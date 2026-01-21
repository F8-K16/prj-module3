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
      state.messages = [];
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
  },
  extraReducers: (builder) => {
    builder

      // Conversations
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload;
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
          state.messages.push(action.payload);
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
} = messageSlice.actions;
