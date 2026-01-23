import type { Conversation, Message } from "@/types/message";
import instance from "@/utils/axios";
import { parseApiError } from "@/utils/helper";

/* ===== CONVERSATIONS ===== */
export const getConversations = async (): Promise<Conversation[]> => {
  try {
    const res = await instance.get("/api/messages/conversations");
    return res.data.data.conversations;
  } catch (err) {
    throw parseApiError(err);
  }
};

export const createOrGetConversation = async (
  userId: string,
): Promise<Conversation> => {
  try {
    const res = await instance.post("/api/messages/conversations", { userId });
    return res.data.data;
  } catch (err) {
    throw parseApiError(err);
  }
};

/* ===== MESSAGES ===== */
export const getMessagesByConversation = async (
  conversationId: string,
): Promise<Message[]> => {
  try {
    const res = await instance.get(
      `/api/messages/conversations/${conversationId}/messages`,
    );
    return res.data.data.messages;
  } catch (err) {
    throw parseApiError(err);
  }
};

export const sendTextMessage = async (payload: {
  conversationId: string;
  recipientId: string;
  content: string;
}): Promise<Message> => {
  try {
    const res = await instance.post("/api/messages/messages", {
      ...payload,
      messageType: "text",
    });
    return res.data.data;
  } catch (err) {
    throw parseApiError(err);
  }
};

export const sendImageMessage = async (payload: {
  conversationId: string;
  recipientId: string;
  image: File;
}): Promise<Message> => {
  try {
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
  } catch (err) {
    throw parseApiError(err);
  }
};

/* ===== READ / UNREAD ===== */
export const markMessageAsRead = async (
  messageId: string,
): Promise<{ _id: string; isRead: boolean }> => {
  try {
    const res = await instance.put(`/api/messages/messages/${messageId}/read`);
    return res.data.data;
  } catch (err) {
    throw parseApiError(err);
  }
};

export const getUnreadCount = async (): Promise<number> => {
  try {
    const res = await instance.get("/api/messages/unread-count");
    return res.data.data.unreadCount;
  } catch (err) {
    throw parseApiError(err);
  }
};
