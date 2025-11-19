// Analytics routes
// ============================================
// ANALYTICS ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const {
  getCourseAnalytics,
  getInstructorAnalytics,
  getLearnerAnalytics,
} = require('../controllers/analytics.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/roleCheck.middleware');
const { validateMongoId, validate } = require('../middlewares/validation.middleware');

// Protected routes only
router.use(protect);

// Instructor analytics
router.get('/instructor', authorize('educator', 'admin'), getInstructorAnalytics);

// Course analytics
router.get('/courses/:id', validateMongoId('id'), validate, getCourseAnalytics);

// Learner analytics
router.get('/learner', getLearnerAnalytics);

module.exports = router;