// ============================================
// NOTIFICATION SLICE
// ============================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

// ============================================
// INITIAL STATE
// ============================================
const initialState = {
  notifications: [],
  unreadCount: 0,
  
  // Pagination
  currentPage: 1,
  totalPages: 1,
  hasMore: true,
  
  // Filters
  filters: {
    type: '',
    read: '',
  },
  
  // Preferences
  preferences: {
    email: true,
    push: true,
    sms: false,
    courseUpdates: true,
    skillExchangeRequests: true,
    messages: true,
    promotions: false,
  },
  
  // Loading states
  loading: false,
  preferencesLoading: false,
  
  error: null,
};

// ============================================
// ASYNC THUNKS
// ============================================

/**
 * Get all notifications
 */
export const getNotifications = createAsyncThunk(
  'notification/getNotifications',
  async ({ page = 1, limit = 20, filters = {} }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        ...filters,
      });
      const response = await axios.get(`/notifications?${queryParams}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Get unread count
 */
export const getUnreadCount = createAsyncThunk(
  'notification/getUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/notifications/unread-count');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Mark notification as read
 */
export const markAsRead = createAsyncThunk(
  'notification/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Mark all as read
 */
export const markAllAsRead = createAsyncThunk(
  'notification/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.put('/notifications/mark-all-read');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Delete notification
 */
export const deleteNotification = createAsyncThunk(
  'notification/deleteNotification',
  async (notificationId, { rejectWithValue }) => {
    try {
      await axios.delete(`/notifications/${notificationId}`);
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Delete all notifications
 */
export const deleteAllNotifications = createAsyncThunk(
  'notification/deleteAllNotifications',
  async (_, { rejectWithValue }) => {
    try {
      await axios.delete('/notifications/delete-all');
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Get notification preferences
 */
export const getNotificationPreferences = createAsyncThunk(
  'notification/getPreferences',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/notifications/preferences');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Update notification preferences
 */
export const updateNotificationPreferences = createAsyncThunk(
  'notification/updatePreferences',
  async (preferences, { rejectWithValue }) => {
    try {
      const response = await axios.put('/notifications/preferences', preferences);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Send test notification
 */
export const sendTestNotification = createAsyncThunk(
  'notification/sendTest',
  async (type, { rejectWithValue }) => {
    try {
      const response = await axios.post('/notifications/send-test', { type });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ============================================
// NOTIFICATION SLICE
// ============================================
const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    clearNotificationError: (state) => {
      state.error = null;
    },
    
    addNotification: (state, action) => {
      // Add new notification to the beginning
      state.notifications.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
    
    removeNotification: (state, action) => {
      const notification = state.notifications.find(n => n._id === action.payload);
      if (notification && !notification.read) {
        state.unreadCount -= 1;
      }
      state.notifications = state.notifications.filter(n => n._id !== action.payload);
    },
    
    updateNotificationLocally: (state, action) => {
      const { id, updates } = action.payload;
      const index = state.notifications.findIndex(n => n._id === id);
      if (index !== -1) {
        state.notifications[index] = { ...state.notifications[index], ...updates };
      }
    },
    
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    
    resetNotifications: (state) => {
      state.notifications = [];
      state.currentPage = 1;
      state.hasMore = true;
    },
  },
  
  extraReducers: (builder) => {
    // Get Notifications
    builder
      .addCase(getNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getNotifications.fulfilled, (state, action) => {
        state.loading = false;
        
        if (action.payload.currentPage === 1) {
          state.notifications = action.payload.notifications;
        } else {
          // Append for pagination
          state.notifications = [...state.notifications, ...action.payload.notifications];
        }
        
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
        state.hasMore = action.payload.currentPage < action.payload.totalPages;
      })
      .addCase(getNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // Get Unread Count
      .addCase(getUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload.count;
      })

    // Mark As Read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(n => n._id === action.payload._id);
        if (index !== -1) {
          state.notifications[index] = action.payload;
          if (!state.notifications[index].read) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
        }
      })

    // Mark All As Read
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map(n => ({ ...n, read: true }));
        state.unreadCount = 0;
      })

    // Delete Notification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n._id === action.payload);
        if (notification && !notification.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications = state.notifications.filter(n => n._id !== action.payload);
      })

    // Delete All Notifications
      .addCase(deleteAllNotifications.fulfilled, (state) => {
        state.notifications = [];
        state.unreadCount = 0;
        state.currentPage = 1;
        state.hasMore = false;
      })

    // Get Notification Preferences
      .addCase(getNotificationPreferences.pending, (state) => {
        state.preferencesLoading = true;
      })
      .addCase(getNotificationPreferences.fulfilled, (state, action) => {
        state.preferencesLoading = false;
        state.preferences = action.payload;
      })
      .addCase(getNotificationPreferences.rejected, (state, action) => {
        state.preferencesLoading = false;
        state.error = action.payload;
      })

    // Update Notification Preferences
      .addCase(updateNotificationPreferences.pending, (state) => {
        state.preferencesLoading = true;
      })
      .addCase(updateNotificationPreferences.fulfilled, (state, action) => {
        state.preferencesLoading = false;
        state.preferences = action.payload;
      })
      .addCase(updateNotificationPreferences.rejected, (state, action) => {
        state.preferencesLoading = false;
        state.error = action.payload;
      });
  },
});

// ============================================
// ACTIONS
// ============================================
export const {
  clearNotificationError,
  addNotification,
  removeNotification,
  updateNotificationLocally,
  setFilters,
  clearFilters,
  resetNotifications,
} = notificationSlice.actions;

// ============================================
// SELECTORS
// ============================================
export const selectNotifications = (state) => state.notification.notifications;
export const selectUnreadCount = (state) => state.notification.unreadCount;
export const selectNotificationFilters = (state) => state.notification.filters;
export const selectNotificationPreferences = (state) => state.notification.preferences;
export const selectHasMoreNotifications = (state) => state.notification.hasMore;
export const selectNotificationLoading = (state) => state.notification.loading;
export const selectNotificationError = (state) => state.notification.error;

// ============================================
// REDUCER
// ============================================
export default notificationSlice.reducer;