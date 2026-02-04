import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createPostCommentApi,
  createReplyApi,
  deleteCommentApi,
  getCommentRepliesApi,
  getPostComments,
  toggleLikeCommentApi,
  updateCommentApi,
} from "@/services/commentApi";
import type { CommentState, PostComment } from "@/types/comment";
import type { RootState } from "@/store/store";
import type { ApiError } from "@/types/api";

const initialState: CommentState = {
  comments: [],
  listLoading: false,
  hasMore: true,
  limit: 10,
  createLoading: false,
  deleteLoading: false,
};

export const fetchPostComments = createAsyncThunk<
  PostComment[],
  { postId: string },
  { state: RootState; rejectValue: ApiError }
>(
  "comments/fetchPostComments",
  async ({ postId }, { getState, rejectWithValue }) => {
    try {
      const { limit } = getState().comments;
      const currentUserId = getState().auth.user?._id;

      const comments = await getPostComments(postId, limit);

      return comments.map((comment) => ({
        ...comment,
        isLiked: currentUserId
          ? comment.likedBy.includes(currentUserId)
          : false,
      }));
    } catch (err) {
      return rejectWithValue(err as ApiError);
    }
  },
);

export const createPostComment = createAsyncThunk<
  PostComment,
  {
    postId: string;
    content: string;
    parentCommentId?: string | null;
  },
  { rejectValue: ApiError }
>("comments/createPostComment", async (payload, { rejectWithValue }) => {
  try {
    return await createPostCommentApi(
      payload.postId,
      payload.content,
      payload.parentCommentId ?? null,
    );
  } catch (err) {
    return rejectWithValue(err as ApiError);
  }
});

export const toggleLikeComment = createAsyncThunk<
  PostComment,
  { postId: string; commentId: string },
  { rejectValue: ApiError }
>("comments/toggleLike", async ({ postId, commentId }, { rejectWithValue }) => {
  try {
    return await toggleLikeCommentApi(postId, commentId);
  } catch (err) {
    return rejectWithValue(err as ApiError);
  }
});

export const fetchCommentReplies = createAsyncThunk<
  {
    commentId: string;
    replies: PostComment[];
    hasMore: boolean;
  },
  { postId: string; commentId: string },
  { state: RootState; rejectValue: ApiError }
>(
  "comments/fetchReplies",
  async ({ postId, commentId }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const currentUserId = state.auth.user?._id;

      const comment = state.comments.comments.find((c) => c._id === commentId);
      const limit = comment?.repliesLimit ?? 5;
      const offset = comment?.repliesOffset ?? 0;

      const res = await getCommentRepliesApi(postId, commentId, limit, offset);

      return {
        commentId,
        replies: res.replies.map((reply) => ({
          ...reply,
          isLiked: currentUserId
            ? reply.likedBy.includes(currentUserId)
            : false,
        })),
        hasMore: res.hasMore,
      };
    } catch (err) {
      return rejectWithValue(err as ApiError);
    }
  },
);

export const createReply = createAsyncThunk<
  PostComment,
  { postId: string; commentId: string; content: string },
  { rejectValue: ApiError }
>("comments/createReply", async (payload, { rejectWithValue }) => {
  try {
    return await createReplyApi(
      payload.postId,
      payload.commentId,
      payload.content,
    );
  } catch (err) {
    return rejectWithValue(err as ApiError);
  }
});

export const updateComment = createAsyncThunk<
  PostComment,
  { postId: string; commentId: string; content: string },
  { rejectValue: ApiError }
>("comments/updateComment", async (payload, { rejectWithValue }) => {
  try {
    return await updateCommentApi(
      payload.postId,
      payload.commentId,
      payload.content,
    );
  } catch (err) {
    return rejectWithValue(err as ApiError);
  }
});

export const deleteComment = createAsyncThunk<
  void,
  { postId: string; commentId: string },
  { rejectValue: ApiError }
>(
  "comments/deleteComment",
  async ({ postId, commentId }, { rejectWithValue }) => {
    try {
      await deleteCommentApi(postId, commentId);
    } catch (err) {
      return rejectWithValue(err as ApiError);
    }
  },
);

const commentSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {
    clearComments: () => initialState,
    increaseLimit: (state, action: { payload: number }) => {
      state.limit += action.payload;
    },
    toggleHideReplies: (state, action: { payload: string }) => {
      const comment = state.comments.find((c) => c._id === action.payload);
      if (!comment) return;

      comment.repliesVisible = false;
      comment.replies = [];
      comment.repliesOffset = 0;
      comment.repliesHasMore = true;
    },
  },

  extraReducers(builder) {
    builder
      /* ===== FETCH COMMENT ===== */
      .addCase(fetchPostComments.pending, (state) => {
        state.listLoading = true;
      })
      .addCase(fetchPostComments.fulfilled, (state, action) => {
        state.listLoading = false;
        state.hasMore = action.payload.length === state.limit;

        state.comments = action.payload.map((comment) => ({
          ...comment,
          replies: [],
          repliesLoading: false,
          repliesVisible: false,
          repliesOffset: 0,
          repliesLimit: 5,
          repliesHasMore: comment.replies.length > 0,
        }));
      })
      .addCase(fetchPostComments.rejected, (state) => {
        state.listLoading = false;
      })

      /* ===== CREATE COMMENT ===== */
      .addCase(createPostComment.pending, (state) => {
        state.createLoading = true;
      })
      .addCase(createPostComment.fulfilled, (state, action) => {
        state.createLoading = false;
        state.comments.unshift({
          ...action.payload,
          replies: [],
          repliesVisible: false,
          repliesOffset: 0,
          repliesLimit: 5,
          repliesHasMore: false,
          replyCreating: false,
        });
      })

      .addCase(createPostComment.rejected, (state) => {
        state.createLoading = false;
      })

      /* ===== LIKE COMMENT ===== */
      .addCase(toggleLikeComment.pending, (state, action) => {
        const comment = state.comments.find(
          (c) => c._id === action.meta.arg.commentId,
        );
        if (comment) comment.likeLoading = true;
      })
      .addCase(toggleLikeComment.fulfilled, (state, action) => {
        const { commentId } = action.meta.arg;
        const { likes, isLiked } = action.payload;

        const comment = state.comments.find((c) => c._id === commentId);
        if (comment) {
          comment.likes = likes;
          comment.isLiked = isLiked;
          comment.likeLoading = false;
        }
      })
      .addCase(toggleLikeComment.rejected, (state, action) => {
        const comment = state.comments.find(
          (c) => c._id === action.meta.arg.commentId,
        );
        if (comment) comment.likeLoading = false;
      })

      /* ===== FETCH REPLIES ===== */
      .addCase(fetchCommentReplies.pending, (state, action) => {
        const comment = state.comments.find(
          (c) => c._id === action.meta.arg.commentId,
        );
        if (comment) comment.repliesLoading = true;
      })

      .addCase(fetchCommentReplies.fulfilled, (state, action) => {
        const { commentId, replies, hasMore } = action.payload;

        const comment = state.comments.find((c) => c._id === commentId);
        if (!comment) return;

        comment.replies.unshift(...replies);
        comment.repliesVisible = true;
        comment.repliesHasMore = hasMore;
        comment.repliesOffset += replies.length;
        comment.repliesLoading = false;
      })
      .addCase(fetchCommentReplies.rejected, (state, action) => {
        const comment = state.comments.find(
          (c) => c._id === action.meta.arg.commentId,
        );
        if (comment) comment.repliesLoading = false;
      })

      /* ===== CREATE REPLY COMMENT ===== */
      .addCase(createReply.pending, (state, action) => {
        const parent = state.comments.find(
          (c) => c._id === action.meta.arg.commentId,
        );
        if (parent) parent.replyCreating = true;
      })

      .addCase(createReply.fulfilled, (state, action) => {
        const reply = action.payload;

        const parent = state.comments.find(
          (c) => c._id === reply.parentCommentId,
        );
        if (!parent) return;

        parent.replyCreating = false;
        parent.repliesVisible = true;
        parent.replies.unshift(reply);
        parent.repliesOffset += 1;
      })

      .addCase(createReply.rejected, (state, action) => {
        const parent = state.comments.find(
          (c) => c._id === action.meta.arg.commentId,
        );
        if (parent) parent.replyCreating = false;
      })

      /* ===== UPDATE COMMENT ===== */
      .addCase(updateComment.pending, (state, action) => {
        const comment = state.comments.find(
          (c) => c._id === action.meta.arg.commentId,
        );
        if (comment) comment.updateLoading = true;
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        const updated = action.payload;
        const comment = state.comments.find((c) => c._id === updated._id);
        if (!comment) return;
        comment.content = updated.content;
        comment.updateLoading = false;
      })
      .addCase(updateComment.rejected, (state, action) => {
        const comment = state.comments.find(
          (c) => c._id === action.meta.arg.commentId,
        );
        if (comment) comment.updateLoading = false;
      })

      /* ===== DELETE COMMENT ===== */
      .addCase(deleteComment.pending, (state) => {
        state.deleteLoading = true;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        const { commentId } = action.meta.arg;
        state.comments = state.comments.filter((c) => c._id !== commentId);
        state.deleteLoading = false;
      })
      .addCase(deleteComment.rejected, (state) => {
        state.deleteLoading = false;
      });
  },
});

export const { clearComments, increaseLimit, toggleHideReplies } =
  commentSlice.actions;
export default commentSlice.reducer;
