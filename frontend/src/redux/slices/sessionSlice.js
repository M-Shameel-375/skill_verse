// ============================================
// LIVE SESSION SLICE
// ============================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

// ============================================
// INITIAL STATE
// ============================================
const initialState = {
  sessions: [],
  currentSession: null,
  mySessions: [],
  upcomingSessions: [],
  pastSessions: [],
  
  // Session room state
  participants: [],
  messages: [],
  isLive: false,
  
  // Pagination
  currentPage: 1,
  totalPages: 1,
  totalSessions: 0,
  
  // Loading states
  loading: false,
  sessionLoading: false,
  createLoading: false,
  joinLoading: false,
  
  error: null,
};

// ============================================
// ASYNC THUNKS
// ============================================

/**
 * Get all live sessions
 */
export const getLiveSessions = createAsyncThunk(
  'session/getLiveSessions',
  async ({ page = 1, limit = 10, filters = {} }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        ...filters,
      });
      const response = await axios.get(`/live-sessions?${queryParams}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Get session by ID
 */
export const getSessionById = createAsyncThunk(
  'session/getSessionById',
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/live-sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Create new live session
 */
export const createLiveSession = createAsyncThunk(
  'session/createLiveSession',
  async (sessionData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/live-sessions', sessionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Update live session
 */
export const updateLiveSession = createAsyncThunk(
  'session/updateLiveSession',
  async ({ sessionId, updates }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/live-sessions/${sessionId}`, updates);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Delete live session
 */
export const deleteLiveSession = createAsyncThunk(
  'session/deleteLiveSession',
  async (sessionId, { rejectWithValue }) => {
    try {
      await axios.delete(`/live-sessions/${sessionId}`);
      return sessionId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Join live session
 */
export const joinLiveSession = createAsyncThunk(
  'session/joinLiveSession',
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/live-sessions/${sessionId}/join`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Leave live session
 */
export const leaveLiveSession = createAsyncThunk(
  'session/leaveLiveSession',
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/live-sessions/${sessionId}/leave`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Start live session
 */
export const startLiveSession = createAsyncThunk(
  'session/startLiveSession',
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/live-sessions/${sessionId}/start`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * End live session
 */
export const endLiveSession = createAsyncThunk(
  'session/endLiveSession',
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/live-sessions/${sessionId}/end`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Get my sessions (created by educator)
 */
export const getMySessions = createAsyncThunk(
  'session/getMySessions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/live-sessions/my-sessions');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Get upcoming sessions
 */
export const getUpcomingSessions = createAsyncThunk(
  'session/getUpcomingSessions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/live-sessions/upcoming');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Get past sessions
 */
export const getPastSessions = createAsyncThunk(
  'session/getPastSessions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/live-sessions/past');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Get session participants
 */
export const getSessionParticipants = createAsyncThunk(
  'session/getSessionParticipants',
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/live-sessions/${sessionId}/participants`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ============================================
// LIVE SESSION SLICE
// ============================================
const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    clearSessionError: (state) => {
      state.error = null;
    },
    setCurrentSession: (state, action) => {
      state.currentSession = action.payload;
    },
    clearCurrentSession: (state) => {
      state.currentSession = null;
      state.participants = [];
      state.messages = [];
      state.isLive = false;
    },
    addParticipant: (state, action) => {
      if (!state.participants.find(p => p._id === action.payload._id)) {
        state.participants.push(action.payload);
      }
    },
    removeParticipant: (state, action) => {
      state.participants = state.participants.filter(p => p._id !== action.payload);
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    setIsLive: (state, action) => {
      state.isLive = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Get Live Sessions
    builder
      .addCase(getLiveSessions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLiveSessions.fulfilled, (state, action) => {
        state.loading = false;
        state.sessions = action.payload.sessions;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
        state.totalSessions = action.payload.total;
      })
      .addCase(getLiveSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // Get Session By ID
      .addCase(getSessionById.pending, (state) => {
        state.sessionLoading = true;
        state.error = null;
      })
      .addCase(getSessionById.fulfilled, (state, action) => {
        state.sessionLoading = false;
        state.currentSession = action.payload;
      })
      .addCase(getSessionById.rejected, (state, action) => {
        state.sessionLoading = false;
        state.error = action.payload;
      })

    // Create Live Session
      .addCase(createLiveSession.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createLiveSession.fulfilled, (state, action) => {
        state.createLoading = false;
        state.mySessions.unshift(action.payload);
      })
      .addCase(createLiveSession.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      })

    // Update Live Session
      .addCase(updateLiveSession.pending, (state) => {
        state.createLoading = true;
      })
      .addCase(updateLiveSession.fulfilled, (state, action) => {
        state.createLoading = false;
        state.currentSession = action.payload;
        const index = state.mySessions.findIndex(s => s._id === action.payload._id);
        if (index !== -1) {
          state.mySessions[index] = action.payload;
        }
      })
      .addCase(updateLiveSession.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      })

    // Delete Live Session
      .addCase(deleteLiveSession.fulfilled, (state, action) => {
        state.mySessions = state.mySessions.filter(s => s._id !== action.payload);
        state.sessions = state.sessions.filter(s => s._id !== action.payload);
      })

    // Join Live Session
      .addCase(joinLiveSession.pending, (state) => {
        state.joinLoading = true;
      })
      .addCase(joinLiveSession.fulfilled, (state, action) => {
        state.joinLoading = false;
        state.currentSession = action.payload;
      })
      .addCase(joinLiveSession.rejected, (state, action) => {
        state.joinLoading = false;
        state.error = action.payload;
      })

    // Start Live Session
      .addCase(startLiveSession.fulfilled, (state, action) => {
        state.currentSession = action.payload;
        state.isLive = true;
      })

    // End Live Session
      .addCase(endLiveSession.fulfilled, (state, action) => {
        state.currentSession = action.payload;
        state.isLive = false;
      })

    // Get My Sessions
      .addCase(getMySessions.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMySessions.fulfilled, (state, action) => {
        state.loading = false;
        state.mySessions = action.payload;
      })
      .addCase(getMySessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // Get Upcoming Sessions
      .addCase(getUpcomingSessions.fulfilled, (state, action) => {
        state.upcomingSessions = action.payload;
      })

    // Get Past Sessions
      .addCase(getPastSessions.fulfilled, (state, action) => {
        state.pastSessions = action.payload;
      })

    // Get Session Participants
      .addCase(getSessionParticipants.fulfilled, (state, action) => {
        state.participants = action.payload;
      });
  },
});

// ============================================
// ACTIONS
// ============================================
export const {
  clearSessionError,
  setCurrentSession,
  clearCurrentSession,
  addParticipant,
  removeParticipant,
  addMessage,
  clearMessages,
  setIsLive,
} = sessionSlice.actions;

// ============================================
// SELECTORS
// ============================================
export const selectSessions = (state) => state.session.sessions;
export const selectCurrentSession = (state) => state.session.currentSession;
export const selectMySessions = (state) => state.session.mySessions;
export const selectUpcomingSessions = (state) => state.session.upcomingSessions;
export const selectPastSessions = (state) => state.session.pastSessions;
export const selectSessionParticipants = (state) => state.session.participants;
export const selectSessionMessages = (state) => state.session.messages;
export const selectIsLive = (state) => state.session.isLive;
export const selectSessionLoading = (state) => state.session.loading;
export const selectSessionError = (state) => state.session.error;

// ============================================
// REDUCER
// ============================================
export default sessionSlice.reducer;