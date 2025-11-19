// User slice
// ============================================
// USER SLICE
// ============================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

// ============================================
// INITIAL STATE
// ============================================
const initialState = {
  profile: null,
  skills: [],
  badges: [],
  certificates: [],
  enrolledCourses: [],
  completedCourses: [],
  learningProgress: {},
  statistics: {
    totalPoints: 0,
    currentLevel: 1,
    coursesCompleted: 0,
    certificatesEarned: 0,
    learningHours: 0,
    currentStreak: 0,
    longestStreak: 0,
  },
  loading: false,
  error: null,
  updateLoading: false,
};

// ============================================
// ASYNC THUNKS
// ============================================

/**
 * Get user profile
 */
export const getUserProfile = createAsyncThunk(
  'user/getProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Update user profile
 */
export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async ({ userId, updates }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/users/${userId}`, updates);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Upload profile image
 */
export const uploadProfileImage = createAsyncThunk(
  'user/uploadProfileImage',
  async ({ userId, formData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/users/${userId}/profile-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Add skill
 */
export const addSkill = createAsyncThunk(
  'user/addSkill',
  async ({ userId, skillData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/users/${userId}/skills`, skillData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Update skill
 */
export const updateSkill = createAsyncThunk(
  'user/updateSkill',
  async ({ userId, skillId, updates }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/users/${userId}/skills/${skillId}`, updates);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Remove skill
 */
export const removeSkill = createAsyncThunk(
  'user/removeSkill',
  async ({ userId, skillId }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/users/${userId}/skills/${skillId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Get user statistics
 */
export const getUserStatistics = createAsyncThunk(
  'user/getStatistics',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/users/${userId}/statistics`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Get enrolled courses
 */
export const getEnrolledCourses = createAsyncThunk(
  'user/getEnrolledCourses',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/users/${userId}/enrolled-courses`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Get certificates
 */
export const getUserCertificates = createAsyncThunk(
  'user/getCertificates',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/users/${userId}/certificates`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Get badges
 */
export const getUserBadges = createAsyncThunk(
  'user/getBadges',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/users/${userId}/badges`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ============================================
// USER SLICE
// ============================================
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
    updateProfileLocally: (state, action) => {
      state.profile = { ...state.profile, ...action.payload };
    },
    clearUserData: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // Get User Profile
    builder
      .addCase(getUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // Update User Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.profile = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })

    // Upload Profile Image
      .addCase(uploadProfileImage.pending, (state) => {
        state.updateLoading = true;
      })
      .addCase(uploadProfileImage.fulfilled, (state, action) => {
        state.updateLoading = false;
        if (state.profile) {
          state.profile.profileImage = action.payload.profileImage;
        }
      })
      .addCase(uploadProfileImage.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })

    // Add Skill
      .addCase(addSkill.fulfilled, (state, action) => {
        state.skills.push(action.payload);
      })

    // Update Skill
      .addCase(updateSkill.fulfilled, (state, action) => {
        const index = state.skills.findIndex(s => s._id === action.payload._id);
        if (index !== -1) {
          state.skills[index] = action.payload;
        }
      })

    // Remove Skill
      .addCase(removeSkill.fulfilled, (state, action) => {
        state.skills = state.skills.filter(s => s._id !== action.payload.skillId);
      })

    // Get User Statistics
      .addCase(getUserStatistics.fulfilled, (state, action) => {
        state.statistics = action.payload;
      })

    // Get Enrolled Courses
      .addCase(getEnrolledCourses.pending, (state) => {
        state.loading = true;
      })
      .addCase(getEnrolledCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.enrolledCourses = action.payload;
      })
      .addCase(getEnrolledCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // Get Certificates
      .addCase(getUserCertificates.fulfilled, (state, action) => {
        state.certificates = action.payload;
      })

    // Get Badges
      .addCase(getUserBadges.fulfilled, (state, action) => {
        state.badges = action.payload;
      });
  },
});

// ============================================
// ACTIONS
// ============================================
export const { clearUserError, updateProfileLocally, clearUserData } = userSlice.actions;

// ============================================
// SELECTORS
// ============================================
export const selectUserProfile = (state) => state.user.profile;
export const selectUserSkills = (state) => state.user.skills;
export const selectUserBadges = (state) => state.user.badges;
export const selectUserCertificates = (state) => state.user.certificates;
export const selectUserStatistics = (state) => state.user.statistics;
export const selectEnrolledCourses = (state) => state.user.enrolledCourses;
export const selectUserLoading = (state) => state.user.loading;
export const selectUserError = (state) => state.user.error;

// ============================================
// REDUCER
// ============================================
export default userSlice.reducer;