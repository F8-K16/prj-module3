import type { User } from "./user";

export type MessageType = "text" | "image";

export interface Message {
  _id: string;
  conversationId: string;
  senderId: User | string;
  recipientId: string;
  messageType: MessageType;
  content: string;
  imageUrl?: string;
  isRead: boolean;
  createdAt: string;

  optimistic?: boolean;
  status?: "sending" | "sent" | "failed";
}

export interface Conversation {
  _id: string;
  participants: User[];
  lastMessage: Message | null;
  lastMessageAt: string;
  unreadCount: number;
  createdAt: string;
}

export interface MessageState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  unreadCount: number;
  conversationsLoading: boolean;
  messagesLoading: boolean;
  error?: string;
  typingUsers: Record<string, string[]>;
}
