// Notification controller
// ============================================
// NOTIFICATION CONTROLLER
// ============================================

const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const Notification = require('../models/Notification.model');
const { getPagination } = require('../utils/helpers');

// ============================================
// @desc    Create notification
// @route   POST /api/v1/notifications
// @access  Private (Admin/System)
// ============================================
exports.createNotification = asyncHandler(async (req, res) => {
  const {
    recipient,
    sender,
    type,
    category,
    title,
    message,
    relatedEntity,
    action,
    priority,
    channels,
    scheduledFor,
    expiresAt,
  } = req.body;

  const notification = await Notification.createNotification({
    recipient,
    sender: sender || req.user._id,
    type,
    category,
    title,
    message,
    relatedEntity,
    action,
    priority: priority || 'medium',
    channels,
    scheduledFor,
    expiresAt,
    sendEmail: channels?.email,
    sendPush: channels?.push,
  });

  // Emit socket event for real-time notification
  const io = req.app.get('io');
  if (io) {
    io.to(recipient.toString()).emit('new-notification', notification);
  }

  ApiResponse.created(res, notification, 'Notification created successfully');
});

// ============================================
// @desc    Get all notifications for current user
// @route   GET /api/v1/notifications
// @access  Private
// ============================================
exports.getMyNotifications = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    category,
    isRead,
    priority,
  } = req.query;

  const options = {
    limit: parseInt(limit),
    skip: (parseInt(page) - 1) * parseInt(limit),
    category,
    isRead: isRead !== undefined ? isRead === 'true' : undefined,
  };

  const notifications = await Notification.getByUser(req.user._id, options);

  const total = await Notification.countDocuments({
    recipient: req.user._id,
    status: { $ne: 'deleted' },
    ...(category && { category }),
    ...(isRead !== undefined && { isRead: isRead === 'true' }),
  });

  const pagination = getPagination(page, limit, total);

  ApiResponse.paginated(res, notifications, pagination, 'Notifications retrieved successfully');
});

// ============================================
// @desc    Get unread notifications
// @route   GET /api/v1/notifications/unread
// @access  Private
// ============================================
exports.getUnreadNotifications = asyncHandler(async (req, res) => {
  const { limit = 20 } = req.query;

  const notifications = await Notification.getUnreadByUser(req.user._id, parseInt(limit));

  ApiResponse.success(res, notifications, 'Unread notifications retrieved successfully');
});

// ============================================
// @desc    Get unread count
// @route   GET /api/v1/notifications/unread-count
// @access  Private
// ============================================
exports.getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countUnread(req.user._id);

  ApiResponse.success(res, { count }, 'Unread count retrieved successfully');
});

// ============================================
// @desc    Get single notification by ID
// @route   GET /api/v1/notifications/:id
// @access  Private
// ============================================
exports.getNotificationById = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id)
    .populate('sender', 'name profileImage');

  if (!notification) {
    throw ApiError.notFound('Notification not found');
  }

  // Check authorization
  if (notification.recipient.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not authorized to view this notification');
  }

  // Auto-mark as read when viewing
  if (!notification.isRead) {
    await notification.markAsRead();
  }

  ApiResponse.success(res, notification, 'Notification retrieved successfully');
});

// ============================================
// @desc    Mark notification as read
// @route   PUT /api/v1/notifications/:id/read
// @access  Private
// ============================================
exports.markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    throw ApiError.notFound('Notification not found');
  }

  // Check authorization
  if (notification.recipient.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not authorized to update this notification');
  }

  await notification.markAsRead();

  ApiResponse.success(res, null, 'Notification marked as read');
});

// ============================================
// @desc    Mark notification as unread
// @route   PUT /api/v1/notifications/:id/unread
// @access  Private
// ============================================
exports.markAsUnread = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    throw ApiError.notFound('Notification not found');
  }

  // Check authorization
  if (notification.recipient.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not authorized to update this notification');
  }

  await notification.markAsUnread();

  ApiResponse.success(res, null, 'Notification marked as unread');
});

// ============================================
// @desc    Mark all notifications as read
// @route   PUT /api/v1/notifications/mark-all-read
// @access  Private
// ============================================
exports.markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.markAllAsRead(req.user._id);

  ApiResponse.success(res, null, 'All notifications marked as read');
});

// ============================================
// @desc    Archive notification
// @route   PUT /api/v1/notifications/:id/archive
// @access  Private
// ============================================
exports.archiveNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    throw ApiError.notFound('Notification not found');
  }

  // Check authorization
  if (notification.recipient.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not authorized to archive this notification');
  }

  await notification.archive();

  ApiResponse.success(res, null, 'Notification archived');
});

// ============================================
// @desc    Delete notification
// @route   DELETE /api/v1/notifications/:id
// @access  Private
// ============================================
exports.deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    throw ApiError.notFound('Notification not found');
  }

  // Check authorization
  if (notification.recipient.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not authorized to delete this notification');
  }

  await notification.softDelete();

  ApiResponse.success(res, null, 'Notification deleted');
});

// ============================================
// @desc    Delete all notifications
// @route   DELETE /api/v1/notifications
// @access  Private
// ============================================
exports.deleteAllNotifications = asyncHandler(async (req, res) => {
  await Notification.deleteAllForUser(req.user._id);

  ApiResponse.success(res, null, 'All notifications deleted');
});

// ============================================
// @desc    Get notification statistics
// @route   GET /api/v1/notifications/statistics
// @access  Private
// ============================================
exports.getNotificationStatistics = asyncHandler(async (req, res) => {
  const stats = await Notification.getStatistics(req.user._id);

  ApiResponse.success(res, stats, 'Statistics retrieved successfully');
});

// ============================================
// @desc    Send bulk notifications (Admin)
// @route   POST /api/v1/notifications/bulk
// @access  Private (Admin)
// ============================================
exports.sendBulkNotifications = asyncHandler(async (req, res) => {
  const { recipients, type, category, title, message, priority } = req.body;

  if (!Array.isArray(recipients) || recipients.length === 0) {
    throw ApiError.badRequest('Recipients array is required');
  }

  const notifications = recipients.map((recipientId) => ({
    recipient: recipientId,
    sender: req.user._id,
    type,
    category,
    title,
    message,
    priority: priority || 'medium',
    channels: {
      inApp: true,
    },
  }));

  await Notification.createBulk(notifications);

  // Emit socket events
  const io = req.app.get('io');
  if (io) {
    recipients.forEach((recipientId) => {
      io.to(recipientId.toString()).emit('new-notification', {
        title,
        message,
        type,
      });
    });
  }

  ApiResponse.success(res, null, `Notifications sent to ${recipients.length} users`);
});

// ============================================
// @desc    Clean expired notifications (Admin/Cron)
// @route   DELETE /api/v1/notifications/clean-expired
// @access  Private (Admin)
// ============================================
exports.cleanExpiredNotifications = asyncHandler(async (req, res) => {
  const result = await Notification.cleanExpired();

  ApiResponse.success(res, result, 'Expired notifications cleaned');
});