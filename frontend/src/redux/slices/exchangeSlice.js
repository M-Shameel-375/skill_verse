// ============================================
// SKILL EXCHANGE SLICE
// ============================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

// ============================================
// INITIAL STATE
// ============================================
const initialState = {
  exchanges: [],
  currentExchange: null,
  myExchanges: [],
  receivedRequests: [],
  sentRequests: [],
  matches: [],
  
  // Pagination
  currentPage: 1,
  totalPages: 1,
  totalExchanges: 0,
  
  // Filters
  filters: {
    offeredSkill: '',
    desiredSkill: '',
    status: '',
  },
  
  // Loading states
  loading: false,
  exchangeLoading: false,
  createLoading: false,
  matchLoading: false,
  
  error: null,
};

// ============================================
// ASYNC THUNKS
// ============================================

/**
 * Get all skill exchanges
 */
export const getSkillExchanges = createAsyncThunk(
  'exchange/getSkillExchanges',
  async ({ page = 1, limit = 10, filters = {} }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        ...filters,
      });
      const response = await axios.get(`/skill-exchanges?${queryParams}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Get exchange by ID
 */
export const getExchangeById = createAsyncThunk(
  'exchange/getExchangeById',
  async (exchangeId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/skill-exchanges/${exchangeId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Create skill exchange request
 */
export const createSkillExchange = createAsyncThunk(
  'exchange/createSkillExchange',
  async (exchangeData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/skill-exchanges', exchangeData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Update skill exchange
 */
export const updateSkillExchange = createAsyncThunk(
  'exchange/updateSkillExchange',
  async ({ exchangeId, updates }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/skill-exchanges/${exchangeId}`, updates);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Delete skill exchange
 */
export const deleteSkillExchange = createAsyncThunk(
  'exchange/deleteSkillExchange',
  async (exchangeId, { rejectWithValue }) => {
    try {
      await axios.delete(`/skill-exchanges/${exchangeId}`);
      return exchangeId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Accept exchange request
 */
export const acceptExchangeRequest = createAsyncThunk(
  'exchange/acceptExchangeRequest',
  async (exchangeId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/skill-exchanges/${exchangeId}/accept`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Reject exchange request
 */
export const rejectExchangeRequest = createAsyncThunk(
  'exchange/rejectExchangeRequest',
  async (exchangeId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/skill-exchanges/${exchangeId}/reject`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Complete exchange
 */
export const completeExchange = createAsyncThunk(
  'exchange/completeExchange',
  async (exchangeId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/skill-exchanges/${exchangeId}/complete`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Get my exchanges
 */
export const getMyExchanges = createAsyncThunk(
  'exchange/getMyExchanges',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/skill-exchanges/my-exchanges');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Get received requests
 */
export const getReceivedRequests = createAsyncThunk(
  'exchange/getReceivedRequests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/skill-exchanges/received');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Get sent requests
 */
export const getSentRequests = createAsyncThunk(
  'exchange/getSentRequests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/skill-exchanges/sent');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Find matches
 */
export const findMatches = createAsyncThunk(
  'exchange/findMatches',
  async ({ offeredSkill, desiredSkill }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/skill-exchanges/find-matches', {
        offeredSkill,
        desiredSkill,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Rate exchange partner
 */
export const rateExchangePartner = createAsyncThunk(
  'exchange/ratePartner',
  async ({ exchangeId, rating, review }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/skill-exchanges/${exchangeId}/rate`, {
        rating,
        review,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ============================================
// SKILL EXCHANGE SLICE
// ============================================
const exchangeSlice = createSlice({
  name: 'exchange',
  initialState,
  reducers: {
    clearExchangeError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearCurrentExchange: (state) => {
      state.currentExchange = null;
    },
    clearMatches: (state) => {
      state.matches = [];
    },
  },
  extraReducers: (builder) => {
    // Get Skill Exchanges
    builder
      .addCase(getSkillExchanges.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSkillExchanges.fulfilled, (state, action) => {
        state.loading = false;
        state.exchanges = action.payload.exchanges;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
        state.totalExchanges = action.payload.total;
      })
      .addCase(getSkillExchanges.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // Get Exchange By ID
      .addCase(getExchangeById.pending, (state) => {
        state.exchangeLoading = true;
        state.error = null;
      })
      .addCase(getExchangeById.fulfilled, (state, action) => {
        state.exchangeLoading = false;
        state.currentExchange = action.payload;
      })
      .addCase(getExchangeById.rejected, (state, action) => {
        state.exchangeLoading = false;
        state.error = action.payload;
      })

    // Create Skill Exchange
      .addCase(createSkillExchange.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createSkillExchange.fulfilled, (state, action) => {
        state.createLoading = false;
        state.myExchanges.unshift(action.payload);
        state.sentRequests.unshift(action.payload);
      })
      .addCase(createSkillExchange.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      })

    // Update Skill Exchange
      .addCase(updateSkillExchange.fulfilled, (state, action) => {
        state.currentExchange = action.payload;
        const index = state.myExchanges.findIndex(e => e._id === action.payload._id);
        if (index !== -1) {
          state.myExchanges[index] = action.payload;
        }
      })

    // Delete Skill Exchange
      .addCase(deleteSkillExchange.fulfilled, (state, action) => {
        state.myExchanges = state.myExchanges.filter(e => e._id !== action.payload);
        state.exchanges = state.exchanges.filter(e => e._id !== action.payload);
      })

    // Accept Exchange Request
      .addCase(acceptExchangeRequest.fulfilled, (state, action) => {
        const index = state.receivedRequests.findIndex(r => r._id === action.payload._id);
        if (index !== -1) {
          state.receivedRequests[index] = action.payload;
        }
      })

    // Reject Exchange Request
      .addCase(rejectExchangeRequest.fulfilled, (state, action) => {
        state.receivedRequests = state.receivedRequests.filter(r => r._id !== action.payload._id);
      })

    // Complete Exchange
      .addCase(completeExchange.fulfilled, (state, action) => {
        const index = state.myExchanges.findIndex(e => e._id === action.payload._id);
        if (index !== -1) {
          state.myExchanges[index] = action.payload;
        }
      })

    // Get My Exchanges
      .addCase(getMyExchanges.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMyExchanges.fulfilled, (state, action) => {
        state.loading = false;
        state.myExchanges = action.payload;
      })
      .addCase(getMyExchanges.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // Get Received Requests
      .addCase(getReceivedRequests.fulfilled, (state, action) => {
        state.receivedRequests = action.payload;
      })

    // Get Sent Requests
      .addCase(getSentRequests.fulfilled, (state, action) => {
        state.sentRequests = action.payload;
      })

    // Find Matches
      .addCase(findMatches.pending, (state) => {
        state.matchLoading = true;
      })
      .addCase(findMatches.fulfilled, (state, action) => {
        state.matchLoading = false;
        state.matches = action.payload;
      })
      .addCase(findMatches.rejected, (state, action) => {
        state.matchLoading = false;
        state.error = action.payload;
      });
  },
});

// ============================================
// ACTIONS
// ============================================
export const {
  clearExchangeError,
  setFilters,
  clearFilters,
  clearCurrentExchange,
  clearMatches,
} = exchangeSlice.actions;

// ============================================
// SELECTORS
// ============================================
export const selectExchanges = (state) => state.exchange.exchanges;
export const selectCurrentExchange = (state) => state.exchange.currentExchange;
export const selectMyExchanges = (state) => state.exchange.myExchanges;
export const selectReceivedRequests = (state) => state.exchange.receivedRequests;
export const selectSentRequests = (state) => state.exchange.sentRequests;
export const selectMatches = (state) => state.exchange.matches;
export const selectExchangeFilters = (state) => state.exchange.filters;
export const selectExchangeLoading = (state) => state.exchange.loading;
export const selectExchangeError = (state) => state.exchange.error;

// ============================================
// REDUCER
// ============================================
export default exchangeSlice.reducer;