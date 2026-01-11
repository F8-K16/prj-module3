import type { PostModalState, Post } from "@/types/post";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const initialState: PostModalState = {
  isOpen: false,
  post: null,
};

const postModalSlice = createSlice({
  name: "postModal",
  initialState,
  reducers: {
    openPostModal(state, action: PayloadAction<Post>) {
      state.isOpen = true;
      state.post = action.payload;
    },
    closePostModal(state) {
      state.isOpen = false;
      state.post = null;
    },
  },
});

export const { openPostModal, closePostModal } = postModalSlice.actions;

export default postModalSlice.reducer;
