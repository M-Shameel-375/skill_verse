// Notification routes
// ============================================
// NOTIFICATION ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const {
  createNotification,
  getMyNotifications,
  getUnreadNotifications,
  getUnreadCount,
  getNotificationById,
  markAsRead,
  markAsUnread,
  markAllAsRead,
  archiveNotification,
  deleteNotification,
  deleteAllNotifications,
  getNotificationStatistics,
  sendBulkNotifications,
  cleanExpiredNotifications,
} = require('../controllers/notification.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/roleCheck.middleware');
const { validateMongoId, validate } = require('../middlewares/validation.middleware');

// Protected routes only
router.use(protect);

router.get('/', getMyNotifications);
router.get('/unread', getUnreadNotifications);
router.get('/unread-count', getUnreadCount);
router.get('/statistics', getNotificationStatistics);
router.put('/mark-all-read', markAllAsRead);
router.delete('/', deleteAllNotifications);
router.get('/:id', validateMongoId('id'), validate, getNotificationById);
router.put('/:id/read', markAsRead);
router.put('/:id/unread', markAsUnread);
router.put('/:id/archive', archiveNotification);
router.delete('/:id', deleteNotification);

// Protected routes - Admin
router.post('/', authorize('admin'), createNotification);
router.post('/bulk', authorize('admin'), sendBulkNotifications);
router.delete('/clean-expired', authorize('admin'), cleanExpiredNotifications);

module.exports = router;