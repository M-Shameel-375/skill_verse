// Chat slice
// ============================================
// CHAT SLICE
// ============================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

// ============================================
// INITIAL STATE
// ============================================
const initialState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  
  // Online users
  onlineUsers: [],
  
  // Typing indicators
  typingUsers: {},
  
  // Unread counts
  unreadCounts: {},
  totalUnread: 0,
  
  // Pagination
  messagesPage: 1,
  hasMoreMessages: true,
  
  // Loading states
  loading: false,
  messagesLoading: false,
  sendingMessage: false,
  
  error: null,
};

// ============================================
// ASYNC THUNKS
// ============================================

/**
 * Get all conversations
 */
export const getConversations = createAsyncThunk(
  'chat/getConversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/chat/conversations');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Get conversation by ID
 */
export const getConversationById = createAsyncThunk(
  'chat/getConversationById',
  async (conversationId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/chat/conversations/${conversationId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Get messages for a conversation
 */
export const getMessages = createAsyncThunk(
  'chat/getMessages',
  async ({ conversationId, page = 1, limit = 50 }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `/chat/conversations/${conversationId}/messages?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Send message
 */
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ conversationId, content, attachments = [] }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/chat/conversations/${conversationId}/messages`, {
        content,
        attachments,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Create or get conversation
 */
export const createConversation = createAsyncThunk(
  'chat/createConversation',
  async ({ participantId, initialMessage }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/chat/conversations', {
        participantId,
        initialMessage,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Mark messages as read
 */
export const markAsRead = createAsyncThunk(
  'chat/markAsRead',
  async (conversationId, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/chat/conversations/${conversationId}/read`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Delete conversation
 */
export const deleteConversation = createAsyncThunk(
  'chat/deleteConversation',
  async (conversationId, { rejectWithValue }) => {
    try {
      await axios.delete(`/chat/conversations/${conversationId}`);
      return conversationId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Delete message
 */
export const deleteMessage = createAsyncThunk(
  'chat/deleteMessage',
  async ({ conversationId, messageId }, { rejectWithValue }) => {
    try {
      await axios.delete(`/chat/conversations/${conversationId}/messages/${messageId}`);
      return messageId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Search messages
 */
export const searchMessages = createAsyncThunk(
  'chat/searchMessages',
  async ({ conversationId, query }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `/chat/conversations/${conversationId}/search?q=${query}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Upload file
 */
export const uploadChatFile = createAsyncThunk(
  'chat/uploadFile',
  async ({ conversationId, file }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(
        `/chat/conversations/${conversationId}/upload`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ============================================
// CHAT SLICE
// ============================================
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearChatError: (state) => {
      state.error = null;
    },
    
    setCurrentConversation: (state, action) => {
      state.currentConversation = action.payload;
      state.messages = [];
      state.messagesPage = 1;
      state.hasMoreMessages = true;
    },
    
    clearCurrentConversation: (state) => {
      state.currentConversation = null;
      state.messages = [];
      state.messagesPage = 1;
      state.hasMoreMessages = true;
    },
    
    addMessage: (state, action) => {
      const message = action.payload;
      
      // Add to messages if in current conversation
      if (state.currentConversation?._id === message.conversation) {
        state.messages.push(message);
      }
      
      // Update conversation's last message
      const convIndex = state.conversations.findIndex(
        c => c._id === message.conversation
      );
      if (convIndex !== -1) {
        state.conversations[convIndex].lastMessage = message;
        state.conversations[convIndex].updatedAt = message.createdAt;
        
        // Move to top
        const conv = state.conversations.splice(convIndex, 1)[0];
        state.conversations.unshift(conv);
      }
    },
    
    updateMessage: (state, action) => {
      const { messageId, updates } = action.payload;
      const index = state.messages.findIndex(m => m._id === messageId);
      if (index !== -1) {
        state.messages[index] = { ...state.messages[index], ...updates };
      }
    },
    
    removeMessage: (state, action) => {
      state.messages = state.messages.filter(m => m._id !== action.payload);
    },
    
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    
    addOnlineUser: (state, action) => {
      if (!state.onlineUsers.includes(action.payload)) {
        state.onlineUsers.push(action.payload);
      }
    },
    
    removeOnlineUser: (state, action) => {
      state.onlineUsers = state.onlineUsers.filter(id => id !== action.payload);
    },
    
    setTypingUser: (state, action) => {
      const { conversationId, userId, isTyping } = action.payload;
      if (isTyping) {
        state.typingUsers[conversationId] = userId;
      } else {
        delete state.typingUsers[conversationId];
      }
    },
    
    setUnreadCount: (state, action) => {
      const { conversationId, count } = action.payload;
      const oldCount = state.unreadCounts[conversationId] || 0;
      state.unreadCounts[conversationId] = count;
      state.totalUnread = state.totalUnread - oldCount + count;
    },
    
    incrementUnreadCount: (state, action) => {
      const conversationId = action.payload;
      state.unreadCounts[conversationId] = (state.unreadCounts[conversationId] || 0) + 1;
      state.totalUnread += 1;
    },
    
    clearUnreadCount: (state, action) => {
      const conversationId = action.payload;
      const count = state.unreadCounts[conversationId] || 0;
      state.unreadCounts[conversationId] = 0;
      state.totalUnread = Math.max(0, state.totalUnread - count);
    },
  },
  
  extraReducers: (builder) => {
    // Get Conversations
    builder
      .addCase(getConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload.conversations;
        state.unreadCounts = action.payload.unreadCounts || {};
        state.totalUnread = Object.values(state.unreadCounts).reduce((a, b) => a + b, 0);
      })
      .addCase(getConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // Get Conversation By ID
      .addCase(getConversationById.fulfilled, (state, action) => {
        state.currentConversation = action.payload;
      })

    // Get Messages
      .addCase(getMessages.pending, (state) => {
        state.messagesLoading = true;
      })
      .addCase(getMessages.fulfilled, (state, action) => {
        state.messagesLoading = false;
        
        if (action.payload.currentPage === 1) {
          state.messages = action.payload.messages;
        } else {
          // Prepend older messages
          state.messages = [...action.payload.messages, ...state.messages];
        }
        
        state.messagesPage = action.payload.currentPage;
        state.hasMoreMessages = action.payload.currentPage < action.payload.totalPages;
      })
      .addCase(getMessages.rejected, (state, action) => {
        state.messagesLoading = false;
        state.error = action.payload;
      })

    // Send Message
      .addCase(sendMessage.pending, (state) => {
        state.sendingMessage = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sendingMessage = false;
        state.messages.push(action.payload);
        
        // Update conversation's last message
        if (state.currentConversation) {
          state.currentConversation.lastMessage = action.payload;
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sendingMessage = false;
        state.error = action.payload;
      })

    // Create Conversation
      .addCase(createConversation.fulfilled, (state, action) => {
        state.currentConversation = action.payload;
        state.conversations.unshift(action.payload);
      })

    // Mark As Read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const conversationId = action.payload.conversationId;
        const count = state.unreadCounts[conversationId] || 0;
        state.unreadCounts[conversationId] = 0;
        state.totalUnread = Math.max(0, state.totalUnread - count);
      })

    // Delete Conversation
      .addCase(deleteConversation.fulfilled, (state, action) => {
        state.conversations = state.conversations.filter(c => c._id !== action.payload);
        if (state.currentConversation?._id === action.payload) {
          state.currentConversation = null;
          state.messages = [];
        }
      })

    // Delete Message
      .addCase(deleteMessage.fulfilled, (state, action) => {
        state.messages = state.messages.filter(m => m._id !== action.payload);
      });
  },
});

// ============================================
// ACTIONS
// ============================================
export const {
  clearChatError,
  setCurrentConversation,
  clearCurrentConversation,
  addMessage,
  updateMessage,
  removeMessage,
  setOnlineUsers,
  addOnlineUser,
  removeOnlineUser,
  setTypingUser,
  setUnreadCount,
  incrementUnreadCount,
  clearUnreadCount,
} = chatSlice.actions;

// ============================================
// SELECTORS
// ============================================
export const selectConversations = (state) => state.chat.conversations;
export const selectCurrentConversation = (state) => state.chat.currentConversation;
export const selectMessages = (state) => state.chat.messages;
export const selectOnlineUsers = (state) => state.chat.onlineUsers;
export const selectTypingUsers = (state) => state.chat.typingUsers;
export const selectUnreadCounts = (state) => state.chat.unreadCounts;
export const selectTotalUnread = (state) => state.chat.totalUnread;
export const selectHasMoreMessages = (state) => state.chat.hasMoreMessages;
export const selectChatLoading = (state) => state.chat.loading;
export const selectMessagesLoading = (state) => state.chat.messagesLoading;
export const selectSendingMessage = (state) => state.chat.sendingMessage;
export const selectChatError = (state) => state.chat.error;

// ============================================
// REDUCER
// ============================================
export default chatSlice.reducer;