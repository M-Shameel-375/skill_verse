// Badge controller
// ============================================
// BADGE CONTROLLER
// ============================================

const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const Badge = require('../models/Badge.model');
const User = require('../models/User.model');
const { getPagination } = require('../utils/helpers');

// ============================================
// @desc    Create badge
// @route   POST /api/v1/badges
// @access  Private (Admin)
// ============================================
exports.createBadge = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    category,
    badgeType,
    icon,
    color,
    animation,
    criteria,
    pointsAwarded,
    benefits,
    rarity,
    difficulty,
    isLimited,
    limitedTo,
  } = req.body;

  const badge = await Badge.create({
    name,
    description,
    category,
    badgeType: badgeType || 'bronze',
    icon: icon || (req.file ? { url: req.file.path, publicId: req.file.filename } : undefined),
    color,
    animation,
    criteria,
    pointsAwarded: pointsAwarded || 0,
    benefits,
    rarity: rarity || 'common',
    difficulty: difficulty || 'easy',
    isLimited,
    limitedTo,
    createdBy: req.user._id,
  });

  ApiResponse.created(res, badge, 'Badge created successfully');
});

// ============================================
// @desc    Get all badges
// @route   GET /api/v1/badges
// @access  Public
// ============================================
exports.getAllBadges = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    category,
    rarity,
    badgeType,
    sort = 'displayOrder',
  } = req.query;

  // Build query
  const query = { isActive: true, isVisible: true };

  if (category) query.category = category;
  if (rarity) query.rarity = rarity;
  if (badgeType) query.badgeType = badgeType;

  // Execute query
  const badges = await Badge.find(query)
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Badge.countDocuments(query);

  const pagination = getPagination(page, limit, total);

  ApiResponse.paginated(res, badges, pagination, 'Badges retrieved successfully');
});

// ============================================
// @desc    Get single badge by ID
// @route   GET /api/v1/badges/:id
// @access  Public
// ============================================
exports.getBadgeById = asyncHandler(async (req, res) => {
  const badge = await Badge.findById(req.params.id);

  if (!badge) {
    throw ApiError.notFound('Badge not found');
  }

  ApiResponse.success(res, badge, 'Badge retrieved successfully');
});

// ============================================
// @desc    Update badge
// @route   PUT /api/v1/badges/:id
// @access  Private (Admin)
// ============================================
exports.updateBadge = asyncHandler(async (req, res) => {
  let badge = await Badge.findById(req.params.id);

  if (!badge) {
    throw ApiError.notFound('Badge not found');
  }

  const allowedUpdates = [
    'name',
    'description',
    'category',
    'badgeType',
    'color',
    'animation',
    'criteria',
    'pointsAwarded',
    'benefits',
    'rarity',
    'difficulty',
    'isActive',
    'isVisible',
    'isFeatured',
    'displayOrder',
  ];

  const updates = {};
  Object.keys(req.body).forEach((key) => {
    if (allowedUpdates.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  badge = await Badge.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  ApiResponse.success(res, badge, 'Badge updated successfully');
});

// ============================================
// @desc    Delete badge
// @route   DELETE /api/v1/badges/:id
// @access  Private (Admin)
// ============================================
exports.deleteBadge = asyncHandler(async (req, res) => {
  const badge = await Badge.findById(req.params.id);

  if (!badge) {
    throw ApiError.notFound('Badge not found');
  }

  await badge.deleteOne();

  ApiResponse.success(res, null, 'Badge deleted successfully');
});

// ============================================
// @desc    Award badge to user
// @route   POST /api/v1/badges/:id/award
// @access  Private (Admin/System)
// ============================================
exports.awardBadge = asyncHandler(async (req, res) => {
  const { userId, progress = 100 } = req.body;

  const badge = await Badge.findById(req.params.id);

  if (!badge) {
    throw ApiError.notFound('Badge not found');
  }

  const result = await badge.awardToUser(userId, progress);

  if (!result.success) {
    throw ApiError.badRequest(result.message);
  }

  // Add badge to user's gamification profile
  await User.findByIdAndUpdate(userId, {
    $addToSet: { 'gamification.badges': badge._id },
  });

  // Award points
  if (badge.pointsAwarded > 0) {
    const user = await User.findById(userId);
    await user.addPoints(badge.pointsAwarded);
  }

  ApiResponse.success(res, result.badge, 'Badge awarded successfully');
});

// ============================================
// @desc    Remove badge from user
// @route   DELETE /api/v1/badges/:id/revoke
// @access  Private (Admin)
// ============================================
exports.revokeBadge = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  const badge = await Badge.findById(req.params.id);

  if (!badge) {
    throw ApiError.notFound('Badge not found');
  }

  await badge.removeFromUser(userId);

  // Remove from user profile
  await User.findByIdAndUpdate(userId, {
    $pull: { 'gamification.badges': badge._id },
  });

  ApiResponse.success(res, null, 'Badge revoked successfully');
});

// ============================================
// @desc    Get user's badges
// @route   GET /api/v1/badges/user/:userId
// @access  Public
// ============================================
exports.getUserBadges = asyncHandler(async (req, res) => {
  const badges = await Badge.getUserBadges(req.params.userId);

  ApiResponse.success(res, badges, 'User badges retrieved successfully');
});

// ============================================
// @desc    Get my badges
// @route   GET /api/v1/badges/my-badges
// @access  Private
// ============================================
exports.getMyBadges = asyncHandler(async (req, res) => {
  const badges = await Badge.getUserBadges(req.user._id);

  ApiResponse.success(res, badges, 'Your badges retrieved successfully');
});

// ============================================
// @desc    Get badges by category
// @route   GET /api/v1/badges/category/:category
// @access  Public
// ============================================
exports.getBadgesByCategory = asyncHandler(async (req, res) => {
  const badges = await Badge.getBadgesByCategory(req.params.category);

  ApiResponse.success(res, badges, 'Badges retrieved successfully');
});

// ============================================
// @desc    Get featured badges
// @route   GET /api/v1/badges/featured
// @access  Public
// ============================================
exports.getFeaturedBadges = asyncHandler(async (req, res) => {
  const { limit = 6 } = req.query;

  const badges = await Badge.getFeaturedBadges(parseInt(limit));

  ApiResponse.success(res, badges, 'Featured badges retrieved successfully');
});

// ============================================
// @desc    Get rare badges
// @route   GET /api/v1/badges/rare
// @access  Public
// ============================================
exports.getRareBadges = asyncHandler(async (req, res) => {
  const badges = await Badge.getRareBadges();

  ApiResponse.success(res, badges, 'Rare badges retrieved successfully');
});

// ============================================
// @desc    Check and award badges (automated)
// @route   POST /api/v1/badges/check-eligibility
// @access  Private
// ============================================
exports.checkBadgeEligibility = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  // Prepare user data for badge checking
  const userData = {
    completedCourses: user.learnerProfile?.completedCourses?.length || 0,
    passedQuizzes: 0, // Would need to query Quiz model
    completedExchanges: user.skillExchangeProfile?.completedExchanges || 0,
    points: user.gamification?.points || 0,
    currentStreak: user.learnerProfile?.currentStreak || 0,
    reviewsGiven: 0, // Would need to query Review model
    enrollments: user.learnerProfile?.enrolledCourses?.length || 0,
    teachingHours: 0, // Would need calculation
  };

  const awardedBadges = await Badge.checkAndAwardBadges(req.user._id, userData);

  ApiResponse.success(
    res,
    { awardedBadges, count: awardedBadges.length },
    awardedBadges.length > 0 ? 'New badges earned!' : 'No new badges at this time'
  );
});

// ============================================
// @desc    Get badge statistics
// @route   GET /api/v1/badges/statistics
// @access  Private (Admin)
// ============================================
exports.getBadgeStatistics = asyncHandler(async (req, res) => {
  const stats = await Badge.getStatistics();

  ApiResponse.success(res, stats, 'Statistics retrieved successfully');
});

// ============================================
// @desc    Get available badges for user to earn
// @route   GET /api/v1/badges/available
// @access  Private
// ============================================
exports.getAvailableBadges = asyncHandler(async (req, res) => {
  const { category, limit = 20, page = 1 } = req.query;

  // Get user's already earned badges
  const user = await User.findById(req.user._id).select('gamification.badges');
  const earnedBadgeIds = user?.gamification?.badges || [];

  // Build query for badges not yet earned
  const query = {
    isActive: true,
    isVisible: true,
    _id: { $nin: earnedBadgeIds },
  };

  if (category) query.category = category;

  const badges = await Badge.find(query)
    .sort({ rarity: 1, displayOrder: 1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .select('name description category badgeType icon color criteria pointsAwarded rarity difficulty');

  const total = await Badge.countDocuments(query);
  const pagination = getPagination(page, limit, total);

  // Calculate progress for each badge
  const badgesWithProgress = await Promise.all(
    badges.map(async (badge) => {
      const progress = await calculateBadgeProgress(req.user._id, badge);
      return {
        ...badge.toObject(),
        progress,
        canClaim: progress >= 100,
      };
    })
  );

  ApiResponse.paginated(res, badgesWithProgress, pagination, 'Available badges retrieved successfully');
});

// ============================================
// @desc    Get user's badge progress
// @route   GET /api/v1/badges/progress
// @access  Private
// ============================================
exports.getBadgeProgress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('gamification learnerProfile skillExchangeProfile')
    .populate('gamification.badges');

  // Get all active badges
  const allBadges = await Badge.find({ isActive: true, isVisible: true });

  const earnedBadgeIds = (user?.gamification?.badges || []).map(b => b._id.toString());

  const badgeProgress = await Promise.all(
    allBadges.map(async (badge) => {
      const isEarned = earnedBadgeIds.includes(badge._id.toString());
      const progress = isEarned ? 100 : await calculateBadgeProgress(req.user._id, badge);

      return {
        badge: {
          _id: badge._id,
          name: badge.name,
          description: badge.description,
          category: badge.category,
          badgeType: badge.badgeType,
          icon: badge.icon,
          color: badge.color,
          rarity: badge.rarity,
          pointsAwarded: badge.pointsAwarded,
        },
        progress,
        isEarned,
        canClaim: !isEarned && progress >= 100,
      };
    })
  );

  // Sort: claimable first, then by progress, then earned last
  badgeProgress.sort((a, b) => {
    if (a.canClaim && !b.canClaim) return -1;
    if (!a.canClaim && b.canClaim) return 1;
    if (!a.isEarned && b.isEarned) return -1;
    if (a.isEarned && !b.isEarned) return 1;
    return b.progress - a.progress;
  });

  const summary = {
    totalBadges: allBadges.length,
    earnedBadges: earnedBadgeIds.length,
    claimableBadges: badgeProgress.filter(b => b.canClaim).length,
    inProgressBadges: badgeProgress.filter(b => !b.isEarned && b.progress > 0 && b.progress < 100).length,
  };

  ApiResponse.success(res, { badges: badgeProgress, summary }, 'Badge progress retrieved successfully');
});

// ============================================
// @desc    Claim an earned badge
// @route   POST /api/v1/badges/claim/:badgeId
// @access  Private
// ============================================
exports.claimBadge = asyncHandler(async (req, res) => {
  const { badgeId } = req.params;

  const badge = await Badge.findById(badgeId);

  if (!badge) {
    throw ApiError.notFound('Badge not found');
  }

  if (!badge.isActive) {
    throw ApiError.badRequest('This badge is no longer active');
  }

  // Check if user already has this badge
  const user = await User.findById(req.user._id);
  const alreadyEarned = user?.gamification?.badges?.includes(badgeId);

  if (alreadyEarned) {
    throw ApiError.badRequest('You have already earned this badge');
  }

  // Calculate progress to verify eligibility
  const progress = await calculateBadgeProgress(req.user._id, badge);

  if (progress < 100) {
    throw ApiError.badRequest(`You have not met the requirements for this badge (${progress}% complete)`);
  }

  // Award the badge
  const result = await badge.awardToUser(req.user._id, 100);

  if (!result.success) {
    throw ApiError.badRequest(result.message);
  }

  // Add badge to user's gamification profile
  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { 'gamification.badges': badge._id },
  });

  // Award points
  if (badge.pointsAwarded > 0) {
    await user.addPoints(badge.pointsAwarded);
  }

  ApiResponse.success(res, {
    badge: result.badge,
    pointsAwarded: badge.pointsAwarded,
  }, 'Badge claimed successfully!');
});

// ============================================
// Helper function to calculate badge progress
// ============================================
const calculateBadgeProgress = async (userId, badge) => {
  const user = await User.findById(userId);

  if (!user || !badge.criteria) return 0;

  const criteriaType = badge.criteria.type;

  switch (criteriaType) {
    case 'course-completion': {
      const required = badge.criteria.coursesRequired || 1;
      const completed = user.learnerProfile?.completedCourses?.length || 0;
      return Math.min(100, Math.round((completed / required) * 100));
    }

    case 'quiz-pass': {
      const required = badge.criteria.quizzesRequired || 1;
      // Query Quiz model for passed quizzes
      const Quiz = require('../models/Quiz.model');
      const passedQuizzes = await Quiz.countDocuments({
        'submissions.user': userId,
        'submissions.passed': true,
      });
      return Math.min(100, Math.round((passedQuizzes / required) * 100));
    }

    case 'skill-exchange': {
      const required = badge.criteria.exchangesRequired || 1;
      const completed = user.skillExchangeProfile?.completedExchanges || 0;
      return Math.min(100, Math.round((completed / required) * 100));
    }

    case 'points-threshold': {
      const required = badge.criteria.pointsRequired || 100;
      const current = user.gamification?.points || 0;
      return Math.min(100, Math.round((current / required) * 100));
    }

    case 'streak': {
      const required = badge.criteria.streakDays || 7;
      const current = user.learnerProfile?.currentStreak || 0;
      return Math.min(100, Math.round((current / required) * 100));
    }

    case 'review-count': {
      const required = badge.criteria.reviewsRequired || 1;
      const Review = require('../models/Review.model');
      const reviewCount = await Review.countDocuments({ user: userId });
      return Math.min(100, Math.round((reviewCount / required) * 100));
    }

    case 'enrollment-count': {
      const required = badge.criteria.enrollmentsRequired || 1;
      const enrolled = user.learnerProfile?.enrolledCourses?.length || 0;
      return Math.min(100, Math.round((enrolled / required) * 100));
    }

    case 'teaching-hours': {
      const required = badge.criteria.hoursRequired || 10;
      const hours = user.educatorProfile?.totalTeachingHours || 0;
      return Math.min(100, Math.round((hours / required) * 100));
    }

    default:
      return 0;
  }
};