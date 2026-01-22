import { useEffect } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store/store";
import {
  connectSocket,
  disconnectSocket,
  onNewMessage,
  offNewMessage,
  onUserTyping,
  offUserTyping,
  onUserStopTyping,
  offUserStopTyping,
} from "@/socket/socket";
import {
  fetchConversations,
  handleIncomingMessage,
  userTyping,
  userStopTyping,
} from "@/features/messageSlice";
import type { Message } from "@/types/message";

export function useChatSocket(isAuthenticated: boolean) {
  const dispatch = useDispatch<AppDispatch>();

  // Connect / Disconnect socket
  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) return;

    connectSocket(token);
    dispatch(fetchConversations());

    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated, dispatch]);

  // New message
  useEffect(() => {
    if (!isAuthenticated) return;

    const handler = (message: Message) => {
      dispatch(handleIncomingMessage(message));
    };

    onNewMessage(handler);
    return () => offNewMessage(handler);
  }, [isAuthenticated, dispatch]);

  // Typing events
  useEffect(() => {
    if (!isAuthenticated) return;

    const onTyping = ({
      conversationId,
      userId,
    }: {
      conversationId: string;
      userId: string;
    }) => {
      dispatch(userTyping({ conversationId, userId }));
    };

    const onStopTyping = ({
      conversationId,
      userId,
    }: {
      conversationId: string;
      userId: string;
    }) => {
      dispatch(userStopTyping({ conversationId, userId }));
    };

    onUserTyping(onTyping);
    onUserStopTyping(onStopTyping);

    return () => {
      offUserTyping(onTyping);
      offUserStopTyping(onStopTyping);
    };
  }, [isAuthenticated, dispatch]);
}
