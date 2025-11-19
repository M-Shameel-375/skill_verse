// LiveSession model
// ============================================
// LIVE SESSION MODEL
// ============================================

const mongoose = require('mongoose');

const liveSessionSchema = new mongoose.Schema(
  {
    // ============================================
    // BASIC INFORMATION
    // ============================================
    title: {
      type: String,
      required: [true, 'Session title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },

    description: {
      type: String,
      required: [true, 'Session description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },

    // ============================================
    // HOST/INSTRUCTOR
    // ============================================
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Host is required'],
    },

    coHosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // ============================================
    // SESSION TYPE & CATEGORY
    // ============================================
    sessionType: {
      type: String,
      enum: ['webinar', 'workshop', 'tutorial', 'q&a', 'discussion', 'lecture'],
      default: 'webinar',
    },

    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Programming',
        'Design',
        'Business',
        'Marketing',
        'Photography',
        'Music',
        'Health & Fitness',
        'Language',
        'Personal Development',
        'Science',
        'Mathematics',
        'Art & Craft',
        'Cooking',
        'Other',
      ],
    },

    tags: [String],

    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'all-levels'],
      default: 'all-levels',
    },

    // ============================================
    // SCHEDULING
    // ============================================
    scheduledAt: {
      type: Date,
      required: [true, 'Scheduled date and time is required'],
      validate: {
        validator: function (value) {
          return value > new Date();
        },
        message: 'Scheduled date must be in the future',
      },
    },

    duration: {
      type: Number, // in minutes
      required: [true, 'Duration is required'],
      min: [15, 'Duration must be at least 15 minutes'],
      max: [480, 'Duration cannot exceed 8 hours'],
    },

    timezone: {
      type: String,
      default: 'UTC',
    },

    // ============================================
    // SESSION STATUS & TIMING
    // ============================================
    status: {
      type: String,
      enum: ['scheduled', 'live', 'completed', 'cancelled', 'postponed'],
      default: 'scheduled',
    },

    actualStartTime: Date,

    actualEndTime: Date,

    actualDuration: Number, // in minutes

    // ============================================
    // PARTICIPANTS
    // ============================================
    participants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        joinedAt: Date,
        leftAt: Date,
        timeSpent: Number, // in minutes
        attendance: {
          type: String,
          enum: ['present', 'absent', 'late'],
          default: 'present',
        },
        certificateIssued: {
          type: Boolean,
          default: false,
        },
      },
    ],

    maxParticipants: {
      type: Number,
      default: 100,
      min: [1, 'At least 1 participant allowed'],
      max: [500, 'Maximum 500 participants allowed'],
    },

    currentParticipants: {
      type: Number,
      default: 0,
    },

    waitingList: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // ============================================
    // PRICING
    // ============================================
    price: {
      type: Number,
      default: 0,
      min: [0, 'Price cannot be negative'],
    },

    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
    },

    isFree: {
      type: Boolean,
      default: true,
    },

    // ============================================
    // RELATED COURSE (OPTIONAL)
    // ============================================
    relatedCourse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },

    // ============================================
    // VIDEO CONFERENCING
    // ============================================
    meetingDetails: {
      platform: {
        type: String,
        enum: ['agora', 'twilio', 'zoom', 'custom'],
        default: 'agora',
      },
      roomId: String,
      meetingId: String,
      password: String,
      joinUrl: String,
      hostUrl: String,
      recordingEnabled: {
        type: Boolean,
        default: false,
      },
      recordingUrl: String,
    },

    // ============================================
    // SESSION MATERIALS
    // ============================================
    materials: [
      {
        title: {
          type: String,
          required: true,
        },
        description: String,
        type: {
          type: String,
          enum: ['pdf', 'doc', 'ppt', 'image', 'video', 'link'],
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
    // AGENDA
    // ============================================
    agenda: [
      {
        topic: {
          type: String,
          required: true,
        },
        duration: Number, // in minutes
        order: Number,
      },
    ],

    // ============================================
    // RECORDING
    // ============================================
    recording: {
      isRecorded: {
        type: Boolean,
        default: false,
      },
      recordingUrl: String,
      publicId: String,
      duration: Number,
      size: Number,
      isPublic: {
        type: Boolean,
        default: false,
      },
      viewCount: {
        type: Number,
        default: 0,
      },
    },

    // ============================================
    // CHAT & INTERACTION
    // ============================================
    chatEnabled: {
      type: Boolean,
      default: true,
    },

    qnaEnabled: {
      type: Boolean,
      default: true,
    },

    pollsEnabled: {
      type: Boolean,
      default: true,
    },

    screenShareEnabled: {
      type: Boolean,
      default: true,
    },

    questions: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        question: String,
        answer: String,
        answeredBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        answeredAt: Date,
        upvotes: {
          type: Number,
          default: 0,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    polls: [
      {
        question: {
          type: String,
          required: true,
        },
        options: [
          {
            text: String,
            votes: {
              type: Number,
              default: 0,
            },
            voters: [
              {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
              },
            ],
          },
        ],
        createdAt: {
          type: Date,
          default: Date.now,
        },
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],

    // ============================================
    // REMINDERS
    // ============================================
    reminders: {
      oneDayBefore: {
        type: Boolean,
        default: true,
      },
      oneHourBefore: {
        type: Boolean,
        default: true,
      },
      fifteenMinBefore: {
        type: Boolean,
        default: true,
      },
    },

    // ============================================
    // CERTIFICATE
    // ============================================
    certificate: {
      enabled: {
        type: Boolean,
        default: false,
      },
      template: String,
      minimumAttendance: {
        type: Number,
        default: 75, // percentage
        min: 0,
        max: 100,
      },
    },

    // ============================================
    // RATINGS & FEEDBACK
    // ============================================
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },

    feedback: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        comment: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // ============================================
    // VISIBILITY & ACCESS
    // ============================================
    visibility: {
      type: String,
      enum: ['public', 'private', 'unlisted'],
      default: 'public',
    },

    requiresApproval: {
      type: Boolean,
      default: false,
    },

    // ============================================
    // NOTIFICATIONS
    // ============================================
    notificationsSent: {
      oneDayBefore: {
        type: Boolean,
        default: false,
      },
      oneHourBefore: {
        type: Boolean,
        default: false,
      },
      fifteenMinBefore: {
        type: Boolean,
        default: false,
      },
      sessionStarted: {
        type: Boolean,
        default: false,
      },
      sessionEnded: {
        type: Boolean,
        default: false,
      },
    },

    // ============================================
    // ANALYTICS
    // ============================================
    analytics: {
      totalViews: {
        type: Number,
        default: 0,
      },
      uniqueViews: {
        type: Number,
        default: 0,
      },
      averageAttendance: Number,
      engagementRate: Number,
      chatMessages: {
        type: Number,
        default: 0,
      },
      questionsAsked: {
        type: Number,
        default: 0,
      },
    },

    // ============================================
    // METADATA
    // ============================================
    cancelledReason: String,
    postponedReason: String,
    postponedTo: Date,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
liveSessionSchema.index({ title: 'text', description: 'text' });
liveSessionSchema.index({ host: 1, status: 1 });
liveSessionSchema.index({ scheduledAt: 1 });
liveSessionSchema.index({ status: 1, scheduledAt: 1 });
liveSessionSchema.index({ category: 1, level: 1 });
liveSessionSchema.index({ slug: 1 });

// ============================================
// VIRTUAL PROPERTIES
// ============================================

// Check if session is full
liveSessionSchema.virtual('isFull').get(function () {
  return this.currentParticipants >= this.maxParticipants;
});

// Check if session is upcoming
liveSessionSchema.virtual('isUpcoming').get(function () {
  return this.scheduledAt > new Date() && this.status === 'scheduled';
});

// Check if session is ongoing
liveSessionSchema.virtual('isOngoing').get(function () {
  return this.status === 'live';
});

// Get available seats
liveSessionSchema.virtual('availableSeats').get(function () {
  return Math.max(0, this.maxParticipants - this.currentParticipants);
});

// Total registered (participants + waiting list)
liveSessionSchema.virtual('totalRegistered').get(function () {
  return this.participants.length + this.waitingList.length;
});

// ============================================
// MIDDLEWARE - PRE SAVE
// ============================================

// Generate slug
liveSessionSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
    
    this.slug += '-' + Date.now().toString(36).substring(2, 7);
  }
  next();
});

// Update isFree based on price
liveSessionSchema.pre('save', function (next) {
  this.isFree = this.price === 0;
  next();
});

// Update current participants count
liveSessionSchema.pre('save', function (next) {
  if (this.isModified('participants')) {
    this.currentParticipants = this.participants.length;
  }
  next();
});

// Update questions count in analytics
liveSessionSchema.pre('save', function (next) {
  if (this.isModified('questions')) {
    this.analytics.questionsAsked = this.questions.length;
  }
  next();
});

// ============================================
// INSTANCE METHODS
// ============================================

// Check if user is registered
liveSessionSchema.methods.isUserRegistered = function (userId) {
  return this.participants.some(
    (p) => p.user.toString() === userId.toString()
  );
};

// Check if user is in waiting list
liveSessionSchema.methods.isUserInWaitingList = function (userId) {
  return this.waitingList.some(
    (w) => w.user.toString() === userId.toString()
  );
};

// Add participant
liveSessionSchema.methods.addParticipant = async function (userId) {
  if (this.isUserRegistered(userId)) {
    throw new Error('User already registered');
  }

  if (this.isFull) {
    // Add to waiting list
    this.waitingList.push({ user: userId });
  } else {
    // Add to participants
    this.participants.push({ user: userId });
  }

  await this.save();
};

// Remove participant
liveSessionSchema.methods.removeParticipant = async function (userId) {
  this.participants = this.participants.filter(
    (p) => p.user.toString() !== userId.toString()
  );

  // Move first waiting list user to participants
  if (this.waitingList.length > 0) {
    const firstWaiting = this.waitingList.shift();
    this.participants.push({ user: firstWaiting.user });
  }

  await this.save();
};

// Start session
liveSessionSchema.methods.startSession = async function () {
  this.status = 'live';
  this.actualStartTime = new Date();
  await this.save();
};

// End session
liveSessionSchema.methods.endSession = async function () {
  this.status = 'completed';
  this.actualEndTime = new Date();
  
  if (this.actualStartTime) {
    const duration = (this.actualEndTime - this.actualStartTime) / 60000; // in minutes
    this.actualDuration = Math.round(duration);
  }

  await this.save();
};

// Calculate average rating
liveSessionSchema.methods.calculateRating = async function () {
  if (this.feedback.length === 0) {
    this.rating.average = 0;
    this.rating.count = 0;
  } else {
    const sum = this.feedback.reduce((acc, f) => acc + f.rating, 0);
    this.rating.average = Math.round((sum / this.feedback.length) * 10) / 10;
    this.rating.count = this.feedback.length;
  }

  await this.save();
};

// Add feedback
liveSessionSchema.methods.addFeedback = async function (userId, rating, comment) {
  // Check if user already provided feedback
  const existingIndex = this.feedback.findIndex(
    (f) => f.user.toString() === userId.toString()
  );

  if (existingIndex !== -1) {
    // Update existing feedback
    this.feedback[existingIndex].rating = rating;
    this.feedback[existingIndex].comment = comment;
  } else {
    // Add new feedback
    this.feedback.push({
      user: userId,
      rating,
      comment,
    });
  }

  await this.calculateRating();
};

// Cancel session
liveSessionSchema.methods.cancelSession = async function (reason) {
  this.status = 'cancelled';
  this.cancelledReason = reason;
  await this.save();
};

// Postpone session
liveSessionSchema.methods.postponeSession = async function (newDate, reason) {
  this.status = 'postponed';
  this.postponedTo = newDate;
  this.postponedReason = reason;
  await this.save();
};

// Increment views
liveSessionSchema.methods.incrementViews = async function (isUnique = false) {
  this.analytics.totalViews += 1;
  if (isUnique) {
    this.analytics.uniqueViews += 1;
  }
  await this.save();
};

// ============================================
// STATIC METHODS
// ============================================

// Get upcoming sessions
liveSessionSchema.statics.getUpcomingSessions = function (limit = 10) {
  return this.find({
    status: 'scheduled',
    scheduledAt: { $gte: new Date() },
  })
    .sort({ scheduledAt: 1 })
    .limit(limit)
    .populate('host', 'name profileImage');
};

// Get live sessions
liveSessionSchema.statics.getLiveSessions = function () {
  return this.find({ status: 'live' })
    .populate('host', 'name profileImage');
};

// Get sessions by host
liveSessionSchema.statics.getSessionsByHost = function (hostId) {
  return this.find({ host: hostId })
    .sort({ scheduledAt: -1 });
};

// Get popular sessions
liveSessionSchema.statics.getPopularSessions = function (limit = 10) {
  return this.find({
    status: 'scheduled',
    scheduledAt: { $gte: new Date() },
  })
    .sort({ currentParticipants: -1, 'analytics.totalViews': -1 })
    .limit(limit)
    .populate('host', 'name profileImage');
};

// ============================================
// EXPORT MODEL
// ============================================
module.exports = mongoose.model('LiveSession', liveSessionSchema);