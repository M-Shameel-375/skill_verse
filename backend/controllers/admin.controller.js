// Admin controller
// ============================================
// ADMIN CONTROLLER
// ============================================

const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const User = require('../models/User.model');
const Course = require('../models/Course.model');
const LiveSession = require('../models/LiveSession.model');
const Payment = require('../models/Payment.model');
const Review = require('../models/Review.model');
const Certificate = require('../models/Certificate.model');
const SkillExchange = require('../models/SkillExchange.model');

// ============================================
// @desc    Get dashboard statistics
// @route   GET /api/v1/admin/dashboard
// @access  Private (Admin)
// ============================================
exports.getDashboardStats = asyncHandler(async (req, res) => {
  // User statistics
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ status: 'active' });
  const newUsersThisMonth = await User.countDocuments({
    createdAt: { $gte: new Date(new Date().setDate(1)) },
  });

  const usersByRole = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
      },
    },
  ]);

  // Course statistics
  const totalCourses = await Course.countDocuments();
  const publishedCourses = await Course.countDocuments({ status: 'published' });
  const draftCourses = await Course.countDocuments({ status: 'draft' });

  // Payment statistics
  const paymentStats = await Payment.aggregate([
    {
      $match: { status: 'succeeded' },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$amount.total' },
        totalPlatformFees: { $sum: '$amount.platformFee' },
        totalPayments: { $sum: 1 },
      },
    },
  ]);

  const revenueThisMonth = await Payment.aggregate([
    {
      $match: {
        status: 'succeeded',
        createdAt: { $gte: new Date(new Date().setDate(1)) },
      },
    },
    {
      $group: {
        _id: null,
        revenue: { $sum: '$amount.total' },
      },
    },
  ]);

  // Live session statistics
  const totalLiveSessions = await LiveSession.countDocuments();
  const upcomingSessions = await LiveSession.countDocuments({
    status: 'scheduled',
    scheduledAt: { $gte: new Date() },
  });

  // Skill exchange statistics
  const totalExchanges = await SkillExchange.countDocuments();
  const activeExchanges = await SkillExchange.countDocuments({
    status: { $in: ['accepted', 'in-progress'] },
  });

  // Certificate statistics
  const totalCertificates = await Certificate.countDocuments();
  const certificatesThisMonth = await Certificate.countDocuments({
    issueDate: { $gte: new Date(new Date().setDate(1)) },
  });

  // Review statistics
  const totalReviews = await Review.countDocuments();
  const pendingReviews = await Review.countDocuments({ status: 'pending' });

  const stats = {
    users: {
      total: totalUsers,
      active: activeUsers,
      newThisMonth: newUsersThisMonth,
      byRole: usersByRole,
    },
    courses: {
      total: totalCourses,
      published: publishedCourses,
      draft: draftCourses,
    },
    payments: {
      totalRevenue: paymentStats[0]?.totalRevenue || 0,
      totalPlatformFees: paymentStats[0]?.totalPlatformFees || 0,
      totalPayments: paymentStats[0]?.totalPayments || 0,
      revenueThisMonth: revenueThisMonth[0]?.revenue || 0,
    },
    liveSessions: {
      total: totalLiveSessions,
      upcoming: upcomingSessions,
    },
    skillExchanges: {
      total: totalExchanges,
      active: activeExchanges,
    },
    certificates: {
      total: totalCertificates,
      issuedThisMonth: certificatesThisMonth,
    },
    reviews: {
      total: totalReviews,
      pending: pendingReviews,
    },
  };

  ApiResponse.success(res, stats, 'Dashboard statistics retrieved successfully');
});

// ============================================
// @desc    Get all users (Admin)
// @route   GET /api/v1/admin/users
// @access  Private (Admin)
// ============================================
exports.getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, status, search } = req.query;

  const query = {};

  if (role) query.role = role;
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const users = await User.find(query)
    .select('-password -refreshToken')
    .sort('-createdAt')
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await User.countDocuments(query);

  ApiResponse.paginated(
    res,
    users,
    { page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit), totalItems: total },
    'Users retrieved successfully'
  );
});

// ============================================
// @desc    Update user role
// @route   PUT /api/v1/admin/users/:id/role
// @access  Private (Admin)
// ============================================
exports.updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  ApiResponse.success(res, user, 'User role updated successfully');
});

// ============================================
// @desc    Update user status
// @route   PUT /api/v1/admin/users/:id/status
// @access  Private (Admin)
// ============================================
exports.updateUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  ApiResponse.success(res, user, 'User status updated successfully');
});

// ============================================
// @desc    Delete user
// @route   DELETE /api/v1/admin/users/:id
// @access  Private (Admin)
// ============================================
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  await user.deleteOne();

  ApiResponse.success(res, null, 'User deleted successfully');
});

// ============================================
// @desc    Get all courses (Admin)
// @route   GET /api/v1/admin/courses
// @access  Private (Admin)
// ============================================
exports.getAllCourses = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;

  const query = {};
  if (status) query.status = status;

  const courses = await Course.find(query)
    .populate('instructor', 'name email')
    .sort('-createdAt')
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Course.countDocuments(query);

  ApiResponse.paginated(
    res,
    courses,
    { page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit), totalItems: total },
    'Courses retrieved successfully'
  );
});

// ============================================
// @desc    Approve course
// @route   PUT /api/v1/admin/courses/:id/approve
// @access  Private (Admin)
// ============================================
exports.approveCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndUpdate(
    req.params.id,
    { status: 'published', isPublished: true, publishedAt: new Date() },
    { new: true }
  );

  if (!course) {
    throw ApiError.notFound('Course not found');
  }

  ApiResponse.success(res, course, 'Course approved successfully');
});

// ============================================
// @desc    Reject course
// @route   PUT /api/v1/admin/courses/:id/reject
// @access  Private (Admin)
// ============================================
exports.rejectCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndUpdate(
    req.params.id,
    { status: 'rejected' },
    { new: true }
  );

  if (!course) {
    throw ApiError.notFound('Course not found');
  }

  ApiResponse.success(res, course, 'Course rejected');
});

// ============================================
// @desc    Get revenue analytics
// @route   GET /api/v1/admin/analytics/revenue
// @access  Private (Admin)
// ============================================
exports.getRevenueAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate, interval = 'day' } = req.query;

  const matchStage = {
    status: 'succeeded',
  };

  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }

  let groupFormat;
  switch (interval) {
    case 'day':
      groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
      break;
    case 'week':
      groupFormat = { $week: '$createdAt' };
      break;
    case 'month':
      groupFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
      break;
    default:
      groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
  }

  const analytics = await Payment.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: groupFormat,
        revenue: { $sum: '$amount.total' },
        platformFees: { $sum: '$amount.platformFee' },
        transactions: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  ApiResponse.success(res, analytics, 'Revenue analytics retrieved successfully');
});

// ============================================
// @desc    Get user growth analytics
// @route   GET /api/v1/admin/analytics/user-growth
// @access  Private (Admin)
// ============================================
exports.getUserGrowthAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const matchStage = {};
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }

  const analytics = await User.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        newUsers: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  ApiResponse.success(res, analytics, 'User growth analytics retrieved successfully');
});

// ============================================
// @desc    Get content moderation queue
// @route   GET /api/v1/admin/moderation
// @access  Private (Admin)
// ============================================
exports.getModerationQueue = asyncHandler(async (req, res) => {
  const pendingCourses = await Course.find({ status: 'pending' })
    .populate('instructor', 'name email')
    .limit(10);

  const pendingReviews = await Review.find({ status: 'pending' })
    .populate('user', 'name email')
    .populate('course', 'title')
    .limit(10);

  const flaggedReviews = await Review.find({ isFlagged: true })
    .populate('user', 'name email')
    .limit(10);

  ApiResponse.success(
    res,
    {
      pendingCourses,
      pendingReviews,
      flaggedReviews,
    },
    'Moderation queue retrieved successfully'
  );
});

// ============================================
// @desc    Get system health
// @route   GET /api/v1/admin/system/health
// @access  Private (Admin)
// ============================================
exports.getSystemHealth = asyncHandler(async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: 'connected',
  };

  ApiResponse.success(res, health, 'System health retrieved successfully');
});

// ============================================
// @desc    Get system settings
// @route   GET /api/v1/admin/settings
// @access  Private (Admin)
// ============================================
exports.getSystemSettings = asyncHandler(async (req, res) => {
  // In a real app, these would come from a Settings model or config
  const settings = {
    general: {
      siteName: 'SkillVerse',
      siteDescription: 'Peer-to-peer skill sharing platform',
      contactEmail: 'support@skillverse.com',
      supportPhone: '+1-800-SKILL',
    },
    payments: {
      platformFee: 10,
      minWithdrawal: 50,
      payoutSchedule: 'weekly',
      enabledGateways: ['stripe'],
    },
    email: {
      smtpHost: 'smtp.example.com',
      smtpPort: 587,
      senderEmail: 'noreply@skillverse.com',
      senderName: 'SkillVerse',
    },
    security: {
      maxLoginAttempts: 5,
      sessionTimeout: 60,
      requireEmailVerification: true,
      require2FA: false,
    },
    features: {
      enableLiveSessions: true,
      enableSkillExchange: true,
      enableBadges: true,
      enableCertificates: true,
      maintenanceMode: false,
    },
  };

  ApiResponse.success(res, settings, 'System settings retrieved successfully');
});

// ============================================
// @desc    Update system settings
// @route   PUT /api/v1/admin/settings
// @access  Private (Admin)
// ============================================
exports.updateSystemSettings = asyncHandler(async (req, res) => {
  const { section, settings } = req.body;

  if (!section || !settings) {
    throw ApiError.badRequest('Section and settings are required');
  }

  // In a real app, you would save these to a Settings model
  // For now, we'll just return success
  ApiResponse.success(
    res,
    { section, settings },
    `${section} settings updated successfully`
  );
});

// ============================================
// @desc    Get educator applications
// @route   GET /api/v1/admin/educator-applications
// @access  Private (Admin)
// ============================================
exports.getEducatorApplications = asyncHandler(async (req, res) => {
  const applications = await User.find({
    'educatorApplication.status': 'pending',
  }).select('name email educatorApplication createdAt');

  ApiResponse.success(res, applications, 'Educator applications retrieved successfully');
});

// ============================================
// @desc    Approve/Reject educator application
// @route   PUT /api/v1/admin/educator-applications/:id
// @access  Private (Admin)
// ============================================
exports.processEducatorApplication = asyncHandler(async (req, res) => {
  const { action, reason } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (!user.educatorApplication) {
    throw ApiError.badRequest('No educator application found for this user');
  }

  if (action === 'approve') {
    user.role = 'educator';
    user.educatorApplication.status = 'approved';
    user.educatorApplication.reviewedAt = new Date();
    user.educatorProfile = {
      expertise: user.educatorApplication.expertise || [],
      teachingExperience: user.educatorApplication.experience || 0,
      totalStudents: 0,
      totalCourses: 0,
      rating: { average: 0, count: 0 },
      earnings: { total: 0, pending: 0, withdrawn: 0 },
      verified: false,
    };
  } else if (action === 'reject') {
    user.educatorApplication.status = 'rejected';
    user.educatorApplication.rejectionReason = reason;
    user.educatorApplication.reviewedAt = new Date();
  } else {
    throw ApiError.badRequest('Invalid action. Use "approve" or "reject"');
  }

  await user.save();

  ApiResponse.success(
    res,
    user,
    `Educator application ${action}d successfully`
  );
});

// ============================================
// @desc    Warn user about content
// @route   POST /api/v1/admin/users/:id/warn
// @access  Private (Admin)
// ============================================
exports.warnUser = asyncHandler(async (req, res) => {
  const { contentId, reason } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Add warning to user record
  if (!user.warnings) {
    user.warnings = [];
  }

  user.warnings.push({
    reason,
    contentId,
    issuedAt: new Date(),
    issuedBy: req.user._id,
  });

  await user.save();

  // TODO: Send warning notification to user

  ApiResponse.success(res, user, 'User warned successfully');
});

// ============================================
// @desc    Ban user
// @route   POST /api/v1/admin/users/:id/ban
// @access  Private (Admin)
// ============================================
exports.banUser = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  user.status = 'banned';
  user.banReason = reason;
  user.bannedAt = new Date();
  user.bannedBy = req.user._id;

  await user.save();

  ApiResponse.success(res, user, 'User banned successfully');
});

// ============================================
// @desc    Approve flagged content
// @route   PUT /api/v1/admin/moderation/:contentId/approve
// @access  Private (Admin)
// ============================================
exports.approveContent = asyncHandler(async (req, res) => {
  const { contentId } = req.params;
  
  // Try to find in reviews first
  let content = await Review.findById(contentId);
  
  if (content) {
    content.isFlagged = false;
    content.status = 'approved';
    await content.save();
    return ApiResponse.success(res, content, 'Content approved successfully');
  }

  // Try courses
  content = await Course.findById(contentId);
  if (content) {
    content.status = 'published';
    await content.save();
    return ApiResponse.success(res, content, 'Content approved successfully');
  }

  throw ApiError.notFound('Content not found');
});

// ============================================
// @desc    Remove flagged content
// @route   DELETE /api/v1/admin/moderation/:contentId
// @access  Private (Admin)
// ============================================
exports.removeContent = asyncHandler(async (req, res) => {
  const { contentId } = req.params;
  
  // Try to find and delete from reviews first
  let content = await Review.findByIdAndDelete(contentId);
  
  if (content) {
    return ApiResponse.success(res, null, 'Content removed successfully');
  }

  // Try courses
  content = await Course.findByIdAndDelete(contentId);
  if (content) {
    return ApiResponse.success(res, null, 'Content removed successfully');
  }

  throw ApiError.notFound('Content not found');
});