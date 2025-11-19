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