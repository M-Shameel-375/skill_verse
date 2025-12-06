// ============================================
// EDUCATOR API - EDUCATOR-SPECIFIC ENDPOINTS
// ============================================

import axios from './axios';

// ============================================
// EDUCATOR DASHBOARD & STATS
// ============================================

/**
 * Get educator dashboard stats
 * @returns {Promise}
 */
export const getEducatorStats = () => {
  return axios.get('/educators/stats');
};

/**
 * Get educator analytics
 * @param {Object} params - { startDate, endDate, period }
 * @returns {Promise}
 */
export const getEducatorAnalytics = (params = {}) => {
  return axios.get('/educators/analytics', { params });
};

// ============================================
// INSTRUCTOR PROFILE
// ============================================

/**
 * Get instructor profile
 * @returns {Promise}
 */
export const getInstructorProfile = () => {
  return axios.get('/educators/profile');
};

/**
 * Update instructor profile
 * @param {Object} data - Profile data
 * @returns {Promise}
 */
export const updateInstructorProfile = (data) => {
  return axios.put('/educators/profile', data);
};

// ============================================
// STUDENT MANAGEMENT
// ============================================

/**
 * Get all students across all courses
 * @param {Object} params - { page, limit, courseId, search }
 * @returns {Promise}
 */
export const getAllStudents = (params = {}) => {
  return axios.get('/educators/students', { params });
};

/**
 * Get student details
 * @param {string} studentId - Student ID
 * @returns {Promise}
 */
export const getStudentDetails = (studentId) => {
  return axios.get(`/educators/students/${studentId}`);
};

// ============================================
// REVIEWS MANAGEMENT
// ============================================

/**
 * Get all reviews for educator's courses
 * @param {Object} params - { page, limit, courseId, rating }
 * @returns {Promise}
 */
export const getAllReviews = (params = {}) => {
  return axios.get('/educators/reviews', { params });
};

/**
 * Reply to a review
 * @param {string} reviewId - Review ID
 * @param {string} reply - Reply text
 * @returns {Promise}
 */
export const replyToReview = (reviewId, reply) => {
  return axios.post(`/reviews/${reviewId}/reply`, { reply });
};

// ============================================
// NOTIFICATIONS
// ============================================

/**
 * Get notifications for educator
 * @param {Object} params - { page, limit, type, read }
 * @returns {Promise}
 */
export const getEducatorNotifications = (params = {}) => {
  return axios.get('/educators/notifications', { params });
};

// ============================================
// EDUCATOR APPLICATION
// ============================================

/**
 * Apply to become educator
 * @param {Object} data - Application data
 * @returns {Promise}
 */
export const applyAsEducator = (data) => {
  return axios.post('/educators/apply', data);
};

/**
 * Check educator application status
 * @returns {Promise}
 */
export const getApplicationStatus = () => {
  return axios.get('/educators/application-status');
};

// ============================================
// EDUCATOR COURSES
// ============================================

/**
 * Get educator's courses
 * @param {Object} params - { page, limit, status }
 * @returns {Promise}
 */
export const getEducatorCourses = (params = {}) => {
  return axios.get('/educators/courses', { params });
};

// ============================================
// EXPORT ALL EDUCATOR API METHODS
// ============================================

const educatorApi = {
  getEducatorStats,
  getEducatorAnalytics,
  getInstructorProfile,
  updateInstructorProfile,
  getAllStudents,
  getStudentDetails,
  getAllReviews,
  replyToReview,
  getEducatorNotifications,
  applyAsEducator,
  getApplicationStatus,
  getEducatorCourses,
};

export default educatorApi;
