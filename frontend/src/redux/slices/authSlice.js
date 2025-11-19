// ============================================
// AUTH REDUX SLICE
// ============================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authApi from '../../api/authApi';
import { storage } from '../../utils/helpers';
import config from '../../config';
import { setAuthToken, removeAuthToken } from '../../api/axios';

// ============================================
// INITIAL STATE
// ============================================
const initialState = {
  user: storage.get(config.auth.userKey) || null,
  token: storage.get(config.auth.tokenKey) || null,
  refreshToken: storage.get(config.auth.refreshTokenKey) || null,
  isAuthenticated: !!storage.get(config.auth.tokenKey),
  isEmailVerified: storage.get(config.auth.userKey)?.isEmailVerified || false,
  loading: false,
  error: null,
  
  // Registration state
  registrationSuccess: false,
  
  // Email verification state
  emailVerificationSuccess: false,
  
  // Password reset state
  passwordResetEmailSent: false,
  passwordResetSuccess: false,
};

// ============================================
// ASYNC THUNKS
// ============================================

/**
 * Register new user
 */
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authApi.register(userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

/**
 * Login user
 */
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

/**
 * Logout user
 */
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logout();
      return null;
    } catch (error) {
      // Even if API call fails, we still logout locally
      return null;
    }
  }
);

/**
 * Get current user
 */
export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getMe();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to get user data');
    }
  }
);

/**
 * Verify email
 */
export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (token, { rejectWithValue }) => {
    try {
      const response = await authApi.verifyEmail(token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Email verification failed');
    }
  }
);

/**
 * Resend verification email
 */
export const resendVerificationEmail = createAsyncThunk(
  'auth/resendVerificationEmail',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.resendVerificationEmail();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to resend verification email');
    }
  }
);

/**
 * Forgot password
 */
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await authApi.forgotPassword(email);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to send reset email');
    }
  }
);

/**
 * Reset password
 */
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await authApi.resetPassword(token, password);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Password reset failed');
    }
  }
);

/**
 * Change password
 */
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwords, { rejectWithValue }) => {
    try {
      const response = await authApi.changePassword(passwords);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to change password');
    }
  }
);

/**
 * Update user details
 */
export const updateUserDetails = createAsyncThunk(
  'auth/updateUserDetails',
  async (updates, { rejectWithValue }) => {
    try {
      const response = await authApi.updateDetails(updates);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update profile');
    }
  }
);

/**
 * Delete account
 */
export const deleteAccount = createAsyncThunk(
  'auth/deleteAccount',
  async (password, { rejectWithValue }) => {
    try {
      const response = await authApi.deleteAccount(password);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete account');
    }
  }
);

/**
 * Social login
 */
export const socialLogin = createAsyncThunk(
  'auth/socialLogin',
  async (socialData, { rejectWithValue }) => {
    try {
      const response = await authApi.socialLogin(socialData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Social login failed');
    }
  }
);

/**
 * Refresh token
 */
export const refreshAuthToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await authApi.refreshToken(auth.refreshToken);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Token refresh failed');
    }
  }
);

// ============================================
// AUTH SLICE
// ============================================
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Clear registration success
    clearRegistrationSuccess: (state) => {
      state.registrationSuccess = false;
    },
    
    // Clear email verification success
    clearEmailVerificationSuccess: (state) => {
      state.emailVerificationSuccess = false;
    },
    
    // Clear password reset states
    clearPasswordResetStates: (state) => {
      state.passwordResetEmailSent = false;
      state.passwordResetSuccess = false;
    },
    
    // Update user locally
    updateUserLocally: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      storage.set(config.auth.userKey, state.user);
    },
    
    // Set authentication from storage (for app initialization)
    initializeAuth: (state) => {
      const token = storage.get(config.auth.tokenKey);
      const refreshToken = storage.get(config.auth.refreshTokenKey);
      const user = storage.get(config.auth.userKey);
      
      if (token && user) {
        state.token = token;
        state.refreshToken = refreshToken;
        state.user = user;
        state.isAuthenticated = true;
        state.isEmailVerified = user.isEmailVerified || false;
        setAuthToken(token);
      }
    },
  },
  
  extraReducers: (builder) => {
    // ============================================
    // REGISTER
    // ============================================
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.registrationSuccess = false;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.isEmailVerified = action.payload.user.isEmailVerified;
        state.registrationSuccess = true;
        
        // Save to storage
        storage.set(config.auth.tokenKey, action.payload.accessToken);
        storage.set(config.auth.refreshTokenKey, action.payload.refreshToken);
        storage.set(config.auth.userKey, action.payload.user);
        
        // Set axios auth token
        setAuthToken(action.payload.accessToken);
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
    
    // ============================================
    // LOGIN
    // ============================================
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.isEmailVerified = action.payload.user.isEmailVerified;
        
        // Save to storage
        storage.set(config.auth.tokenKey, action.payload.accessToken);
        storage.set(config.auth.refreshTokenKey, action.payload.refreshToken);
        storage.set(config.auth.userKey, action.payload.user);
        
        // Set axios auth token
        setAuthToken(action.payload.accessToken);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
    
    // ============================================
    // LOGOUT
    // ============================================
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.isEmailVerified = false;
        state.error = null;
        
        // Clear storage
        storage.remove(config.auth.tokenKey);
        storage.remove(config.auth.refreshTokenKey);
        storage.remove(config.auth.userKey);
        
        // Remove axios auth token
        removeAuthToken();
      })
      .addCase(logout.rejected, (state) => {
        // Logout locally even if API fails
        state.loading = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.isEmailVerified = false;
        
        storage.remove(config.auth.tokenKey);
        storage.remove(config.auth.refreshTokenKey);
        storage.remove(config.auth.userKey);
        removeAuthToken();
      })
    
    // ============================================
    // GET CURRENT USER
    // ============================================
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isEmailVerified = action.payload.isEmailVerified;
        
        // Update storage
        storage.set(config.auth.userKey, action.payload);
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
    
    // ============================================
    // VERIFY EMAIL
    // ============================================
      .addCase(verifyEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state) => {
        state.loading = false;
        state.isEmailVerified = true;
        state.emailVerificationSuccess = true;
        
        if (state.user) {
          state.user.isEmailVerified = true;
          storage.set(config.auth.userKey, state.user);
        }
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
    
    // ============================================
    // RESEND VERIFICATION EMAIL
    // ============================================
      .addCase(resendVerificationEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendVerificationEmail.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resendVerificationEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
    
    // ============================================
    // FORGOT PASSWORD
    // ============================================
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.passwordResetEmailSent = false;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
        state.passwordResetEmailSent = true;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
    
    // ============================================
    // RESET PASSWORD
    // ============================================
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.passwordResetSuccess = false;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.passwordResetSuccess = true;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
    
    // ============================================
    // CHANGE PASSWORD
    // ============================================
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
    
    // ============================================
    // UPDATE USER DETAILS
    // ============================================
      .addCase(updateUserDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        
        // Update storage
        storage.set(config.auth.userKey, action.payload);
      })
      .addCase(updateUserDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
    
    // ============================================
    // DELETE ACCOUNT
    // ============================================
      .addCase(deleteAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        
        // Clear storage
        storage.remove(config.auth.tokenKey);
        storage.remove(config.auth.refreshTokenKey);
        storage.remove(config.auth.userKey);
        removeAuthToken();
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
    
    // ============================================
    // SOCIAL LOGIN
    // ============================================
      .addCase(socialLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(socialLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.isEmailVerified = action.payload.user.isEmailVerified;
        
        // Save to storage
        storage.set(config.auth.tokenKey, action.payload.accessToken);
        storage.set(config.auth.refreshTokenKey, action.payload.refreshToken);
        storage.set(config.auth.userKey, action.payload.user);
        setAuthToken(action.payload.accessToken);
      })
      .addCase(socialLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
    
    // ============================================
    // REFRESH TOKEN
    // ============================================
      .addCase(refreshAuthToken.fulfilled, (state, action) => {
        state.token = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        
        // Update storage
        storage.set(config.auth.tokenKey, action.payload.accessToken);
        storage.set(config.auth.refreshTokenKey, action.payload.refreshToken);
        setAuthToken(action.payload.accessToken);
      })
      .addCase(refreshAuthToken.rejected, (state) => {
        // Token refresh failed - logout
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        
        storage.remove(config.auth.tokenKey);
        storage.remove(config.auth.refreshTokenKey);
        storage.remove(config.auth.userKey);
        removeAuthToken();
      });
  },
});

// ============================================
// EXPORT ACTIONS
// ============================================
export const {
  clearError,
  clearRegistrationSuccess,
  clearEmailVerificationSuccess,
  clearPasswordResetStates,
  updateUserLocally,
  initializeAuth,
} = authSlice.actions;

// ============================================
// SELECTORS
// ============================================
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsEmailVerified = (state) => state.auth.isEmailVerified;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectUserRole = (state) => state.auth.user?.role;

// ============================================
// EXPORT REDUCER
// ============================================
export default authSlice.reducer;