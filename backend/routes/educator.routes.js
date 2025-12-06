// ============================================
// EDUCATOR ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/roleCheck.middleware');

const {
  getEducatorStats,
  getEducatorAnalytics,
  getEducatorProfile,
  updateEducatorProfile,
  getAllStudents,
  getStudentDetails,
  getAllReviews,
  applyAsEducator,
  getApplicationStatus,
  getEducatorCourses
} = require('../controllers/educator.controller');

// ============================================
// APPLICATION ROUTES (Any authenticated user)
// ============================================

// Apply to become an educator
router.post('/apply', protect, applyAsEducator);

// Check application status
router.get('/application-status', protect, getApplicationStatus);

// ============================================
// EDUCATOR-ONLY ROUTES
// ============================================

// Dashboard stats
router.get('/stats', protect, requireRole('educator'), getEducatorStats);

// Analytics
router.get('/analytics', protect, requireRole('educator'), getEducatorAnalytics);

// Profile
router.get('/profile', protect, requireRole('educator'), getEducatorProfile);
router.put('/profile', protect, requireRole('educator'), updateEducatorProfile);

// Courses
router.get('/courses', protect, requireRole('educator'), getEducatorCourses);

// Students
router.get('/students', protect, requireRole('educator'), getAllStudents);
router.get('/students/:studentId', protect, requireRole('educator'), getStudentDetails);

// Reviews
router.get('/reviews', protect, requireRole('educator'), getAllReviews);

module.exports = router;
