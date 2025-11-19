// Admin routes
// ============================================
// ADMIN ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  getAllCourses,
  approveCourse,
  rejectCourse,
  getRevenueAnalytics,
  getUserGrowthAnalytics,
  getModerationQueue,
  getSystemHealth,
} = require('../controllers/admin.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize, isAdmin } = require('../middlewares/roleCheck.middleware');
const { validateMongoId, validate } = require('../middlewares/validation.middleware');

// All admin routes require authentication and admin role
router.use(protect);
router.use(isAdmin);

// Dashboard
router.get('/dashboard', getDashboardStats);
router.get('/system/health', getSystemHealth);

// User management
router.get('/users', getAllUsers);
router.put('/users/:id/role', validateMongoId('id'), validate, updateUserRole);
router.put('/users/:id/status', validateMongoId('id'), validate, updateUserStatus);
router.delete('/users/:id', validateMongoId('id'), validate, deleteUser);

// Course management
router.get('/courses', getAllCourses);
router.put('/courses/:id/approve', validateMongoId('id'), validate, approveCourse);
router.put('/courses/:id/reject', validateMongoId('id'), validate, rejectCourse);

// Content moderation
router.get('/moderation', getModerationQueue);

// Analytics
router.get('/analytics/revenue', getRevenueAnalytics);
router.get('/analytics/user-growth', getUserGrowthAnalytics);

module.exports = router;