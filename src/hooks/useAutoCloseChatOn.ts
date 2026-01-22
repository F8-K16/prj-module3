import { closeChatModals } from "@/features/modalSlice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";

export function useAutoCloseChatOn() {
  const { pathname } = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    const isChatPage = pathname === "/chat" || pathname.startsWith("/direct");

    if (isChatPage) {
      dispatch(closeChatModals());
    }
  }, [pathname, dispatch]);
}
