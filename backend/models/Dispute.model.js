// ============================================
// DISPUTE MODEL
// ============================================

const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema(
  {
    // ============================================
    // DISPUTE IDENTIFICATION
    // ============================================
    disputeNumber: {
      type: String,
      unique: true,
    },

    // ============================================
    // PARTIES INVOLVED
    // ============================================
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporter is required'],
    },
    
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // ============================================
    // DISPUTE TYPE & CATEGORY
    // ============================================
    type: {
      type: String,
      enum: [
        'skill-exchange', // Dispute in skill exchange
        'course-content', // Issue with course content
        'payment',        // Payment related dispute
        'user-behavior',  // User misconduct
        'review',         // Fake/unfair review
        'refund',         // Refund request
        'technical',      // Technical issue
        'other',          // Other issues
      ],
      required: [true, 'Dispute type is required'],
    },

    category: {
      type: String,
      enum: [
        'quality',        // Quality of service/content
        'fraud',          // Fraudulent activity
        'harassment',     // Harassment or abuse
        'no-show',        // Party didn't show up
        'incomplete',     // Incomplete service
        'misrepresentation', // False claims
        'copyright',      // Copyright violation
        'payment-issue',  // Payment not received
        'refund-request', // Wants refund
        'other',
      ],
      default: 'other',
    },

    // ============================================
    // RELATED ENTITIES
    // ============================================
    relatedEntity: {
      entityType: {
        type: String,
        enum: ['SkillExchange', 'Course', 'Payment', 'Review', 'LiveSession'],
      },
      entityId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'relatedEntity.entityType',
      },
    },

    // ============================================
    // DISPUTE DETAILS
    // ============================================
    title: {
      type: String,
      required: [true, 'Dispute title is required'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },

    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },

    evidence: [
      {
        type: {
          type: String,
          enum: ['screenshot', 'document', 'link', 'message'],
        },
        url: String,
        description: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // ============================================
    // DISPUTE STATUS
    // ============================================
    status: {
      type: String,
      enum: [
        'pending',      // Newly submitted
        'under-review', // Admin is reviewing
        'investigating',// Under investigation
        'resolved',     // Resolved
        'rejected',     // Dispute rejected
        'escalated',    // Escalated to higher authority
        'closed',       // Closed without action
      ],
      default: 'pending',
    },

    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },

    // ============================================
    // RESOLUTION
    // ============================================
    resolution: {
      outcome: {
        type: String,
        enum: [
          'in-favor-reporter',    // Ruled in favor of reporter
          'in-favor-reported',    // Ruled in favor of reported user
          'mutual-agreement',     // Both parties agreed
          'partial-resolution',   // Partial resolution
          'no-action',            // No action taken
          'refund-issued',        // Refund was issued
          'warning-issued',       // Warning issued
          'account-suspended',    // Account suspended
          'account-banned',       // Account banned
        ],
      },
      description: String,
      actions: [
        {
          action: String,
          targetUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
          details: String,
          executedAt: Date,
        },
      ],
      refundAmount: Number,
      resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      resolvedAt: Date,
    },

    // ============================================
    // COMMUNICATION
    // ============================================
    messages: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        senderRole: {
          type: String,
          enum: ['reporter', 'reported', 'admin'],
        },
        message: {
          type: String,
          required: true,
        },
        attachments: [
          {
            type: String,
            url: String,
          },
        ],
        isInternal: {
          type: Boolean,
          default: false, // If true, only visible to admins
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // ============================================
    // ADMIN NOTES (Internal)
    // ============================================
    adminNotes: [
      {
        admin: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        note: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // ============================================
    // ASSIGNMENT
    // ============================================
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // ============================================
    // TIMESTAMPS
    // ============================================
    submittedAt: {
      type: Date,
      default: Date.now,
    },

    lastActivityAt: {
      type: Date,
      default: Date.now,
    },

    dueDate: Date, // Expected resolution date
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
disputeSchema.index({ status: 1, priority: 1 });
disputeSchema.index({ reporter: 1 });
disputeSchema.index({ reportedUser: 1 });
disputeSchema.index({ assignedTo: 1 });
disputeSchema.index({ type: 1 });
disputeSchema.index({ createdAt: -1 });

// ============================================
// PRE-SAVE MIDDLEWARE
// ============================================
disputeSchema.pre('save', async function (next) {
  // Generate dispute number if not exists
  if (!this.disputeNumber) {
    const count = await this.constructor.countDocuments();
    this.disputeNumber = `DSP-${Date.now().toString(36).toUpperCase()}-${(count + 1).toString().padStart(4, '0')}`;
  }
  
  // Update last activity
  this.lastActivityAt = new Date();
  
  next();
});

// ============================================
// METHODS
// ============================================

// Add message to dispute
disputeSchema.methods.addMessage = async function (senderId, message, senderRole, isInternal = false, attachments = []) {
  this.messages.push({
    sender: senderId,
    senderRole,
    message,
    isInternal,
    attachments,
    createdAt: new Date(),
  });
  this.lastActivityAt = new Date();
  return this.save();
};

// Add admin note
disputeSchema.methods.addAdminNote = async function (adminId, note) {
  this.adminNotes.push({
    admin: adminId,
    note,
    createdAt: new Date(),
  });
  this.lastActivityAt = new Date();
  return this.save();
};

// Update status
disputeSchema.methods.updateStatus = async function (newStatus, adminId) {
  this.status = newStatus;
  this.lastActivityAt = new Date();
  
  if (newStatus === 'under-review' || newStatus === 'investigating') {
    if (!this.assignedTo) {
      this.assignedTo = adminId;
    }
  }
  
  return this.save();
};

// Resolve dispute
disputeSchema.methods.resolve = async function (outcome, description, adminId, actions = []) {
  this.status = 'resolved';
  this.resolution = {
    outcome,
    description,
    actions,
    resolvedBy: adminId,
    resolvedAt: new Date(),
  };
  this.lastActivityAt = new Date();
  
  return this.save();
};

// ============================================
// STATICS
// ============================================

// Get disputes by status
disputeSchema.statics.getByStatus = function (status) {
  return this.find({ status })
    .populate('reporter', 'name email avatar')
    .populate('reportedUser', 'name email avatar')
    .populate('assignedTo', 'name email')
    .sort({ priority: -1, createdAt: -1 });
};

// Get open disputes count
disputeSchema.statics.getOpenCount = function () {
  return this.countDocuments({
    status: { $in: ['pending', 'under-review', 'investigating', 'escalated'] },
  });
};

// Get disputes statistics
disputeSchema.statics.getStatistics = async function () {
  const stats = await this.aggregate([
    {
      $facet: {
        byStatus: [
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ],
        byType: [
          { $group: { _id: '$type', count: { $sum: 1 } } },
        ],
        byPriority: [
          { $group: { _id: '$priority', count: { $sum: 1 } } },
        ],
        total: [
          { $count: 'count' },
        ],
        avgResolutionTime: [
          {
            $match: {
              status: 'resolved',
              'resolution.resolvedAt': { $exists: true },
            },
          },
          {
            $project: {
              resolutionTime: {
                $subtract: ['$resolution.resolvedAt', '$submittedAt'],
              },
            },
          },
          {
            $group: {
              _id: null,
              avgTime: { $avg: '$resolutionTime' },
            },
          },
        ],
      },
    },
  ]);

  return {
    byStatus: stats[0].byStatus,
    byType: stats[0].byType,
    byPriority: stats[0].byPriority,
    total: stats[0].total[0]?.count || 0,
    avgResolutionTimeMs: stats[0].avgResolutionTime[0]?.avgTime || 0,
  };
};

const Dispute = mongoose.model('Dispute', disputeSchema);

module.exports = Dispute;
