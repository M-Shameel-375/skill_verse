// Review controller
// ============================================
// REVIEW CONTROLLER
// ============================================

const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const Review = require('../models/Review.model');
const Course = require('../models/Course.model');
const LiveSession = require('../models/LiveSession.model');
const User = require('../models/User.model');
const { getPagination } = require('../utils/helpers');

// ============================================
// @desc    Create review
// @route   POST /api/v1/reviews
// @access  Private
// ============================================
exports.createReview = asyncHandler(async (req, res) => {
  const {
    reviewType,
    course,
    liveSession,
    instructor,
    rating,
    title,
    comment,
    detailedRatings,
    pros,
    cons,
    wouldRecommend,
    targetAudience,
  } = req.body;

  // Check if user already reviewed
  const existingReview = await Review.findOne({
    user: req.user._id,
    [reviewType]: reviewType === 'course' ? course : reviewType === 'live-session' ? liveSession : instructor,
  });

  if (existingReview) {
    throw ApiError.conflict('You have already reviewed this');
  }

  // Verify user has access (enrolled in course, attended session, etc.)
  if (reviewType === 'course') {
    const courseData = await Course.findById(course);
    if (!courseData) {
      throw ApiError.notFound('Course not found');
    }
    
    if (!courseData.isUserEnrolled(req.user._id)) {
      throw ApiError.forbidden('You must be enrolled to review this course');
    }
  }

  // Create review
  const review = await Review.create({
    user: req.user._id,
    reviewType,
    course,
    liveSession,
    instructor,
    rating,
    title,
    comment,
    detailedRatings,
    pros,
    cons,
    wouldRecommend: wouldRecommend !== undefined ? wouldRecommend : true,
    targetAudience,
    isVerifiedPurchase: true,
    status: 'approved', // Auto-approve for now
    isApproved: true,
  });

  // Update course/instructor ratings
  if (reviewType === 'course') {
    const courseData = await Course.findById(course);
    await courseData.calculateRating();
    await courseData.calculateRatingDistribution();
  }

  ApiResponse.created(res, review, 'Review submitted successfully');
});

// ============================================
// @desc    Get all reviews (with filters)
// @route   GET /api/v1/reviews
// @access  Public
// ============================================
exports.getAllReviews = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    course,
    liveSession,
    instructor,
    rating,
    sort = '-createdAt',
  } = req.query;

  // Build query
  const query = { isApproved: true };

  if (course) query.course = course;
  if (liveSession) query.liveSession = liveSession;
  if (instructor) query.instructor = instructor;
  if (rating) query.rating = parseInt(rating);

  // Execute query
  const reviews = await Review.find(query)
    .populate('user', 'name profileImage')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Review.countDocuments(query);

  const pagination = getPagination(page, limit, total);

  ApiResponse.paginated(res, reviews, pagination, 'Reviews retrieved successfully');
});

// ============================================
// @desc    Get single review by ID
// @route   GET /api/v1/reviews/:id
// @access  Public
// ============================================
exports.getReviewById = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id)
    .populate('user', 'name profileImage')
    .populate('course', 'title thumbnail')
    .populate('liveSession', 'title')
    .populate('instructor', 'name profileImage');

  if (!review) {
    throw ApiError.notFound('Review not found');
  }

  ApiResponse.success(res, review, 'Review retrieved successfully');
});

// ============================================
// @desc    Update review
// @route   PUT /api/v1/reviews/:id
// @access  Private
// ============================================
exports.updateReview = asyncHandler(async (req, res) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    throw ApiError.notFound('Review not found');
  }

  // Check ownership
  if (review.user.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not authorized to update this review');
  }

  const allowedUpdates = [
    'rating',
    'title',
    'comment',
    'detailedRatings',
    'pros',
    'cons',
    'wouldRecommend',
  ];

  const updates = {};
  Object.keys(req.body).forEach((key) => {
    if (allowedUpdates.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  await review.updateReview(updates);

  ApiResponse.success(res, review, 'Review updated successfully');
});

// ============================================
// @desc    Delete review
// @route   DELETE /api/v1/reviews/:id
// @access  Private
// ============================================
exports.deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    throw ApiError.notFound('Review not found');
  }

  // Check ownership
  if (
    review.user.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    throw ApiError.forbidden('Not authorized to delete this review');
  }

  await review.deleteOne();

  // Update course ratings
  if (review.course) {
    const course = await Course.findById(review.course);
    await course.calculateRating();
    await course.calculateRatingDistribution();
  }

  ApiResponse.success(res, null, 'Review deleted successfully');
});

// ============================================
// @desc    Mark review as helpful
// @route   POST /api/v1/reviews/:id/helpful
// @access  Private
// ============================================
exports.markAsHelpful = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    throw ApiError.notFound('Review not found');
  }

  await review.markAsHelpful(req.user._id);

  ApiResponse.success(res, null, 'Marked as helpful');
});

// ============================================
// @desc    Mark review as not helpful
// @route   POST /api/v1/reviews/:id/not-helpful
// @access  Private
// ============================================
exports.markAsNotHelpful = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    throw ApiError.notFound('Review not found');
  }

  await review.markAsNotHelpful(req.user._id);

  ApiResponse.success(res, null, 'Marked as not helpful');
});

// ============================================
// @desc    Flag review
// @route   POST /api/v1/reviews/:id/flag
// @access  Private
// ============================================
exports.flagReview = asyncHandler(async (req, res) => {
  const { reason, description } = req.body;

  const review = await Review.findById(req.params.id);

  if (!review) {
    throw ApiError.notFound('Review not found');
  }

  await review.flag(req.user._id, reason, description);

  ApiResponse.success(res, null, 'Review flagged successfully');
});

// ============================================
// @desc    Add instructor response
// @route   POST /api/v1/reviews/:id/response
// @access  Private (Educator)
// ============================================
exports.addResponse = asyncHandler(async (req, res) => {
  const { comment } = req.body;

  const review = await Review.findById(req.params.id).populate('course');

  if (!review) {
    throw ApiError.notFound('Review not found');
  }

  // Check if user is the instructor
  if (review.course?.instructor.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Only the instructor can respond to this review');
  }

  await review.addResponse(req.user._id, comment);

  ApiResponse.success(res, review, 'Response added successfully');
});

// ============================================
// @desc    Get reviews by course
// @route   GET /api/v1/reviews/course/:courseId
// @access  Public
// ============================================
exports.getReviewsByCourse = asyncHandler(async (req, res) => {
  const { sortBy, limit = 10 } = req.query;

  const reviews = await Review.getReviewsByCourse(req.params.courseId, {
    sortBy,
    limit: parseInt(limit),
  });

  // Get rating summary
  const ratingSummary = await Review.calculateAverageRating('course', req.params.courseId);

  ApiResponse.success(
    res,
    {
      reviews,
      ratingSummary,
    },
    'Reviews retrieved successfully'
  );
});

// ============================================
// @desc    Get my reviews
// @route   GET /api/v1/reviews/my-reviews
// @access  Private
// ============================================
exports.getMyReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.getReviewsByUser(req.user._id);

  ApiResponse.success(res, reviews, 'Your reviews retrieved successfully');
});

// ============================================
// @desc    Approve review (Admin/Moderator)
// @route   PUT /api/v1/reviews/:id/approve
// @access  Private (Admin)
// ============================================
exports.approveReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    throw ApiError.notFound('Review not found');
  }

  await review.approve(req.user._id);

  ApiResponse.success(res, null, 'Review approved successfully');
});

// ============================================
// @desc    Reject review (Admin/Moderator)
// @route   PUT /api/v1/reviews/:id/reject
// @access  Private (Admin)
// ============================================
exports.rejectReview = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const review = await Review.findById(req.params.id);

  if (!review) {
    throw ApiError.notFound('Review not found');
  }

  await review.reject(req.user._id, reason);

  ApiResponse.success(res, null, 'Review rejected successfully');
});

// ============================================
// @desc    Get pending reviews (Admin)
// @route   GET /api/v1/reviews/pending
// @access  Private (Admin)
// ============================================
exports.getPendingReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.getPendingReviews();

  ApiResponse.success(res, reviews, 'Pending reviews retrieved successfully');
});

// ============================================
// @desc    Get flagged reviews (Admin)
// @route   GET /api/v1/reviews/flagged
// @access  Private (Admin)
// ============================================
exports.getFlaggedReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.getFlaggedReviews();

  ApiResponse.success(res, reviews, 'Flagged reviews retrieved successfully');
});

// ============================================
// @desc    Get top reviews
// @route   GET /api/v1/reviews/top/:entityType/:entityId
// @access  Public
// ============================================
exports.getTopReviews = asyncHandler(async (req, res) => {
  const { entityType, entityId } = req.params;
  const { limit = 5 } = req.query;

  const reviews = await Review.getTopReviews(entityType, entityId, parseInt(limit));

  ApiResponse.success(res, reviews, 'Top reviews retrieved successfully');
});