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

const initialState: PostDetailState = {
  post: null,
  postDetailLoading: false,
};

export const fetchPostDetail = createAsyncThunk<
  Post,
  string,
  { state: RootState }
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
    } catch {
      return rejectWithValue("Có lỗi khi fetch chi tiết bài viết");
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
        state.post = action.payload;
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
          state.post.likes = action.payload.likes;
          state.post.isLiked = action.payload.isLiked;
          state.post.likedBy = action.payload.likedBy;
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
