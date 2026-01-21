import authSlice from "@/features/authSlice";
import modalSlice from "@/features/modalSlice";
import postSlice from "@/features/postSlice";
import userSlice from "@/features/userSlice";
import postDetailSlice from "@/features/postDetailSlice";
import commentSlice from "@/features/commentSlice";
import messageSlice from "@/features/messageSlice";

import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    posts: postSlice,
    modal: modalSlice,
    users: userSlice,
    postDetail: postDetailSlice,
    comments: commentSlice,
    messages: messageSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
