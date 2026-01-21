import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Post, PostState } from "@/types/post";
import {
  createPostApi,
  deletePostApi,
  getNewsfeed,
  getPostsTrending,
  savePostApi,
  toggleLikePostApi,
  unsavePostApi,
  updatePostCaptionApi,
} from "@/services/postApi";
import type { RootState } from "@/store/store";

const initialState: PostState = {
  posts: [],
  postLoading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  deletedPostId: null,
};

export const fetchNewsfeed = createAsyncThunk<
  Post[],
  void,
  { rejectValue: string }
>("posts/fetchNewsfeed", async (_, { rejectWithValue }) => {
  try {
    return await getNewsfeed();
  } catch {
    return rejectWithValue("Failed to fetch Newfeeds");
  }
});

export const fetchPostsTrending = createAsyncThunk<
  Post[],
  void,
  { rejectValue: string }
>("posts/fetchPostsTrending", async (_, { rejectWithValue }) => {
  try {
    return await getPostsTrending();
  } catch {
    return rejectWithValue("Failed to fetch post trending");
  }
});

export const createPost = createAsyncThunk<
  Post,
  { file: File; caption?: string },
  { state: RootState; rejectValue: string }
>(
  "posts/createPost",
  async ({ file, caption }, { getState, rejectWithValue }) => {
    try {
      const res = await createPostApi(file, caption);
      const authUser = getState().auth.user;

      if (authUser) {
        return {
          ...res,
          userId: {
            _id: authUser._id,
            username: authUser.username,
            profilePicture: authUser.profilePicture,
          },
        };
      }

      return res;
    } catch {
      return rejectWithValue("Failed to create new post");
    }
  },
);

export const updatePostCaption = createAsyncThunk<
  {
    postId: string;
    caption: string;
    updatedAt: string;
  },
  { postId: string; caption: string },
  { rejectValue: string }
>(
  "posts/updatePostCaption",
  async ({ postId, caption }, { rejectWithValue }) => {
    try {
      const data = await updatePostCaptionApi(postId, caption);

      return {
        postId: data._id,
        caption: data.caption,
        updatedAt: data.updatedAt,
      };
    } catch {
      return rejectWithValue("Failed to update post caption");
    }
  },
);

export const deletePost = createAsyncThunk<string, string>(
  "posts/deletePost",
  async (postId, { rejectWithValue }) => {
    try {
      await deletePostApi(postId);
      return postId;
    } catch {
      return rejectWithValue("Failed to delete post");
    }
  },
);

export const toggleLikePost = createAsyncThunk(
  "posts/toggleLike",
  async (postId: string, { rejectWithValue }) => {
    try {
      const data = await toggleLikePostApi(postId);
      return data;
    } catch {
      return rejectWithValue("Failed to toggle like post");
    }
  },
);

export const toggleSavePost = createAsyncThunk<
  Post,
  string,
  { state: RootState }
>("posts/toggleSave", async (postId, { getState, rejectWithValue }) => {
  try {
    const state = getState();

    const post =
      state.postDetail.post ?? state.posts.posts.find((p) => p._id === postId);

    if (!post) throw new Error("Post not found");

    const data = post.isSaved
      ? await unsavePostApi(postId)
      : await savePostApi(postId);

    return {
      ...data,
      isSaved: !post.isSaved,
    };
  } catch {
    return rejectWithValue("Failed to toggle save post");
  }
});

const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    resetDeletedPostId: (state) => {
      state.deletedPostId = null;
    },
  },
  extraReducers(builder) {
    builder
      /* ===== FETCH NEWFEEDS ===== */
      .addCase(fetchNewsfeed.pending, (state) => {
        state.postLoading = true;
      })
      .addCase(fetchNewsfeed.fulfilled, (state, action) => {
        state.posts = action.payload;

        state.postLoading = false;
      })
      .addCase(fetchNewsfeed.rejected, (state) => {
        state.postLoading = false;
      })

      /* ===== FETCH EXPLORE POSTS ===== */
      .addCase(fetchPostsTrending.pending, (state) => {
        state.postLoading = true;
      })
      .addCase(fetchPostsTrending.fulfilled, (state, action) => {
        state.posts = action.payload;
        state.postLoading = false;
      })
      .addCase(fetchPostsTrending.rejected, (state) => {
        state.postLoading = false;
      })

      /* ===== LIKE POST ===== */
      .addCase(toggleLikePost.fulfilled, (state, action) => {
        const updatedPost = action.payload;

        const post = state.posts.find((p) => p._id === updatedPost._id);
        if (post) {
          post.likes = updatedPost.likes;
          post.isLiked = updatedPost.isLiked;
          post.likedBy = updatedPost.likedBy;
        }
      })

      .addCase(toggleSavePost.fulfilled, (state, action) => {
        const updatedPost = action.payload;

        const post = state.posts.find((p) => p._id === updatedPost._id);
        if (post) {
          post.isSaved = updatedPost.isSaved;
          post.savedBy = updatedPost.savedBy;
        }
      })

      /* ===== CREATE POST ===== */
      .addCase(createPost.pending, (state) => {
        state.createLoading = true;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.createLoading = false;
        state.posts.unshift(action.payload);
      })
      .addCase(createPost.rejected, (state) => {
        state.createLoading = false;
      })

      /* ===== UPDATE POST CAPTION ===== */
      .addCase(updatePostCaption.pending, (state) => {
        state.updateLoading = true;
      })

      .addCase(updatePostCaption.fulfilled, (state, action) => {
        state.updateLoading = false;

        const { postId, caption, updatedAt } = action.payload;

        const post = state.posts.find((p) => p._id === postId);
        if (post) {
          post.caption = caption;
          post.updatedAt = updatedAt;
        }
      })

      .addCase(updatePostCaption.rejected, (state) => {
        state.updateLoading = false;
      })

      /* ===== DELETE POST ===== */
      .addCase(deletePost.pending, (state) => {
        state.deleteLoading = true;
      })

      .addCase(deletePost.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deletedPostId = action.payload;
        state.posts = state.posts.filter((p) => p._id !== action.payload);
      })

      .addCase(deletePost.rejected, (state) => {
        state.deleteLoading = false;
      });
  },
});

export default postSlice.reducer;
export const { resetDeletedPostId } = postSlice.actions;
