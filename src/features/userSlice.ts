import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  clearAllSearchHistoryApi,
  deleteSearchHistoryItemApi,
  followUserApi,
  getFollowersApi,
  getFollowingApi,
  getProfileById,
  getSearchHistoryApi,
  getSuggestedUsersApi,
  saveSearchHistoryApi,
  searchUsersApi,
  unfollowUserApi,
} from "@/services/userApi";
import type { SearchHistory, User, UsersState } from "@/types/user";
import { markAsFollowing, markAsUnfollowing } from "@/utils/helper";
import type { ApiError } from "@/types/api";

const initialState: UsersState = {
  suggestedUsers: [],
  profileUser: null,
  followers: [],
  following: [],
  userLoading: false,
  profileLoading: false,
  followLoadingIds: [],
  searchResult: [],
  searchHistory: [],
  searchLoading: false,
};

type FollowPayload = {
  targetUserId: string;
  authUserId: string;
};

export const fetchProfileById = createAsyncThunk<
  User,
  string,
  { rejectValue: ApiError }
>("users/fetchProfileById", async (userId, { rejectWithValue }) => {
  try {
    return await getProfileById(userId);
  } catch (err) {
    return rejectWithValue(err as ApiError);
  }
});

export const fetchSuggestedUsers = createAsyncThunk<
  User[],
  void,
  { rejectValue: ApiError }
>("users/fetchSuggested", async (_, { rejectWithValue }) => {
  try {
    return await getSuggestedUsersApi();
  } catch (err) {
    return rejectWithValue(err as ApiError);
  }
});

export const searchUsers = createAsyncThunk(
  "users/search",
  async (q: string) => {
    return await searchUsersApi(q);
  },
);

export const saveSearchHistory = createAsyncThunk(
  "users/saveSearchHistory",
  async (
    data: { searchedUserId: string; searchQuery: string },
    { rejectWithValue },
  ) => {
    try {
      await saveSearchHistoryApi(data);
      return data;
    } catch (err) {
      return rejectWithValue(err as ApiError);
    }
  },
);

export const fetchSearchHistory = createAsyncThunk<
  SearchHistory[],
  void,
  { rejectValue: ApiError }
>("users/fetchSearchHistory", async (_, { rejectWithValue }) => {
  try {
    return await getSearchHistoryApi();
  } catch (err) {
    return rejectWithValue(err as ApiError);
  }
});

export const deleteSearchHistoryItem = createAsyncThunk(
  "users/deleteSearchHistoryItem",
  async (historyId: string, { rejectWithValue }) => {
    try {
      await deleteSearchHistoryItemApi(historyId);
      return historyId;
    } catch (err) {
      return rejectWithValue(err as ApiError);
    }
  },
);

export const clearAllSearchHistory = createAsyncThunk(
  "users/clearAllSearchHistory",
  async (_, { rejectWithValue }) => {
    try {
      await clearAllSearchHistoryApi();
      return true;
    } catch (err) {
      return rejectWithValue(err as ApiError);
    }
  },
);

export const followUser = createAsyncThunk<FollowPayload, FollowPayload>(
  "users/follow",
  async (payload) => {
    await followUserApi(payload.targetUserId);
    return payload;
  },
);

export const unfollowUser = createAsyncThunk<FollowPayload, FollowPayload>(
  "users/unfollow",
  async (payload) => {
    await unfollowUserApi(payload.targetUserId);
    return payload;
  },
);

export const fetchFollowers = createAsyncThunk<
  User[],
  string,
  { rejectValue: ApiError }
>("users/fetchFollowers", async (userId, { rejectWithValue }) => {
  try {
    return await getFollowersApi(userId);
  } catch (err) {
    return rejectWithValue(err as ApiError);
  }
});

export const fetchFollowing = createAsyncThunk<
  User[],
  string,
  { rejectValue: ApiError }
>("users/fetchFollowing", async (userId, { rejectWithValue }) => {
  try {
    return await getFollowingApi(userId);
  } catch (err) {
    return rejectWithValue(err as ApiError);
  }
});

const userSlice = createSlice({
  name: "suggestedUsers",
  initialState,
  reducers: {
    clearSearch(state) {
      state.searchResult = [];
    },
  },
  extraReducers: (builder) => {
    builder
      /* ================= PROFILE ================= */
      .addCase(fetchProfileById.pending, (state) => {
        state.profileLoading = true;
        state.profileUser = null;
      })

      .addCase(fetchProfileById.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.profileUser = action.payload;
      })

      .addCase(fetchProfileById.rejected, (state) => {
        state.profileLoading = false;
      })
      /* ================= SUGGESTED ================= */
      .addCase(fetchSuggestedUsers.pending, (state) => {
        state.userLoading = true;
      })
      .addCase(fetchSuggestedUsers.fulfilled, (state, action) => {
        state.userLoading = false;
        state.suggestedUsers = action.payload;
      })
      .addCase(fetchSuggestedUsers.rejected, (state) => {
        state.userLoading = false;
      })

      /* ================= FOLLOWERS ================= */
      .addCase(fetchFollowers.pending, (state) => {
        state.userLoading = true;
      })
      .addCase(fetchFollowers.fulfilled, (state, action) => {
        state.userLoading = false;
        state.followers = action.payload;
      })
      .addCase(fetchFollowers.rejected, (state) => {
        state.userLoading = false;
      })

      /* ================= FOLLOWING ================= */
      .addCase(fetchFollowing.pending, (state) => {
        state.userLoading = true;
      })
      .addCase(fetchFollowing.fulfilled, (state, action) => {
        state.userLoading = false;
        state.following = action.payload;
      })
      .addCase(fetchFollowing.rejected, (state) => {
        state.userLoading = false;
      })

      /* ================= FOLLOW ================= */
      .addCase(followUser.pending, (state, action) => {
        state.followLoadingIds.push(action.meta.arg.targetUserId);
      })
      .addCase(followUser.fulfilled, (state, action) => {
        const { targetUserId, authUserId } = action.payload;

        // 1️⃣ stop loading
        state.followLoadingIds = state.followLoadingIds.filter(
          (id) => id !== targetUserId,
        );

        // 2️⃣ update target user's followers count
        if (state.profileUser?._id === targetUserId) {
          state.profileUser.isFollowing = true;
          state.profileUser.followersCount =
            (state.profileUser.followersCount || 0) + 1;
        }

        // 3️⃣ update auth user's following count (nếu đang xem profile mình)
        if (state.profileUser?._id === authUserId) {
          state.profileUser.followingCount =
            (state.profileUser.followingCount || 0) + 1;
        }

        // 4️⃣ sync all lists
        markAsFollowing(state.suggestedUsers, targetUserId);
        markAsFollowing(state.followers, targetUserId);

        const userToFollow =
          state.followers.find((u) => u._id === targetUserId) ||
          state.suggestedUsers.find((u) => u._id === targetUserId) ||
          (state.profileUser?._id === targetUserId ? state.profileUser : null);

        if (
          userToFollow &&
          !state.following.some((u) => u._id === targetUserId)
        ) {
          state.following.push({ ...userToFollow, isFollowing: true });
        }
      })

      .addCase(followUser.rejected, (state, action) => {
        state.followLoadingIds = state.followLoadingIds.filter(
          (id) => id !== action.meta.arg.targetUserId,
        );
      })

      /* ================= UNFOLLOW ================= */
      .addCase(unfollowUser.pending, (state, action) => {
        state.followLoadingIds.push(action.meta.arg.targetUserId);
      })

      .addCase(unfollowUser.fulfilled, (state, action) => {
        const { targetUserId, authUserId } = action.payload;

        state.followLoadingIds = state.followLoadingIds.filter(
          (id) => id !== targetUserId,
        );

        // target user
        if (state.profileUser?._id === targetUserId) {
          state.profileUser.isFollowing = false;
          state.profileUser.followersCount = Math.max(
            0,
            (state.profileUser.followersCount || 1) - 1,
          );
        }

        // auth user
        if (state.profileUser?._id === authUserId) {
          state.profileUser.followingCount = Math.max(
            0,
            (state.profileUser.followingCount || 1) - 1,
          );
        }

        markAsUnfollowing(state.suggestedUsers, targetUserId);
        markAsUnfollowing(state.followers, targetUserId);

        state.following = state.following.filter((u) => u._id !== targetUserId);
      })

      .addCase(unfollowUser.rejected, (state, action) => {
        state.followLoadingIds = state.followLoadingIds.filter(
          (id) => id !== action.meta.arg.targetUserId,
        );
      })

      /* ================= SEARCH ================= */
      .addCase(searchUsers.pending, (state) => {
        state.searchLoading = true;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResult = action.payload;
      })
      .addCase(searchUsers.rejected, (state) => {
        state.searchLoading = false;
      })

      /* ===== SEARCH HISTORY ===== */
      .addCase(fetchSearchHistory.fulfilled, (state, action) => {
        state.searchHistory = action.payload;
      })
      .addCase(saveSearchHistory.fulfilled, (state, action) => {
        const { searchedUserId } = action.payload;

        state.searchHistory = state.searchHistory.filter(
          (h) => h.searchedUserId._id !== searchedUserId,
        );
      })
      .addCase(deleteSearchHistoryItem.fulfilled, (state, action) => {
        const historyId = action.payload;
        state.searchHistory = state.searchHistory.filter(
          (item) => item._id !== historyId,
        );
      })

      .addCase(clearAllSearchHistory.fulfilled, (state) => {
        state.searchHistory = [];
      });
  },
});

export const { clearSearch } = userSlice.actions;
export default userSlice.reducer;
