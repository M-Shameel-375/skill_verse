// User controller
// ============================================
// USER CONTROLLER
// ============================================

const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const User = require('../models/User.model');
const Course = require('../models/Course.model');
const { getPagination } = require('../utils/helpers');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinary.service');

// ============================================
// @desc    Get user profile by ID
// @route   GET /api/v1/users/:id
// @access  Public
// ============================================
exports.getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password -refreshToken -emailVerificationToken -passwordResetToken')
    .populate('learnerProfile.enrolledCourses', 'title thumbnail rating')
    .populate('gamification.badges', 'name icon description');

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  ApiResponse.success(res, user, 'User profile retrieved successfully');
});

// ============================================
// @desc    Get current user profile
// @route   GET /api/v1/users/me
// @access  Private
// ============================================
exports.getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('-password -refreshToken -emailVerificationToken -passwordResetToken')
    .populate('learnerProfile.enrolledCourses', 'title thumbnail rating')
    .populate('gamification.badges', 'name icon description');

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  ApiResponse.success(res, user, 'Current user profile retrieved successfully');
});

// ============================================
// @desc    Update user profile
// @route   PUT /api/v1/users/profile
// @access  Private
// ============================================
exports.updateProfile = asyncHandler(async (req, res) => {
  const {
    name,
    phone,
    bio,
    title,
    location,
    socialLinks,
    interests,
    learningGoals,
  } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Update basic fields
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (bio) user.bio = bio;
  if (title) user.title = title;
  if (location) user.location = location;
  if (socialLinks) user.socialLinks = { ...user.socialLinks, ...socialLinks };
  if (interests) user.interests = interests;
  if (learningGoals) user.learningGoals = learningGoals;

  await user.save();

  ApiResponse.success(res, user, 'Profile updated successfully');
});

// ============================================
// @desc    Upload profile image
// @route   PUT /api/v1/users/profile-image
// @access  Private
// ============================================
exports.uploadProfileImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('Please upload an image');
  }

  const user = await User.findById(req.user._id);

  // Delete old image if exists
  if (user.profileImage?.publicId) {
    await deleteFromCloudinary(user.profileImage.publicId);
  }

  // Upload new image (assuming Cloudinary is configured)
  user.profileImage = {
    url: req.file.path,
    publicId: req.file.filename,
  };

  await user.save();

  ApiResponse.success(res, {
    profileImage: user.profileImage,
  }, 'Profile image uploaded successfully');
});

// ============================================
// @desc    Upload cover image
// @route   PUT /api/v1/users/cover-image
// @access  Private
// ============================================
exports.uploadCoverImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('Please upload an image');
  }

  const user = await User.findById(req.user._id);

  // Delete old cover image if exists
  if (user.coverImage?.publicId) {
    await deleteFromCloudinary(user.coverImage.publicId);
  }

  // Upload new cover image
  user.coverImage = {
    url: req.file.path,
    publicId: req.file.filename,
  };

  await user.save();

  ApiResponse.success(res, {
    coverImage: user.coverImage,
  }, 'Cover image uploaded successfully');
});

// ============================================
// @desc    Add/Update skills
// @route   PUT /api/v1/users/skills
// @access  Private
// ============================================
exports.updateSkills = asyncHandler(async (req, res) => {
  const { skills } = req.body;

  if (!Array.isArray(skills)) {
    throw ApiError.badRequest('Skills must be an array');
  }

  const user = await User.findById(req.user._id);
  user.skills = skills;
  await user.save();

  ApiResponse.success(res, {
    skills: user.skills,
  }, 'Skills updated successfully');
});

// ============================================
// @desc    Add single skill
// @route   POST /api/v1/users/skills
// @access  Private
// ============================================
exports.addSkill = asyncHandler(async (req, res) => {
  const { name, level, yearsOfExperience } = req.body;

  const user = await User.findById(req.user._id);

  // Check if skill already exists
  const existingSkill = user.skills.find((s) => s.name === name);
  if (existingSkill) {
    throw ApiError.conflict('Skill already exists');
  }

  user.skills.push({
    name,
    level: level || 'beginner',
    yearsOfExperience: yearsOfExperience || 0,
  });

  await user.save();

  ApiResponse.success(res, {
    skills: user.skills,
  }, 'Skill added successfully');
});

// ============================================
// @desc    Remove skill
// @route   DELETE /api/v1/users/skills/:skillId
// @access  Private
// ============================================
exports.removeSkill = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  user.skills = user.skills.filter(
    (skill) => skill._id.toString() !== req.params.skillId
  );

  await user.save();

  ApiResponse.success(res, {
    skills: user.skills,
  }, 'Skill removed successfully');
});

// ============================================
// @desc    Endorse user skill
// @route   POST /api/v1/users/:userId/skills/:skillId/endorse
// @access  Private
// ============================================
exports.endorseSkill = asyncHandler(async (req, res) => {
  const { userId, skillId } = req.params;

  const user = await User.findById(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const skill = user.skills.id(skillId);

  if (!skill) {
    throw ApiError.notFound('Skill not found');
  }

  skill.endorsements += 1;
  await user.save();

  ApiResponse.success(res, {
    skill,
  }, 'Skill endorsed successfully');
});

// ============================================
// @desc    Get all users (with filters)
// @route   GET /api/v1/users
// @access  Public
// ============================================
exports.getAllUsers = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    role,
    search,
    skills,
    sort = '-createdAt',
  } = req.query;

  // Build query
  const query = { status: 'active' };

  if (role) {
    query.role = role;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { bio: { $regex: search, $options: 'i' } },
    ];
  }

  if (skills) {
    const skillsArray = skills.split(',');
    query['skills.name'] = { $in: skillsArray };
  }

  // Execute query
  const users = await User.find(query)
    .select('-password -refreshToken')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await User.countDocuments(query);

  const pagination = getPagination(page, limit, total);

  ApiResponse.paginated(res, users, pagination, 'Users retrieved successfully');
});

// ============================================
// @desc    Search users
// @route   GET /api/v1/users/search
// @access  Public
// ============================================
exports.searchUsers = asyncHandler(async (req, res) => {
  const { q, limit = 10 } = req.query;

  if (!q) {
    throw ApiError.badRequest('Search query is required');
  }

  const users = await User.searchUsers(q)
    .select('name email profileImage bio skills role')
    .limit(parseInt(limit));

  ApiResponse.success(res, users, 'Search results retrieved successfully');
});

// ============================================
// @desc    Get user statistics
// @route   GET /api/v1/users/:id/stats
// @access  Public
// ============================================
exports.getUserStats = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const stats = {
    profileCompletion: user.profileCompletion,
    totalSkills: user.skills?.length || 0,
    gamification: {
      points: user.gamification?.points || 0,
      level: user.gamification?.level || 1,
      badges: user.gamification?.badges?.length || 0,
    },
  };

  // Role-specific stats
  if (user.role === 'learner') {
    stats.learner = {
      enrolledCourses: user.learnerProfile?.enrolledCourses?.length || 0,
      completedCourses: user.learnerProfile?.completedCourses?.length || 0,
      certificates: user.learnerProfile?.certificates?.length || 0,
      learningHours: user.learnerProfile?.learningHours || 0,
      currentStreak: user.learnerProfile?.currentStreak || 0,
      longestStreak: user.learnerProfile?.longestStreak || 0,
    };
  }

  if (user.role === 'educator') {
    stats.educator = {
      totalStudents: user.educatorProfile?.totalStudents || 0,
      totalCourses: user.educatorProfile?.totalCourses || 0,
      averageRating: user.educatorProfile?.rating?.average || 0,
      totalEarnings: user.educatorProfile?.earnings?.total || 0,
    };
  }

  if (user.role === 'skillExchanger') {
    stats.skillExchange = {
      completedExchanges: user.skillExchangeProfile?.completedExchanges || 0,
      averageRating: user.skillExchangeProfile?.rating?.average || 0,
      offeredSkills: user.skillExchangeProfile?.offeredSkills?.length || 0,
      desiredSkills: user.skillExchangeProfile?.desiredSkills?.length || 0,
    };
  }

  ApiResponse.success(res, stats, 'User statistics retrieved successfully');
});

// ============================================
// @desc    Get user's enrolled courses
// @route   GET /api/v1/users/my-courses
// @access  Private
// ============================================
exports.getMyCourses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate({
      path: 'learnerProfile.enrolledCourses',
      select: 'title description thumbnail instructor rating price',
      populate: {
        path: 'instructor',
        select: 'name profileImage',
      },
    });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const enrolledCourses = user.learnerProfile?.enrolledCourses || [];

  ApiResponse.success(res, enrolledCourses, 'Enrolled courses retrieved successfully');
});

// ============================================
// @desc    Get user's certificates
// @route   GET /api/v1/users/my-certificates
// @access  Private
// ============================================
exports.getMyCertificates = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate({
      path: 'learnerProfile.certificates',
      populate: {
        path: 'course',
        select: 'title',
      },
    });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const certificates = user.learnerProfile?.certificates || [];

  ApiResponse.success(res, certificates, 'Certificates retrieved successfully');
});

// ============================================
// @desc    Get user's badges
// @route   GET /api/v1/users/my-badges
// @access  Private
// ============================================
exports.getMyBadges = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('gamification.badges');

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const badges = user.gamification?.badges || [];

  ApiResponse.success(res, badges, 'Badges retrieved successfully');
});

// ============================================
// @desc    Get user certificates by ID
// @route   GET /api/v1/users/:id/certificates
// @access  Public
// ============================================
exports.getUserCertificates = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .populate({
      path: 'learnerProfile.certificates',
      populate: { path: 'course', select: 'title thumbnail' },
    });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  ApiResponse.success(res, user.learnerProfile?.certificates || [], 'Certificates retrieved');
});

// ============================================
// @desc    Get user badges by ID
// @route   GET /api/v1/users/:id/badges
// @access  Public
// ============================================
exports.getUserBadges = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .populate('gamification.badges');

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  ApiResponse.success(res, user.gamification?.badges || [], 'Badges retrieved');
});

// ============================================
// @desc    Switch active role
// @route   POST /api/v1/users/switch-role
// @access  Private
// ============================================
exports.switchActiveRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const validRoles = ['learner', 'educator', 'skillExchanger'];

  if (!validRoles.includes(role)) {
    throw ApiError.badRequest('Invalid role');
  }

  const user = await User.findById(req.user._id);
  
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Check if user has this role capability
  if (role === 'educator' && !user.educatorProfile) {
    throw ApiError.forbidden('You need to apply as educator first');
  }

  if (role === 'skillExchanger' && !user.skillExchangeProfile) {
    // Initialize skill exchanger profile
    user.skillExchangeProfile = {
      offeredSkills: [],
      desiredSkills: [],
      completedExchanges: 0,
      rating: { average: 0, count: 0 },
      availability: [],
    };
  }

  user.activeRole = role;
  await user.save();

  ApiResponse.success(res, { activeRole: role }, 'Role switched successfully');
});

// ============================================
// @desc    Get my statistics
// @route   GET /api/v1/users/statistics
// @access  Private
// ============================================
exports.getMyStatistics = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const stats = {
    coursesCompleted: user.learnerProfile?.completedCourses?.length || 0,
    certificatesEarned: user.learnerProfile?.certificates?.length || 0,
    totalPoints: user.gamification?.points || 0,
    currentStreak: user.gamification?.streak || user.learnerProfile?.currentStreak || 0,
    learningHours: user.learnerProfile?.learningHours || 0,
    level: user.gamification?.level || 1,
    enrolledCourses: user.learnerProfile?.enrolledCourses?.length || 0,
    badges: user.gamification?.badges?.length || 0,
  };

  ApiResponse.success(res, stats, 'Statistics retrieved');
});

// ============================================
// @desc    Get notification preferences
// @route   GET /api/v1/users/notification-preferences
// @access  Private
// ============================================
exports.getNotificationPreferences = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('notificationPreferences');

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  ApiResponse.success(
    res,
    user.notificationPreferences || {},
    'Notification preferences retrieved successfully'
  );
});

// ============================================
// @desc    Update notification preferences
// @route   PUT /api/v1/users/notification-preferences
// @access  Private
// ============================================
exports.updateNotificationPreferences = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  user.notificationPreferences = {
    ...user.notificationPreferences,
    ...req.body,
  };

  await user.save();

  ApiResponse.success(
    res,
    { notificationPreferences: user.notificationPreferences },
    'Notification preferences updated successfully'
  );
});

// ============================================
// @desc    Get learning progress
// @route   GET /api/v1/users/learning-progress
// @access  Private
// ============================================
exports.getLearningProgress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('learnerProfile.enrolledCourses', 'title');

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Get detailed progress for each course
  const coursesWithProgress = await Promise.all(
    (user.learnerProfile?.enrolledCourses || []).map(async (course) => {
      const courseData = await Course.findById(course._id);
      const progress = courseData?.getUserProgress(user._id) || 0;

      return {
        course: {
          _id: course._id,
          title: course.title,
        },
        progress,
      };
    })
  );

  const progressData = {
    totalCourses: user.learnerProfile?.enrolledCourses?.length || 0,
    completedCourses: user.learnerProfile?.completedCourses?.length || 0,
    learningHours: user.learnerProfile?.learningHours || 0,
    currentStreak: user.learnerProfile?.currentStreak || 0,
    courses: coursesWithProgress,
  };

  ApiResponse.success(res, progressData, 'Learning progress retrieved successfully');
});

// ============================================
// @desc    Update learning streak
// @route   POST /api/v1/users/update-streak
// @access  Private
// ============================================
exports.updateLearningStreak = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  await user.updateStreak();

  ApiResponse.success(res, {
    currentStreak: user.learnerProfile?.currentStreak || 0,
    longestStreak: user.learnerProfile?.longestStreak || 0,
  }, 'Streak updated successfully');
});

// ============================================
// @desc    Get top educators
// @route   GET /api/v1/users/top-educators
// @access  Public
// ============================================
exports.getTopEducators = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const educators = await User.find({
    role: 'educator',
    status: 'active',
  })
    .select('name profileImage bio educatorProfile')
    .sort({ 'educatorProfile.rating.average': -1, 'educatorProfile.totalStudents': -1 })
    .limit(parseInt(limit));

  ApiResponse.success(res, educators, 'Top educators retrieved successfully');
});

// ============================================
// @desc    Get recommended users (for skill exchange)
// @route   GET /api/v1/users/recommended
// @access  Private
// ============================================
exports.getRecommendedUsers = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Find users with skills the current user wants to learn
  const desiredSkills = user.skillExchangeProfile?.desiredSkills || [];

  const recommendedUsers = await User.find({
    _id: { $ne: user._id },
    status: 'active',
    'skillExchangeProfile.offeredSkills': { $in: desiredSkills },
  })
    .select('name profileImage skills skillExchangeProfile')
    .limit(10);

  ApiResponse.success(res, recommendedUsers, 'Recommended users retrieved successfully');
});

// ============================================
// @desc    Follow user (Future feature)
// @route   POST /api/v1/users/:id/follow
// @access  Private
// ============================================
exports.followUser = asyncHandler(async (req, res) => {
  // Implementation for follow functionality
  ApiResponse.success(res, null, 'Follow feature coming soon');
});

// ============================================
// @desc    Unfollow user (Future feature)
// @route   DELETE /api/v1/users/:id/unfollow
// @access  Private
// ============================================
exports.unfollowUser = asyncHandler(async (req, res) => {
  // Implementation for unfollow functionality
  ApiResponse.success(res, null, 'Unfollow feature coming soon');
});

// ============================================
// @desc    Export user data (GDPR compliance)
// @route   GET /api/v1/users/export-data
// @access  Private
// ============================================
exports.exportUserData = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('-password -refreshToken')
    .populate('learnerProfile.enrolledCourses')
    .populate('learnerProfile.certificates')
    .populate('gamification.badges');

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Return user data as JSON for download
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename=user-data.json');
  
  ApiResponse.success(res, user, 'User data exported successfully');
});

// ============================================
// @desc    Delete own account
// @route   DELETE /api/v1/users/me
// @access  Private
// ============================================
exports.deleteAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Delete profile images from Cloudinary if they exist
  if (user.profileImage?.publicId) {
    await deleteFromCloudinary(user.profileImage.publicId);
  }
  if (user.coverImage?.publicId) {
    await deleteFromCloudinary(user.coverImage.publicId);
  }

  // Soft delete or hard delete based on requirements
  // For now, doing soft delete by marking as deleted
  user.status = 'deleted';
  user.deletedAt = new Date();
  user.email = `deleted_${user._id}_${user.email}`; // Preserve but invalidate email
  await user.save();

  ApiResponse.success(res, null, 'Account deleted successfully');
});

// ============================================
// @desc    Sync user from Clerk to MongoDB
// @route   POST /api/v1/users/sync
// @access  Public (called after Clerk sign-in/sign-up)
// ============================================
exports.syncUser = asyncHandler(async (req, res) => {
  const { clerkId, email, name, profileImage } = req.body;

  if (!clerkId || !email) {
    throw ApiError.badRequest('Clerk ID and email are required');
  }

  // Find existing user or create new one
  let user = await User.findOne({ 
    $or: [{ clerkId }, { email }] 
  });

  if (user) {
    // Update existing user with latest Clerk data
    user.clerkId = clerkId;
    if (name) user.name = name;
    if (profileImage) user.profileImage = { url: profileImage };
    user.lastLogin = new Date();
    await user.save();
  } else {
    // Create new user with default role
    user = await User.create({
      clerkId,
      email,
      name: name || email.split('@')[0],
      profileImage: profileImage ? { url: profileImage } : undefined,
      role: 'learner', // Default role
      status: 'active',
      isEmailVerified: true, // Clerk handles email verification
      lastLogin: new Date(),
    });
  }

  ApiResponse.success(res, {
    _id: user._id,
    clerkId: user.clerkId,
    name: user.name,
    email: user.email,
    role: user.role,
    profileImage: user.profileImage,
    createdAt: user.createdAt,
  }, 'User synced successfully');
});

// ============================================
// @desc    Update or create user role (for Clerk integration)
// @route   PUT /api/v1/users/role
// @access  Public (called after Clerk sign-up)
// ============================================
exports.updateUserRole = asyncHandler(async (req, res) => {
  const { clerkId, email, name, role } = req.body;

  if (!email || !role) {
    throw ApiError.badRequest('Email and role are required');
  }

  // Validate role
  const validRoles = ['learner', 'educator', 'skillExchanger'];
  if (!validRoles.includes(role)) {
    throw ApiError.badRequest('Invalid role. Must be learner, educator, or skillExchanger');
  }

  // Find existing user or create new one
  let user = await User.findOne({ 
    $or: [{ email }, { clerkId }] 
  });

  if (user) {
    // PREVENT ROLE CHANGES - Role can only be set once!
    if (user.role && user.role !== 'learner') {
      throw ApiError.badRequest(`Role already set to ${user.role}. Cannot change role once selected. Contact support if you need to change your role.`);
    }

    // Update existing user
    user.role = role;
    if (clerkId) user.clerkId = clerkId;
    if (name) user.name = name;

    // Initialize role-specific profile
    if (role === 'educator' && !user.educatorProfile) {
      user.educatorProfile = {
        expertise: [],
        teachingExperience: 0,
        totalStudents: 0,
        totalCourses: 0,
        rating: { average: 0, count: 0 },
        earnings: { total: 0, pending: 0, withdrawn: 0 },
        verified: false,
      };
    }

    if (role === 'skillExchanger' && !user.skillExchangeProfile) {
      user.skillExchangeProfile = {
        offeredSkills: [],
        desiredSkills: [],
        completedExchanges: 0,
        rating: { average: 0, count: 0 },
        availability: [],
      };
    }
  } else {
    // Create new user
    const userData = {
      clerkId: clerkId || `clerk_${Date.now()}`,
      email,
      name: name || email.split('@')[0],
      role,
      status: 'active',
      isEmailVerified: true,
    };

    // Initialize role-specific profile
    if (role === 'educator') {
      userData.educatorProfile = {
        expertise: [],
        teachingExperience: 0,
        totalStudents: 0,
        totalCourses: 0,
        rating: { average: 0, count: 0 },
        earnings: { total: 0, pending: 0, withdrawn: 0 },
        verified: false,
      };
    }

    if (role === 'skillExchanger') {
      userData.skillExchangeProfile = {
        offeredSkills: [],
        desiredSkills: [],
        completedExchanges: 0,
        rating: { average: 0, count: 0 },
        availability: [],
      };
    }

    user = await User.create(userData);
  }

  await user.save();

  ApiResponse.success(res, {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  }, `User role updated to ${role} successfully`);
});

// ============================================
// @desc    Apply as educator
// @route   POST /api/v1/users/apply-educator
// @access  Private
// ============================================
exports.applyAsEducator = asyncHandler(async (req, res) => {
  const {
    expertise,
    experience,
    bio,
    qualifications,
    portfolio,
    linkedIn,
    motivation,
  } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (user.role === 'educator') {
    throw ApiError.badRequest('You are already an educator');
  }

  if (user.educatorApplication?.status === 'pending') {
    throw ApiError.badRequest('You already have a pending application');
  }

  // Create educator application
  user.educatorApplication = {
    expertise: expertise || [],
    experience: experience || 0,
    bio: bio || '',
    qualifications: qualifications || [],
    portfolio: portfolio || '',
    linkedIn: linkedIn || '',
    motivation: motivation || '',
    status: 'pending',
    appliedAt: new Date(),
  };

  await user.save();

  ApiResponse.success(
    res,
    { application: user.educatorApplication },
    'Educator application submitted successfully. We will review your application and get back to you soon.'
  );
});