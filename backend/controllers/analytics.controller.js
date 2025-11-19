// Analytics controller
// ============================================
// ANALYTICS CONTROLLER
// ============================================

const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const Course = require('../models/Course.model');
const User = require('../models/User.model');
const Payment = require('../models/Payment.model');
const LiveSession = require('../models/LiveSession.model');

// ============================================
// @desc    Get course analytics
// @route   GET /api/v1/analytics/courses/:id
// @access  Private (Educator - Course Owner)
// ============================================
exports.getCourseAnalytics = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    throw ApiError.notFound('Course not found');
  }

  // Check authorization
  if (
    course.instructor.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    throw ApiError.forbidden('Not authorized to view analytics');
  }

  const analytics = {
    overview: {
      totalStudents: course.totalStudents,
      totalViews: course.views,
      averageRating: course.rating.average,
      totalReviews: course.rating.count,
      totalRevenue: course.earnings.total,
    },
    engagement: {
      completionRate: course.enrolledStudents.length > 0
        ? Math.round((course.enrolledStudents.filter(s => s.progress === 100).length / course.enrolledStudents.length) * 100)
        : 0,
      averageProgress: course.enrolledStudents.length > 0
        ? Math.round(course.enrolledStudents.reduce((sum, s) => sum + s.progress, 0) / course.enrolledStudents.length)
        : 0,
    },
    students: course.enrolledStudents.slice(0, 10),
  };

  ApiResponse.success(res, analytics, 'Course analytics retrieved successfully');
});

// ============================================
// @desc    Get instructor analytics
// @route   GET /api/v1/analytics/instructor
// @access  Private (Educator)
// ============================================
exports.getInstructorAnalytics = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  const analytics = {
    overview: {
      totalCourses: user.educatorProfile?.totalCourses || 0,
      totalStudents: user.educatorProfile?.totalStudents || 0,
      averageRating: user.educatorProfile?.rating?.average || 0,
      totalEarnings: user.educatorProfile?.earnings?.total || 0,
    },
    earnings: {
      total: user.educatorProfile?.earnings?.total || 0,
      pending: user.educatorProfile?.earnings?.pending || 0,
      withdrawn: user.educatorProfile?.earnings?.withdrawn || 0,
    },
  };

  ApiResponse.success(res, analytics, 'Instructor analytics retrieved successfully');
});

// ============================================
// @desc    Get learner analytics
// @route   GET /api/v1/analytics/learner
// @access  Private
// ============================================
exports.getLearnerAnalytics = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('learnerProfile.enrolledCourses', 'title')
    .populate('learnerProfile.completedCourses', 'title');

  const analytics = {
    learning: {
      enrolledCourses: user.learnerProfile?.enrolledCourses?.length || 0,
      completedCourses: user.learnerProfile?.completedCourses?.length || 0,
      certificates: user.learnerProfile?.certificates?.length || 0,
      learningHours: user.learnerProfile?.learningHours || 0,
    },
    progress: {
      currentStreak: user.learnerProfile?.currentStreak || 0,
      longestStreak: user.learnerProfile?.longestStreak || 0,
    },
    gamification: {
      points: user.gamification?.points || 0,
      level: user.gamification?.level || 1,
      badges: user.gamification?.badges?.length || 0,
    },
  };

  ApiResponse.success(res, analytics, 'Learner analytics retrieved successfully');
});

module.exports = exports;