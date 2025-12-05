// LiveSession controller
// ============================================
// LIVE SESSION CONTROLLER
// ============================================

const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const LiveSession = require('../models/LiveSession.model');
const User = require('../models/User.model');
const { getPagination } = require('../utils/helpers');
const { sendEmail } = require('../services/email.service');
const { generateAgoraToken, generateChannelName, getVideoServiceStatus, createMeetingRoom } = require('../services/video.service');

// ============================================
// @desc    Create new live session
// @route   POST /api/v1/live-sessions
// @access  Private (Educator/Admin)
// ============================================
exports.createLiveSession = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    sessionType,
    category,
    tags,
    level,
    scheduledAt,
    duration,
    timezone,
    maxParticipants,
    price,
    relatedCourse,
    agenda,
    materials,
  } = req.body;

  const session = await LiveSession.create({
    title,
    description,
    sessionType,
    category,
    tags,
    level,
    scheduledAt,
    duration,
    timezone,
    maxParticipants,
    price,
    isFree: price === 0,
    relatedCourse,
    agenda,
    materials,
    host: req.user._id,
    createdBy: req.user._id,
  });

  ApiResponse.created(res, session, 'Live session created successfully');
});

// ============================================
// @desc    Get all live sessions (with filters)
// @route   GET /api/v1/live-sessions
// @access  Public
// ============================================
exports.getAllLiveSessions = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    category,
    level,
    sessionType,
    status,
    search,
    sort = 'scheduledAt',
    upcoming,
  } = req.query;

  // Build query
  const query = { visibility: 'public' };

  if (category) query.category = category;
  if (level) query.level = level;
  if (sessionType) query.sessionType = sessionType;
  if (status) query.status = status;

  if (search) {
    query.$text = { $search: search };
  }

  if (upcoming === 'true') {
    query.scheduledAt = { $gte: new Date() };
    query.status = 'scheduled';
  }

  // Execute query
  const sessions = await LiveSession.find(query)
    .populate('host', 'name profileImage')
    .populate('coHosts', 'name profileImage')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await LiveSession.countDocuments(query);

  const pagination = getPagination(page, limit, total);

  ApiResponse.paginated(res, sessions, pagination, 'Live sessions retrieved successfully');
});

// ============================================
// @desc    Get single live session by ID
// @route   GET /api/v1/live-sessions/:id
// @access  Public
// ============================================
exports.getLiveSessionById = asyncHandler(async (req, res) => {
  const session = await LiveSession.findById(req.params.id)
    .populate('host', 'name profileImage bio educatorProfile')
    .populate('coHosts', 'name profileImage')
    .populate('relatedCourse', 'title thumbnail');

  if (!session) {
    throw ApiError.notFound('Live session not found');
  }

  // Increment views
  await session.incrementViews(true);

  // Check if user is registered
  let isRegistered = false;
  if (req.user) {
    isRegistered = session.isUserRegistered(req.user._id);
  }

  const sessionData = session.toObject();
  sessionData.isRegistered = isRegistered;

  ApiResponse.success(res, sessionData, 'Live session retrieved successfully');
});

// ============================================
// @desc    Update live session
// @route   PUT /api/v1/live-sessions/:id
// @access  Private (Host/Admin)
// ============================================
exports.updateLiveSession = asyncHandler(async (req, res) => {
  let session = await LiveSession.findById(req.params.id);

  if (!session) {
    throw ApiError.notFound('Live session not found');
  }

  // Check authorization
  if (
    session.host.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    throw ApiError.forbidden('Not authorized to update this session');
  }

  const allowedUpdates = [
    'title',
    'description',
    'sessionType',
    'category',
    'tags',
    'level',
    'scheduledAt',
    'duration',
    'timezone',
    'maxParticipants',
    'price',
    'agenda',
    'materials',
  ];

  const updates = {};
  Object.keys(req.body).forEach((key) => {
    if (allowedUpdates.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  updates.updatedBy = req.user._id;

  session = await LiveSession.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  ApiResponse.success(res, session, 'Live session updated successfully');
});

// ============================================
// @desc    Delete live session
// @route   DELETE /api/v1/live-sessions/:id
// @access  Private (Host/Admin)
// ============================================
exports.deleteLiveSession = asyncHandler(async (req, res) => {
  const session = await LiveSession.findById(req.params.id);

  if (!session) {
    throw ApiError.notFound('Live session not found');
  }

  // Check authorization
  if (
    session.host.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    throw ApiError.forbidden('Not authorized to delete this session');
  }

  await session.deleteOne();

  ApiResponse.success(res, null, 'Live session deleted successfully');
});

// ============================================
// @desc    Register for live session
// @route   POST /api/v1/live-sessions/:id/register
// @access  Private
// ============================================
exports.registerForSession = asyncHandler(async (req, res) => {
  const session = await LiveSession.findById(req.params.id);

  if (!session) {
    throw ApiError.notFound('Live session not found');
  }

  // Check if already registered
  if (session.isUserRegistered(req.user._id)) {
    throw ApiError.conflict('Already registered for this session');
  }

  // Add participant
  await session.addParticipant(req.user._id);

  // Send confirmation email
  const user = await User.findById(req.user._id);
  await sendEmail({
    to: user.email,
    subject: `Registration Confirmation - ${session.title}`,
    template: 'session-registration',
    data: {
      name: user.name,
      sessionTitle: session.title,
      scheduledAt: session.scheduledAt,
      joinUrl: `${process.env.FRONTEND_URL}/live-sessions/${session._id}/join`,
    },
  });

  ApiResponse.success(res, null, 'Registered successfully');
});

// ============================================
// @desc    Unregister from live session
// @route   DELETE /api/v1/live-sessions/:id/register
// @access  Private
// ============================================
exports.unregisterFromSession = asyncHandler(async (req, res) => {
  const session = await LiveSession.findById(req.params.id);

  if (!session) {
    throw ApiError.notFound('Live session not found');
  }

  // Check if registered
  if (!session.isUserRegistered(req.user._id)) {
    throw ApiError.badRequest('Not registered for this session');
  }

  // Remove participant
  await session.removeParticipant(req.user._id);

  ApiResponse.success(res, null, 'Unregistered successfully');
});

// ============================================
// @desc    Start live session
// @route   POST /api/v1/live-sessions/:id/start
// @access  Private (Host/CoHost)
// ============================================
exports.startSession = asyncHandler(async (req, res) => {
  const session = await LiveSession.findById(req.params.id);

  if (!session) {
    throw ApiError.notFound('Live session not found');
  }

  // Check authorization
  const isHost = session.host.toString() === req.user._id.toString();
  const isCoHost = session.coHosts.some(
    (coHost) => coHost.toString() === req.user._id.toString()
  );

  if (!isHost && !isCoHost) {
    throw ApiError.forbidden('Not authorized to start this session');
  }

  await session.startSession();

  // Notify participants
  // Implementation depends on notification service

  ApiResponse.success(res, session, 'Session started successfully');
});

// ============================================
// @desc    End live session
// @route   POST /api/v1/live-sessions/:id/end
// @access  Private (Host/CoHost)
// ============================================
exports.endSession = asyncHandler(async (req, res) => {
  const session = await LiveSession.findById(req.params.id);

  if (!session) {
    throw ApiError.notFound('Live session not found');
  }

  // Check authorization
  const isHost = session.host.toString() === req.user._id.toString();
  const isCoHost = session.coHosts.some(
    (coHost) => coHost.toString() === req.user._id.toString()
  );

  if (!isHost && !isCoHost) {
    throw ApiError.forbidden('Not authorized to end this session');
  }

  await session.endSession();

  ApiResponse.success(res, session, 'Session ended successfully');
});

// ============================================
// @desc    Cancel live session
// @route   POST /api/v1/live-sessions/:id/cancel
// @access  Private (Host/Admin)
// ============================================
exports.cancelSession = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const session = await LiveSession.findById(req.params.id);

  if (!session) {
    throw ApiError.notFound('Live session not found');
  }

  // Check authorization
  if (
    session.host.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    throw ApiError.forbidden('Not authorized to cancel this session');
  }

  await session.cancelSession(reason);

  // Notify all participants
  // Implementation depends on notification service

  ApiResponse.success(res, null, 'Session cancelled successfully');
});

// ============================================
// @desc    Postpone live session
// @route   POST /api/v1/live-sessions/:id/postpone
// @access  Private (Host/Admin)
// ============================================
exports.postponeSession = asyncHandler(async (req, res) => {
  const { newDate, reason } = req.body;

  const session = await LiveSession.findById(req.params.id);

  if (!session) {
    throw ApiError.notFound('Live session not found');
  }

  // Check authorization
  if (
    session.host.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    throw ApiError.forbidden('Not authorized to postpone this session');
  }

  await session.postponeSession(newDate, reason);

  ApiResponse.success(res, session, 'Session postponed successfully');
});

// ============================================
// @desc    Add feedback to session
// @route   POST /api/v1/live-sessions/:id/feedback
// @access  Private
// ============================================
exports.addFeedback = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const session = await LiveSession.findById(req.params.id);

  if (!session) {
    throw ApiError.notFound('Live session not found');
  }

  // Check if user attended
  if (!session.isUserRegistered(req.user._id)) {
    throw ApiError.forbidden('Only participants can provide feedback');
  }

  await session.addFeedback(req.user._id, rating, comment);

  ApiResponse.success(res, null, 'Feedback submitted successfully');
});

// ============================================
// @desc    Get upcoming sessions
// @route   GET /api/v1/live-sessions/upcoming
// @access  Public
// ============================================
exports.getUpcomingSessions = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const sessions = await LiveSession.getUpcomingSessions(parseInt(limit));

  ApiResponse.success(res, sessions, 'Upcoming sessions retrieved successfully');
});

// ============================================
// @desc    Get live sessions
// @route   GET /api/v1/live-sessions/live
// @access  Public
// ============================================
exports.getLiveSessions = asyncHandler(async (req, res) => {
  const sessions = await LiveSession.getLiveSessions();

  ApiResponse.success(res, sessions, 'Live sessions retrieved successfully');
});

// ============================================
// @desc    Get my sessions as host
// @route   GET /api/v1/live-sessions/my-sessions
// @access  Private (Educator)
// ============================================
exports.getMySessionsAsHost = asyncHandler(async (req, res) => {
  const sessions = await LiveSession.getSessionsByHost(req.user._id);

  ApiResponse.success(res, sessions, 'Sessions retrieved successfully');
});

// ============================================
// @desc    Get my registered sessions
// @route   GET /api/v1/live-sessions/registered
// @access  Private
// ============================================
exports.getMyRegisteredSessions = asyncHandler(async (req, res) => {
  const sessions = await LiveSession.find({
    'participants.user': req.user._id,
  })
    .populate('host', 'name profileImage')
    .sort('scheduledAt');

  ApiResponse.success(res, sessions, 'Registered sessions retrieved successfully');
});

// ============================================
// @desc    Add question during session
// @route   POST /api/v1/live-sessions/:id/questions
// @access  Private
// ============================================
exports.addQuestion = asyncHandler(async (req, res) => {
  const { question } = req.body;

  const session = await LiveSession.findById(req.params.id);

  if (!session) {
    throw ApiError.notFound('Live session not found');
  }

  // Check if user is registered
  if (!session.isUserRegistered(req.user._id)) {
    throw ApiError.forbidden('Only participants can ask questions');
  }

  session.questions.push({
    user: req.user._id,
    question,
  });

  await session.save();

  ApiResponse.created(res, null, 'Question added successfully');
});

// ============================================
// @desc    Answer question
// @route   PUT /api/v1/live-sessions/:id/questions/:questionId/answer
// @access  Private (Host/CoHost)
// ============================================
exports.answerQuestion = asyncHandler(async (req, res) => {
  const { answer } = req.body;

  const session = await LiveSession.findById(req.params.id);

  if (!session) {
    throw ApiError.notFound('Live session not found');
  }

  // Check authorization
  const isHost = session.host.toString() === req.user._id.toString();
  const isCoHost = session.coHosts.some(
    (coHost) => coHost.toString() === req.user._id.toString()
  );

  if (!isHost && !isCoHost) {
    throw ApiError.forbidden('Not authorized to answer questions');
  }

  const question = session.questions.id(req.params.questionId);

  if (!question) {
    throw ApiError.notFound('Question not found');
  }

  question.answer = answer;
  question.answeredBy = req.user._id;
  question.answeredAt = new Date();

  await session.save();

  ApiResponse.success(res, null, 'Question answered successfully');
});

// ============================================
// @desc    Create poll
// @route   POST /api/v1/live-sessions/:id/polls
// @access  Private (Host/CoHost)
// ============================================
exports.createPoll = asyncHandler(async (req, res) => {
  const { question, options } = req.body;

  const session = await LiveSession.findById(req.params.id);

  if (!session) {
    throw ApiError.notFound('Live session not found');
  }

  // Check authorization
  const isHost = session.host.toString() === req.user._id.toString();
  const isCoHost = session.coHosts.some(
    (coHost) => coHost.toString() === req.user._id.toString()
  );

  if (!isHost && !isCoHost) {
    throw ApiError.forbidden('Not authorized to create polls');
  }

  const poll = {
    question,
    options: options.map((text) => ({ text, votes: 0, voters: [] })),
  };

  session.polls.push(poll);
  await session.save();

  ApiResponse.created(res, poll, 'Poll created successfully');
});

// ============================================
// @desc    Vote on poll
// @route   POST /api/v1/live-sessions/:id/polls/:pollId/vote
// @access  Private
// ============================================
exports.voteOnPoll = asyncHandler(async (req, res) => {
  const { optionIndex } = req.body;

  const session = await LiveSession.findById(req.params.id);

  if (!session) {
    throw ApiError.notFound('Live session not found');
  }

  // Check if user is registered
  if (!session.isUserRegistered(req.user._id)) {
    throw ApiError.forbidden('Only participants can vote');
  }

  const poll = session.polls.id(req.params.pollId);

  if (!poll) {
    throw ApiError.notFound('Poll not found');
  }

  if (!poll.isActive) {
    throw ApiError.badRequest('Poll is no longer active');
  }

  // Check if already voted
  const hasVoted = poll.options.some((option) =>
    option.voters.includes(req.user._id)
  );

  if (hasVoted) {
    throw ApiError.conflict('Already voted on this poll');
  }

  // Add vote
  poll.options[optionIndex].votes += 1;
  poll.options[optionIndex].voters.push(req.user._id);

  await session.save();

  ApiResponse.success(res, null, 'Vote recorded successfully');
});

// ============================================
// @desc    Get popular sessions
// @route   GET /api/v1/live-sessions/popular
// @access  Public
// ============================================
exports.getPopularSessions = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const sessions = await LiveSession.getPopularSessions(parseInt(limit));

  ApiResponse.success(res, sessions, 'Popular sessions retrieved successfully');
});

// ============================================
// @desc    Get video token for live session
// @route   GET /api/v1/live-sessions/:id/video-token
// @access  Private (Registered participants or host)
// ============================================
exports.getVideoToken = asyncHandler(async (req, res) => {
  const session = await LiveSession.findById(req.params.id);

  if (!session) {
    throw ApiError.notFound('Live session not found');
  }

  // Check if session is active or about to start (within 15 minutes)
  const now = new Date();
  const sessionStart = new Date(session.scheduledAt);
  const fifteenMinutesBefore = new Date(sessionStart.getTime() - 15 * 60 * 1000);
  
  if (session.status !== 'live' && now < fifteenMinutesBefore) {
    throw ApiError.badRequest('Session has not started yet. Join 15 minutes before scheduled time.');
  }

  // Determine user role
  const isHost = session.host.toString() === req.user._id.toString();
  const isCoHost = session.coHosts?.some(
    (coHost) => coHost.toString() === req.user._id.toString()
  );
  const isRegistered = session.isUserRegistered?.(req.user._id) || 
    session.participants?.some(p => p.user?.toString() === req.user._id.toString());

  if (!isHost && !isCoHost && !isRegistered) {
    throw ApiError.forbidden('You must register for this session to join');
  }

  // Determine role for token
  const role = isHost || isCoHost ? 'host' : 'audience';
  
  // Generate channel name and token
  const channelName = generateChannelName(session._id.toString());
  const tokenInfo = generateAgoraToken(channelName, 0, role);

  // Return token info along with session details
  ApiResponse.success(res, {
    ...tokenInfo,
    sessionId: session._id,
    sessionTitle: session.title,
    isHost,
    isCoHost,
    meetingLink: session.meetingLink, // Fallback external link
    streamingConfig: session.streamingConfig,
  }, 'Video token generated successfully');
});

// ============================================
// @desc    Get video service status
// @route   GET /api/v1/live-sessions/video-status
// @access  Private (Educator/Admin)
// ============================================
exports.getVideoStatus = asyncHandler(async (req, res) => {
  const status = getVideoServiceStatus();

  ApiResponse.success(res, status, 'Video service status retrieved');
});

// ============================================
// @desc    Create/update meeting room for session
// @route   POST /api/v1/live-sessions/:id/meeting-room
// @access  Private (Host only)
// ============================================
exports.createMeetingRoomForSession = asyncHandler(async (req, res) => {
  const session = await LiveSession.findById(req.params.id);

  if (!session) {
    throw ApiError.notFound('Live session not found');
  }

  // Only host can create meeting room
  if (session.host.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Only the host can create a meeting room');
  }

  // Generate meeting room
  const roomInfo = createMeetingRoom(session._id.toString(), req.user._id.toString());

  // Update session with streaming config
  session.streamingConfig = {
    ...session.streamingConfig,
    provider: 'agora',
    channelName: roomInfo.channelName,
    isConfigured: !roomInfo.useFallback,
  };

  await session.save();

  ApiResponse.success(res, {
    ...roomInfo,
    sessionId: session._id,
  }, 'Meeting room created successfully');
});

// ============================================
// @desc    Set external meeting link (fallback)
// @route   PUT /api/v1/live-sessions/:id/meeting-link
// @access  Private (Host only)
// ============================================
exports.setMeetingLink = asyncHandler(async (req, res) => {
  const { meetingLink, platform } = req.body;

  if (!meetingLink) {
    throw ApiError.badRequest('Meeting link is required');
  }

  const session = await LiveSession.findById(req.params.id);

  if (!session) {
    throw ApiError.notFound('Live session not found');
  }

  // Only host can set meeting link
  if (session.host.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Only the host can set meeting link');
  }

  session.meetingLink = meetingLink;
  session.streamingConfig = {
    ...session.streamingConfig,
    provider: platform || 'custom',
    externalLink: meetingLink,
    isConfigured: true,
  };

  await session.save();

  ApiResponse.success(res, {
    meetingLink: session.meetingLink,
    streamingConfig: session.streamingConfig,
  }, 'Meeting link updated successfully');
});