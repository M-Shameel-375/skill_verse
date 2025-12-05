// User routes
// ============================================
// USER ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  getCurrentUser,
  updateProfile,
  uploadProfileImage,
  uploadCoverImage,
  updateSkills,
  addSkill,
  removeSkill,
  endorseSkill,
  getAllUsers,
  searchUsers,
  getUserStats,
  getMyCourses,
  getMyCertificates,
  getMyBadges,
  updateNotificationPreferences,
  getLearningProgress,
  updateLearningStreak,
  getTopEducators,
  getRecommendedUsers,
  exportUserData,
  updateUserRole,
  syncUser,
  applyAsEducator,
} = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware');
const { uploadSingleImage } = require('../middlewares/upload.middleware');
const { validateUpdateProfile, validate } = require('../middlewares/validation.middleware');

// Public routes
router.get('/', getAllUsers);
router.get('/search', searchUsers);
router.get('/top-educators', getTopEducators);
router.post('/sync', syncUser); // Sync user from Clerk to MongoDB
router.put('/role', updateUserRole); // Role selection endpoint (for Clerk)

// These must come AFTER specific routes to avoid catching them
router.get('/:id/stats', getUserStats);
router.get('/:id', getUserProfile);

// Protected routes
router.use(protect);

router.get('/me', getCurrentUser);
router.get('/me/courses', getMyCourses);
router.get('/me/certificates', getMyCertificates);
router.get('/me/badges', getMyBadges);
router.get('/me/learning-progress', getLearningProgress);
router.get('/me/recommended', getRecommendedUsers);
router.get('/me/export-data', exportUserData);

router.put('/profile', validateUpdateProfile, validate, updateProfile);
router.put('/profile-image', uploadSingleImage('profileImage'), uploadProfileImage);
router.put('/cover-image', uploadSingleImage('coverImage'), uploadCoverImage);
router.put('/skills', updateSkills);
router.post('/skills', addSkill);
router.delete('/skills/:skillId', removeSkill);
router.post('/:userId/skills/:skillId/endorse', endorseSkill);
router.put('/notification-preferences', updateNotificationPreferences);
router.post('/update-streak', updateLearningStreak);
router.post('/apply-educator', applyAsEducator);

module.exports = router;