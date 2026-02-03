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
import type { ApiError } from "@/types/api";

const initialState: PostState = {
  posts: [],
  postLoading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  deletedPostId: null,
  hasMore: true,
  offset: 0,
  limit: 20,
  isFirstLoad: true,
};

export const fetchNewsfeed = createAsyncThunk<
  {
    posts: Post[];
    hasMore: boolean;
    offset: number;
  },
  void,
  { state: RootState; rejectValue: ApiError }
>("posts/fetchNewsfeed", async (_, { getState, rejectWithValue }) => {
  try {
    const { offset, limit } = getState().posts;

    const res = await getNewsfeed(offset, limit);

    return {
      posts: res.posts,
      hasMore: res.hasMore,
      offset: offset + res.posts.length,
    };
  } catch (err) {
    return rejectWithValue(err as ApiError);
  }
});

export const fetchPostsTrending = createAsyncThunk<
  Post[],
  void,
  { rejectValue: ApiError }
>("posts/fetchPostsTrending", async (_, { rejectWithValue }) => {
  try {
    return await getPostsTrending();
  } catch (err) {
    return rejectWithValue(err as ApiError);
  }
});

export const createPost = createAsyncThunk<
  Post,
  { file: File; caption?: string },
  { state: RootState; rejectValue: ApiError }
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
    } catch (err) {
      return rejectWithValue(err as ApiError);
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
  { rejectValue: ApiError }
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
    } catch (err) {
      return rejectWithValue(err as ApiError);
    }
  },
);

export const deletePost = createAsyncThunk<
  string,
  string,
  { rejectValue: ApiError }
>("posts/deletePost", async (postId, { rejectWithValue }) => {
  try {
    await deletePostApi(postId);
    return postId;
  } catch (err) {
    return rejectWithValue(err as ApiError);
  }
});

export const toggleLikePost = createAsyncThunk<
  Post,
  string,
  { rejectValue: ApiError }
>("posts/toggleLike", async (postId, { rejectWithValue }) => {
  try {
    return await toggleLikePostApi(postId);
  } catch (err) {
    return rejectWithValue(err as ApiError);
  }
});

export const toggleSavePost = createAsyncThunk<
  Post,
  string,
  { state: RootState; rejectValue: ApiError }
>("posts/toggleSave", async (postId, { getState, rejectWithValue }) => {
  try {
    const state = getState();
    const post =
      state.postDetail.post ?? state.posts.posts.find((p) => p._id === postId);

    if (!post) {
      throw { message: "Post not found" } as ApiError;
    }

    const updatedPost = post.isSaved
      ? await unsavePostApi(postId)
      : await savePostApi(postId);

    return {
      ...updatedPost,
      isSaved: !post.isSaved,
    };
  } catch (err) {
    return rejectWithValue(err as ApiError);
  }
});

const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    resetDeletedPostId: (state) => {
      state.deletedPostId = null;
    },
    resetNewsFeed: (state) => {
      state.posts = [];
      state.offset = 0;
      state.hasMore = true;
      state.isFirstLoad = true;
      state.postLoading = false;
    },
  },
  extraReducers(builder) {
    builder
      /* ===== FETCH NEWFEEDS ===== */
      .addCase(fetchNewsfeed.pending, (state) => {
        if (state.isFirstLoad) {
          state.postLoading = true;
        }
      })
      .addCase(fetchNewsfeed.fulfilled, (state, action) => {
        const existingIds = new Set(state.posts.map((p) => p._id));

        const newPosts = action.payload.posts.filter(
          (p) => !existingIds.has(p._id),
        );
        console.log(action.payload);

        state.posts.push(...newPosts);
        state.hasMore = action.payload.hasMore;
        state.offset = action.payload.offset;
        state.postLoading = false;
        state.isFirstLoad = false;
      })
      .addCase(fetchNewsfeed.rejected, (state) => {
        state.postLoading = false;
        state.isFirstLoad = false;
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
          Object.assign(post, {
            ...updatedPost,
            userId: post.userId,
          });
        }
      })

      .addCase(toggleSavePost.fulfilled, (state, action) => {
        const updatedPost = action.payload;

        const post = state.posts.find((p) => p._id === updatedPost._id);
        if (post) {
          Object.assign(post, {
            ...updatedPost,
            userId: post.userId,
          });
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
export const { resetDeletedPostId, resetNewsFeed } = postSlice.actions;
