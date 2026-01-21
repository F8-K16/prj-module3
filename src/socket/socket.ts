import { io, Socket } from "socket.io-client";
import type { Message } from "@/types/message";

let socket: Socket | null = null;

export const connectSocket = (token: string) => {
  if (socket?.connected) return socket;

  socket = io("https://instagram.f8team.dev", {
    auth: {
      token,
    },
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket?.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Socket disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    console.error("🚨 Socket connect error:", err.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("🧹 Socket cleared");
  }
};

/* ================= Events ================= */

export const onNewMessage = (cb: (message: Message) => void) => {
  socket?.on("new_message", cb);
};

export const offNewMessage = (cb: (message: Message) => void) => {
  socket?.off("new_message", cb);
};

export const emitTyping = (payload: {
  conversationId: string;
  recipientId: string;
}) => {
  socket?.emit("typing", payload);
};

export const emitStopTyping = (payload: {
  conversationId: string;
  recipientId: string;
}) => {
  socket?.emit("stop_typing", payload);
};
