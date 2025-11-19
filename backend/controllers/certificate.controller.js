// Certificate controller
// ============================================
// CERTIFICATE CONTROLLER
// ============================================

const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const Certificate = require('../models/Certificate.model');
const Course = require('../models/Course.model');
const User = require('../models/User.model');
const { generateCertificatePDF } = require('../services/certificate.service');
const { getPagination } = require('../utils/helpers');

// ============================================
// @desc    Issue certificate
// @route   POST /api/v1/certificates
// @access  Private (Admin/System)
// ============================================
exports.issueCertificate = asyncHandler(async (req, res) => {
  const {
    user,
    certificateType,
    course,
    quiz,
    liveSession,
    skillExchange,
    courseName,
    instructorName,
    performance,
    skills,
  } = req.body;

  // Verify user exists
  const userData = await User.findById(user);
  if (!userData) {
    throw ApiError.notFound('User not found');
  }

  // Generate certificate PDF
  const certificateFile = await generateCertificatePDF({
    recipientName: userData.name,
    courseName,
    instructorName,
    completionDate: new Date(),
    performance,
  });

  // Create certificate
  const certificate = await Certificate.create({
    user,
    recipientName: userData.name,
    recipientEmail: userData.email,
    certificateType,
    course,
    quiz,
    liveSession,
    skillExchange,
    courseName,
    instructorName: instructorName || req.user?.name,
    instructor: req.user?._id,
    completionDate: new Date(),
    performance,
    skills,
    certificateFile,
    issuedBy: req.user?._id,
  });

  // Add certificate to user profile
  await User.findByIdAndUpdate(user, {
    $addToSet: { 'learnerProfile.certificates': certificate._id },
  });

  ApiResponse.created(res, certificate, 'Certificate issued successfully');
});

// ============================================
// @desc    Get all certificates (with filters)
// @route   GET /api/v1/certificates
// @access  Private
// ============================================
exports.getAllCertificates = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    certificateType,
    status,
    user,
    sort = '-issueDate',
  } = req.query;

  // Build query
  const query = {};

  if (certificateType) query.certificateType = certificateType;
  if (status) query.status = status;
  if (user) query.user = user;

  // Execute query
  const certificates = await Certificate.find(query)
    .populate('user', 'name email profileImage')
    .populate('course', 'title')
    .populate('instructor', 'name')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Certificate.countDocuments(query);

  const pagination = getPagination(page, limit, total);

  ApiResponse.paginated(res, certificates, pagination, 'Certificates retrieved successfully');
});

// ============================================
// @desc    Get single certificate by ID
// @route   GET /api/v1/certificates/:id
// @access  Public
// ============================================
exports.getCertificateById = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findById(req.params.id)
    .populate('user', 'name email profileImage')
    .populate('course', 'title instructor')
    .populate('instructor', 'name profileImage');

  if (!certificate) {
    throw ApiError.notFound('Certificate not found');
  }

  // Track view
  await certificate.trackView();

  ApiResponse.success(res, certificate, 'Certificate retrieved successfully');
});

// ============================================
// @desc    Get certificate by certificate ID
// @route   GET /api/v1/certificates/cert/:certificateId
// @access  Public
// ============================================
exports.getByCertificateId = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findOne({
    certificateId: req.params.certificateId,
  })
    .populate('user', 'name email profileImage')
    .populate('course', 'title');

  if (!certificate) {
    throw ApiError.notFound('Certificate not found');
  }

  await certificate.trackView();

  ApiResponse.success(res, certificate, 'Certificate retrieved successfully');
});

// ============================================
// @desc    Verify certificate
// @route   GET /api/v1/certificates/verify/:verificationCode
// @access  Public
// ============================================
exports.verifyCertificate = asyncHandler(async (req, res) => {
  const result = await Certificate.verifyByCode(req.params.verificationCode);

  if (!result.valid) {
    throw ApiError.notFound(result.message);
  }

  ApiResponse.success(res, result, 'Certificate verified successfully');
});

// ============================================
// @desc    Download certificate
// @route   GET /api/v1/certificates/:id/download
// @access  Private
// ============================================
exports.downloadCertificate = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findById(req.params.id);

  if (!certificate) {
    throw ApiError.notFound('Certificate not found');
  }

  // Check authorization
  if (
    certificate.user.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    throw ApiError.forbidden('Not authorized to download this certificate');
  }

  // Track download
  await certificate.trackDownload();

  // Redirect to certificate file URL or send file
  res.redirect(certificate.certificateFile.url);
});

// ============================================
// @desc    Get user's certificates
// @route   GET /api/v1/certificates/user/:userId
// @access  Public
// ============================================
exports.getUserCertificates = asyncHandler(async (req, res) => {
  const certificates = await Certificate.getCertificatesByUser(req.params.userId);

  ApiResponse.success(res, certificates, 'Certificates retrieved successfully');
});

// ============================================
// @desc    Get my certificates
// @route   GET /api/v1/certificates/my-certificates
// @access  Private
// ============================================
exports.getMyCertificates = asyncHandler(async (req, res) => {
  const certificates = await Certificate.getCertificatesByUser(req.user._id);

  ApiResponse.success(res, certificates, 'Your certificates retrieved successfully');
});

// ============================================
// @desc    Share certificate
// @route   POST /api/v1/certificates/:id/share
// @access  Private
// ============================================
exports.shareCertificate = asyncHandler(async (req, res) => {
  const { platform } = req.body;

  const certificate = await Certificate.findById(req.params.id);

  if (!certificate) {
    throw ApiError.notFound('Certificate not found');
  }

  // Check authorization
  if (certificate.user.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not authorized to share this certificate');
  }

  await certificate.shareOn(platform);

  const shareableLink = certificate.getShareableLink();

  ApiResponse.success(
    res,
    { shareableLink, platform },
    'Certificate shared successfully'
  );
});

// ============================================
// @desc    Revoke certificate
// @route   PUT /api/v1/certificates/:id/revoke
// @access  Private (Admin/Instructor)
// ============================================
exports.revokeCertificate = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const certificate = await Certificate.findById(req.params.id);

  if (!certificate) {
    throw ApiError.notFound('Certificate not found');
  }

  // Check authorization
  if (
    certificate.instructor?.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    throw ApiError.forbidden('Not authorized to revoke this certificate');
  }

  await certificate.revoke(req.user._id, reason);

  ApiResponse.success(res, null, 'Certificate revoked successfully');
});

// ============================================
// @desc    Reactivate certificate
// @route   PUT /api/v1/certificates/:id/reactivate
// @access  Private (Admin)
// ============================================
exports.reactivateCertificate = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findById(req.params.id);

  if (!certificate) {
    throw ApiError.notFound('Certificate not found');
  }

  await certificate.reactivate();

  ApiResponse.success(res, certificate, 'Certificate reactivated successfully');
});

// ============================================
// @desc    Get expiring certificates
// @route   GET /api/v1/certificates/expiring
// @access  Private (Admin)
// ============================================
exports.getExpiringCertificates = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;

  const certificates = await Certificate.getExpiringCertificates(parseInt(days));

  ApiResponse.success(res, certificates, 'Expiring certificates retrieved successfully');
});

// ============================================
// @desc    Get certificate statistics
// @route   GET /api/v1/certificates/statistics
// @access  Private (Admin)
// ============================================
exports.getCertificateStatistics = asyncHandler(async (req, res) => {
  const stats = await Certificate.getStatistics();

  ApiResponse.success(res, stats, 'Statistics retrieved successfully');
});

// ============================================
// @desc    Update certificate visibility
// @route   PUT /api/v1/certificates/:id/visibility
// @access  Private
// ============================================
exports.updateCertificateVisibility = asyncHandler(async (req, res) => {
  const { isPublic } = req.body;

  const certificate = await Certificate.findById(req.params.id);

  if (!certificate) {
    throw ApiError.notFound('Certificate not found');
  }

  // Check authorization
  if (certificate.user.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not authorized to update this certificate');
  }

  certificate.sharing.isPublic = isPublic;
  await certificate.save();

  ApiResponse.success(res, certificate, 'Visibility updated successfully');
});