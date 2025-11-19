// Review routes
// ============================================
// REVIEW ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const {
  createReview,
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview,
  markAsHelpful,
  markAsNotHelpful,
  flagReview,
  addResponse,
  getReviewsByCourse,
  getMyReviews,
  approveReview,
  rejectReview,
  getPendingReviews,
  getFlaggedReviews,
  getTopReviews,
} = require('../controllers/review.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/roleCheck.middleware');
const { validateReview, validateMongoId, validate } = require('../middlewares/validation.middleware');

// Public routes
router.get('/', getAllReviews);
router.get('/course/:courseId', getReviewsByCourse);
router.get('/top/:entityType/:entityId', getTopReviews);
router.get('/:id', validateMongoId('id'), validate, getReviewById);

// Protected routes
router.use(protect);

router.post('/', validateReview, validate, createReview);
router.get('/my/reviews', getMyReviews);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);
router.post('/:id/helpful', markAsHelpful);
router.post('/:id/not-helpful', markAsNotHelpful);
router.post('/:id/flag', flagReview);

// Protected routes - Educator
router.post('/:id/response', authorize('educator', 'admin'), addResponse);

// Protected routes - Admin
router.get('/admin/pending', authorize('admin'), getPendingReviews);
router.get('/admin/flagged', authorize('admin'), getFlaggedReviews);
router.put('/:id/approve', authorize('admin'), approveReview);
router.put('/:id/reject', authorize('admin'), rejectReview);

module.exports = router;