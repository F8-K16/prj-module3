import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import ExplorePage from "./pages/ExplorePage";
import ChatPage from "./pages/ChatPage";
import ProfilePage from "./pages/ProfilePage";

import LoginPage from "./pages/LoginPage";
import AuthMiddleware from "./middlewares/AuthMiddleware";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "./store/store";
import { useEffect } from "react";
import { initAuth } from "./features/authSlice";
import Loading from "./utils/loading/Loading";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import VerifyEmailTokenPage from "./pages/VerifyEmailTokenPage";
import InfoPage from "./pages/InfoPage";
import ChatDetailPage from "./pages/ChatDetailPage";
import { connectSocket, disconnectSocket } from "./socket/socket";

export default function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { authLoading, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );

  useEffect(() => {
    dispatch(initAuth());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem("access_token");
      if (token) {
        connectSocket(token);
      }
    } else {
      disconnectSocket();
    }
  }, [isAuthenticated]);

  if (authLoading) {
    return <Loading />;
  }
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/verify-email/:token" element={<VerifyEmailTokenPage />} />

        <Route element={<AuthMiddleware />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route
              path="/direct/:conversationId"
              element={<ChatDetailPage />}
            />
            <Route path="/user/:userId/*" element={<ProfilePage />} />
            <Route path="/profile" element={<InfoPage />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}
