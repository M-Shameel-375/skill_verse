// User model
// ============================================
// USER MODEL
// ============================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/config');

const userSchema = new mongoose.Schema(
  {
    // ============================================
    // BASIC INFORMATION
    // ============================================
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't return password by default
    },

    phone: {
      type: String,
      trim: true,
      match: [/^\+?[1-9]\d{1,14}$/, 'Please provide a valid phone number'],
    },

    // ============================================
    // ROLE & STATUS
    // ============================================
    role: {
      type: String,
      enum: ['learner', 'educator', 'skillExchanger', 'admin'],
      default: 'learner',
    },

    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'banned'],
      default: 'active',
    },

    // ============================================
    // PROFILE INFORMATION
    // ============================================
    profileImage: {
      url: String,
      publicId: String,
    },

    coverImage: {
      url: String,
      publicId: String,
    },

    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },

    title: {
      type: String,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },

    location: {
      country: String,
      city: String,
      timezone: String,
    },

    // ============================================
    // SKILLS & INTERESTS
    // ============================================
    skills: [
      {
        name: {
          type: String,
          required: true,
        },
        level: {
          type: String,
          enum: ['beginner', 'intermediate', 'advanced', 'expert'],
          default: 'beginner',
        },
        yearsOfExperience: Number,
        endorsements: {
          type: Number,
          default: 0,
        },
      },
    ],

    interests: [String],

    learningGoals: [String],

    // ============================================
    // SOCIAL LINKS
    // ============================================
    socialLinks: {
      linkedin: String,
      github: String,
      twitter: String,
      website: String,
      portfolio: String,
    },

    // ============================================
    // EDUCATOR SPECIFIC
    // ============================================
    educatorProfile: {
      expertise: [String],
      teachingExperience: Number, // in years
      totalStudents: {
        type: Number,
        default: 0,
      },
      totalCourses: {
        type: Number,
        default: 0,
      },
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
      earnings: {
        total: {
          type: Number,
          default: 0,
        },
        pending: {
          type: Number,
          default: 0,
        },
        withdrawn: {
          type: Number,
          default: 0,
        },
      },
      stripeAccountId: String,
      verified: {
        type: Boolean,
        default: false,
      },
    },

    // ============================================
    // LEARNER SPECIFIC
    // ============================================
    learnerProfile: {
      enrolledCourses: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Course',
        },
      ],
      completedCourses: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Course',
        },
      ],
      certificates: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Certificate',
        },
      ],
      learningHours: {
        type: Number,
        default: 0,
      },
      currentStreak: {
        type: Number,
        default: 0,
      },
      longestStreak: {
        type: Number,
        default: 0,
      },
      lastActiveDate: Date,
    },

    // ============================================
    // SKILL EXCHANGER SPECIFIC
    // ============================================
    skillExchangeProfile: {
      offeredSkills: [String],
      desiredSkills: [String],
      completedExchanges: {
        type: Number,
        default: 0,
      },
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
      availability: [
        {
          day: {
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          },
          timeSlots: [
            {
              start: String, // e.g., "09:00"
              end: String,   // e.g., "17:00"
            },
          ],
        },
      ],
    },

    // ============================================
    // GAMIFICATION
    // ============================================
    gamification: {
      points: {
        type: Number,
        default: 0,
      },
      level: {
        type: Number,
        default: 1,
      },
      badges: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Badge',
        },
      ],
      achievements: [
        {
          name: String,
          description: String,
          earnedAt: {
            type: Date,
            default: Date.now,
          },
          icon: String,
        },
      ],
    },

    // ============================================
    // NOTIFICATIONS PREFERENCES
    // ============================================
    notificationPreferences: {
      email: {
        type: Boolean,
        default: true,
      },
      push: {
        type: Boolean,
        default: true,
      },
      sms: {
        type: Boolean,
        default: false,
      },
      courseUpdates: {
        type: Boolean,
        default: true,
      },
      skillExchangeRequests: {
        type: Boolean,
        default: true,
      },
      messages: {
        type: Boolean,
        default: true,
      },
      promotions: {
        type: Boolean,
        default: false,
      },
    },

    // ============================================
    // VERIFICATION & SECURITY
    // ============================================
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationToken: String,
    emailVerificationExpire: Date,

    passwordResetToken: String,
    passwordResetExpire: Date,

    refreshToken: String,

    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },

    twoFactorSecret: String,

    // ============================================
    // STRIPE
    // ============================================
    stripeCustomerId: String,

    // ============================================
    // METADATA
    // ============================================
    lastLogin: Date,

    loginAttempts: {
      type: Number,
      default: 0,
    },

    accountLockedUntil: Date,

    deletedAt: Date,
  },
  {
    timestamps: true, // createdAt, updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ============================================
// INDEXES
// ============================================
userSchema.index({ email: 1 });
userSchema.index({ role: 1, status: 1 });
userSchema.index({ 'skills.name': 1 });
userSchema.index({ createdAt: -1 });

// ============================================
// VIRTUAL PROPERTIES
// ============================================

// Full profile completion percentage
userSchema.virtual('profileCompletion').get(function () {
  let completed = 0;
  const total = 10;

  if (this.name) completed++;
  if (this.email) completed++;
  if (this.phone) completed++;
  if (this.bio) completed++;
  if (this.profileImage?.url) completed++;
  if (this.location?.country) completed++;
  if (this.skills?.length > 0) completed++;
  if (this.interests?.length > 0) completed++;
  if (this.socialLinks?.linkedin || this.socialLinks?.github) completed++;
  if (this.isEmailVerified) completed++;

  return Math.round((completed / total) * 100);
});

// ============================================
// MIDDLEWARE - PRE SAVE
// ============================================

// Hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash password if it has been modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(config.security.bcryptRounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update lastActiveDate for learners
userSchema.pre('save', function (next) {
  if (this.role === 'learner' && this.isModified('learnerProfile')) {
    this.learnerProfile.lastActiveDate = new Date();
  }
  next();
});

// ============================================
// INSTANCE METHODS
// ============================================

// Match password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Check if account is locked
userSchema.methods.isAccountLocked = function () {
  return this.accountLockedUntil && this.accountLockedUntil > Date.now();
};

// Increment login attempts
userSchema.methods.incrementLoginAttempts = async function () {
  // Reset attempts if lock has expired
  if (this.accountLockedUntil && this.accountLockedUntil < Date.now()) {
    this.loginAttempts = 1;
    this.accountLockedUntil = undefined;
  } else {
    this.loginAttempts += 1;

    // Lock account after 5 failed attempts
    if (this.loginAttempts >= 5) {
      this.accountLockedUntil = Date.now() + 30 * 60 * 1000; // 30 minutes
    }
  }

  await this.save();
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = async function () {
  this.loginAttempts = 0;
  this.accountLockedUntil = undefined;
  await this.save();
};

// Add points (gamification)
userSchema.methods.addPoints = async function (points) {
  this.gamification.points += points;

  // Level up logic (every 1000 points = 1 level)
  const newLevel = Math.floor(this.gamification.points / 1000) + 1;
  if (newLevel > this.gamification.level) {
    this.gamification.level = newLevel;
  }

  await this.save();
};

// Update learning streak
userSchema.methods.updateStreak = async function () {
  if (!this.learnerProfile) return;

  const today = new Date().setHours(0, 0, 0, 0);
  const lastActive = this.learnerProfile.lastActiveDate
    ? new Date(this.learnerProfile.lastActiveDate).setHours(0, 0, 0, 0)
    : null;

  if (!lastActive || today - lastActive > 86400000) {
    // More than 1 day gap
    this.learnerProfile.currentStreak = 1;
  } else if (today - lastActive === 86400000) {
    // Exactly 1 day gap
    this.learnerProfile.currentStreak += 1;
  }

  // Update longest streak
  if (this.learnerProfile.currentStreak > this.learnerProfile.longestStreak) {
    this.learnerProfile.longestStreak = this.learnerProfile.currentStreak;
  }

  this.learnerProfile.lastActiveDate = new Date();
  await this.save();
};

// ============================================
// STATIC METHODS
// ============================================

// Get users by role
userSchema.statics.getUsersByRole = function (role) {
  return this.find({ role, status: 'active' });
};

// Search users
userSchema.statics.searchUsers = function (searchTerm) {
  return this.find({
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { email: { $regex: searchTerm, $options: 'i' } },
      { 'skills.name': { $regex: searchTerm, $options: 'i' } },
    ],
    status: 'active',
  });
};

// ============================================
// EXPORT MODEL
// ============================================
module.exports = mongoose.model('User', userSchema);