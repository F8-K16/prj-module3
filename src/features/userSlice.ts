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
import type { User, UsersState } from "@/types/user";
import { markAsFollowing, markAsUnfollowing } from "@/utils/helper";

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

export const fetchProfileById = createAsyncThunk(
  "users/fetchProfileById",
  async (userId: string, { rejectWithValue }) => {
    try {
      const res = await getProfileById(userId);
      return res as User;
    } catch {
      return rejectWithValue("Fetch profile failed");
    }
  },
);

export const fetchSuggestedUsers = createAsyncThunk(
  "users/fetchSuggested",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getSuggestedUsersApi();
      return res.data.data as User[];
    } catch {
      return rejectWithValue("Fetch suggested users failed");
    }
  },
);

export const searchUsers = createAsyncThunk(
  "users/search",
  async (q: string) => {
    const res = await searchUsersApi(q);
    return res.data;
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
    } catch {
      return rejectWithValue("Save search history failed");
    }
  },
);

export const fetchSearchHistory = createAsyncThunk(
  "users/fetchSearchHistory",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getSearchHistoryApi();
      return res.data.data;
    } catch {
      return rejectWithValue("Fetch search history failed");
    }
  },
);

export const deleteSearchHistoryItem = createAsyncThunk(
  "users/deleteSearchHistoryItem",
  async (historyId: string, { rejectWithValue }) => {
    try {
      await deleteSearchHistoryItemApi(historyId);
      return historyId;
    } catch {
      return rejectWithValue("Delete search history item failed");
    }
  },
);

export const clearAllSearchHistory = createAsyncThunk(
  "users/clearAllSearchHistory",
  async (_, { rejectWithValue }) => {
    try {
      await clearAllSearchHistoryApi();
      return true;
    } catch {
      return rejectWithValue("Clear search history failed");
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

export const fetchFollowers = createAsyncThunk(
  "users/fetchFollowers",
  async (userId: string, { rejectWithValue }) => {
    try {
      const res = await getFollowersApi(userId);
      return res.data.data.followers as User[];
    } catch {
      return rejectWithValue("Fetch followers failed");
    }
  },
);

export const fetchFollowing = createAsyncThunk(
  "users/fetchFollowing",
  async (userId: string, { rejectWithValue }) => {
    try {
      const res = await getFollowingApi(userId);
      return res.data.data.following as User[];
    } catch {
      return rejectWithValue("Fetch following failed");
    }
  },
);

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
