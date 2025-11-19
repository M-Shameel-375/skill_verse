// Course model
// ============================================
// COURSE MODEL
// ============================================

const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    // ============================================
    // BASIC INFORMATION
    // ============================================
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },

    description: {
      type: String,
      required: [true, 'Course description is required'],
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },

    shortDescription: {
      type: String,
      maxlength: [200, 'Short description cannot exceed 200 characters'],
    },

    // ============================================
    // EDUCATOR/INSTRUCTOR
    // ============================================
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Instructor is required'],
    },

    coInstructors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // ============================================
    // CATEGORY & TAGS
    // ============================================
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

    subcategory: {
      type: String,
      trim: true,
    },

    tags: [String],

    // ============================================
    // LEVEL & PREREQUISITES
    // ============================================
    level: {
      type: String,
      required: [true, 'Course level is required'],
      enum: ['beginner', 'intermediate', 'advanced', 'all-levels'],
      default: 'beginner',
    },

    prerequisites: [String],

    targetAudience: [String],

    // ============================================
    // PRICING
    // ============================================
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
      default: 0,
    },

    originalPrice: {
      type: Number,
      min: [0, 'Original price cannot be negative'],
    },

    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
    },

    discount: {
      percentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      validUntil: Date,
    },

    isFree: {
      type: Boolean,
      default: false,
    },

    // ============================================
    // CONTENT
    // ============================================
    thumbnail: {
      url: {
        type: String,
        required: [true, 'Course thumbnail is required'],
      },
      publicId: String,
    },

    previewVideo: {
      url: String,
      publicId: String,
      duration: Number,
    },

    sections: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
        },
        description: String,
        order: {
          type: Number,
          required: true,
        },
        lectures: [
          {
            title: {
              type: String,
              required: true,
              trim: true,
            },
            description: String,
            order: {
              type: Number,
              required: true,
            },
            type: {
              type: String,
              enum: ['video', 'article', 'quiz', 'assignment', 'resource'],
              default: 'video',
            },
            content: {
              video: {
                url: String,
                publicId: String,
                duration: Number, // in seconds
              },
              article: {
                content: String,
                readTime: Number, // in minutes
              },
              resources: [
                {
                  title: String,
                  url: String,
                  publicId: String,
                  type: String, // pdf, doc, ppt, etc.
                  size: Number, // in bytes
                },
              ],
            },
            isFree: {
              type: Boolean,
              default: false,
            },
            isCompleted: {
              type: Boolean,
              default: false,
            },
          },
        ],
      },
    ],

    // ============================================
    // COURSE METRICS
    // ============================================
    duration: {
      total: {
        type: Number,
        default: 0, // Total duration in minutes
      },
      videos: {
        type: Number,
        default: 0,
      },
      articles: {
        type: Number,
        default: 0,
      },
      resources: {
        type: Number,
        default: 0,
      },
    },

    totalLectures: {
      type: Number,
      default: 0,
    },

    totalQuizzes: {
      type: Number,
      default: 0,
    },

    // ============================================
    // LEARNING OUTCOMES
    // ============================================
    learningOutcomes: [
      {
        type: String,
        trim: true,
      },
    ],

    requirements: [
      {
        type: String,
        trim: true,
      },
    ],

    // ============================================
    // ENROLLMENT & STUDENTS
    // ============================================
    enrolledStudents: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        enrolledAt: {
          type: Date,
          default: Date.now,
        },
        progress: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },
        completedLectures: [
          {
            type: mongoose.Schema.Types.ObjectId,
          },
        ],
        lastAccessedAt: Date,
        certificateIssued: {
          type: Boolean,
          default: false,
        },
      },
    ],

    totalStudents: {
      type: Number,
      default: 0,
    },

    maxStudents: {
      type: Number,
      default: null, // null = unlimited
    },

    // ============================================
    // RATINGS & REVIEWS
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
      distribution: {
        1: { type: Number, default: 0 },
        2: { type: Number, default: 0 },
        3: { type: Number, default: 0 },
        4: { type: Number, default: 0 },
        5: { type: Number, default: 0 },
      },
    },

    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
      },
    ],

    // ============================================
    // LANGUAGE & SUBTITLES
    // ============================================
    language: {
      type: String,
      default: 'English',
    },

    subtitles: [
      {
        language: String,
        url: String,
      },
    ],

    // ============================================
    // STATUS & VISIBILITY
    // ============================================
    status: {
      type: String,
      enum: ['draft', 'pending', 'published', 'archived', 'rejected'],
      default: 'draft',
    },

    isPublished: {
      type: Boolean,
      default: false,
    },

    publishedAt: Date,

    isFeatured: {
      type: Boolean,
      default: false,
    },

    // ============================================
    // CERTIFICATE
    // ============================================
    certificate: {
      enabled: {
        type: Boolean,
        default: true,
      },
      minimumScore: {
        type: Number,
        default: 70,
        min: 0,
        max: 100,
      },
      template: String,
    },

    // ============================================
    // EARNINGS (FOR INSTRUCTOR)
    // ============================================
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

    // ============================================
    // METADATA
    // ============================================
    views: {
      type: Number,
      default: 0,
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    lastUpdated: Date,

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
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });
courseSchema.index({ instructor: 1, status: 1 });
courseSchema.index({ category: 1, level: 1 });
courseSchema.index({ 'rating.average': -1 });
courseSchema.index({ totalStudents: -1 });
courseSchema.index({ price: 1 });
courseSchema.index({ createdAt: -1 });
courseSchema.index({ slug: 1 });

// ============================================
// VIRTUAL PROPERTIES
// ============================================

// Total likes count
courseSchema.virtual('likesCount').get(function () {
  return this.likes?.length || 0;
});

// Total wishlist count
courseSchema.virtual('wishlistCount').get(function () {
  return this.wishlist?.length || 0;
});

// Discounted price
courseSchema.virtual('discountedPrice').get(function () {
  if (this.discount?.percentage > 0) {
    return this.price - (this.price * this.discount.percentage) / 100;
  }
  return this.price;
});

// Is discount active
courseSchema.virtual('isDiscountActive').get(function () {
  if (this.discount?.validUntil) {
    return new Date(this.discount.validUntil) > new Date();
  }
  return false;
});

// ============================================
// MIDDLEWARE - PRE SAVE
// ============================================

// Generate slug from title
courseSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
    
    // Add random string to ensure uniqueness
    this.slug += '-' + Date.now().toString(36).substring(2, 7);
  }
  next();
});

// Calculate total duration and lectures
courseSchema.pre('save', function (next) {
  if (this.isModified('sections')) {
    let totalDuration = 0;
    let totalLectures = 0;
    let totalVideos = 0;
    let totalArticles = 0;
    let totalResources = 0;

    this.sections.forEach((section) => {
      section.lectures.forEach((lecture) => {
        totalLectures++;

        if (lecture.type === 'video' && lecture.content?.video?.duration) {
          totalVideos++;
          totalDuration += lecture.content.video.duration;
        } else if (lecture.type === 'article' && lecture.content?.article?.readTime) {
          totalArticles++;
          totalDuration += lecture.content.article.readTime * 60; // Convert to seconds
        }

        if (lecture.content?.resources) {
          totalResources += lecture.content.resources.length;
        }
      });
    });

    this.totalLectures = totalLectures;
    this.duration.total = Math.round(totalDuration / 60); // Convert to minutes
    this.duration.videos = totalVideos;
    this.duration.articles = totalArticles;
    this.duration.resources = totalResources;
  }
  next();
});

// Set original price
courseSchema.pre('save', function (next) {
  if (this.isModified('price') && !this.originalPrice) {
    this.originalPrice = this.price;
  }
  next();
});

// Update isFree based on price
courseSchema.pre('save', function (next) {
  this.isFree = this.price === 0;
  next();
});

// Set published date
courseSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
    this.isPublished = true;
  }
  next();
});

// Update lastUpdated
courseSchema.pre('save', function (next) {
  if (this.isModified()) {
    this.lastUpdated = new Date();
  }
  next();
});

// ============================================
// INSTANCE METHODS
// ============================================

// Calculate average rating
courseSchema.methods.calculateRating = async function () {
  const Review = mongoose.model('Review');
  const stats = await Review.aggregate([
    {
      $match: { course: this._id, isApproved: true },
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    this.rating.average = Math.round(stats[0].averageRating * 10) / 10;
    this.rating.count = stats[0].totalReviews;
  } else {
    this.rating.average = 0;
    this.rating.count = 0;
  }

  await this.save();
};

// Calculate rating distribution
courseSchema.methods.calculateRatingDistribution = async function () {
  const Review = mongoose.model('Review');
  const distribution = await Review.aggregate([
    {
      $match: { course: this._id, isApproved: true },
    },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 },
      },
    },
  ]);

  // Reset distribution
  this.rating.distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  distribution.forEach((item) => {
    this.rating.distribution[item._id] = item.count;
  });

  await this.save();
};

// Update student count
courseSchema.methods.updateStudentCount = async function () {
  this.totalStudents = this.enrolledStudents.length;
  await this.save();
};

// Check if user is enrolled
courseSchema.methods.isUserEnrolled = function (userId) {
  return this.enrolledStudents.some(
    (enrollment) => enrollment.user.toString() === userId.toString()
  );
};

// Get user progress
courseSchema.methods.getUserProgress = function (userId) {
  const enrollment = this.enrolledStudents.find(
    (e) => e.user.toString() === userId.toString()
  );
  return enrollment?.progress || 0;
};

// Increment views
courseSchema.methods.incrementViews = async function () {
  this.views += 1;
  await this.save();
};

// ============================================
// STATIC METHODS
// ============================================

// Get published courses
courseSchema.statics.getPublishedCourses = function () {
  return this.find({ status: 'published', isPublished: true });
};

// Get featured courses
courseSchema.statics.getFeaturedCourses = function (limit = 6) {
  return this.find({ isFeatured: true, status: 'published' })
    .limit(limit)
    .populate('instructor', 'name profileImage');
};

// Get top rated courses
courseSchema.statics.getTopRatedCourses = function (limit = 10) {
  return this.find({ status: 'published' })
    .sort({ 'rating.average': -1, 'rating.count': -1 })
    .limit(limit)
    .populate('instructor', 'name profileImage');
};

// Get trending courses
courseSchema.statics.getTrendingCourses = function (limit = 10) {
  return this.find({ status: 'published' })
    .sort({ totalStudents: -1, views: -1 })
    .limit(limit)
    .populate('instructor', 'name profileImage');
};

// Search courses
courseSchema.statics.searchCourses = function (searchTerm) {
  return this.find({
    $text: { $search: searchTerm },
    status: 'published',
  }).sort({ score: { $meta: 'textScore' } });
};

// ============================================
// EXPORT MODEL
// ============================================
module.exports = mongoose.model('Course', courseSchema);