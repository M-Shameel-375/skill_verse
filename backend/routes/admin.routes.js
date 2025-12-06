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
  getSystemSettings,
  updateSystemSettings,
  getEducatorApplications,
  processEducatorApplication,
  warnUser,
  banUser,
  approveContent,
  removeContent,
  getAllPayments,
  processRefund,
  updatePaymentStatus,
  getReports,
  downloadReport,
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
router.post('/users/:id/warn', validateMongoId('id'), validate, warnUser);
router.post('/users/:id/ban', validateMongoId('id'), validate, banUser);
router.delete('/users/:id', validateMongoId('id'), validate, deleteUser);

// Course management
router.get('/courses', getAllCourses);
router.put('/courses/:id/approve', validateMongoId('id'), validate, approveCourse);
router.put('/courses/:id/reject', validateMongoId('id'), validate, rejectCourse);

// Content moderation
router.get('/moderation', getModerationQueue);
router.put('/moderation/:id/approve', validateMongoId('id'), validate, approveContent);
router.delete('/moderation/:id', validateMongoId('id'), validate, removeContent);

// Analytics
router.get('/analytics/revenue', getRevenueAnalytics);
router.get('/analytics/user-growth', getUserGrowthAnalytics);

// System settings
router.get('/settings', getSystemSettings);
router.put('/settings', updateSystemSettings);

// Educator applications
router.get('/educator-applications', getEducatorApplications);
router.put('/educator-applications/:id', validateMongoId('id'), validate, processEducatorApplication);

// Payment management
router.get('/payments', getAllPayments);
router.post('/payments/:id/refund', validateMongoId('id'), validate, processRefund);
router.put('/payments/:id/status', validateMongoId('id'), validate, updatePaymentStatus);

// Reports
router.get('/reports', getReports);
router.get('/reports/:id/download', validateMongoId('id'), validate, downloadReport);

// ============================================
// TEMPORARY ENDPOINT TO PROMOTE SELF TO ADMIN
// Remove this endpoint after first use for security!
// ============================================
router.post('/promote-self', protect, async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const user = await require('../models/User.model').findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = 'admin';
    await user.save();

    res.json({
      message: 'Successfully promoted to admin role',
      user: { name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Error promoting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;