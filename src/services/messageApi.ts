import type { Conversation, Message } from "@/types/message";
import instance from "@/utils/axios";

export const getConversations = async (): Promise<Conversation[]> => {
  const res = await instance.get("/api/messages/conversations");
  return res.data.data.conversations;
};

export const createOrGetConversation = async (
  userId: string,
): Promise<Conversation> => {
  const res = await instance.post("/api/messages/conversations", { userId });
  return res.data.data;
};

export const getMessagesByConversation = async (
  conversationId: string,
): Promise<Message[]> => {
  const res = await instance.get(
    `/api/messages/conversations/${conversationId}/messages`,
  );
  return res.data.data.messages;
};

export const sendTextMessage = async (payload: {
  conversationId: string;
  recipientId: string;
  content: string;
}): Promise<Message> => {
  const res = await instance.post("/api/messages/messages", {
    ...payload,
    messageType: "text",
  });
  return res.data.data;
};

export const sendImageMessage = async (payload: {
  conversationId: string;
  recipientId: string;
  image: File;
}): Promise<Message> => {
  const formData = new FormData();
  formData.append("conversationId", payload.conversationId);
  formData.append("recipientId", payload.recipientId);
  formData.append("messageType", "image");
  formData.append("image", payload.image);

  const res = await instance.post("/api/messages/messages", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data.data;
};

export const markMessageAsRead = async (
  messageId: string,
): Promise<{ _id: string; isRead: boolean }> => {
  const res = await instance.put(`/api/messages/messages/${messageId}/read`);
  return res.data.data;
};

export const getUnreadCount = async (): Promise<number> => {
  const res = await instance.get("/api/messages/unread-count");
  return res.data.data.unreadCount;
};
