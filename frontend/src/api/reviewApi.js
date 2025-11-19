// ============================================
// REVIEW API ENDPOINTS
// ============================================

import axios from './axios';

const REVIEW_ENDPOINTS = {
  GET_REVIEWS: '/reviews',
  GET_REVIEW: '/reviews',
  CREATE_REVIEW: '/reviews',
  UPDATE_REVIEW: '/reviews',
  DELETE_REVIEW: '/reviews',
  GET_COURSE_REVIEWS: '/reviews/course',
  GET_USER_REVIEWS: '/reviews/user',
  LIKE_REVIEW: '/reviews/like',
  UNLIKE_REVIEW: '/reviews/unlike',
  REPORT_REVIEW: '/reviews/report',
  GET_STATS: '/reviews/stats',
  GET_MY_REVIEWS: '/reviews/my-reviews',
  VERIFY_REVIEW: '/reviews/verify',
  HELPFUL_REVIEW: '/reviews/helpful',
};

// ============================================
// GET ALL REVIEWS
// ============================================
/**
 * Get all reviews with filters
 * @param {Object} params - { page, limit, rating, verified }
 * @returns {Promise}
 */
export const getReviews = (params = {}) => {
  return axios.get(REVIEW_ENDPOINTS.GET_REVIEWS, { params });
};

// ============================================
// GET REVIEW BY ID
// ============================================
/**
 * Get review details by ID
 * @param {string} reviewId - Review ID
 * @returns {Promise}
 */
export const getReviewById = (reviewId) => {
  return axios.get(`${REVIEW_ENDPOINTS.GET_REVIEW}/${reviewId}`);
};

// ============================================
// CREATE REVIEW
// ============================================
/**
 * Create course review
 * @param {Object} reviewData - { courseId, rating, comment, title }
 * @returns {Promise}
 */
export const createReview = (reviewData) => {
  return axios.post(REVIEW_ENDPOINTS.CREATE_REVIEW, reviewData);
};

// ============================================
// UPDATE REVIEW
// ============================================
/**
 * Update existing review
 * @param {string} reviewId - Review ID
 * @param {Object} updates - { rating, comment, title }
 * @returns {Promise}
 */
export const updateReview = (reviewId, updates) => {
  return axios.put(`${REVIEW_ENDPOINTS.UPDATE_REVIEW}/${reviewId}`, updates);
};

// ============================================
// DELETE REVIEW
// ============================================
/**
 * Delete review
 * @param {string} reviewId - Review ID
 * @returns {Promise}
 */
export const deleteReview = (reviewId) => {
  return axios.delete(`${REVIEW_ENDPOINTS.DELETE_REVIEW}/${reviewId}`);
};

// ============================================
// GET COURSE REVIEWS
// ============================================
/**
 * Get all reviews for a course
 * @param {string} courseId - Course ID
 * @param {Object} params - { page, limit, rating, sort }
 * @returns {Promise}
 */
export const getCourseReviews = (courseId, params = {}) => {
  return axios.get(`${REVIEW_ENDPOINTS.GET_COURSE_REVIEWS}/${courseId}`, { params });
};

// ============================================
// GET USER REVIEWS
// ============================================
/**
 * Get all reviews by a user
 * @param {string} userId - User ID
 * @param {Object} params - { page, limit }
 * @returns {Promise}
 */
export const getUserReviews = (userId, params = {}) => {
  return axios.get(`${REVIEW_ENDPOINTS.GET_USER_REVIEWS}/${userId}`, { params });
};

// ============================================
// LIKE REVIEW
// ============================================
/**
 * Like a review
 * @param {string} reviewId - Review ID
 * @returns {Promise}
 */
export const likeReview = (reviewId) => {
  return axios.post(`${REVIEW_ENDPOINTS.LIKE_REVIEW}/${reviewId}`);
};

// ============================================
// UNLIKE REVIEW
// ============================================
/**
 * Unlike a review
 * @param {string} reviewId - Review ID
 * @returns {Promise}
 */
export const unlikeReview = (reviewId) => {
  return axios.post(`${REVIEW_ENDPOINTS.UNLIKE_REVIEW}/${reviewId}`);
};

// ============================================
// REPORT REVIEW
// ============================================
/**
 * Report inappropriate review
 * @param {string} reviewId - Review ID
 * @param {Object} reportData - { reason, description }
 * @returns {Promise}
 */
export const reportReview = (reviewId, reportData) => {
  return axios.post(`${REVIEW_ENDPOINTS.REPORT_REVIEW}/${reviewId}`, reportData);
};

// ============================================
// GET REVIEW STATISTICS
// ============================================
/**
 * Get review statistics for a course
 * @param {string} courseId - Course ID
 * @returns {Promise}
 */
export const getReviewStats = (courseId) => {
  return axios.get(`${REVIEW_ENDPOINTS.GET_STATS}/${courseId}`);
};

// ============================================
// GET MY REVIEWS
// ============================================
/**
 * Get current user's reviews
 * @param {Object} params - { page, limit }
 * @returns {Promise}
 */
export const getMyReviews = (params = {}) => {
  return axios.get(REVIEW_ENDPOINTS.GET_MY_REVIEWS, { params });
};

// ============================================
// VERIFY REVIEW
// ============================================
/**
 * Verify review (admin only)
 * @param {string} reviewId - Review ID
 * @returns {Promise}
 */
export const verifyReview = (reviewId) => {
  return axios.post(`${REVIEW_ENDPOINTS.VERIFY_REVIEW}/${reviewId}`);
};

// ============================================
// MARK REVIEW AS HELPFUL
// ============================================
/**
 * Mark review as helpful
 * @param {string} reviewId - Review ID
 * @returns {Promise}
 */
export const markReviewHelpful = (reviewId) => {
  return axios.post(`${REVIEW_ENDPOINTS.HELPFUL_REVIEW}/${reviewId}`);
};

// ============================================
// ADD REVIEW REPLY
// ============================================
/**
 * Add reply to review (educator only)
 * @param {string} reviewId - Review ID
 * @param {Object} replyData - { message }
 * @returns {Promise}
 */
export const addReviewReply = (reviewId, replyData) => {
  return axios.post(`/reviews/${reviewId}/reply`, replyData);
};

// ============================================
// UPDATE REVIEW REPLY
// ============================================
/**
 * Update review reply
 * @param {string} reviewId - Review ID
 * @param {string} replyId - Reply ID
 * @param {Object} updates - { message }
 * @returns {Promise}
 */
export const updateReviewReply = (reviewId, replyId, updates) => {
  return axios.put(`/reviews/${reviewId}/reply/${replyId}`, updates);
};

// ============================================
// DELETE REVIEW REPLY
// ============================================
/**
 * Delete review reply
 * @param {string} reviewId - Review ID
 * @param {string} replyId - Reply ID
 * @returns {Promise}
 */
export const deleteReviewReply = (reviewId, replyId) => {
  return axios.delete(`/reviews/${reviewId}/reply/${replyId}`);
};

// ============================================
// GET FEATURED REVIEWS
// ============================================
/**
 * Get featured reviews for a course
 * @param {string} courseId - Course ID
 * @param {number} limit - Number of reviews
 * @returns {Promise}
 */
export const getFeaturedReviews = (courseId, limit = 5) => {
  return axios.get(`/reviews/course/${courseId}/featured`, {
    params: { limit },
  });
};

// ============================================
// CHECK CAN REVIEW
// ============================================
/**
 * Check if user can review a course
 * @param {string} courseId - Course ID
 * @returns {Promise}
 */
export const canReviewCourse = (courseId) => {
  return axios.get(`/reviews/can-review/${courseId}`);
};

// ============================================
// EXPORT ALL REVIEW API METHODS
// ============================================
const reviewApi = {
  getReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  getCourseReviews,
  getUserReviews,
  likeReview,
  unlikeReview,
  reportReview,
  getReviewStats,
  getMyReviews,
  verifyReview,
  markReviewHelpful,
  addReviewReply,
  updateReviewReply,
  deleteReviewReply,
  getFeaturedReviews,
  canReviewCourse,
};

export default reviewApi;