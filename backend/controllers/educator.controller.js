// ============================================
// EDUCATOR CONTROLLER
// ============================================

const User = require('../models/User.model');
const Course = require('../models/Course.model');
const Review = require('../models/Review.model');
const Payment = require('../models/Payment.model');
const Certificate = require('../models/Certificate.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// ============================================
// GET EDUCATOR DASHBOARD STATS
// ============================================
/**
 * @desc    Get educator dashboard statistics
 * @route   GET /api/v1/educators/stats
 * @access  Private (Educator)
 */
const getEducatorStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get all courses by this educator
  const courses = await Course.find({ instructor: userId });
  const courseIds = courses.map(c => c._id);

  // Calculate total students
  const totalStudents = courses.reduce((acc, course) => {
    return acc + (course.enrolledStudents?.length || 0);
  }, 0);

  // Get total reviews
  const reviewsCount = await Review.countDocuments({ course: { $in: courseIds } });

  // Calculate average rating
  const reviewStats = await Review.aggregate([
    { $match: { course: { $in: courseIds } } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  const averageRating = reviewStats[0]?.averageRating || 0;

  // Get total earnings
  const earnings = await Payment.aggregate([
    {
      $match: {
        course: { $in: courseIds },
        status: 'completed'
      }
    },
    {
      $group: {
        _id: null,
        totalEarnings: { $sum: '$instructorEarnings' },
        totalRevenue: { $sum: '$amount' }
      }
    }
  ]);

  const totalEarnings = earnings[0]?.totalEarnings || 0;
  const totalRevenue = earnings[0]?.totalRevenue || 0;

  // Get this month's stats
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const monthlyPayments = await Payment.aggregate([
    {
      $match: {
        course: { $in: courseIds },
        status: 'completed',
        createdAt: { $gte: startOfMonth }
      }
    },
    {
      $group: {
        _id: null,
        monthlyEarnings: { $sum: '$instructorEarnings' },
        enrollmentsThisMonth: { $sum: 1 }
      }
    }
  ]);

  // Get pending payouts (if applicable)
  const pendingPayouts = await Payment.aggregate([
    {
      $match: {
        course: { $in: courseIds },
        status: 'completed',
        instructorPaid: { $ne: true }
      }
    },
    {
      $group: {
        _id: null,
        pendingAmount: { $sum: '$instructorEarnings' }
      }
    }
  ]);

  const stats = {
    totalCourses: courses.length,
    publishedCourses: courses.filter(c => c.status === 'published').length,
    draftCourses: courses.filter(c => c.status === 'draft').length,
    totalStudents,
    totalReviews: reviewsCount,
    averageRating: Math.round(averageRating * 10) / 10,
    totalEarnings,
    totalRevenue,
    monthlyEarnings: monthlyPayments[0]?.monthlyEarnings || 0,
    enrollmentsThisMonth: monthlyPayments[0]?.enrollmentsThisMonth || 0,
    pendingPayouts: pendingPayouts[0]?.pendingAmount || 0
  };

  res.status(200).json(new ApiResponse(200, stats, 'Educator stats retrieved successfully'));
});

// ============================================
// GET EDUCATOR ANALYTICS
// ============================================
/**
 * @desc    Get educator analytics data
 * @route   GET /api/v1/educators/analytics
 * @access  Private (Educator)
 */
const getEducatorAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { startDate, endDate, period = '30days' } = req.query;

  // Get courses
  const courses = await Course.find({ instructor: userId });
  const courseIds = courses.map(c => c._id);

  // Date range calculation
  let dateStart, dateEnd;
  dateEnd = endDate ? new Date(endDate) : new Date();
  
  if (startDate) {
    dateStart = new Date(startDate);
  } else {
    dateStart = new Date();
    switch(period) {
      case '7days':
        dateStart.setDate(dateStart.getDate() - 7);
        break;
      case '30days':
        dateStart.setDate(dateStart.getDate() - 30);
        break;
      case '90days':
        dateStart.setDate(dateStart.getDate() - 90);
        break;
      case '1year':
        dateStart.setFullYear(dateStart.getFullYear() - 1);
        break;
      default:
        dateStart.setDate(dateStart.getDate() - 30);
    }
  }

  // Get daily earnings
  const dailyEarnings = await Payment.aggregate([
    {
      $match: {
        course: { $in: courseIds },
        status: 'completed',
        createdAt: { $gte: dateStart, $lte: dateEnd }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        earnings: { $sum: '$instructorEarnings' },
        enrollments: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Get enrollments over time
  const enrollmentsByDate = await Payment.aggregate([
    {
      $match: {
        course: { $in: courseIds },
        status: 'completed',
        createdAt: { $gte: dateStart, $lte: dateEnd }
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          course: '$course'
        },
        count: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'courses',
        localField: '_id.course',
        foreignField: '_id',
        as: 'courseInfo'
      }
    },
    { $unwind: { path: '$courseInfo', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        date: '$_id.date',
        courseName: '$courseInfo.title',
        count: 1
      }
    },
    { $sort: { date: 1 } }
  ]);

  // Get course performance
  const coursePerformance = await Promise.all(
    courses.map(async (course) => {
      const reviews = await Review.find({ course: course._id });
      const avgRating = reviews.length > 0
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
        : 0;

      const earnings = await Payment.aggregate([
        {
          $match: {
            course: course._id,
            status: 'completed',
            createdAt: { $gte: dateStart, $lte: dateEnd }
          }
        },
        {
          $group: {
            _id: null,
            totalEarnings: { $sum: '$instructorEarnings' },
            enrollments: { $sum: 1 }
          }
        }
      ]);

      return {
        courseId: course._id,
        title: course.title,
        thumbnail: course.thumbnail,
        totalStudents: course.enrolledStudents?.length || 0,
        rating: Math.round(avgRating * 10) / 10,
        reviewsCount: reviews.length,
        earnings: earnings[0]?.totalEarnings || 0,
        periodEnrollments: earnings[0]?.enrollments || 0,
        status: course.status
      };
    })
  );

  // Get reviews distribution
  const reviewsDistribution = await Review.aggregate([
    { $match: { course: { $in: courseIds } } },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const analytics = {
    dateRange: { start: dateStart, end: dateEnd },
    dailyEarnings,
    enrollmentsByDate,
    coursePerformance,
    reviewsDistribution: {
      1: reviewsDistribution.find(r => r._id === 1)?.count || 0,
      2: reviewsDistribution.find(r => r._id === 2)?.count || 0,
      3: reviewsDistribution.find(r => r._id === 3)?.count || 0,
      4: reviewsDistribution.find(r => r._id === 4)?.count || 0,
      5: reviewsDistribution.find(r => r._id === 5)?.count || 0
    }
  };

  res.status(200).json(new ApiResponse(200, analytics, 'Educator analytics retrieved successfully'));
});

// ============================================
// GET EDUCATOR PROFILE
// ============================================
/**
 * @desc    Get educator profile
 * @route   GET /api/v1/educators/profile
 * @access  Private (Educator)
 */
const getEducatorProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId).select('-password');
  
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Get educator-specific stats
  const courses = await Course.find({ instructor: userId });
  const courseIds = courses.map(c => c._id);
  
  const totalStudents = courses.reduce((acc, course) => {
    return acc + (course.enrolledStudents?.length || 0);
  }, 0);

  const reviewStats = await Review.aggregate([
    { $match: { course: { $in: courseIds } } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  const profile = {
    ...user.toObject(),
    educatorStats: {
      totalCourses: courses.length,
      totalStudents,
      averageRating: Math.round((reviewStats[0]?.averageRating || 0) * 10) / 10,
      totalReviews: reviewStats[0]?.totalReviews || 0
    }
  };

  res.status(200).json(new ApiResponse(200, profile, 'Educator profile retrieved successfully'));
});

// ============================================
// UPDATE EDUCATOR PROFILE
// ============================================
/**
 * @desc    Update educator profile
 * @route   PUT /api/v1/educators/profile
 * @access  Private (Educator)
 */
const updateEducatorProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const {
    bio,
    expertise,
    experience,
    socialLinks,
    headline,
    website
  } = req.body;

  const updateData = {};
  
  if (bio) updateData['educatorProfile.bio'] = bio;
  if (expertise) updateData['educatorProfile.expertise'] = expertise;
  if (experience) updateData['educatorProfile.experience'] = experience;
  if (socialLinks) updateData['educatorProfile.socialLinks'] = socialLinks;
  if (headline) updateData['educatorProfile.headline'] = headline;
  if (website) updateData['educatorProfile.website'] = website;

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json(new ApiResponse(200, user, 'Educator profile updated successfully'));
});

// ============================================
// GET ALL STUDENTS
// ============================================
/**
 * @desc    Get all students across educator's courses
 * @route   GET /api/v1/educators/students
 * @access  Private (Educator)
 */
const getAllStudents = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 20, courseId, search } = req.query;

  // Get educator's courses
  let courseQuery = { instructor: userId };
  if (courseId) {
    courseQuery._id = courseId;
  }
  
  const courses = await Course.find(courseQuery).select('enrolledStudents title');
  
  // Collect all student IDs
  const studentIds = new Set();
  const studentCourses = new Map(); // Map to track which courses each student is in

  courses.forEach(course => {
    (course.enrolledStudents || []).forEach(studentId => {
      studentIds.add(studentId.toString());
      if (!studentCourses.has(studentId.toString())) {
        studentCourses.set(studentId.toString(), []);
      }
      studentCourses.get(studentId.toString()).push({
        courseId: course._id,
        courseTitle: course.title
      });
    });
  });

  // Build student query
  let studentQuery = { _id: { $in: Array.from(studentIds) } };
  
  if (search) {
    studentQuery.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const students = await User.find(studentQuery)
    .select('firstName lastName email avatar createdAt learnerProfile')
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  // Add enrolled courses info to each student
  const studentsWithCourses = students.map(student => ({
    ...student,
    enrolledCourses: studentCourses.get(student._id.toString()) || []
  }));

  const total = await User.countDocuments(studentQuery);

  res.status(200).json(new ApiResponse(200, {
    students: studentsWithCourses,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  }, 'Students retrieved successfully'));
});

// ============================================
// GET STUDENT DETAILS
// ============================================
/**
 * @desc    Get specific student details
 * @route   GET /api/v1/educators/students/:studentId
 * @access  Private (Educator)
 */
const getStudentDetails = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { studentId } = req.params;

  // Get educator's courses
  const courses = await Course.find({ instructor: userId });
  const courseIds = courses.map(c => c._id);

  // Verify student is enrolled in educator's courses
  const enrolledCourses = courses.filter(course => 
    course.enrolledStudents?.some(id => id.toString() === studentId)
  );

  if (enrolledCourses.length === 0) {
    throw new ApiError(404, 'Student not found in your courses');
  }

  // Get student info
  const student = await User.findById(studentId)
    .select('firstName lastName email avatar createdAt learnerProfile')
    .lean();

  if (!student) {
    throw new ApiError(404, 'Student not found');
  }

  // Get student's progress in educator's courses
  const courseProgress = await Promise.all(
    enrolledCourses.map(async (course) => {
      // Find student's progress record
      const progressData = course.studentProgress?.find(
        p => p.student?.toString() === studentId
      );

      // Get certificates
      const certificate = await Certificate.findOne({
        user: studentId,
        course: course._id
      });

      return {
        courseId: course._id,
        courseTitle: course.title,
        progress: progressData?.progress || 0,
        completedLessons: progressData?.completedLessons?.length || 0,
        totalLessons: course.sections?.reduce((acc, s) => acc + (s.lessons?.length || 0), 0) || 0,
        enrolledAt: progressData?.enrolledAt,
        lastAccessed: progressData?.lastAccessed,
        hasCertificate: !!certificate
      };
    })
  );

  // Get reviews student has left
  const reviews = await Review.find({
    user: studentId,
    course: { $in: courseIds }
  }).populate('course', 'title');

  res.status(200).json(new ApiResponse(200, {
    student,
    courseProgress,
    reviews
  }, 'Student details retrieved successfully'));
});

// ============================================
// GET ALL REVIEWS FOR EDUCATOR'S COURSES
// ============================================
/**
 * @desc    Get all reviews for educator's courses
 * @route   GET /api/v1/educators/reviews
 * @access  Private (Educator)
 */
const getAllReviews = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 20, courseId, rating } = req.query;

  // Get educator's courses
  let courseQuery = { instructor: userId };
  if (courseId) {
    courseQuery._id = courseId;
  }
  
  const courses = await Course.find(courseQuery).select('_id');
  const courseIds = courses.map(c => c._id);

  // Build review query
  let reviewQuery = { course: { $in: courseIds } };
  if (rating) {
    reviewQuery.rating = parseInt(rating);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const reviews = await Review.find(reviewQuery)
    .populate('user', 'firstName lastName avatar')
    .populate('course', 'title thumbnail')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Review.countDocuments(reviewQuery);

  // Get rating distribution
  const ratingDistribution = await Review.aggregate([
    { $match: { course: { $in: courseIds } } },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json(new ApiResponse(200, {
    reviews,
    ratingDistribution: {
      1: ratingDistribution.find(r => r._id === 1)?.count || 0,
      2: ratingDistribution.find(r => r._id === 2)?.count || 0,
      3: ratingDistribution.find(r => r._id === 3)?.count || 0,
      4: ratingDistribution.find(r => r._id === 4)?.count || 0,
      5: ratingDistribution.find(r => r._id === 5)?.count || 0
    },
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  }, 'Reviews retrieved successfully'));
});

// ============================================
// APPLY AS EDUCATOR
// ============================================
/**
 * @desc    Apply to become an educator
 * @route   POST /api/v1/educators/apply
 * @access  Private
 */
const applyAsEducator = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { expertise, experience, bio, portfolio, motivation } = req.body;

  const user = await User.findById(userId);
  
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Check if user is already an educator
  if (user.roles.includes('educator')) {
    throw new ApiError(400, 'You are already an educator');
  }

  // Check if application is pending
  if (user.educatorProfile?.applicationStatus === 'pending') {
    throw new ApiError(400, 'You already have a pending application');
  }

  // Update user with application data
  user.educatorProfile = {
    ...user.educatorProfile,
    expertise: expertise || [],
    experience: experience || '',
    bio: bio || '',
    portfolio: portfolio || '',
    motivation: motivation || '',
    applicationStatus: 'pending',
    appliedAt: new Date()
  };

  await user.save();

  res.status(200).json(new ApiResponse(200, {
    applicationStatus: 'pending',
    appliedAt: user.educatorProfile.appliedAt
  }, 'Application submitted successfully'));
});

// ============================================
// GET APPLICATION STATUS
// ============================================
/**
 * @desc    Get educator application status
 * @route   GET /api/v1/educators/application-status
 * @access  Private
 */
const getApplicationStatus = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId).select('roles educatorProfile');
  
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const isEducator = user.roles.includes('educator');
  const applicationStatus = user.educatorProfile?.applicationStatus || 'none';

  res.status(200).json(new ApiResponse(200, {
    isEducator,
    applicationStatus,
    appliedAt: user.educatorProfile?.appliedAt,
    approvedAt: user.educatorProfile?.approvedAt,
    rejectionReason: user.educatorProfile?.rejectionReason
  }, 'Application status retrieved successfully'));
});

// ============================================
// GET EDUCATOR'S COURSES
// ============================================
/**
 * @desc    Get all courses by educator
 * @route   GET /api/v1/educators/courses
 * @access  Private (Educator)
 */
const getEducatorCourses = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 10, status } = req.query;

  let query = { instructor: userId };
  if (status) {
    query.status = status;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const courses = await Course.find(query)
    .populate('category', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Add stats to each course
  const coursesWithStats = await Promise.all(
    courses.map(async (course) => {
      const reviewStats = await Review.aggregate([
        { $match: { course: course._id } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 }
          }
        }
      ]);

      const earnings = await Payment.aggregate([
        {
          $match: {
            course: course._id,
            status: 'completed'
          }
        },
        {
          $group: {
            _id: null,
            totalEarnings: { $sum: '$instructorEarnings' }
          }
        }
      ]);

      return {
        ...course.toObject(),
        stats: {
          enrolledStudents: course.enrolledStudents?.length || 0,
          averageRating: Math.round((reviewStats[0]?.averageRating || 0) * 10) / 10,
          totalReviews: reviewStats[0]?.totalReviews || 0,
          totalEarnings: earnings[0]?.totalEarnings || 0
        }
      };
    })
  );

  const total = await Course.countDocuments(query);

  res.status(200).json(new ApiResponse(200, {
    courses: coursesWithStats,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  }, 'Courses retrieved successfully'));
});

module.exports = {
  getEducatorStats,
  getEducatorAnalytics,
  getEducatorProfile,
  updateEducatorProfile,
  getAllStudents,
  getStudentDetails,
  getAllReviews,
  applyAsEducator,
  getApplicationStatus,
  getEducatorCourses
};
