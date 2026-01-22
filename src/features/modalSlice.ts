import type { ModalState } from "@/types/modal";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const initialState: ModalState = {
  activeModal: null,
  postId: null,
  userId: null,
};

const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    openPostModal(state, action: PayloadAction<string>) {
      state.activeModal = "post";
      state.postId = action.payload;
    },

    openNewMessageModal(state) {
      state.activeModal = "new-message";
    },

    openCreateModal(state) {
      state.activeModal = "create";
    },

    openFollowersModal(state, action: PayloadAction<string>) {
      state.activeModal = "followers";
      state.userId = action.payload;
    },

    openFollowingModal(state, action: PayloadAction<string>) {
      state.activeModal = "following";
      state.userId = action.payload;
    },

    openCommentOptionsModal(
      state,
      action: PayloadAction<{
        postId: string;
        commentId: string;
        ownerId: string;
      }>,
    ) {
      state.activeModal = "comment-options";
      state.commentId = action.payload.commentId;
      state.commentOwnerId = action.payload.ownerId;
      state.postId = action.payload.postId;
      state.parentModal = "post";
    },

    openPostOptionsModal(
      state,
      action: PayloadAction<{
        postId: string;
        ownerId: string;
        parentModal?: "post" | null;
      }>,
    ) {
      state.activeModal = "post-options";
      state.ownerId = action.payload.ownerId;
      state.postId = action.payload.postId;
      state.parentModal = action.payload.parentModal ?? null;
    },

    openEditCommentModal(
      state,
      action: PayloadAction<{ postId: string; commentId: string }>,
    ) {
      state.activeModal = "edit-comment";
      state.postId = action.payload.postId;
      state.commentId = action.payload.commentId;
      state.parentModal = "post";
    },

    openEditPostModal(state, action: PayloadAction<{ postId: string }>) {
      state.activeModal = "edit-post";
      state.postId = action.payload.postId;
      state.parentModal = "post";
    },

    closeModal(state) {
      if (
        state.activeModal === "comment-options" ||
        state.activeModal === "edit-comment" ||
        state.activeModal === "edit-post" ||
        state.activeModal === "post-options"
      ) {
        state.activeModal = state.parentModal ?? null;
        state.parentModal = null;
        return;
      }

      state.activeModal = null;
      state.postId = null;
      state.userId = null;
      state.parentModal = null;
    },
  },
});

export const {
  openPostModal,
  openNewMessageModal,
  openCreateModal,
  openFollowersModal,
  openFollowingModal,
  openCommentOptionsModal,
  openPostOptionsModal,
  openEditCommentModal,
  openEditPostModal,
  closeModal,
} = modalSlice.actions;

export default modalSlice.reducer;
