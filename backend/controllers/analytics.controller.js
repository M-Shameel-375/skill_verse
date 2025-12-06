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
const Certificate = require('../models/Certificate.model');
const Badge = require('../models/Badge.model');
const PDFDocument = require('pdfkit');
const path = require('path');

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

// ============================================
// @desc    Export learner progress report as PDF
// @route   GET /api/v1/analytics/export/progress
// @access  Private
// ============================================
exports.exportProgressReport = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('learnerProfile.enrolledCourses', 'title thumbnail duration')
    .populate('learnerProfile.completedCourses', 'title completedAt')
    .populate('gamification.badges', 'name icon description');

  // Get user's certificates
  const certificates = await Certificate.find({ user: req.user._id })
    .populate('course', 'title')
    .sort({ issuedAt: -1 });

  // Get user's badges
  const userBadges = await Badge.find({ 
    _id: { $in: user.gamification?.badges || [] } 
  });

  // Create PDF document
  const doc = new PDFDocument({ 
    margin: 50,
    size: 'A4'
  });

  // Set response headers for PDF download
  const filename = `progress-report-${user.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  // Pipe PDF to response
  doc.pipe(res);

  // ============================================
  // PDF HEADER
  // ============================================
  doc.fontSize(28)
    .fillColor('#2563eb')
    .text('SkillVerse', { align: 'center' });
  
  doc.fontSize(18)
    .fillColor('#374151')
    .text('Learning Progress Report', { align: 'center' });
  
  doc.moveDown(0.5);
  doc.fontSize(12)
    .fillColor('#6b7280')
    .text(`Generated on: ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, { align: 'center' });

  doc.moveDown(2);

  // ============================================
  // USER INFO SECTION
  // ============================================
  doc.fontSize(16)
    .fillColor('#1f2937')
    .text('Learner Information', { underline: true });
  
  doc.moveDown(0.5);
  doc.fontSize(11)
    .fillColor('#374151')
    .text(`Name: ${user.name}`)
    .text(`Email: ${user.email}`)
    .text(`Member Since: ${new Date(user.createdAt).toLocaleDateString()}`)
    .text(`Current Level: ${user.gamification?.level || 1}`)
    .text(`Total Points: ${user.gamification?.points || 0}`);

  doc.moveDown(1.5);

  // ============================================
  // LEARNING STATISTICS
  // ============================================
  doc.fontSize(16)
    .fillColor('#1f2937')
    .text('Learning Statistics', { underline: true });
  
  doc.moveDown(0.5);

  const stats = [
    ['Enrolled Courses', user.learnerProfile?.enrolledCourses?.length || 0],
    ['Completed Courses', user.learnerProfile?.completedCourses?.length || 0],
    ['Certificates Earned', certificates.length],
    ['Badges Earned', userBadges.length],
    ['Learning Hours', user.learnerProfile?.learningHours || 0],
    ['Current Streak', `${user.learnerProfile?.currentStreak || 0} days`],
    ['Longest Streak', `${user.learnerProfile?.longestStreak || 0} days`],
  ];

  stats.forEach(([label, value]) => {
    doc.fontSize(11)
      .fillColor('#374151')
      .text(`${label}: `, { continued: true })
      .fillColor('#2563eb')
      .text(`${value}`);
  });

  doc.moveDown(1.5);

  // ============================================
  // ENROLLED COURSES
  // ============================================
  if (user.learnerProfile?.enrolledCourses?.length > 0) {
    doc.fontSize(16)
      .fillColor('#1f2937')
      .text('Enrolled Courses', { underline: true });
    
    doc.moveDown(0.5);

    user.learnerProfile.enrolledCourses.forEach((course, index) => {
      doc.fontSize(11)
        .fillColor('#374151')
        .text(`${index + 1}. ${course.title || 'Untitled Course'}`);
    });

    doc.moveDown(1.5);
  }

  // ============================================
  // COMPLETED COURSES
  // ============================================
  if (user.learnerProfile?.completedCourses?.length > 0) {
    doc.fontSize(16)
      .fillColor('#1f2937')
      .text('Completed Courses', { underline: true });
    
    doc.moveDown(0.5);

    user.learnerProfile.completedCourses.forEach((course, index) => {
      doc.fontSize(11)
        .fillColor('#374151')
        .text(`${index + 1}. ${course.title || 'Untitled Course'}`);
    });

    doc.moveDown(1.5);
  }

  // ============================================
  // CERTIFICATES
  // ============================================
  if (certificates.length > 0) {
    doc.fontSize(16)
      .fillColor('#1f2937')
      .text('Certificates Earned', { underline: true });
    
    doc.moveDown(0.5);

    certificates.forEach((cert, index) => {
      doc.fontSize(11)
        .fillColor('#374151')
        .text(`${index + 1}. ${cert.course?.title || cert.courseName || 'Certificate'}`)
        .fontSize(10)
        .fillColor('#6b7280')
        .text(`   Certificate ID: ${cert.certificateNumber || cert._id}`)
        .text(`   Issued: ${new Date(cert.issuedAt || cert.createdAt).toLocaleDateString()}`);
      doc.moveDown(0.3);
    });

    doc.moveDown(1);
  }

  // ============================================
  // BADGES
  // ============================================
  if (userBadges.length > 0) {
    doc.fontSize(16)
      .fillColor('#1f2937')
      .text('Badges Earned', { underline: true });
    
    doc.moveDown(0.5);

    userBadges.forEach((badge, index) => {
      doc.fontSize(11)
        .fillColor('#374151')
        .text(`${index + 1}. ${badge.name}`)
        .fontSize(10)
        .fillColor('#6b7280')
        .text(`   ${badge.description || ''}`);
      doc.moveDown(0.3);
    });

    doc.moveDown(1);
  }

  // ============================================
  // FOOTER
  // ============================================
  doc.moveDown(2);
  doc.fontSize(10)
    .fillColor('#9ca3af')
    .text('This report was automatically generated by SkillVerse.', { align: 'center' })
    .text('For questions, contact support@skillverse.com', { align: 'center' });

  // Finalize PDF
  doc.end();
});

// ============================================
// @desc    Export learner progress report as JSON
// @route   GET /api/v1/analytics/export/json
// @access  Private
// ============================================
exports.exportProgressJSON = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('learnerProfile.enrolledCourses', 'title duration category')
    .populate('learnerProfile.completedCourses', 'title completedAt')
    .populate('gamification.badges', 'name description');

  const certificates = await Certificate.find({ user: req.user._id })
    .populate('course', 'title')
    .sort({ issuedAt: -1 });

  const badges = await Badge.find({ 
    _id: { $in: user.gamification?.badges || [] } 
  });

  const report = {
    generatedAt: new Date().toISOString(),
    learner: {
      name: user.name,
      email: user.email,
      memberSince: user.createdAt,
      level: user.gamification?.level || 1,
      points: user.gamification?.points || 0,
    },
    statistics: {
      enrolledCourses: user.learnerProfile?.enrolledCourses?.length || 0,
      completedCourses: user.learnerProfile?.completedCourses?.length || 0,
      certificatesEarned: certificates.length,
      badgesEarned: badges.length,
      learningHours: user.learnerProfile?.learningHours || 0,
      currentStreak: user.learnerProfile?.currentStreak || 0,
      longestStreak: user.learnerProfile?.longestStreak || 0,
    },
    enrolledCourses: user.learnerProfile?.enrolledCourses?.map(c => ({
      id: c._id,
      title: c.title,
      category: c.category,
      duration: c.duration,
    })) || [],
    completedCourses: user.learnerProfile?.completedCourses?.map(c => ({
      id: c._id,
      title: c.title,
    })) || [],
    certificates: certificates.map(cert => ({
      id: cert._id,
      certificateNumber: cert.certificateNumber,
      courseName: cert.course?.title || cert.courseName,
      issuedAt: cert.issuedAt || cert.createdAt,
    })),
    badges: badges.map(badge => ({
      id: badge._id,
      name: badge.name,
      description: badge.description,
    })),
  };

  // Set headers for JSON download
  const filename = `progress-report-${user.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.json`;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  res.json(report);
});

// ============================================
// AGORA CONFIG
// ============================================
exports.agoraConfig = {
  appId: process.env.AGORA_APP_ID || 'your_agora_app_id',
  appCertificate: process.env.AGORA_APP_CERTIFICATE || 'your_agora_certificate',
};

module.exports = exports;
