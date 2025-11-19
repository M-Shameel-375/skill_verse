// Notification model
// ============================================
// NOTIFICATION MODEL
// ============================================

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    // ============================================
    // RECIPIENT
    // ============================================
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient is required'],
      index: true,
    },

    // ============================================
    // SENDER (OPTIONAL)
    // ============================================
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // ============================================
    // NOTIFICATION TYPE & CATEGORY
    // ============================================
    type: {
      type: String,
      enum: [
        // Course related
        'course-enrollment',
        'course-update',
        'course-completion',
        'new-lecture',
        
        // Live session related
        'session-reminder',
        'session-started',
        'session-cancelled',
        'session-rescheduled',
        
        // Skill exchange related
        'exchange-request',
        'exchange-accepted',
        'exchange-rejected',
        'exchange-completed',
        
        // Quiz & Certificate
        'quiz-available',
        'quiz-graded',
        'certificate-issued',
        
        // Payment & Purchase
        'payment-success',
        'payment-failed',
        'refund-processed',
        'payout-processed',
        
        // Social & Interaction
        'new-message',
        'new-review',
        'review-response',
        'new-follower',
        
        // Gamification
        'badge-earned',
        'level-up',
        'achievement-unlocked',
        
        // System
        'account-verified',
        'password-changed',
        'login-alert',
        'system-announcement',
        
        // Admin
        'content-approved',
        'content-rejected',
        'account-warning',
      ],
      required: true,
    },

    category: {
      type: String,
      enum: [
        'course',
        'live-session',
        'skill-exchange',
        'payment',
        'social',
        'gamification',
        'system',
        'admin',
      ],
      required: true,
    },

    // ============================================
    // NOTIFICATION CONTENT
    // ============================================
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },

    message: {
      type: String,
      required: [true, 'Message is required'],
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },

    // ============================================
    // RELATED ENTITIES
    // ============================================
    relatedEntity: {
      entityType: {
        type: String,
        enum: [
          'course',
          'live-session',
          'skill-exchange',
          'quiz',
          'certificate',
          'payment',
          'review',
          'badge',
          'user',
        ],
      },
      entityId: {
        type: mongoose.Schema.Types.ObjectId,
      },
    },

    // ============================================
    // ACTION & LINK
    // ============================================
    action: {
      label: {
        type: String,
        maxlength: [30, 'Action label cannot exceed 30 characters'],
      },
      url: String,
      route: String,
    },

    // ============================================
    // PRIORITY
    // ============================================
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },

    // ============================================
    // STATUS
    // ============================================
    status: {
      type: String,
      enum: ['unread', 'read', 'archived', 'deleted'],
      default: 'unread',
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    readAt: Date,

    // ============================================
    // DELIVERY CHANNELS
    // ============================================
    channels: {
      inApp: {
        type: Boolean,
        default: true,
      },
      email: {
        sent: {
          type: Boolean,
          default: false,
        },
        sentAt: Date,
        error: String,
      },
      push: {
        sent: {
          type: Boolean,
          default: false,
        },
        sentAt: Date,
        error: String,
      },
      sms: {
        sent: {
          type: Boolean,
          default: false,
        },
        sentAt: Date,
        error: String,
      },
    },

    // ============================================
    // MEDIA ATTACHMENTS
    // ============================================
    media: {
      icon: String,
      image: String,
      thumbnail: String,
    },

    // ============================================
    // METADATA
    // ============================================
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },

    // ============================================
    // SCHEDULING
    // ============================================
    scheduledFor: Date,

    isSent: {
      type: Boolean,
      default: false,
    },

    sentAt: Date,

    // ============================================
    // EXPIRATION
    // ============================================
    expiresAt: Date,

    // ============================================
    // GROUPING (FOR BATCH NOTIFICATIONS)
    // ============================================
    groupKey: String,

    batchId: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ============================================
// INDEXES
// ============================================
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, status: 1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ category: 1 });
notificationSchema.index({ scheduledFor: 1, isSent: 1 });
notificationSchema.index({ expiresAt: 1 });
notificationSchema.index({ groupKey: 1 });

// ============================================
// VIRTUAL PROPERTIES
// ============================================

// Check if notification is expired
notificationSchema.virtual('isExpired').get(function () {
  return this.expiresAt && new Date() > this.expiresAt;
});

// Check if notification is scheduled
notificationSchema.virtual('isScheduled').get(function () {
  return this.scheduledFor && new Date() < this.scheduledFor;
});

// Time ago
notificationSchema.virtual('timeAgo').get(function () {
  const seconds = Math.floor((new Date() - this.createdAt) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + 'y ago';

  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + 'mo ago';

  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + 'd ago';

  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + 'h ago';

  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + 'm ago';

  return 'Just now';
});

// ============================================
// MIDDLEWARE - PRE SAVE
// ============================================

// Set sentAt timestamp
notificationSchema.pre('save', function (next) {
  if (this.isModified('isSent') && this.isSent && !this.sentAt) {
    this.sentAt = new Date();
  }
  next();
});

// Set readAt timestamp
notificationSchema.pre('save', function (next) {
  if (this.isModified('isRead') && this.isRead && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

// Auto-expire old notifications
notificationSchema.pre('save', function (next) {
  if (this.isNew && !this.expiresAt) {
    // Set expiration to 30 days from now
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  next();
});

// ============================================
// INSTANCE METHODS
// ============================================

// Mark as read
notificationSchema.methods.markAsRead = async function () {
  this.isRead = true;
  this.status = 'read';
  this.readAt = new Date();
  await this.save();
};

// Mark as unread
notificationSchema.methods.markAsUnread = async function () {
  this.isRead = false;
  this.status = 'unread';
  this.readAt = null;
  await this.save();
};

// Archive notification
notificationSchema.methods.archive = async function () {
  this.status = 'archived';
  await this.save();
};

// Delete notification (soft delete)
notificationSchema.methods.softDelete = async function () {
  this.status = 'deleted';
  await this.save();
};

// Send via email
notificationSchema.methods.sendEmail = async function () {
  try {
    // Email sending logic would go here
    this.channels.email.sent = true;
    this.channels.email.sentAt = new Date();
    await this.save();
    return { success: true };
  } catch (error) {
    this.channels.email.error = error.message;
    await this.save();
    return { success: false, error: error.message };
  }
};

// Send push notification
notificationSchema.methods.sendPush = async function () {
  try {
    // Push notification logic would go here
    this.channels.push.sent = true;
    this.channels.push.sentAt = new Date();
    await this.save();
    return { success: true };
  } catch (error) {
    this.channels.push.error = error.message;
    await this.save();
    return { success: false, error: error.message };
  }
};

// ============================================
// STATIC METHODS
// ============================================

// Get unread notifications for user
notificationSchema.statics.getUnreadByUser = function (userId, limit = 20) {
  return this.find({
    recipient: userId,
    isRead: false,
    status: { $ne: 'deleted' },
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('sender', 'name profileImage');
};

// Get all notifications for user
notificationSchema.statics.getByUser = function (userId, options = {}) {
  const query = {
    recipient: userId,
    status: { $ne: 'deleted' },
  };

  if (options.category) {
    query.category = options.category;
  }

  if (options.isRead !== undefined) {
    query.isRead = options.isRead;
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(options.limit || 50)
    .skip(options.skip || 0)
    .populate('sender', 'name profileImage');
};

// Count unread notifications
notificationSchema.statics.countUnread = function (userId) {
  return this.countDocuments({
    recipient: userId,
    isRead: false,
    status: { $ne: 'deleted' },
  });
};

// Mark all as read for user
notificationSchema.statics.markAllAsRead = async function (userId) {
  return this.updateMany(
    {
      recipient: userId,
      isRead: false,
      status: { $ne: 'deleted' },
    },
    {
      $set: {
        isRead: true,
        status: 'read',
        readAt: new Date(),
      },
    }
  );
};

// Delete all notifications for user
notificationSchema.statics.deleteAllForUser = async function (userId) {
  return this.updateMany(
    {
      recipient: userId,
    },
    {
      $set: {
        status: 'deleted',
      },
    }
  );
};

// Create notification
notificationSchema.statics.createNotification = async function (data) {
  const notification = new this(data);
  await notification.save();

  // Send via different channels based on user preferences
  if (data.sendEmail) {
    await notification.sendEmail();
  }

  if (data.sendPush) {
    await notification.sendPush();
  }

  return notification;
};

// Create bulk notifications
notificationSchema.statics.createBulk = async function (notifications) {
  return this.insertMany(notifications);
};

// Get scheduled notifications
notificationSchema.statics.getScheduledNotifications = function () {
  return this.find({
    isSent: false,
    scheduledFor: { $lte: new Date() },
  });
};

// Clean expired notifications
notificationSchema.statics.cleanExpired = async function () {
  return this.deleteMany({
    expiresAt: { $lt: new Date() },
  });
};

// Get notification statistics
notificationSchema.statics.getStatistics = async function (userId) {
  const stats = await this.aggregate([
    {
      $match: {
        recipient: mongoose.Types.ObjectId(userId),
        status: { $ne: 'deleted' },
      },
    },
    {
      $group: {
        _id: '$category',
        total: { $sum: 1 },
        unread: {
          $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] },
        },
      },
    },
  ]);

  return stats;
};

// ============================================
// EXPORT MODEL
// ============================================
module.exports = mongoose.model('Notification', notificationSchema);