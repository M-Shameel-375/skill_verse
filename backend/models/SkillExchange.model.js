// SkillExchange model
// ============================================
// SKILL EXCHANGE MODEL
// ============================================

const mongoose = require('mongoose');

const skillExchangeSchema = new mongoose.Schema(
  {
    // ============================================
    // PARTICIPANTS
    // ============================================
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requester is required'],
    },

    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Provider is required'],
    },

    // ============================================
    // SKILLS
    // ============================================
    offeredSkill: {
      name: {
        type: String,
        required: [true, 'Offered skill name is required'],
        trim: true,
      },
      level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        required: true,
      },
      description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters'],
      },
    },

    requestedSkill: {
      name: {
        type: String,
        required: [true, 'Requested skill name is required'],
        trim: true,
      },
      level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        required: true,
      },
      description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters'],
      },
    },

    // ============================================
    // EXCHANGE DETAILS
    // ============================================
    title: {
      type: String,
      required: [true, 'Exchange title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },

    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },

    objectives: [
      {
        type: String,
        trim: true,
      },
    ],

    // ============================================
    // STATUS & WORKFLOW
    // ============================================
    status: {
      type: String,
      enum: [
        'pending',
        'accepted',
        'rejected',
        'in-progress',
        'completed',
        'cancelled',
        'disputed',
      ],
      default: 'pending',
    },

    // ============================================
    // SCHEDULING
    // ============================================
    proposedSchedule: [
      {
        date: {
          type: Date,
          required: true,
        },
        startTime: {
          type: String,
          required: true,
        },
        endTime: {
          type: String,
          required: true,
        },
        timezone: {
          type: String,
          default: 'UTC',
        },
      },
    ],

    agreedSchedule: [
      {
        date: {
          type: Date,
          required: true,
        },
        startTime: {
          type: String,
          required: true,
        },
        endTime: {
          type: String,
          required: true,
        },
        duration: {
          type: Number, // in minutes
        },
        timezone: {
          type: String,
          default: 'UTC',
        },
        status: {
          type: String,
          enum: ['scheduled', 'completed', 'missed', 'rescheduled'],
          default: 'scheduled',
        },
        completedAt: Date,
        notes: String,
      },
    ],

    // ============================================
    // SESSION TRACKING
    // ============================================
    sessions: [
      {
        sessionNumber: {
          type: Number,
          required: true,
        },
        scheduledAt: {
          type: Date,
          required: true,
        },
        actualStartTime: Date,
        actualEndTime: Date,
        duration: Number, // actual duration in minutes
        topic: String,
        notes: String,
        recording: {
          url: String,
          publicId: String,
          duration: Number,
        },
        attendance: {
          requester: {
            type: String,
            enum: ['present', 'absent', 'late'],
          },
          provider: {
            type: String,
            enum: ['present', 'absent', 'late'],
          },
        },
        status: {
          type: String,
          enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
          default: 'scheduled',
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    totalSessions: {
      type: Number,
      default: 0,
    },

    completedSessions: {
      type: Number,
      default: 0,
    },

    // ============================================
    // DURATION & TIME
    // ============================================
    estimatedDuration: {
      type: Number, // total estimated hours
      min: [1, 'Duration must be at least 1 hour'],
      max: [200, 'Duration cannot exceed 200 hours'],
    },

    actualDuration: {
      type: Number, // total actual hours spent
      default: 0,
    },

    // ============================================
    // MEETING PLATFORM
    // ============================================
    preferredPlatform: {
      type: String,
      enum: ['zoom', 'google-meet', 'skype', 'discord', 'teams', 'custom'],
      default: 'zoom',
    },

    meetingLink: String,

    meetingId: String,

    meetingPassword: String,

    // ============================================
    // COMMUNICATION
    // ============================================
    chatEnabled: {
      type: Boolean,
      default: true,
    },

    messages: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        message: {
          type: String,
          required: true,
          maxlength: [1000, 'Message cannot exceed 1000 characters'],
        },
        attachments: [
          {
            fileName: String,
            url: String,
            publicId: String,
            fileType: String,
            size: Number,
          },
        ],
        isRead: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // ============================================
    // PROGRESS TRACKING
    // ============================================
    milestones: [
      {
        title: {
          type: String,
          required: true,
        },
        description: String,
        targetDate: Date,
        status: {
          type: String,
          enum: ['pending', 'in-progress', 'completed'],
          default: 'pending',
        },
        completedAt: Date,
        completedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],

    progress: {
      requesterProgress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      providerProgress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      overallProgress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
    },

    // ============================================
    // RESOURCES SHARED
    // ============================================
    sharedResources: [
      {
        sharedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        description: String,
        type: {
          type: String,
          enum: ['document', 'video', 'link', 'image', 'other'],
          required: true,
        },
        url: String,
        publicId: String,
        size: Number,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // ============================================
    // RATINGS & FEEDBACK
    // ============================================
    feedback: {
      requesterFeedback: {
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        comment: {
          type: String,
          maxlength: [500, 'Comment cannot exceed 500 characters'],
        },
        skills: [
          {
            skillName: String,
            rating: {
              type: Number,
              min: 1,
              max: 5,
            },
          },
        ],
        wouldRecommend: Boolean,
        submittedAt: Date,
      },
      providerFeedback: {
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        comment: {
          type: String,
          maxlength: [500, 'Comment cannot exceed 500 characters'],
        },
        skills: [
          {
            skillName: String,
            rating: {
              type: Number,
              min: 1,
              max: 5,
            },
          },
        ],
        wouldRecommend: Boolean,
        submittedAt: Date,
      },
    },

    // ============================================
    // ENDORSEMENTS
    // ============================================
    endorsements: {
      requesterEndorsed: {
        type: Boolean,
        default: false,
      },
      providerEndorsed: {
        type: Boolean,
        default: false,
      },
    },

    // ============================================
    // TERMS & AGREEMENTS
    // ============================================
    terms: {
      commitmentHours: Number,
      sessionFrequency: String, // e.g., "twice per week"
      cancellationPolicy: String,
      additionalTerms: String,
      agreedBy: {
        requester: {
          agreed: {
            type: Boolean,
            default: false,
          },
          agreedAt: Date,
        },
        provider: {
          agreed: {
            type: Boolean,
            default: false,
          },
          agreedAt: Date,
        },
      },
    },

    // ============================================
    // MATCH SCORE (AI/ALGORITHM)
    // ============================================
    matchScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    matchFactors: {
      skillCompatibility: Number,
      availabilityMatch: Number,
      experienceLevel: Number,
      ratingHistory: Number,
      responseTime: Number,
    },

    // ============================================
    // CANCELLATION & DISPUTES
    // ============================================
    cancellation: {
      cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      reason: String,
      cancelledAt: Date,
    },

    dispute: {
      isDisputed: {
        type: Boolean,
        default: false,
      },
      raisedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      reason: String,
      description: String,
      status: {
        type: String,
        enum: ['open', 'investigating', 'resolved', 'closed'],
      },
      resolution: String,
      resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      resolvedAt: Date,
      raisedAt: Date,
    },

    // ============================================
    // GAMIFICATION
    // ============================================
    pointsAwarded: {
      requester: {
        type: Number,
        default: 0,
      },
      provider: {
        type: Number,
        default: 0,
      },
    },

    badgesEarned: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        badge: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Badge',
        },
        earnedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // ============================================
    // METADATA
    // ============================================
    requestedAt: {
      type: Date,
      default: Date.now,
    },

    acceptedAt: Date,

    startedAt: Date,

    completedAt: Date,

    expiresAt: Date, // Auto-expire pending requests

    lastActivityAt: {
      type: Date,
      default: Date.now,
    },

    isArchived: {
      type: Boolean,
      default: false,
    },
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
skillExchangeSchema.index({ requester: 1, status: 1 });
skillExchangeSchema.index({ provider: 1, status: 1 });
skillExchangeSchema.index({ status: 1, createdAt: -1 });
skillExchangeSchema.index({ 'offeredSkill.name': 1, 'requestedSkill.name': 1 });
skillExchangeSchema.index({ matchScore: -1 });

// ============================================
// VIRTUAL PROPERTIES
// ============================================

// Check if both parties agreed to terms
skillExchangeSchema.virtual('termsAgreed').get(function () {
  return (
    this.terms?.agreedBy?.requester?.agreed &&
    this.terms?.agreedBy?.provider?.agreed
  );
});

// Average rating
skillExchangeSchema.virtual('averageRating').get(function () {
  const ratings = [];
  if (this.feedback?.requesterFeedback?.rating) {
    ratings.push(this.feedback.requesterFeedback.rating);
  }
  if (this.feedback?.providerFeedback?.rating) {
    ratings.push(this.feedback.providerFeedback.rating);
  }
  if (ratings.length === 0) return 0;
  return ratings.reduce((a, b) => a + b, 0) / ratings.length;
});

// Completion percentage
skillExchangeSchema.virtual('completionPercentage').get(function () {
  if (this.totalSessions === 0) return 0;
  return Math.round((this.completedSessions / this.totalSessions) * 100);
});

// Unread messages count
skillExchangeSchema.virtual('unreadMessagesCount').get(function () {
  return this.messages?.filter((m) => !m.isRead).length || 0;
});

// ============================================
// MIDDLEWARE - PRE SAVE
// ============================================

// Update last activity
skillExchangeSchema.pre('save', function (next) {
  if (this.isModified()) {
    this.lastActivityAt = new Date();
  }
  next();
});

// Calculate overall progress
skillExchangeSchema.pre('save', function (next) {
  if (
    this.isModified('progress.requesterProgress') ||
    this.isModified('progress.providerProgress')
  ) {
    this.progress.overallProgress = Math.round(
      (this.progress.requesterProgress + this.progress.providerProgress) / 2
    );
  }
  next();
});

// Update completed sessions count
skillExchangeSchema.pre('save', function (next) {
  if (this.isModified('sessions')) {
    this.completedSessions = this.sessions.filter(
      (s) => s.status === 'completed'
    ).length;
    this.totalSessions = this.sessions.length;
  }
  next();
});

// Calculate actual duration
skillExchangeSchema.pre('save', function (next) {
  if (this.isModified('sessions')) {
    const totalMinutes = this.sessions
      .filter((s) => s.status === 'completed' && s.duration)
      .reduce((sum, s) => sum + s.duration, 0);
    this.actualDuration = Math.round(totalMinutes / 60); // Convert to hours
  }
  next();
});

// ============================================
// INSTANCE METHODS
// ============================================

// Accept exchange request
skillExchangeSchema.methods.acceptRequest = async function () {
  this.status = 'accepted';
  this.acceptedAt = new Date();
  await this.save();
};

// Reject exchange request
skillExchangeSchema.methods.rejectRequest = async function () {
  this.status = 'rejected';
  await this.save();
};

// Start exchange
skillExchangeSchema.methods.startExchange = async function () {
  if (!this.termsAgreed) {
    throw new Error('Both parties must agree to terms before starting');
  }
  this.status = 'in-progress';
  this.startedAt = new Date();
  await this.save();
};

// Complete exchange
skillExchangeSchema.methods.completeExchange = async function () {
  this.status = 'completed';
  this.completedAt = new Date();
  await this.save();
};

// Cancel exchange
skillExchangeSchema.methods.cancelExchange = async function (userId, reason) {
  this.status = 'cancelled';
  this.cancellation = {
    cancelledBy: userId,
    reason: reason,
    cancelledAt: new Date(),
  };
  await this.save();
};

// Add message
skillExchangeSchema.methods.addMessage = async function (
  senderId,
  message,
  attachments = []
) {
  this.messages.push({
    sender: senderId,
    message: message,
    attachments: attachments,
  });
  await this.save();
};

// Mark messages as read
skillExchangeSchema.methods.markMessagesAsRead = async function (userId) {
  this.messages.forEach((msg) => {
    if (msg.sender.toString() !== userId.toString()) {
      msg.isRead = true;
    }
  });
  await this.save();
};

// Add session
skillExchangeSchema.methods.addSession = async function (sessionData) {
  this.sessions.push({
    sessionNumber: this.sessions.length + 1,
    ...sessionData,
  });
  await this.save();
};

// Complete session
skillExchangeSchema.methods.completeSession = async function (
  sessionId,
  duration,
  notes
) {
  const session = this.sessions.id(sessionId);
  if (session) {
    session.status = 'completed';
    session.actualEndTime = new Date();
    session.duration = duration;
    session.notes = notes;
    session.completedAt = new Date();
    await this.save();
  }
};

// Add feedback
skillExchangeSchema.methods.addFeedback = async function (
  userId,
  rating,
  comment,
  skills = [],
  wouldRecommend = true
) {
  const feedbackData = {
    rating,
    comment,
    skills,
    wouldRecommend,
    submittedAt: new Date(),
  };

  if (userId.toString() === this.requester.toString()) {
    this.feedback.requesterFeedback = feedbackData;
  } else if (userId.toString() === this.provider.toString()) {
    this.feedback.providerFeedback = feedbackData;
  }

  await this.save();
};

// Raise dispute
skillExchangeSchema.methods.raiseDispute = async function (
  userId,
  reason,
  description
) {
  this.status = 'disputed';
  this.dispute = {
    isDisputed: true,
    raisedBy: userId,
    reason: reason,
    description: description,
    status: 'open',
    raisedAt: new Date(),
  };
  await this.save();
};

// Resolve dispute
skillExchangeSchema.methods.resolveDispute = async function (
  resolvedBy,
  resolution
) {
  this.dispute.status = 'resolved';
  this.dispute.resolution = resolution;
  this.dispute.resolvedBy = resolvedBy;
  this.dispute.resolvedAt = new Date();
  this.status = 'completed';
  await this.save();
};

// Agree to terms
skillExchangeSchema.methods.agreeToTerms = async function (userId) {
  if (userId.toString() === this.requester.toString()) {
    this.terms.agreedBy.requester.agreed = true;
    this.terms.agreedBy.requester.agreedAt = new Date();
  } else if (userId.toString() === this.provider.toString()) {
    this.terms.agreedBy.provider.agreed = true;
    this.terms.agreedBy.provider.agreedAt = new Date();
  }
  await this.save();
};

// Endorse skill
skillExchangeSchema.methods.endorseSkill = async function (userId) {
  if (userId.toString() === this.requester.toString()) {
    this.endorsements.requesterEndorsed = true;
  } else if (userId.toString() === this.provider.toString()) {
    this.endorsements.providerEndorsed = true;
  }
  await this.save();
};

// Update progress
skillExchangeSchema.methods.updateProgress = async function (
  userId,
  progress
) {
  if (userId.toString() === this.requester.toString()) {
    this.progress.requesterProgress = progress;
  } else if (userId.toString() === this.provider.toString()) {
    this.progress.providerProgress = progress;
  }
  await this.save();
};

// ============================================
// STATIC METHODS
// ============================================

// Get pending requests for user
skillExchangeSchema.statics.getPendingRequests = function (userId) {
  return this.find({
    provider: userId,
    status: 'pending',
  })
    .populate('requester', 'name profileImage skills')
    .sort({ createdAt: -1 });
};

// Get active exchanges for user
skillExchangeSchema.statics.getActiveExchanges = function (userId) {
  return this.find({
    $or: [{ requester: userId }, { provider: userId }],
    status: { $in: ['accepted', 'in-progress'] },
  })
    .populate('requester provider', 'name profileImage skills')
    .sort({ lastActivityAt: -1 });
};

// Get completed exchanges for user
skillExchangeSchema.statics.getCompletedExchanges = function (userId) {
  return this.find({
    $or: [{ requester: userId }, { provider: userId }],
    status: 'completed',
  })
    .populate('requester provider', 'name profileImage')
    .sort({ completedAt: -1 });
};

// Find matches for skill exchange
skillExchangeSchema.statics.findMatches = function (
  userId,
  offeredSkill,
  desiredSkill
) {
  return this.find({
    requester: { $ne: userId },
    'offeredSkill.name': desiredSkill,
    'requestedSkill.name': offeredSkill,
    status: 'pending',
  })
    .populate('requester', 'name profileImage skills rating')
    .sort({ matchScore: -1 });
};

// ============================================
// EXPORT MODEL
// ============================================
module.exports = mongoose.model('SkillExchange', skillExchangeSchema);