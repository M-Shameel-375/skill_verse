// ============================================
// BADGE MODEL
// ============================================

const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema(
  {
    // ============================================
    // BASIC INFORMATION
    // ============================================
    name: {
      type: String,
      required: [true, 'Badge name is required'],
      unique: true,
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },

    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },

    // ============================================
    // BADGE CATEGORY & TYPE
    // ============================================
    category: {
      type: String,
      enum: [
        'achievement',
        'milestone',
        'skill',
        'participation',
        'special',
        'time-based',
        'community',
      ],
      required: true,
    },

    badgeType: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'special'],
      default: 'bronze',
    },

    // ============================================
    // VISUAL DESIGN
    // ============================================
    icon: {
      url: {
        type: String,
        required: [true, 'Badge icon is required'],
      },
      publicId: String,
    },

    color: {
      type: String,
      default: '#FFD700',
    },

    animation: {
      type: String,
      enum: ['none', 'pulse', 'glow', 'bounce', 'rotate'],
      default: 'none',
    },

    // ============================================
    // EARNING CRITERIA
    // ============================================
    criteria: {
      type: {
        type: String,
        enum: [
          'course-completion',
          'quiz-pass',
          'skill-exchange',
          'points-threshold',
          'streak',
          'review-count',
          'enrollment-count',
          'teaching-hours',
          'custom',
        ],
        required: true,
      },

      // For course-completion
      coursesRequired: Number,
      specificCourses: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Course',
        },
      ],

      // For quiz-pass
      quizzesRequired: Number,
      minimumScore: Number,

      // For skill-exchange
      exchangesRequired: Number,
      skillsRequired: [String],

      // For points-threshold
      pointsRequired: Number,

      // For streak
      streakDays: Number,

      // For review-count
      reviewsRequired: Number,
      minimumRating: Number,

      // For enrollment-count
      enrollmentsRequired: Number,

      // For teaching-hours
      hoursRequired: Number,

      // Custom criteria
      customCriteria: mongoose.Schema.Types.Mixed,
    },

    // ============================================
    // POINTS & REWARDS
    // ============================================
    pointsAwarded: {
      type: Number,
      default: 0,
      min: [0, 'Points cannot be negative'],
    },

    benefits: [
      {
        type: String,
        description: String,
      },
    ],

    // ============================================
    // RARITY & DIFFICULTY
    // ============================================
    rarity: {
      type: String,
      enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
      default: 'common',
    },

    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'expert'],
      default: 'easy',
    },

    // ============================================
    // AVAILABILITY
    // ============================================
    isActive: {
      type: Boolean,
      default: true,
    },

    isLimited: {
      type: Boolean,
      default: false,
    },

    limitedTo: {
      quantity: Number,
      startDate: Date,
      endDate: Date,
    },

    // ============================================
    // USERS WHO EARNED THIS BADGE
    // ============================================
    earnedBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        earnedAt: {
          type: Date,
          default: Date.now,
        },
        progress: {
          type: Number,
          default: 100,
        },
      },
    ],

    totalEarned: {
      type: Number,
      default: 0,
    },

    // ============================================
    // DISPLAY SETTINGS
    // ============================================
    displayOrder: {
      type: Number,
      default: 0,
    },

    isVisible: {
      type: Boolean,
      default: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    // ============================================
    // METADATA
    // ============================================
    tags: [String],

    relatedSkills: [String],

    createdBy: {
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
badgeSchema.index({ slug: 1 });
badgeSchema.index({ category: 1, badgeType: 1 });
badgeSchema.index({ rarity: 1 });
badgeSchema.index({ isActive: 1, isVisible: 1 });
badgeSchema.index({ 'earnedBy.user': 1 });
badgeSchema.index({ displayOrder: 1 });

// ============================================
// VIRTUAL PROPERTIES
// ============================================

// Earn rate (percentage of users who earned this badge)
badgeSchema.virtual('earnRate').get(function () {
  // This would need total user count to calculate properly
  return this.totalEarned;
});

// Is currently available
badgeSchema.virtual('isAvailable').get(function () {
  if (!this.isActive) return false;
  if (!this.isLimited) return true;

  const now = new Date();
  if (this.limitedTo?.startDate && now < this.limitedTo.startDate) return false;
  if (this.limitedTo?.endDate && now > this.limitedTo.endDate) return false;
  if (this.limitedTo?.quantity && this.totalEarned >= this.limitedTo.quantity)
    return false;

  return true;
});

// ============================================
// MIDDLEWARE - PRE SAVE
// ============================================

// Generate slug
badgeSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
  }
  next();
});

// Update total earned count
badgeSchema.pre('save', function (next) {
  if (this.isModified('earnedBy')) {
    this.totalEarned = this.earnedBy.length;
  }
  next();
});

// ============================================
// INSTANCE METHODS
// ============================================

// Award badge to user
badgeSchema.methods.awardToUser = async function (userId, progress = 100) {
  // Check if user already has this badge
  const alreadyEarned = this.earnedBy.some(
    (e) => e.user.toString() === userId.toString()
  );

  if (alreadyEarned) {
    return { success: false, message: 'Badge already earned' };
  }

  // Check if badge is still available
  if (!this.isAvailable) {
    return { success: false, message: 'Badge is no longer available' };
  }

  // Award badge
  this.earnedBy.push({
    user: userId,
    earnedAt: new Date(),
    progress: progress,
  });

  await this.save();

  return { success: true, badge: this };
};

// Remove badge from user
badgeSchema.methods.removeFromUser = async function (userId) {
  this.earnedBy = this.earnedBy.filter(
    (e) => e.user.toString() !== userId.toString()
  );

  await this.save();
};

// Check if user has earned this badge
badgeSchema.methods.hasUserEarned = function (userId) {
  return this.earnedBy.some((e) => e.user.toString() === userId.toString());
};

// Get user progress towards badge
badgeSchema.methods.getUserProgress = function (userId) {
  const earned = this.earnedBy.find(
    (e) => e.user.toString() === userId.toString()
  );
  return earned?.progress || 0;
};

// ============================================
// STATIC METHODS
// ============================================

// Get all active badges
badgeSchema.statics.getActiveBadges = function () {
  return this.find({ isActive: true, isVisible: true }).sort({ displayOrder: 1 });
};

// Get badges by category
badgeSchema.statics.getBadgesByCategory = function (category) {
  return this.find({ category, isActive: true, isVisible: true }).sort({
    displayOrder: 1,
  });
};

// Get user's badges
badgeSchema.statics.getUserBadges = function (userId) {
  return this.find({ 'earnedBy.user': userId }).sort({ 'earnedBy.earnedAt': -1 });
};

// Get featured badges
badgeSchema.statics.getFeaturedBadges = function (limit = 6) {
  return this.find({ isFeatured: true, isActive: true, isVisible: true })
    .limit(limit)
    .sort({ displayOrder: 1 });
};

// Get rare badges
badgeSchema.statics.getRareBadges = function () {
  return this.find({
    rarity: { $in: ['rare', 'epic', 'legendary'] },
    isActive: true,
    isVisible: true,
  }).sort({ rarity: -1, totalEarned: 1 });
};

// Check and award badges to user based on criteria
badgeSchema.statics.checkAndAwardBadges = async function (userId, userData) {
  const badges = await this.find({ isActive: true });
  const awardedBadges = [];

  for (const badge of badges) {
    // Skip if user already has this badge
    if (badge.hasUserEarned(userId)) continue;

    // Check if user meets criteria
    const meetsCriteria = await badge.checkCriteria(userData);

    if (meetsCriteria) {
      const result = await badge.awardToUser(userId);
      if (result.success) {
        awardedBadges.push(badge);
      }
    }
  }

  return awardedBadges;
};

// Check if user meets badge criteria
badgeSchema.methods.checkCriteria = async function (userData) {
  const { type } = this.criteria;

  switch (type) {
    case 'course-completion':
      return userData.completedCourses >= (this.criteria.coursesRequired || 0);

    case 'quiz-pass':
      return userData.passedQuizzes >= (this.criteria.quizzesRequired || 0);

    case 'skill-exchange':
      return (
        userData.completedExchanges >= (this.criteria.exchangesRequired || 0)
      );

    case 'points-threshold':
      return userData.points >= (this.criteria.pointsRequired || 0);

    case 'streak':
      return userData.currentStreak >= (this.criteria.streakDays || 0);

    case 'review-count':
      return userData.reviewsGiven >= (this.criteria.reviewsRequired || 0);

    case 'enrollment-count':
      return userData.enrollments >= (this.criteria.enrollmentsRequired || 0);

    case 'teaching-hours':
      return userData.teachingHours >= (this.criteria.hoursRequired || 0);

    default:
      return false;
  }
};

// Get badge statistics
badgeSchema.statics.getStatistics = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalEarned: { $sum: '$totalEarned' },
      },
    },
  ]);

  const byRarity = await this.aggregate([
    {
      $group: {
        _id: '$rarity',
        count: { $sum: 1 },
      },
    },
  ]);

  return {
    byCategory: stats,
    byRarity,
  };
};

// ============================================
// EXPORT MODEL
// ============================================
module.exports = mongoose.model('Badge', badgeSchema);