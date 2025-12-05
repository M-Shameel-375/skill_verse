// ============================================
// USER API ENDPOINTS
// ============================================

import axios from './axios';

const USER_ENDPOINTS = {
  GET_USER: '/users',
  UPDATE_USER: '/users',
  DELETE_USER: '/users',
  UPLOAD_PROFILE_IMAGE: '/users/profile-image',
  UPLOAD_COVER_IMAGE: '/users/cover-image',
  GET_SKILLS: '/users/skills',
  ADD_SKILL: '/users/skills',
  UPDATE_SKILL: '/users/skills',
  DELETE_SKILL: '/users/skills',
  GET_STATISTICS: '/users/statistics',
  GET_ENROLLED_COURSES: '/users/enrolled-courses',
  GET_CERTIFICATES: '/users/certificates',
  GET_BADGES: '/users/badges',
  GET_ACHIEVEMENTS: '/users/achievements',
  UPDATE_PREFERENCES: '/users/preferences',
  SEARCH_USERS: '/users/search',
  FOLLOW_USER: '/users/follow',
  UNFOLLOW_USER: '/users/unfollow',
  GET_FOLLOWERS: '/users/followers',
  GET_FOLLOWING: '/users/following',
};

// ============================================
// GET USER BY ID
// ============================================
/**
 * Get user profile by ID
 * @param {string} userId - User ID
 * @returns {Promise}
 */
export const getUserById = (userId) => {
  return axios.get(`${USER_ENDPOINTS.GET_USER}/${userId}`);
};

// ============================================
// UPDATE USER PROFILE
// ============================================
/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updates - Profile updates
 * @returns {Promise}
 */
export const updateUserProfile = (userId, updates) => {
  return axios.put(`${USER_ENDPOINTS.UPDATE_USER}/${userId}`, updates);
};

// ============================================
// DELETE USER ACCOUNT
// ============================================
/**
 * Delete user account
 * @param {string} userId - User ID
 * @returns {Promise}
 */
export const deleteUser = (userId) => {
  return axios.delete(`${USER_ENDPOINTS.DELETE_USER}/${userId}`);
};

// ============================================
// UPLOAD PROFILE IMAGE
// ============================================
/**
 * Upload profile image
 * @param {string} userId - User ID
 * @param {FormData} formData - Image file
 * @returns {Promise}
 */
export const uploadProfileImage = (userId, formData) => {
  return axios.post(`${USER_ENDPOINTS.UPLOAD_PROFILE_IMAGE}/${userId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// ============================================
// UPLOAD COVER IMAGE
// ============================================
/**
 * Upload cover image
 * @param {string} userId - User ID
 * @param {FormData} formData - Image file
 * @returns {Promise}
 */
export const uploadCoverImage = (userId, formData) => {
  return axios.post(`${USER_ENDPOINTS.UPLOAD_COVER_IMAGE}/${userId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// ============================================
// GET USER SKILLS
// ============================================
/**
 * Get user skills
 * @param {string} userId - User ID
 * @returns {Promise}
 */
export const getUserSkills = (userId) => {
  return axios.get(`${USER_ENDPOINTS.GET_SKILLS}/${userId}`);
};

// ============================================
// ADD SKILL
// ============================================
/**
 * Add a new skill
 * @param {string} userId - User ID
 * @param {Object} skillData - { name, level, yearsOfExperience }
 * @returns {Promise}
 */
export const addSkill = (userId, skillData) => {
  return axios.post(`${USER_ENDPOINTS.ADD_SKILL}/${userId}`, skillData);
};

// ============================================
// UPDATE SKILL
// ============================================
/**
 * Update existing skill
 * @param {string} userId - User ID
 * @param {string} skillId - Skill ID
 * @param {Object} updates - Skill updates
 * @returns {Promise}
 */
export const updateSkill = (userId, skillId, updates) => {
  return axios.put(`${USER_ENDPOINTS.UPDATE_SKILL}/${userId}/${skillId}`, updates);
};

// ============================================
// DELETE SKILL
// ============================================
/**
 * Delete skill
 * @param {string} userId - User ID
 * @param {string} skillId - Skill ID
 * @returns {Promise}
 */
export const deleteSkill = (userId, skillId) => {
  return axios.delete(`${USER_ENDPOINTS.DELETE_SKILL}/${userId}/${skillId}`);
};

// ============================================
// ENDORSE SKILL
// ============================================
/**
 * Endorse user skill
 * @param {string} userId - User ID
 * @param {string} skillId - Skill ID
 * @returns {Promise}
 */
export const endorseSkill = (userId, skillId) => {
  return axios.post(`/users/${userId}/skills/${skillId}/endorse`);
};

// ============================================
// GET USER STATISTICS
// ============================================
/**
 * Get user learning statistics
 * @param {string} userId - User ID
 * @returns {Promise}
 */
export const getUserStatistics = (userId) => {
  return axios.get(`${USER_ENDPOINTS.GET_STATISTICS}/${userId}`);
};

// ============================================
// GET ENROLLED COURSES
// ============================================
/**
 * Get user's enrolled courses
 * @param {string} userId - User ID
 * @returns {Promise}
 */
export const getEnrolledCourses = (userId) => {
  return axios.get(`${USER_ENDPOINTS.GET_ENROLLED_COURSES}/${userId}`);
};

// ============================================
// GET USER CERTIFICATES
// ============================================
/**
 * Get user's certificates
 * @param {string} userId - User ID
 * @returns {Promise}
 */
export const getUserCertificates = (userId) => {
  return axios.get(`${USER_ENDPOINTS.GET_CERTIFICATES}/${userId}`);
};

// ============================================
// GET USER BADGES
// ============================================
/**
 * Get user's earned badges
 * @param {string} userId - User ID
 * @returns {Promise}
 */
export const getUserBadges = (userId) => {
  return axios.get(`${USER_ENDPOINTS.GET_BADGES}/${userId}`);
};

// ============================================
// GET USER ACHIEVEMENTS
// ============================================
/**
 * Get user's achievements
 * @param {string} userId - User ID
 * @returns {Promise}
 */
export const getUserAchievements = (userId) => {
  return axios.get(`${USER_ENDPOINTS.GET_ACHIEVEMENTS}/${userId}`);
};

// ============================================
// UPDATE USER PREFERENCES
// ============================================
/**
 * Update user preferences
 * @param {string} userId - User ID
 * @param {Object} preferences - User preferences
 * @returns {Promise}
 */
export const updateUserPreferences = (userId, preferences) => {
  return axios.put(`${USER_ENDPOINTS.UPDATE_PREFERENCES}/${userId}`, preferences);
};

// ============================================
// SEARCH USERS
// ============================================
/**
 * Search users by name or email
 * @param {string} query - Search query
 * @returns {Promise}
 */
export const searchUsers = (query) => {
  return axios.get(`${USER_ENDPOINTS.SEARCH_USERS}?q=${query}`);
};

// ============================================
// FOLLOW USER
// ============================================
/**
 * Follow a user
 * @param {string} userId - User ID to follow
 * @returns {Promise}
 */
export const followUser = (userId) => {
  return axios.post(`${USER_ENDPOINTS.FOLLOW_USER}/${userId}`);
};

// ============================================
// UNFOLLOW USER
// ============================================
/**
 * Unfollow a user
 * @param {string} userId - User ID to unfollow
 * @returns {Promise}
 */
export const unfollowUser = (userId) => {
  return axios.post(`${USER_ENDPOINTS.UNFOLLOW_USER}/${userId}`);
};

// ============================================
// GET FOLLOWERS
// ============================================
/**
 * Get user's followers
 * @param {string} userId - User ID
 * @returns {Promise}
 */
export const getFollowers = (userId) => {
  return axios.get(`${USER_ENDPOINTS.GET_FOLLOWERS}/${userId}`);
};

// ============================================
// GET FOLLOWING
// ============================================
/**
 * Get users that user is following
 * @param {string} userId - User ID
 * @returns {Promise}
 */
export const getFollowing = (userId) => {
  return axios.get(`${USER_ENDPOINTS.GET_FOLLOWING}/${userId}`);
};

// ============================================
// GET USER PROFILE (current user)
// ============================================
/**
 * Get current user's profile
 * @returns {Promise}
 */
export const getUserProfile = () => {
  return axios.get('/users/me');
};

// ============================================
// UPDATE PROFILE (current user)
// ============================================
/**
 * Update current user's profile
 * @param {Object|FormData} updates - Profile updates
 * @returns {Promise}
 */
export const updateProfile = (updates) => {
  const isFormData = updates instanceof FormData;
  return axios.put('/users/me', updates, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
};

// ============================================
// APPLY AS EDUCATOR
// ============================================
/**
 * Submit application to become an educator
 * @param {Object} applicationData - Educator application data
 * @returns {Promise}
 */
export const applyAsEducator = (applicationData) => {
  return axios.post('/users/apply-educator', applicationData);
};

// ============================================
// EXPORT ALL USER API METHODS
// ============================================
const userApi = {
  getUserById,
  getUserProfile,
  updateProfile,
  updateUserProfile,
  deleteUser,
  uploadProfileImage,
  uploadCoverImage,
  getUserSkills,
  addSkill,
  updateSkill,
  deleteSkill,
  endorseSkill,
  getUserStatistics,
  getEnrolledCourses,
  getUserCertificates,
  getUserBadges,
  getUserAchievements,
  updateUserPreferences,
  searchUsers,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  applyAsEducator,
};

export default userApi;