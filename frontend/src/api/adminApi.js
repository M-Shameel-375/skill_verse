// ============================================
// ADMIN API
// ============================================

import axios from './axios';

/**
 * Get admin dashboard stats
 */
export const getDashboardStats = async () => {
  const response = await axios.get('/admin/dashboard');
  return response;
};

/**
 * Get system health status
 */
export const getSystemHealth = async () => {
  const response = await axios.get('/admin/system/health');
  return response;
};

// ============================================
// USER MANAGEMENT
// ============================================

/**
 * Get all users with filters
 */
export const getAllUsers = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await axios.get(`/admin/users?${queryString}`);
  return response;
};

/**
 * Update user role
 */
export const updateUserRole = async (userId, role) => {
  const response = await axios.put(`/admin/users/${userId}/role`, { role });
  return response;
};

/**
 * Update user status (active, suspended, banned)
 */
export const updateUserStatus = async (userId, status) => {
  const response = await axios.put(`/admin/users/${userId}/status`, { status });
  return response;
};

/**
 * Delete user
 */
export const deleteUser = async (userId) => {
  const response = await axios.delete(`/admin/users/${userId}`);
  return response;
};

// ============================================
// COURSE MANAGEMENT
// ============================================

/**
 * Get all courses for admin
 */
export const getAllCourses = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await axios.get(`/admin/courses?${queryString}`);
  return response;
};

/**
 * Approve a course
 */
export const approveCourse = async (courseId) => {
  const response = await axios.put(`/admin/courses/${courseId}/approve`);
  return response;
};

/**
 * Reject a course
 */
export const rejectCourse = async (courseId, reason) => {
  const response = await axios.put(`/admin/courses/${courseId}/reject`, { reason });
  return response;
};

// ============================================
// CONTENT MODERATION
// ============================================

/**
 * Get moderation queue (flagged content)
 */
export const getModerationQueue = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await axios.get(`/admin/moderation?${queryString}`);
  return response;
};

/**
 * Approve flagged content
 */
export const approveContent = async (contentId) => {
  const response = await axios.put(`/admin/moderation/${contentId}/approve`);
  return response;
};

/**
 * Remove flagged content
 */
export const removeContent = async (contentId) => {
  const response = await axios.delete(`/admin/moderation/${contentId}`);
  return response;
};

/**
 * Warn user about flagged content
 */
export const warnUser = async (userId, contentId, reason) => {
  const response = await axios.post(`/admin/users/${userId}/warn`, { contentId, reason });
  return response;
};

/**
 * Ban user
 */
export const banUser = async (userId, reason) => {
  const response = await axios.post(`/admin/users/${userId}/ban`, { reason });
  return response;
};

// ============================================
// ANALYTICS
// ============================================

/**
 * Get revenue analytics
 */
export const getRevenueAnalytics = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await axios.get(`/admin/analytics/revenue?${queryString}`);
  return response;
};

/**
 * Get user growth analytics
 */
export const getUserGrowthAnalytics = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await axios.get(`/admin/analytics/user-growth?${queryString}`);
  return response;
};

/**
 * Get instructor analytics
 */
export const getInstructorAnalytics = async () => {
  const response = await axios.get('/analytics/instructor');
  return response;
};

/**
 * Get course analytics
 */
export const getCourseAnalytics = async (courseId) => {
  const response = await axios.get(`/analytics/courses/${courseId}`);
  return response;
};

/**
 * Get learner analytics
 */
export const getLearnerAnalytics = async () => {
  const response = await axios.get('/analytics/learner');
  return response;
};

// ============================================
// SYSTEM SETTINGS
// ============================================

/**
 * Get system settings
 */
export const getSystemSettings = async () => {
  const response = await axios.get('/admin/settings');
  return response;
};

/**
 * Update system settings
 */
export const updateSystemSettings = async (settings) => {
  const response = await axios.put('/admin/settings', settings);
  return response;
};

export default {
  getDashboardStats,
  getSystemHealth,
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  getAllCourses,
  approveCourse,
  rejectCourse,
  getModerationQueue,
  approveContent,
  removeContent,
  warnUser,
  banUser,
  getRevenueAnalytics,
  getUserGrowthAnalytics,
  getInstructorAnalytics,
  getCourseAnalytics,
  getLearnerAnalytics,
  getSystemSettings,
  updateSystemSettings,
};
