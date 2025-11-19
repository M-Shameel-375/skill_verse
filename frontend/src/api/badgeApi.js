// ============================================
// BADGE API ENDPOINTS
// ============================================

import axios from './axios';

const BADGE_ENDPOINTS = {
  GET_BADGES: '/badges',
  GET_BADGE: '/badges',
  CREATE_BADGE: '/badges',
  UPDATE_BADGE: '/badges',
  DELETE_BADGE: '/badges',
  AWARD_BADGE: '/badges/award',
  GET_USER_BADGES: '/badges/user',
  GET_MY_BADGES: '/badges/my-badges',
  GET_AVAILABLE_BADGES: '/badges/available',
  GET_BADGE_PROGRESS: '/badges/progress',
  CLAIM_BADGE: '/badges/claim',
  GET_CATEGORIES: '/badges/categories',
  GET_LEADERBOARD: '/badges/leaderboard',
  UPLOAD_ICON: '/badges/icon',
};

// ============================================
// GET ALL BADGES
// ============================================
/**
 * Get all badges with filters
 * @param {Object} params - { page, limit, category, type }
 * @returns {Promise}
 */
export const getBadges = (params = {}) => {
  return axios.get(BADGE_ENDPOINTS.GET_BADGES, { params });
};

// ============================================
// GET BADGE BY ID
// ============================================
/**
 * Get badge details by ID
 * @param {string} badgeId - Badge ID
 * @returns {Promise}
 */
export const getBadgeById = (badgeId) => {
  return axios.get(`${BADGE_ENDPOINTS.GET_BADGE}/${badgeId}`);
};

// ============================================
// CREATE BADGE
// ============================================
/**
 * Create new badge (admin only)
 * @param {Object} badgeData - Badge data
 * @returns {Promise}
 */
export const createBadge = (badgeData) => {
  return axios.post(BADGE_ENDPOINTS.CREATE_BADGE, badgeData);
};

// ============================================
// UPDATE BADGE
// ============================================
/**
 * Update badge (admin only)
 * @param {string} badgeId - Badge ID
 * @param {Object} updates - Badge updates
 * @returns {Promise}
 */
export const updateBadge = (badgeId, updates) => {
  return axios.put(`${BADGE_ENDPOINTS.UPDATE_BADGE}/${badgeId}`, updates);
};

// ============================================
// DELETE BADGE
// ============================================
/**
 * Delete badge (admin only)
 * @param {string} badgeId - Badge ID
 * @returns {Promise}
 */
export const deleteBadge = (badgeId) => {
  return axios.delete(`${BADGE_ENDPOINTS.DELETE_BADGE}/${badgeId}`);
};

// ============================================
// AWARD BADGE
// ============================================
/**
 * Award badge to user (admin only)
 * @param {Object} awardData - { userId, badgeId, reason }
 * @returns {Promise}
 */
export const awardBadge = (awardData) => {
  return axios.post(BADGE_ENDPOINTS.AWARD_BADGE, awardData);
};

// ============================================
// GET USER BADGES
// ============================================
/**
 * Get badges earned by a user
 * @param {string} userId - User ID
 * @param {Object} params - { page, limit, category }
 * @returns {Promise}
 */
export const getUserBadges = (userId, params = {}) => {
  return axios.get(`${BADGE_ENDPOINTS.GET_USER_BADGES}/${userId}`, { params });
};

// ============================================
// GET MY BADGES
// ============================================
/**
 * Get current user's badges
 * @param {Object} params - { page, limit, category }
 * @returns {Promise}
 */
export const getMyBadges = (params = {}) => {
  return axios.get(BADGE_ENDPOINTS.GET_MY_BADGES, { params });
};

// ============================================
// GET AVAILABLE BADGES
// ============================================
/**
 * Get available badges to earn
 * @returns {Promise}
 */
export const getAvailableBadges = () => {
  return axios.get(BADGE_ENDPOINTS.GET_AVAILABLE_BADGES);
};

// ============================================
// GET BADGE PROGRESS
// ============================================
/**
 * Get progress towards earning badges
 * @param {string} badgeId - Badge ID (optional)
 * @returns {Promise}
 */
export const getBadgeProgress = (badgeId = null) => {
  const url = badgeId 
    ? `${BADGE_ENDPOINTS.GET_BADGE_PROGRESS}/${badgeId}`
    : BADGE_ENDPOINTS.GET_BADGE_PROGRESS;
  return axios.get(url);
};

// ============================================
// CLAIM BADGE
// ============================================
/**
 * Claim earned badge
 * @param {string} badgeId - Badge ID
 * @returns {Promise}
 */
export const claimBadge = (badgeId) => {
  return axios.post(`${BADGE_ENDPOINTS.CLAIM_BADGE}/${badgeId}`);
};

// ============================================
// GET BADGE CATEGORIES
// ============================================
/**
 * Get all badge categories
 * @returns {Promise}
 */
export const getBadgeCategories = () => {
  return axios.get(BADGE_ENDPOINTS.GET_CATEGORIES);
};

// ============================================
// GET BADGE LEADERBOARD
// ============================================
/**
 * Get badge leaderboard
 * @param {Object} params - { limit, category, period }
 * @returns {Promise}
 */
export const getBadgeLeaderboard = (params = {}) => {
  return axios.get(BADGE_ENDPOINTS.GET_LEADERBOARD, { params });
};

// ============================================
// UPLOAD BADGE ICON
// ============================================
/**
 * Upload badge icon (admin only)
 * @param {string} badgeId - Badge ID
 * @param {FormData} formData - Icon file
 * @returns {Promise}
 */
export const uploadBadgeIcon = (badgeId, formData) => {
  return axios.post(`${BADGE_ENDPOINTS.UPLOAD_ICON}/${badgeId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// ============================================
// SHARE BADGE
// ============================================
/**
 * Get shareable badge link
 * @param {string} badgeId - Badge ID
 * @param {string} platform - 'linkedin' | 'twitter' | 'facebook'
 * @returns {Promise}
 */
export const shareBadge = (badgeId, platform) => {
  return axios.post(`/badges/${badgeId}/share`, { platform });
};

// ============================================
// GET BADGE STATISTICS
// ============================================
/**
 * Get badge statistics
 * @param {string} badgeId - Badge ID
 * @returns {Promise}
 */
export const getBadgeStatistics = (badgeId) => {
  return axios.get(`/badges/${badgeId}/statistics`);
};

// ============================================
// VERIFY BADGE
// ============================================
/**
 * Verify badge authenticity
 * @param {string} badgeId - Badge ID
 * @param {string} userId - User ID
 * @returns {Promise}
 */
export const verifyBadge = (badgeId, userId) => {
  return axios.get(`/badges/verify/${badgeId}/${userId}`);
};

// ============================================
// GET RARE BADGES
// ============================================
/**
 * Get rare/exclusive badges
 * @returns {Promise}
 */
export const getRareBadges = () => {
  return axios.get('/badges/rare');
};

// ============================================
// EXPORT ALL BADGE API METHODS
// ============================================
const badgeApi = {
  getBadges,
  getBadgeById,
  createBadge,
  updateBadge,
  deleteBadge,
  awardBadge,
  getUserBadges,
  getMyBadges,
  getAvailableBadges,
  getBadgeProgress,
  claimBadge,
  getBadgeCategories,
  getBadgeLeaderboard,
  uploadBadgeIcon,
  shareBadge,
  getBadgeStatistics,
  verifyBadge,
  getRareBadges,
};

export default badgeApi;