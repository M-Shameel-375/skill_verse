// ============================================
// REDUX STORE CONFIGURATION
// ============================================

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import courseReducer from './slices/courseSlice';
import sessionReducer from './slices/sessionSlice';
import exchangeReducer from './slices/exchangeSlice';
import quizReducer from './slices/quizSlice';
import notificationReducer from './slices/notificationSlice';
import chatReducer from './slices/chatSlice';
import uiReducer from './slices/uiSlice';

// ============================================
// CONFIGURE STORE
// ============================================
const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    course: courseReducer,
    session: sessionReducer,
    exchange: exchangeReducer,
    quiz: quizReducer,
    notification: notificationReducer,
    chat: chatReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['auth/login/fulfilled', 'auth/register/fulfilled'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['items.dates'],
      },
    }),
  devTools: import.meta.env.MODE !== 'production',
});

// ============================================
// EXPORT STORE
// ============================================
export default store;

// ============================================
// EXPORT TYPES FOR TYPESCRIPT (OPTIONAL)
// ============================================
export const getState = store.getState;
export const dispatch = store.dispatch;