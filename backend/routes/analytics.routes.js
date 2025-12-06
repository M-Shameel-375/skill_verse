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
  exportProgressReport,
  exportProgressJSON,
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

// Export progress reports
router.get('/export/progress', exportProgressReport);  // PDF download
router.get('/export/json', exportProgressJSON);        // JSON download

module.exports = router;