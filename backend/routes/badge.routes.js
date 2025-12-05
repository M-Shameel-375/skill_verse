// Badge routes
// ============================================
// BADGE ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const {
  createBadge,
  getAllBadges,
  getBadgeById,
  updateBadge,
  deleteBadge,
  awardBadge,
  revokeBadge,
  getUserBadges,
  getMyBadges,
  getBadgesByCategory,
  getFeaturedBadges,
  getRareBadges,
  checkBadgeEligibility,
  getBadgeStatistics,
  getAvailableBadges,
  getBadgeProgress,
  claimBadge,
} = require('../controllers/badge.controller');
const { protect, optionalAuth } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/roleCheck.middleware');
const { uploadSingleImage } = require('../middlewares/upload.middleware');
const { validateMongoId, validate } = require('../middlewares/validation.middleware');

// Public routes
router.get('/', getAllBadges);
router.get('/featured', getFeaturedBadges);
router.get('/rare', getRareBadges);
router.get('/category/:category', getBadgesByCategory);
router.get('/user/:userId', getUserBadges);
router.get('/:id', validateMongoId('id'), validate, getBadgeById);

// Protected routes
router.use(protect);

router.get('/my/badges', getMyBadges);
router.get('/available', getAvailableBadges);
router.get('/progress', getBadgeProgress);
router.post('/claim/:badgeId', validateMongoId('badgeId'), validate, claimBadge);
router.post('/check-eligibility', checkBadgeEligibility);

// Protected routes - Admin
router.post('/', authorize('admin'), uploadSingleImage('icon'), createBadge);
router.put('/:id', authorize('admin'), updateBadge);
router.delete('/:id', authorize('admin'), deleteBadge);
router.post('/:id/award', authorize('admin'), awardBadge);
router.delete('/:id/revoke', authorize('admin'), revokeBadge);
router.get('/admin/statistics', authorize('admin'), getBadgeStatistics);

module.exports = router;