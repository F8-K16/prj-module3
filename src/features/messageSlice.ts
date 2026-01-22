import {
  createOrGetConversation,
  getConversations,
  getMessagesByConversation,
  getUnreadCount,
  markMessageAsRead,
  sendImageMessage,
  sendTextMessage,
} from "@/services/messageApi";
import type { Conversation, Message, MessageState } from "@/types/message";
import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

const initialState: MessageState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  unreadCount: 0,
  conversationsLoading: false,
  messagesLoading: false,
  typingUsers: {},
};

export const fetchConversations = createAsyncThunk<Conversation[]>(
  "message/fetchConversations",
  async () => {
    return await getConversations();
  },
);

export const fetchOrCreateConversation = createAsyncThunk<Conversation, string>(
  "message/fetchOrCreateConversation",
  async (userId) => {
    return await createOrGetConversation(userId);
  },
);

export const fetchMessages = createAsyncThunk<Message[], string>(
  "message/fetchMessages",
  async (conversationId) => {
    return await getMessagesByConversation(conversationId);
  },
);

export const sendTextMessageThunk = createAsyncThunk<
  Message,
  {
    conversationId: string;
    recipientId: string;
    content: string;
  }
>("message/sendTextMessage", async (payload) => {
  return await sendTextMessage(payload);
});

export const sendImageMessageThunk = createAsyncThunk<
  Message,
  {
    conversationId: string;
    recipientId: string;
    image: File;
  }
>("message/sendImageMessage", async (payload) => {
  return await sendImageMessage(payload);
});

export const fetchUnreadCount = createAsyncThunk<number>(
  "message/fetchUnreadCount",
  async () => {
    return await getUnreadCount();
  },
);

export const markMessageAsReadThunk = createAsyncThunk<
  { _id: string; isRead: boolean },
  string
>("message/markMessageAsRead", async (messageId) => {
  return await markMessageAsRead(messageId);
});

const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    setCurrentConversation(state, action: PayloadAction<Conversation>) {
      state.currentConversation = action.payload;
    },
    clearMessages(state) {
      state.messages = [];
    },
    clearUnreadForConversation(state, action: PayloadAction<string>) {
      const conversation = state.conversations.find(
        (c) => c._id === action.payload,
      );
      if (conversation) {
        conversation.unreadCount = 0;
      }
    },
    pushMessage(state, action: PayloadAction<Message>) {
      state.messages.push(action.payload);
    },
    pushOptimisticMessage(state, action: PayloadAction<Message>) {
      state.messages.push(action.payload);
    },
    updateMessageStatus(
      state,
      action: PayloadAction<{
        id: string;
        status: "sending" | "sent" | "failed";
      }>,
    ) {
      const { id, status } = action.payload;

      const msg = state.messages.find((m) => m._id === id);
      if (msg) {
        msg.status = status;
        msg.optimistic = false;
      }
    },
    handleIncomingMessage: (state, action: PayloadAction<Message>) => {
      const msg = action.payload;

      if (state.currentConversation?._id === msg.conversationId) {
        state.messages.push(msg);
      }

      const conversation = state.conversations.find(
        (c) => c._id === msg.conversationId,
      );

      if (conversation) {
        conversation.lastMessage = msg;
        conversation.lastMessageAt = msg.createdAt;

        if (state.currentConversation?._id !== msg.conversationId) {
          conversation.unreadCount += 1;
        }
      }
    },
    userTyping(
      state,
      action: PayloadAction<{ conversationId: string; userId: string }>,
    ) {
      const { conversationId, userId } = action.payload;

      if (!state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = [];
      }

      if (!state.typingUsers[conversationId].includes(userId)) {
        state.typingUsers[conversationId].push(userId);
      }
    },

    userStopTyping(
      state,
      action: PayloadAction<{ conversationId: string; userId: string }>,
    ) {
      const { conversationId, userId } = action.payload;

      state.typingUsers[conversationId] =
        state.typingUsers[conversationId]?.filter((id) => id !== userId) || [];
    },
  },
  extraReducers: (builder) => {
    builder

      // Conversations
      .addCase(fetchConversations.pending, (state) => {
        state.conversationsLoading = true;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversationsLoading = false;
        state.conversations = action.payload.map((serverConversation) => {
          const localConversation = state.conversations.find(
            (c) => c._id === serverConversation._id,
          );

          return localConversation
            ? {
                ...serverConversation,
                lastMessage:
                  localConversation.lastMessage ??
                  serverConversation.lastMessage,
                unreadCount:
                  localConversation.unreadCount ??
                  serverConversation.unreadCount,
                lastMessageAt:
                  localConversation.lastMessageAt ??
                  serverConversation.lastMessageAt,
              }
            : serverConversation;
        });
      })
      .addCase(fetchConversations.rejected, (state) => {
        state.conversationsLoading = false;
      })

      // Create / Get conversation
      .addCase(fetchOrCreateConversation.fulfilled, (state, action) => {
        state.currentConversation = action.payload;

        const exists = state.conversations.find(
          (c) => c._id === action.payload._id,
        );
        if (!exists) {
          state.conversations.unshift(action.payload);
        }
      })

      // Messages
      .addCase(fetchMessages.pending, (state) => {
        state.messagesLoading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        if (
          state.currentConversation &&
          state.currentConversation._id === action.meta.arg
        ) {
          state.messages = action.payload;
        }
        state.messagesLoading = false;
      })
      .addCase(fetchMessages.rejected, (state) => {
        state.messagesLoading = false;
      })

      // Send text message
      .addCase(
        sendTextMessageThunk.fulfilled,
        (state, action: PayloadAction<Message>) => {
          const msg = action.payload;

          if (state.currentConversation?._id === msg.conversationId) {
            state.messages.push(msg);
          }

          const conversation = state.conversations.find(
            (c) => c._id === msg.conversationId,
          );

          if (conversation) {
            conversation.lastMessage = msg;
            conversation.lastMessageAt = msg.createdAt;
          } else {
            state.conversations.unshift({
              _id: msg.conversationId,
              lastMessage: msg,
              lastMessageAt: msg.createdAt,
              unreadCount: 0,
            } as Conversation);
          }
        },
      )

      // Send image message
      .addCase(sendImageMessageThunk.fulfilled, (state, action) => {
        const realMsg = action.payload;

        const optimisticMsg = state.messages.find(
          (m) =>
            m.messageType === "image" &&
            m.optimistic &&
            m.status === "sending" &&
            m.conversationId === realMsg.conversationId,
        );

        if (optimisticMsg) {
          Object.assign(optimisticMsg, {
            ...realMsg,
            optimistic: false,
            status: "sent",
          });
        } else {
          state.messages.push({
            ...realMsg,
            status: "sent",
          });
        }

        const conversation = state.conversations.find(
          (c) => c._id === realMsg.conversationId,
        );

        if (conversation) {
          conversation.lastMessage = realMsg;
          conversation.lastMessageAt = realMsg.createdAt;
        }
      })

      // Unread count
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })

      // Mark as read
      .addCase(markMessageAsReadThunk.fulfilled, (state, action) => {
        const { _id, isRead } = action.payload;

        const msg = state.messages.find((m) => m._id === _id);
        if (msg) {
          msg.isRead = isRead;
        }
      });
  },
});

export default messageSlice.reducer;
export const {
  clearMessages,
  setCurrentConversation,
  pushMessage,
  pushOptimisticMessage,
  updateMessageStatus,
  clearUnreadForConversation,
  handleIncomingMessage,
  userTyping,
  userStopTyping,
} = messageSlice.actions;
