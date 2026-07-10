import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

export const fetchChats = createAsyncThunk(
  'chat/fetchChats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/chats');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch chats');
    }
  }
);

export const createChat = createAsyncThunk(
  'chat/createChat',
  async (targetUserId, { rejectWithValue }) => {
    try {
      const response = await api.post('/chats', { targetUserId });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to initiate chat');
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (chatId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/chats/${chatId}/messages`);
      return { chatId, messages: response.data.messages };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages');
    }
  }
);

export const sendChatMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ chatId, text }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/chats/${chatId}/messages`, { text });
      return response.data; // contains message object
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send message');
    }
  }
);

const initialState = {
  chats: [],
  messages: [],
  activeChatId: null,
  loading: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveChat: (state, action) => {
      state.activeChatId = action.payload;
    },
    clearActiveChat: (state) => {
      state.activeChatId = null;
      state.messages = [];
    },
    // Used for real-time appends if socket-like behavior is added
    appendNewMessage: (state, action) => {
      if (state.activeChatId === action.payload.chat) {
        state.messages.push(action.payload);
      }
      // Update last message in the chat list item
      const chatIndex = state.chats.findIndex((c) => c._id === action.payload.chat);
      if (chatIndex !== -1) {
        state.chats[chatIndex].lastMessage = action.payload.text;
        state.chats[chatIndex].updatedAt = new Date().toISOString();
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch chats list
      .addCase(fetchChats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.loading = false;
        state.chats = action.payload.chats;
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create chat thread
      .addCase(createChat.fulfilled, (state, action) => {
        const exists = state.chats.find((c) => c._id === action.payload.chat._id);
        if (!exists) {
          state.chats.unshift(action.payload.chat);
        }
        state.activeChatId = action.payload.chat._id;
      })
      // Fetch messages list
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload.messages;
        state.activeChatId = action.payload.chatId;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Send chat message
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload.message);
        const chatIndex = state.chats.findIndex((c) => c._id === action.payload.message.chat);
        if (chatIndex !== -1) {
          state.chats[chatIndex].lastMessage = action.payload.message.text;
          state.chats[chatIndex].updatedAt = action.payload.message.createdAt;
        }
      });
  },
});

export const { setActiveChat, clearActiveChat, appendNewMessage } = chatSlice.actions;
export default chatSlice.reducer;
