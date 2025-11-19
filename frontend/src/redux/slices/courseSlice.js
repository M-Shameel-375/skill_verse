// ============================================
// COURSE SLICE
// ============================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

// ============================================
// INITIAL STATE
// ============================================
const initialState = {
  courses: [],
  currentCourse: null,
  myCourses: [],
  enrolledCourses: [],
  featuredCourses: [],
  popularCourses: [],
  categories: [],
  
  // Pagination
  currentPage: 1,
  totalPages: 1,
  totalCourses: 0,
  
  // Filters
  filters: {
    category: '',
    level: '',
    price: '',
    rating: '',
    search: '',
  },
  
  // Loading states
  loading: false,
  courseLoading: false,
  enrollLoading: false,
  createLoading: false,
  
  error: null,
};

// ============================================
// ASYNC THUNKS
// ============================================

/**
 * Get all courses with filters
 */
export const getCourses = createAsyncThunk(
  'course/getCourses',
  async ({ page = 1, limit = 10, filters = {} }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        ...filters,
      });
      const response = await axios.get(`/courses?${queryParams}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Get course by ID
 */
export const getCourseById = createAsyncThunk(
  'course/getCourseById',
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/courses/${courseId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Create new course
 */
export const createCourse = createAsyncThunk(
  'course/createCourse',
  async (courseData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/courses', courseData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Update course
 */
export const updateCourse = createAsyncThunk(
  'course/updateCourse',
  async ({ courseId, updates }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/courses/${courseId}`, updates);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Delete course
 */
export const deleteCourse = createAsyncThunk(
  'course/deleteCourse',
  async (courseId, { rejectWithValue }) => {
    try {
      await axios.delete(`/courses/${courseId}`);
      return courseId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Enroll in course
 */
export const enrollInCourse = createAsyncThunk(
  'course/enrollInCourse',
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/courses/${courseId}/enroll`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Get my courses (created by educator)
 */
export const getMyCourses = createAsyncThunk(
  'course/getMyCourses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/courses/my-courses');
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
  'course/getEnrolledCourses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/courses/enrolled');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Get featured courses
 */
export const getFeaturedCourses = createAsyncThunk(
  'course/getFeaturedCourses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/courses/featured');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Get popular courses
 */
export const getPopularCourses = createAsyncThunk(
  'course/getPopularCourses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/courses/popular');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Update course progress
 */
export const updateCourseProgress = createAsyncThunk(
  'course/updateProgress',
  async ({ courseId, lectureId, progress }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/courses/${courseId}/progress`, {
        lectureId,
        progress,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Add review
 */
export const addCourseReview = createAsyncThunk(
  'course/addReview',
  async ({ courseId, reviewData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/courses/${courseId}/reviews`, reviewData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Search courses
 */
export const searchCourses = createAsyncThunk(
  'course/searchCourses',
  async (searchTerm, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/courses/search?q=${searchTerm}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ============================================
// COURSE SLICE
// ============================================
const courseSlice = createSlice({
  name: 'course',
  initialState,
  reducers: {
    clearCourseError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    clearCurrentCourse: (state) => {
      state.currentCourse = null;
    },
  },
  extraReducers: (builder) => {
    // Get Courses
    builder
      .addCase(getCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload.courses;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
        state.totalCourses = action.payload.total;
      })
      .addCase(getCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // Get Course By ID
      .addCase(getCourseById.pending, (state) => {
        state.courseLoading = true;
        state.error = null;
      })
      .addCase(getCourseById.fulfilled, (state, action) => {
        state.courseLoading = false;
        state.currentCourse = action.payload;
      })
      .addCase(getCourseById.rejected, (state, action) => {
        state.courseLoading = false;
        state.error = action.payload;
      })

    // Create Course
      .addCase(createCourse.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.createLoading = false;
        state.myCourses.unshift(action.payload);
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      })

    // Update Course
      .addCase(updateCourse.pending, (state) => {
        state.createLoading = true;
      })
      .addCase(updateCourse.fulfilled, (state, action) => {
        state.createLoading = false;
        state.currentCourse = action.payload;
        const index = state.myCourses.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.myCourses[index] = action.payload;
        }
      })
      .addCase(updateCourse.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      })

    // Delete Course
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.myCourses = state.myCourses.filter(c => c._id !== action.payload);
        state.courses = state.courses.filter(c => c._id !== action.payload);
      })

    // Enroll In Course
      .addCase(enrollInCourse.pending, (state) => {
        state.enrollLoading = true;
      })
      .addCase(enrollInCourse.fulfilled, (state, action) => {
        state.enrollLoading = false;
        state.enrolledCourses.push(action.payload);
      })
      .addCase(enrollInCourse.rejected, (state, action) => {
        state.enrollLoading = false;
        state.error = action.payload;
      })

    // Get My Courses
      .addCase(getMyCourses.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMyCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.myCourses = action.payload;
      })
      .addCase(getMyCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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

    // Get Featured Courses
      .addCase(getFeaturedCourses.fulfilled, (state, action) => {
        state.featuredCourses = action.payload;
      })

    // Get Popular Courses
      .addCase(getPopularCourses.fulfilled, (state, action) => {
        state.popularCourses = action.payload;
      })

    // Search Courses
      .addCase(searchCourses.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload;
      })
      .addCase(searchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// ============================================
// ACTIONS
// ============================================
export const {
  clearCourseError,
  setFilters,
  clearFilters,
  setCurrentPage,
  clearCurrentCourse,
} = courseSlice.actions;

// ============================================
// SELECTORS
// ============================================
export const selectCourses = (state) => state.course.courses;
export const selectCurrentCourse = (state) => state.course.currentCourse;
export const selectMyCourses = (state) => state.course.myCourses;
export const selectEnrolledCourses = (state) => state.course.enrolledCourses;
export const selectFeaturedCourses = (state) => state.course.featuredCourses;
export const selectPopularCourses = (state) => state.course.popularCourses;
export const selectCourseFilters = (state) => state.course.filters;
export const selectCoursePagination = (state) => ({
  currentPage: state.course.currentPage,
  totalPages: state.course.totalPages,
  totalCourses: state.course.totalCourses,
});
export const selectCourseLoading = (state) => state.course.loading;
export const selectCourseError = (state) => state.course.error;

// ============================================
// REDUCER
// ============================================
export default courseSlice.reducer;