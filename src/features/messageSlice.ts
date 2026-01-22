import {
  createOrGetConversation,
  getConversations,
  getMessagesByConversation,
  getUnreadCount,
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
  loading: false,
  typingUsers: {},
};

/**
 * Get conversations
 */
export const fetchConversations = createAsyncThunk<Conversation[]>(
  "message/fetchConversations",
  async () => {
    return await getConversations();
  },
);

/**
 * Create or get conversation
 */
export const fetchOrCreateConversation = createAsyncThunk<Conversation, string>(
  "message/fetchOrCreateConversation",
  async (userId) => {
    return await createOrGetConversation(userId);
  },
);

/**
 * Get messages by conversation
 */
export const fetchMessages = createAsyncThunk<Message[], string>(
  "message/fetchMessages",
  async (conversationId) => {
    return await getMessagesByConversation(conversationId);
  },
);

/**
 * Send text message
 */
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

/**
 * Send image message
 */
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

/**
 * Get unread count
 */
export const fetchUnreadCount = createAsyncThunk<number>(
  "message/fetchUnreadCount",
  async () => {
    return await getUnreadCount();
  },
);

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
        state.loading = true;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
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
        state.loading = false;
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
        state.loading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        if (
          state.currentConversation &&
          state.currentConversation._id === action.meta.arg
        ) {
          state.messages = action.payload;
        }
        state.loading = false;
      })
      .addCase(fetchMessages.rejected, (state) => {
        state.loading = false;
      })

      // Send text / image message
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

      // Unread count
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      });
  },
});

export default messageSlice.reducer;
export const {
  clearMessages,
  setCurrentConversation,
  pushMessage,
  clearUnreadForConversation,
  handleIncomingMessage,
  userTyping,
  userStopTyping,
} = messageSlice.actions;
