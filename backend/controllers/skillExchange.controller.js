// SkillExchange controller
// ============================================
// SKILL EXCHANGE CONTROLLER
// ============================================

const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const SkillExchange = require('../models/SkillExchange.model');
const User = require('../models/User.model');
const { getPagination } = require('../utils/helpers');
const { sendEmail } = require('../services/email.service');

// ============================================
// @desc    Create skill exchange request
// @route   POST /api/v1/skill-exchanges
// @access  Private
// ============================================
exports.createSkillExchange = asyncHandler(async (req, res) => {
  const {
    provider,
    offeredSkill,
    requestedSkill,
    title,
    description,
    objectives,
    proposedSchedule,
    estimatedDuration,
    preferredPlatform,
  } = req.body;

  // Check if provider exists
  const providerUser = await User.findById(provider);
  if (!providerUser) {
    throw ApiError.notFound('Provider user not found');
  }

  // Create skill exchange
  const skillExchange = await SkillExchange.create({
    requester: req.user._id,
    provider,
    offeredSkill,
    requestedSkill,
    title,
    description,
    objectives,
    proposedSchedule,
    estimatedDuration,
    preferredPlatform: preferredPlatform || 'zoom',
  });

  // Send notification email to provider
  await sendEmail({
    to: providerUser.email,
    subject: 'New Skill Exchange Request',
    template: 'skill-exchange-request',
    data: {
      name: providerUser.name,
      requesterName: req.user.name,
      offeredSkill: offeredSkill.name,
      requestedSkill: requestedSkill.name,
      exchangeUrl: `${process.env.FRONTEND_URL}/skill-exchanges/${skillExchange._id}`,
    },
  });

  ApiResponse.created(res, skillExchange, 'Skill exchange request created successfully');
});

// ============================================
// @desc    Get all skill exchanges (with filters)
// @route   GET /api/v1/skill-exchanges
// @access  Private
// ============================================
exports.getAllSkillExchanges = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    offeredSkill,
    requestedSkill,
    sort = '-createdAt',
  } = req.query;

  // Build query
  const query = {
    $or: [{ requester: req.user._id }, { provider: req.user._id }],
  };

  if (status) {
    query.status = status;
  }

  if (offeredSkill) {
    query['offeredSkill.name'] = { $regex: offeredSkill, $options: 'i' };
  }

  if (requestedSkill) {
    query['requestedSkill.name'] = { $regex: requestedSkill, $options: 'i' };
  }

  // Execute query
  const exchanges = await SkillExchange.find(query)
    .populate('requester', 'name profileImage skills')
    .populate('provider', 'name profileImage skills')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await SkillExchange.countDocuments(query);

  const pagination = getPagination(page, limit, total);

  ApiResponse.paginated(res, exchanges, pagination, 'Skill exchanges retrieved successfully');
});

// ============================================
// @desc    Get single skill exchange by ID
// @route   GET /api/v1/skill-exchanges/:id
// @access  Private
// ============================================
exports.getSkillExchangeById = asyncHandler(async (req, res) => {
  const exchange = await SkillExchange.findById(req.params.id)
    .populate('requester', 'name profileImage bio skills')
    .populate('provider', 'name profileImage bio skills');

  if (!exchange) {
    throw ApiError.notFound('Skill exchange not found');
  }

  // Check authorization
  const isParticipant =
    exchange.requester._id.toString() === req.user._id.toString() ||
    exchange.provider._id.toString() === req.user._id.toString();

  if (!isParticipant && req.user.role !== 'admin') {
    throw ApiError.forbidden('Not authorized to view this exchange');
  }

  ApiResponse.success(res, exchange, 'Skill exchange retrieved successfully');
});

// ============================================
// @desc    Update skill exchange
// @route   PUT /api/v1/skill-exchanges/:id
// @access  Private
// ============================================
exports.updateSkillExchange = asyncHandler(async (req, res) => {
  let exchange = await SkillExchange.findById(req.params.id);

  if (!exchange) {
    throw ApiError.notFound('Skill exchange not found');
  }

  // Check authorization
  const isParticipant =
    exchange.requester.toString() === req.user._id.toString() ||
    exchange.provider.toString() === req.user._id.toString();

  if (!isParticipant) {
    throw ApiError.forbidden('Not authorized to update this exchange');
  }

  const allowedUpdates = [
    'title',
    'description',
    'objectives',
    'proposedSchedule',
    'agreedSchedule',
    'estimatedDuration',
    'preferredPlatform',
    'meetingLink',
  ];

  const updates = {};
  Object.keys(req.body).forEach((key) => {
    if (allowedUpdates.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  exchange = await SkillExchange.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  ApiResponse.success(res, exchange, 'Skill exchange updated successfully');
});

// ============================================
// @desc    Accept skill exchange request
// @route   POST /api/v1/skill-exchanges/:id/accept
// @access  Private
// ============================================
exports.acceptSkillExchange = asyncHandler(async (req, res) => {
  const exchange = await SkillExchange.findById(req.params.id);

  if (!exchange) {
    throw ApiError.notFound('Skill exchange not found');
  }

  // Check if user is the provider
  if (exchange.provider.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Only the provider can accept this request');
  }

  if (exchange.status !== 'pending') {
    throw ApiError.badRequest('This request has already been processed');
  }

  await exchange.acceptRequest();

  // Send notification to requester
  const requester = await User.findById(exchange.requester);
  await sendEmail({
    to: requester.email,
    subject: 'Skill Exchange Request Accepted',
    template: 'skill-exchange-accepted',
    data: {
      name: requester.name,
      providerName: req.user.name,
      exchangeUrl: `${process.env.FRONTEND_URL}/skill-exchanges/${exchange._id}`,
    },
  });

  ApiResponse.success(res, exchange, 'Skill exchange request accepted');
});

// ============================================
// @desc    Reject skill exchange request
// @route   POST /api/v1/skill-exchanges/:id/reject
// @access  Private
// ============================================
exports.rejectSkillExchange = asyncHandler(async (req, res) => {
  const exchange = await SkillExchange.findById(req.params.id);

  if (!exchange) {
    throw ApiError.notFound('Skill exchange not found');
  }

  // Check if user is the provider
  if (exchange.provider.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Only the provider can reject this request');
  }

  if (exchange.status !== 'pending') {
    throw ApiError.badRequest('This request has already been processed');
  }

  await exchange.rejectRequest();

  ApiResponse.success(res, null, 'Skill exchange request rejected');
});

// ============================================
// @desc    Start skill exchange
// @route   POST /api/v1/skill-exchanges/:id/start
// @access  Private
// ============================================
exports.startSkillExchange = asyncHandler(async (req, res) => {
  const exchange = await SkillExchange.findById(req.params.id);

  if (!exchange) {
    throw ApiError.notFound('Skill exchange not found');
  }

  // Check authorization
  const isParticipant =
    exchange.requester.toString() === req.user._id.toString() ||
    exchange.provider.toString() === req.user._id.toString();

  if (!isParticipant) {
    throw ApiError.forbidden('Not authorized to start this exchange');
  }

  await exchange.startExchange();

  ApiResponse.success(res, exchange, 'Skill exchange started successfully');
});

// ============================================
// @desc    Complete skill exchange
// @route   POST /api/v1/skill-exchanges/:id/complete
// @access  Private
// ============================================
exports.completeSkillExchange = asyncHandler(async (req, res) => {
  const exchange = await SkillExchange.findById(req.params.id);

  if (!exchange) {
    throw ApiError.notFound('Skill exchange not found');
  }

  // Check authorization
  const isParticipant =
    exchange.requester.toString() === req.user._id.toString() ||
    exchange.provider.toString() === req.user._id.toString();

  if (!isParticipant) {
    throw ApiError.forbidden('Not authorized to complete this exchange');
  }

  await exchange.completeExchange();

  // Update user profiles
  await User.findByIdAndUpdate(exchange.requester, {
    $inc: { 'skillExchangeProfile.completedExchanges': 1 },
  });

  await User.findByIdAndUpdate(exchange.provider, {
    $inc: { 'skillExchangeProfile.completedExchanges': 1 },
  });

  ApiResponse.success(res, exchange, 'Skill exchange completed successfully');
});

// ============================================
// @desc    Cancel skill exchange
// @route   POST /api/v1/skill-exchanges/:id/cancel
// @access  Private
// ============================================
exports.cancelSkillExchange = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const exchange = await SkillExchange.findById(req.params.id);

  if (!exchange) {
    throw ApiError.notFound('Skill exchange not found');
  }

  // Check authorization
  const isParticipant =
    exchange.requester.toString() === req.user._id.toString() ||
    exchange.provider.toString() === req.user._id.toString();

  if (!isParticipant) {
    throw ApiError.forbidden('Not authorized to cancel this exchange');
  }

  await exchange.cancelExchange(req.user._id, reason);

  ApiResponse.success(res, null, 'Skill exchange cancelled successfully');
});

// ============================================
// @desc    Add message to exchange
// @route   POST /api/v1/skill-exchanges/:id/messages
// @access  Private
// ============================================
exports.addMessage = asyncHandler(async (req, res) => {
  const { message, attachments } = req.body;

  const exchange = await SkillExchange.findById(req.params.id);

  if (!exchange) {
    throw ApiError.notFound('Skill exchange not found');
  }

  // Check authorization
  const isParticipant =
    exchange.requester.toString() === req.user._id.toString() ||
    exchange.provider.toString() === req.user._id.toString();

  if (!isParticipant) {
    throw ApiError.forbidden('Not authorized to send messages');
  }

  await exchange.addMessage(req.user._id, message, attachments);

  ApiResponse.created(res, null, 'Message sent successfully');
});

// ============================================
// @desc    Mark messages as read
// @route   PUT /api/v1/skill-exchanges/:id/messages/read
// @access  Private
// ============================================
exports.markMessagesAsRead = asyncHandler(async (req, res) => {
  const exchange = await SkillExchange.findById(req.params.id);

  if (!exchange) {
    throw ApiError.notFound('Skill exchange not found');
  }

  await exchange.markMessagesAsRead(req.user._id);

  ApiResponse.success(res, null, 'Messages marked as read');
});

// ============================================
// @desc    Add session
// @route   POST /api/v1/skill-exchanges/:id/sessions
// @access  Private
// ============================================
exports.addSession = asyncHandler(async (req, res) => {
  const { scheduledAt, topic, notes } = req.body;

  const exchange = await SkillExchange.findById(req.params.id);

  if (!exchange) {
    throw ApiError.notFound('Skill exchange not found');
  }

  // Check authorization
  const isParticipant =
    exchange.requester.toString() === req.user._id.toString() ||
    exchange.provider.toString() === req.user._id.toString();

  if (!isParticipant) {
    throw ApiError.forbidden('Not authorized to add sessions');
  }

  await exchange.addSession({
    scheduledAt,
    topic,
    notes,
    status: 'scheduled',
  });

  ApiResponse.created(res, null, 'Session added successfully');
});

// ============================================
// @desc    Complete session
// @route   PUT /api/v1/skill-exchanges/:id/sessions/:sessionId/complete
// @access  Private
// ============================================
exports.completeSession = asyncHandler(async (req, res) => {
  const { duration, notes } = req.body;

  const exchange = await SkillExchange.findById(req.params.id);

  if (!exchange) {
    throw ApiError.notFound('Skill exchange not found');
  }

  // Check authorization
  const isParticipant =
    exchange.requester.toString() === req.user._id.toString() ||
    exchange.provider.toString() === req.user._id.toString();

  if (!isParticipant) {
    throw ApiError.forbidden('Not authorized to complete sessions');
  }

  await exchange.completeSession(req.params.sessionId, duration, notes);

  ApiResponse.success(res, null, 'Session completed successfully');
});

// ============================================
// @desc    Add feedback
// @route   POST /api/v1/skill-exchanges/:id/feedback
// @access  Private
// ============================================
exports.addFeedback = asyncHandler(async (req, res) => {
  const { rating, comment, skills, wouldRecommend } = req.body;

  const exchange = await SkillExchange.findById(req.params.id);

  if (!exchange) {
    throw ApiError.notFound('Skill exchange not found');
  }

  // Check authorization
  const isParticipant =
    exchange.requester.toString() === req.user._id.toString() ||
    exchange.provider.toString() === req.user._id.toString();

  if (!isParticipant) {
    throw ApiError.forbidden('Not authorized to provide feedback');
  }

  if (exchange.status !== 'completed') {
    throw ApiError.badRequest('Can only provide feedback after completion');
  }

  await exchange.addFeedback(req.user._id, rating, comment, skills, wouldRecommend);

  // Update user's average rating
  const otherUserId =
    exchange.requester.toString() === req.user._id.toString()
      ? exchange.provider
      : exchange.requester;

  const allExchanges = await SkillExchange.find({
    $or: [{ requester: otherUserId }, { provider: otherUserId }],
    status: 'completed',
  });

  let totalRating = 0;
  let count = 0;

  allExchanges.forEach((ex) => {
    if (ex.feedback.requesterFeedback?.rating) {
      totalRating += ex.feedback.requesterFeedback.rating;
      count++;
    }
    if (ex.feedback.providerFeedback?.rating) {
      totalRating += ex.feedback.providerFeedback.rating;
      count++;
    }
  });

  if (count > 0) {
    await User.findByIdAndUpdate(otherUserId, {
      'skillExchangeProfile.rating.average': totalRating / count,
      'skillExchangeProfile.rating.count': count,
    });
  }

  ApiResponse.success(res, null, 'Feedback submitted successfully');
});

// ============================================
// @desc    Endorse skill
// @route   POST /api/v1/skill-exchanges/:id/endorse
// @access  Private
// ============================================
exports.endorseSkill = asyncHandler(async (req, res) => {
  const exchange = await SkillExchange.findById(req.params.id);

  if (!exchange) {
    throw ApiError.notFound('Skill exchange not found');
  }

  // Check authorization
  const isParticipant =
    exchange.requester.toString() === req.user._id.toString() ||
    exchange.provider.toString() === req.user._id.toString();

  if (!isParticipant) {
    throw ApiError.forbidden('Not authorized to endorse');
  }

  if (exchange.status !== 'completed') {
    throw ApiError.badRequest('Can only endorse after completion');
  }

  await exchange.endorseSkill(req.user._id);

  ApiResponse.success(res, null, 'Skill endorsed successfully');
});

// ============================================
// @desc    Update progress
// @route   PUT /api/v1/skill-exchanges/:id/progress
// @access  Private
// ============================================
exports.updateProgress = asyncHandler(async (req, res) => {
  const { progress } = req.body;

  const exchange = await SkillExchange.findById(req.params.id);

  if (!exchange) {
    throw ApiError.notFound('Skill exchange not found');
  }

  // Check authorization
  const isParticipant =
    exchange.requester.toString() === req.user._id.toString() ||
    exchange.provider.toString() === req.user._id.toString();

  if (!isParticipant) {
    throw ApiError.forbidden('Not authorized to update progress');
  }

  await exchange.updateProgress(req.user._id, progress);

  ApiResponse.success(res, { progress: exchange.progress }, 'Progress updated successfully');
});

// ============================================
// @desc    Agree to terms
// @route   POST /api/v1/skill-exchanges/:id/agree-terms
// @access  Private
// ============================================
exports.agreeToTerms = asyncHandler(async (req, res) => {
  const exchange = await SkillExchange.findById(req.params.id);

  if (!exchange) {
    throw ApiError.notFound('Skill exchange not found');
  }

  // Check authorization
  const isParticipant =
    exchange.requester.toString() === req.user._id.toString() ||
    exchange.provider.toString() === req.user._id.toString();

  if (!isParticipant) {
    throw ApiError.forbidden('Not authorized');
  }

  await exchange.agreeToTerms(req.user._id);

  ApiResponse.success(res, null, 'Terms agreed successfully');
});

// ============================================
// @desc    Raise dispute
// @route   POST /api/v1/skill-exchanges/:id/dispute
// @access  Private
// ============================================
exports.raiseDispute = asyncHandler(async (req, res) => {
  const { reason, description } = req.body;

  const exchange = await SkillExchange.findById(req.params.id);

  if (!exchange) {
    throw ApiError.notFound('Skill exchange not found');
  }

  // Check authorization
  const isParticipant =
    exchange.requester.toString() === req.user._id.toString() ||
    exchange.provider.toString() === req.user._id.toString();

  if (!isParticipant) {
    throw ApiError.forbidden('Not authorized to raise dispute');
  }

  await exchange.raiseDispute(req.user._id, reason, description);

  ApiResponse.success(res, null, 'Dispute raised successfully');
});

// ============================================
// @desc    Get pending requests for user
// @route   GET /api/v1/skill-exchanges/pending
// @access  Private
// ============================================
exports.getPendingRequests = asyncHandler(async (req, res) => {
  const requests = await SkillExchange.getPendingRequests(req.user._id);

  ApiResponse.success(res, requests, 'Pending requests retrieved successfully');
});

// ============================================
// @desc    Get active exchanges for user
// @route   GET /api/v1/skill-exchanges/active
// @access  Private
// ============================================
exports.getActiveExchanges = asyncHandler(async (req, res) => {
  const exchanges = await SkillExchange.getActiveExchanges(req.user._id);

  ApiResponse.success(res, exchanges, 'Active exchanges retrieved successfully');
});

// ============================================
// @desc    Get completed exchanges for user
// @route   GET /api/v1/skill-exchanges/completed
// @access  Private
// ============================================
exports.getCompletedExchanges = asyncHandler(async (req, res) => {
  const exchanges = await SkillExchange.getCompletedExchanges(req.user._id);

  ApiResponse.success(res, exchanges, 'Completed exchanges retrieved successfully');
});

// ============================================
// @desc    Find matches for skill exchange
// @route   GET /api/v1/skill-exchanges/matches
// @access  Private
// ============================================
exports.findMatches = asyncHandler(async (req, res) => {
  const { offeredSkill, desiredSkill } = req.query;

  if (!offeredSkill || !desiredSkill) {
    throw ApiError.badRequest('Both offeredSkill and desiredSkill are required');
  }

  const matches = await SkillExchange.findMatches(
    req.user._id,
    offeredSkill,
    desiredSkill
  );

  ApiResponse.success(res, matches, 'Matches found successfully');
});

// ============================================
// @desc    Add shared resource
// @route   POST /api/v1/skill-exchanges/:id/resources
// @access  Private
// ============================================
exports.addSharedResource = asyncHandler(async (req, res) => {
  const { title, description, type, url } = req.body;

  const exchange = await SkillExchange.findById(req.params.id);

  if (!exchange) {
    throw ApiError.notFound('Skill exchange not found');
  }

  // Check authorization
  const isParticipant =
    exchange.requester.toString() === req.user._id.toString() ||
    exchange.provider.toString() === req.user._id.toString();

  if (!isParticipant) {
    throw ApiError.forbidden('Not authorized to add resources');
  }

  exchange.sharedResources.push({
    sharedBy: req.user._id,
    title,
    description,
    type,
    url: url || (req.file ? req.file.path : null),
    publicId: req.file ? req.file.filename : null,
    size: req.file ? req.file.size : null,
  });

  await exchange.save();

  ApiResponse.created(res, null, 'Resource added successfully');
});