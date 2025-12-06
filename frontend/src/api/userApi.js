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
 * Get current user's learning statistics
 * @returns {Promise}
 */
export const getUserStatistics = () => {
  return axios.get('/users/statistics');
};

/**
 * Get user's statistics by ID
 * @param {string} userId - User ID
 * @returns {Promise}
 */
export const getUserStatsById = (userId) => {
  return axios.get(`/users/${userId}/stats`);
};

// ============================================
// GET ENROLLED COURSES
// ============================================
/**
 * Get current user's enrolled courses
 * @returns {Promise}
 */
export const getEnrolledCourses = () => {
  return axios.get('/courses/enrolled');
};

/**
 * Get user's enrolled courses by ID
 * @param {string} userId - User ID
 * @returns {Promise}
 */
export const getUserEnrolledCourses = (userId) => {
  return axios.get(`/users/${userId}/courses`);
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
  return axios.get(`/users/${userId}/certificates`);
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
  return axios.get(`/users/${userId}/badges`);
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
  return axios.put('/users/profile', updates, {
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
// SYNC USER (Clerk → MongoDB)
// ============================================
/**
 * Sync user from Clerk to MongoDB
 * @param {Object} userData - { clerkId, email, name, profileImage }
 * @returns {Promise}
 */
export const syncUser = (userData) => {
  return axios.post('/users/sync', userData);
};

// ============================================
// GET NOTIFICATION PREFERENCES
// ============================================
/**
 * Get user's notification preferences
 * @returns {Promise}
 */
export const getNotificationPreferences = () => {
  return axios.get('/users/notification-preferences');
};

// ============================================
// UPDATE NOTIFICATION PREFERENCES
// ============================================
/**
 * Update user's notification preferences
 * @param {Object} preferences - Notification preferences
 * @returns {Promise}
 */
export const updateNotificationPreferences = (preferences) => {
  return axios.put('/users/notification-preferences', preferences);
};

// ============================================
// DELETE ACCOUNT
// ============================================
/**
 * Delete current user's account
 * @returns {Promise}
 */
export const deleteAccount = () => {
  return axios.delete('/users/me');
};

// ============================================
// UPDATE USER ROLE
// ============================================
/**
 * Update user's role (for role selection)
 * @param {string} role - New role
 * @returns {Promise}
 */
export const updateUserRole = (role) => {
  return axios.put('/users/role', { role });
};

// ============================================
// SWITCH ACTIVE ROLE
// ============================================
/**
 * Switch active role (for users with multiple roles)
 * @param {string} role - Role to switch to
 * @returns {Promise}
 */
export const switchActiveRole = (role) => {
  return axios.post('/users/switch-role', { role });
};


// ============================================
// GET CURRENT USER (alias for getUserProfile)
// ============================================
/**
 * Get current logged-in user
 * @returns {Promise}
 */
export const getCurrentUser = () => {
  return axios.get('/users/me');
};

// ============================================
// EXPORT ALL USER API METHODS
// ============================================
const userApi = {
  getUserById,
  getUserProfile,
  getCurrentUser,
  updateProfile,
  updateUserProfile,
  deleteUser,
  deleteAccount,
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
  getNotificationPreferences,
  updateNotificationPreferences,
  searchUsers,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  applyAsEducator,
  syncUser,
  updateUserRole,
  switchActiveRole,
};

export default userApi;