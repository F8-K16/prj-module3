import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Post, PostDetailState } from "@/types/post";
import { getPostDetail } from "@/services/postApi";
import {
  deletePost,
  toggleLikePost,
  toggleSavePost,
  updatePostCaption,
} from "./postSlice";
import type { RootState } from "@/store/store";
import type { ApiError } from "@/types/api";
import { normalizePost } from "@/utils/helper";

const initialState: PostDetailState = {
  post: null,
  postDetailLoading: false,
};

export const fetchPostDetail = createAsyncThunk<
  Post,
  string,
  { state: RootState; rejectValue: ApiError }
>(
  "postDetail/fetchPostDetail",
  async (postId, { getState, rejectWithValue }) => {
    try {
      const post = await getPostDetail(postId);
      const currentUserId = getState().auth.user?._id;

      return {
        ...post,
        isLiked: currentUserId ? post.likedBy.includes(currentUserId) : false,
        isSaved: currentUserId ? post.savedBy.includes(currentUserId) : false,
      };
    } catch (err) {
      return rejectWithValue(err as ApiError);
    }
  },
);

const postDetailSlice = createSlice({
  name: "postDetail",
  initialState,
  reducers: {
    clearPostDetail: (state) => {
      state.post = null;
      state.postDetailLoading = false;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchPostDetail.pending, (state) => {
        state.postDetailLoading = true;
      })
      .addCase(fetchPostDetail.fulfilled, (state, action) => {
        state.post = normalizePost(action.payload);
        state.postDetailLoading = false;
      })
      .addCase(fetchPostDetail.rejected, (state) => {
        state.postDetailLoading = false;
      })
      .addCase(updatePostCaption.fulfilled, (state, action) => {
        if (state.post && state.post._id === action.payload.postId) {
          state.post.caption = action.payload.caption;
          state.post.updatedAt = action.payload.updatedAt;
        }
      })

      .addCase(toggleLikePost.fulfilled, (state, action) => {
        if (!state.post) return;
        if (state.post._id === action.payload._id) {
          const normalized = normalizePost(action.payload);
          state.post.likes = normalized.likes;
          state.post.isLiked = normalized.isLiked;
          state.post.likedBy = normalized.likedBy;
        }
      })

      .addCase(toggleSavePost.fulfilled, (state, action) => {
        if (!state.post) return;

        if (state.post._id === action.payload._id) {
          state.post.isSaved = action.payload.isSaved;
          state.post.savedBy = action.payload.savedBy;
        }
      })
      .addCase(deletePost.fulfilled, (state) => {
        state.post = null;
        state.postDetailLoading = false;
      });
  },
});

export const { clearPostDetail } = postDetailSlice.actions;
export default postDetailSlice.reducer;
