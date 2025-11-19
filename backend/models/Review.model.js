// Review model
// ============================================
// REVIEW MODEL
// ============================================

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    // ============================================
    // REVIEWER & TARGET
    // ============================================
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },

    // ============================================
    // REVIEW TYPE & TARGET
    // ============================================
    reviewType: {
      type: String,
      enum: ['course', 'live-session', 'skill-exchange', 'instructor'],
      required: true,
    },

    // Related entities
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },

    liveSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LiveSession',
    },

    skillExchange: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SkillExchange',
    },

    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // ============================================
    // RATING & FEEDBACK
    // ============================================
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },

    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },

    comment: {
      type: String,
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },

    // ============================================
    // DETAILED RATINGS (FOR COURSES)
    // ============================================
    detailedRatings: {
      contentQuality: {
        type: Number,
        min: 1,
        max: 5,
      },
      instructorKnowledge: {
        type: Number,
        min: 1,
        max: 5,
      },
      valueForMoney: {
        type: Number,
        min: 1,
        max: 5,
      },
      engagement: {
        type: Number,
        min: 1,
        max: 5,
      },
      difficulty: {
        type: Number,
        min: 1,
        max: 5,
      },
    },

    // ============================================
    // PROS & CONS
    // ============================================
    pros: [
      {
        type: String,
        trim: true,
      },
    ],

    cons: [
      {
        type: String,
        trim: true,
      },
    ],

    // ============================================
    // RECOMMENDATIONS
    // ============================================
    wouldRecommend: {
      type: Boolean,
      default: true,
    },

    targetAudience: {
      type: String,
      enum: ['beginners', 'intermediate', 'advanced', 'all'],
    },

    // ============================================
    // MEDIA ATTACHMENTS
    // ============================================
    attachments: [
      {
        type: {
          type: String,
          enum: ['image', 'video'],
        },
        url: String,
        publicId: String,
        thumbnail: String,
      },
    ],

    // ============================================
    // VERIFICATION
    // ============================================
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },

    isVerifiedCompletion: {
      type: Boolean,
      default: false,
    },

    // ============================================
    // STATUS & MODERATION
    // ============================================
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'flagged', 'hidden'],
      default: 'pending',
    },

    isApproved: {
      type: Boolean,
      default: false,
    },

    moderation: {
      moderatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      moderatedAt: Date,
      moderationNote: String,
      rejectionReason: String,
    },

    // ============================================
    // HELPFULNESS
    // ============================================
    helpfulness: {
      helpful: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      notHelpful: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      helpfulCount: {
        type: Number,
        default: 0,
      },
      notHelpfulCount: {
        type: Number,
        default: 0,
      },
    },

    // ============================================
    // FLAGS & REPORTS
    // ============================================
    flags: [
      {
        flaggedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        reason: {
          type: String,
          enum: ['spam', 'inappropriate', 'offensive', 'fake', 'other'],
        },
        description: String,
        flaggedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    isFlagged: {
      type: Boolean,
      default: false,
    },

    // ============================================
    // INSTRUCTOR RESPONSE
    // ============================================
    response: {
      comment: String,
      respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      respondedAt: Date,
    },

    // ============================================
    // METADATA
    // ============================================
    metadata: {
      completionPercentage: Number,
      timeSpent: Number, // hours spent before review
      deviceType: String,
      platform: String,
    },

    editedAt: Date,

    isEdited: {
      type: Boolean,
      default: false,
    },

    // ============================================
    // VISIBILITY
    // ============================================
    isPublic: {
      type: Boolean,
      default: true,
    },

    isAnonymous: {
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
reviewSchema.index({ course: 1, isApproved: 1 });
reviewSchema.index({ liveSession: 1, isApproved: 1 });
reviewSchema.index({ instructor: 1, isApproved: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ rating: -1, 'helpfulness.helpfulCount': -1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ status: 1 });

// Compound index for unique review per user per entity
reviewSchema.index({ user: 1, course: 1 }, { unique: true, partialFilterExpression: { course: { $exists: true } } });
reviewSchema.index({ user: 1, liveSession: 1 }, { unique: true, partialFilterExpression: { liveSession: { $exists: true } } });

// ============================================
// VIRTUAL PROPERTIES
// ============================================

// Net helpfulness score
reviewSchema.virtual('helpfulnessScore').get(function () {
  return this.helpfulness.helpfulCount - this.helpfulness.notHelpfulCount;
});

// Average detailed rating
reviewSchema.virtual('averageDetailedRating').get(function () {
  if (!this.detailedRatings) return null;

  const ratings = Object.values(this.detailedRatings).filter((r) => r != null);
  if (ratings.length === 0) return null;

  return ratings.reduce((a, b) => a + b, 0) / ratings.length;
});

// Review age in days
reviewSchema.virtual('ageInDays').get(function () {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// ============================================
// MIDDLEWARE - PRE SAVE
// ============================================

// Update helpfulness counts
reviewSchema.pre('save', function (next) {
  if (this.isModified('helpfulness')) {
    this.helpfulness.helpfulCount = this.helpfulness.helpful?.length || 0;
    this.helpfulness.notHelpfulCount = this.helpfulness.notHelpful?.length || 0;
  }
  next();
});

// Set flag status
reviewSchema.pre('save', function (next) {
  if (this.isModified('flags')) {
    this.isFlagged = this.flags.length > 0;
  }
  next();
});

// Auto-approve if verified purchase
reviewSchema.pre('save', function (next) {
  if (this.isNew && this.isVerifiedPurchase) {
    this.status = 'approved';
    this.isApproved = true;
  }
  next();
});

// ============================================
// INSTANCE METHODS
// ============================================

// Mark as helpful
reviewSchema.methods.markAsHelpful = async function (userId) {
  // Remove from not helpful if exists
  this.helpfulness.notHelpful = this.helpfulness.notHelpful.filter(
    (id) => id.toString() !== userId.toString()
  );

  // Add to helpful if not already there
  if (!this.helpfulness.helpful.some((id) => id.toString() === userId.toString())) {
    this.helpfulness.helpful.push(userId);
  }

  await this.save();
};

// Mark as not helpful
reviewSchema.methods.markAsNotHelpful = async function (userId) {
  // Remove from helpful if exists
  this.helpfulness.helpful = this.helpfulness.helpful.filter(
    (id) => id.toString() !== userId.toString()
  );

  // Add to not helpful if not already there
  if (!this.helpfulness.notHelpful.some((id) => id.toString() === userId.toString())) {
    this.helpfulness.notHelpful.push(userId);
  }

  await this.save();
};

// Flag review
reviewSchema.methods.flag = async function (userId, reason, description) {
  this.flags.push({
    flaggedBy: userId,
    reason: reason,
    description: description,
  });

  await this.save();
};

// Approve review
reviewSchema.methods.approve = async function (moderatorId) {
  this.status = 'approved';
  this.isApproved = true;
  this.moderation = {
    moderatedBy: moderatorId,
    moderatedAt: new Date(),
  };

  await this.save();
};

// Reject review
reviewSchema.methods.reject = async function (moderatorId, reason) {
  this.status = 'rejected';
  this.isApproved = false;
  this.moderation = {
    moderatedBy: moderatorId,
    moderatedAt: new Date(),
    rejectionReason: reason,
  };

  await this.save();
};

// Add instructor response
reviewSchema.methods.addResponse = async function (responderId, comment) {
  this.response = {
    comment: comment,
    respondedBy: responderId,
    respondedAt: new Date(),
  };

  await this.save();
};

// Update review
reviewSchema.methods.updateReview = async function (updates) {
  Object.assign(this, updates);
  this.isEdited = true;
  this.editedAt = new Date();

  await this.save();
};

// ============================================
// STATIC METHODS
// ============================================

// Get reviews by course
reviewSchema.statics.getReviewsByCourse = function (courseId, options = {}) {
  const query = {
    course: courseId,
    isApproved: true,
  };

  let sort = { createdAt: -1 };

  if (options.sortBy === 'helpful') {
    sort = { 'helpfulness.helpfulCount': -1, createdAt: -1 };
  } else if (options.sortBy === 'rating-high') {
    sort = { rating: -1, createdAt: -1 };
  } else if (options.sortBy === 'rating-low') {
    sort = { rating: 1, createdAt: -1 };
  }

  return this.find(query)
    .sort(sort)
    .populate('user', 'name profileImage')
    .limit(options.limit || 10);
};

// Get reviews by user
reviewSchema.statics.getReviewsByUser = function (userId) {
  return this.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate('course', 'title thumbnail')
    .populate('liveSession', 'title')
    .populate('instructor', 'name profileImage');
};

// Get pending reviews for moderation
reviewSchema.statics.getPendingReviews = function () {
  return this.find({ status: 'pending' })
    .sort({ createdAt: 1 })
    .populate('user', 'name email')
    .populate('course', 'title');
};

// Get flagged reviews
reviewSchema.statics.getFlaggedReviews = function () {
  return this.find({ isFlagged: true })
    .sort({ 'flags.0.flaggedAt': -1 })
    .populate('user', 'name email')
    .populate('course', 'title');
};

// Calculate average rating
reviewSchema.statics.calculateAverageRating = async function (entityType, entityId) {
  const field = entityType === 'course' ? 'course' : 
                entityType === 'liveSession' ? 'liveSession' : 
                entityType === 'instructor' ? 'instructor' : null;

  if (!field) return { average: 0, count: 0 };

  const result = await this.aggregate([
    {
      $match: {
        [field]: entityId,
        isApproved: true,
      },
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        count: { $sum: 1 },
        distribution: {
          $push: '$rating',
        },
      },
    },
  ]);

  if (result.length === 0) {
    return { average: 0, count: 0, distribution: {} };
  }

  // Calculate distribution
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  result[0].distribution.forEach((rating) => {
    distribution[rating] = (distribution[rating] || 0) + 1;
  });

  return {
    average: Math.round(result[0].averageRating * 10) / 10,
    count: result[0].count,
    distribution,
  };
};

// Get top reviews
reviewSchema.statics.getTopReviews = function (entityType, entityId, limit = 5) {
  const field = entityType === 'course' ? 'course' : 
                entityType === 'liveSession' ? 'liveSession' : 
                entityType === 'instructor' ? 'instructor' : null;

  if (!field) return [];

  return this.find({
    [field]: entityId,
    isApproved: true,
  })
    .sort({ 'helpfulness.helpfulCount': -1, rating: -1 })
    .limit(limit)
    .populate('user', 'name profileImage');
};

// Get review statistics
reviewSchema.statics.getStatistics = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const ratingDistribution = await this.aggregate([
    {
      $match: { isApproved: true },
    },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 },
      },
    },
  ]);

  return {
    byStatus: stats,
    ratingDistribution,
  };
};

// ============================================
// EXPORT MODEL
// ============================================
module.exports = mongoose.model('Review', reviewSchema);