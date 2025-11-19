// ============================================
// QUIZ SLICE
// ============================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

// ============================================
// INITIAL STATE
// ============================================
const initialState = {
  quizzes: [],
  currentQuiz: null,
  currentQuestion: 0,
  answers: {},
  results: null,
  userQuizzes: [],
  
  // Quiz taking state
  isQuizActive: false,
  startTime: null,
  timeRemaining: null,
  
  // Loading states
  loading: false,
  quizLoading: false,
  submitLoading: false,
  
  error: null,
};

// ============================================
// ASYNC THUNKS
// ============================================

/**
 * Get all quizzes
 */
export const getQuizzes = createAsyncThunk(
  'quiz/getQuizzes',
  async ({ courseId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/courses/${courseId}/quizzes`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Get quiz by ID
 */
export const getQuizById = createAsyncThunk(
  'quiz/getQuizById',
  async (quizId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/quizzes/${quizId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Create new quiz
 */
export const createQuiz = createAsyncThunk(
  'quiz/createQuiz',
  async ({ courseId, quizData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/courses/${courseId}/quizzes`, quizData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Update quiz
 */
export const updateQuiz = createAsyncThunk(
  'quiz/updateQuiz',
  async ({ quizId, updates }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/quizzes/${quizId}`, updates);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Delete quiz
 */
export const deleteQuiz = createAsyncThunk(
  'quiz/deleteQuiz',
  async (quizId, { rejectWithValue }) => {
    try {
      await axios.delete(`/quizzes/${quizId}`);
      return quizId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Start quiz
 */
export const startQuiz = createAsyncThunk(
  'quiz/startQuiz',
  async (quizId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/quizzes/${quizId}/start`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Submit quiz
 */
export const submitQuiz = createAsyncThunk(
  'quiz/submitQuiz',
  async ({ quizId, answers }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/quizzes/${quizId}/submit`, { answers });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Get quiz results
 */
export const getQuizResults = createAsyncThunk(
  'quiz/getQuizResults',
  async ({ quizId, attemptId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/quizzes/${quizId}/results/${attemptId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Get user quiz attempts
 */
export const getUserQuizAttempts = createAsyncThunk(
  'quiz/getUserQuizAttempts',
  async (quizId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/quizzes/${quizId}/attempts`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Retake quiz
 */
export const retakeQuiz = createAsyncThunk(
  'quiz/retakeQuiz',
  async (quizId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/quizzes/${quizId}/retake`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ============================================
// QUIZ SLICE
// ============================================
const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    clearQuizError: (state) => {
      state.error = null;
    },
    setCurrentQuestion: (state, action) => {
      state.currentQuestion = action.payload;
    },
    nextQuestion: (state) => {
      if (state.currentQuiz && state.currentQuestion < state.currentQuiz.questions.length - 1) {
        state.currentQuestion += 1;
      }
    },
    previousQuestion: (state) => {
      if (state.currentQuestion > 0) {
        state.currentQuestion -= 1;
      }
    },
    setAnswer: (state, action) => {
      const { questionId, answer } = action.payload;
      state.answers[questionId] = answer;
    },
    clearAnswers: (state) => {
      state.answers = {};
    },
    setTimeRemaining: (state, action) => {
      state.timeRemaining = action.payload;
    },
    decrementTime: (state) => {
      if (state.timeRemaining > 0) {
        state.timeRemaining -= 1;
      }
    },
    clearQuizState: (state) => {
      state.currentQuiz = null;
      state.currentQuestion = 0;
      state.answers = {};
      state.results = null;
      state.isQuizActive = false;
      state.startTime = null;
      state.timeRemaining = null;
    },
  },
  extraReducers: (builder) => {
    // Get Quizzes
    builder
      .addCase(getQuizzes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getQuizzes.fulfilled, (state, action) => {
        state.loading = false;
        state.quizzes = action.payload;
      })
      .addCase(getQuizzes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // Get Quiz By ID
      .addCase(getQuizById.pending, (state) => {
        state.quizLoading = true;
        state.error = null;
      })
      .addCase(getQuizById.fulfilled, (state, action) => {
        state.quizLoading = false;
        state.currentQuiz = action.payload;
      })
      .addCase(getQuizById.rejected, (state, action) => {
        state.quizLoading = false;
        state.error = action.payload;
      })

    // Create Quiz
      .addCase(createQuiz.pending, (state) => {
        state.loading = true;
      })
      .addCase(createQuiz.fulfilled, (state, action) => {
        state.loading = false;
        state.quizzes.push(action.payload);
      })
      .addCase(createQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // Update Quiz
      .addCase(updateQuiz.fulfilled, (state, action) => {
        state.currentQuiz = action.payload;
        const index = state.quizzes.findIndex(q => q._id === action.payload._id);
        if (index !== -1) {
          state.quizzes[index] = action.payload;
        }
      })

    // Delete Quiz
      .addCase(deleteQuiz.fulfilled, (state, action) => {
        state.quizzes = state.quizzes.filter(q => q._id !== action.payload);
      })

    // Start Quiz
      .addCase(startQuiz.fulfilled, (state, action) => {
        state.currentQuiz = action.payload;
        state.isQuizActive = true;
        state.startTime = Date.now();
        state.currentQuestion = 0;
        state.answers = {};
        if (action.payload.timeLimit) {
          state.timeRemaining = action.payload.timeLimit * 60; // Convert to seconds
        }
      })

    // Submit Quiz
      .addCase(submitQuiz.pending, (state) => {
        state.submitLoading = true;
      })
      .addCase(submitQuiz.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.results = action.payload;
        state.isQuizActive = false;
      })
      .addCase(submitQuiz.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload;
      })

    // Get Quiz Results
      .addCase(getQuizResults.fulfilled, (state, action) => {
        state.results = action.payload;
      })

    // Get User Quiz Attempts
      .addCase(getUserQuizAttempts.fulfilled, (state, action) => {
        state.userQuizzes = action.payload;
      })

    // Retake Quiz
      .addCase(retakeQuiz.fulfilled, (state, action) => {
        state.currentQuiz = action.payload;
        state.isQuizActive = true;
        state.startTime = Date.now();
        state.currentQuestion = 0;
        state.answers = {};
        state.results = null;
        if (action.payload.timeLimit) {
          state.timeRemaining = action.payload.timeLimit * 60;
        }
      });
  },
});

// ============================================
// ACTIONS
// ============================================
export const {
  clearQuizError,
  setCurrentQuestion,
  nextQuestion,
  previousQuestion,
  setAnswer,
  clearAnswers,
  setTimeRemaining,
  decrementTime,
  clearQuizState,
} = quizSlice.actions;

// ============================================
// SELECTORS
// ============================================
export const selectQuizzes = (state) => state.quiz.quizzes;
export const selectCurrentQuiz = (state) => state.quiz.currentQuiz;
export const selectCurrentQuestion = (state) => state.quiz.currentQuestion;
export const selectAnswers = (state) => state.quiz.answers;
export const selectQuizResults = (state) => state.quiz.results;
export const selectIsQuizActive = (state) => state.quiz.isQuizActive;
export const selectTimeRemaining = (state) => state.quiz.timeRemaining;
export const selectUserQuizzes = (state) => state.quiz.userQuizzes;
export const selectQuizLoading = (state) => state.quiz.loading;
export const selectQuizError = (state) => state.quiz.error;

// ============================================
// REDUCER
// ============================================
export default quizSlice.reducer;