// ============================================
// DISPUTE CONTROLLER
// ============================================

const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const Dispute = require('../models/Dispute.model');
const User = require('../models/User.model');
const notificationService = require('../services/notification.service');

// ============================================
// USER ENDPOINTS
// ============================================

// @desc    Create a new dispute
// @route   POST /api/v1/disputes
// @access  Private
exports.createDispute = asyncHandler(async (req, res) => {
  const {
    type,
    category,
    title,
    description,
    reportedUserId,
    relatedEntityType,
    relatedEntityId,
    evidence,
  } = req.body;

  const reporter = req.user._id;

  // Validate
  if (!type || !title || !description) {
    throw new ApiError(400, 'Type, title, and description are required');
  }

  // Create dispute
  const dispute = await Dispute.create({
    reporter,
    reportedUser: reportedUserId || null,
    type,
    category: category || 'other',
    title,
    description,
    evidence: evidence || [],
    relatedEntity: relatedEntityType && relatedEntityId ? {
      entityType: relatedEntityType,
      entityId: relatedEntityId,
    } : undefined,
    priority: determinePriority(type, category),
  });

  // Notify admins
  const admins = await User.find({ role: 'Admin' }).select('_id');
  for (const admin of admins) {
    await notificationService.createNotification({
      recipient: admin._id,
      type: 'system',
      title: 'New Dispute Submitted',
      message: `A new ${type} dispute has been submitted: ${title}`,
      data: {
        disputeId: dispute._id,
        disputeNumber: dispute.disputeNumber,
      },
    });
  }

  res.status(201).json(
    new ApiResponse(201, dispute, 'Dispute submitted successfully')
  );
});

// @desc    Get my disputes
// @route   GET /api/v1/disputes/my
// @access  Private
exports.getMyDisputes = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { status, page = 1, limit = 10 } = req.query;

  const query = {
    $or: [{ reporter: userId }, { reportedUser: userId }],
  };

  if (status) {
    query.status = status;
  }

  const disputes = await Dispute.find(query)
    .populate('reporter', 'name email avatar')
    .populate('reportedUser', 'name email avatar')
    .populate('assignedTo', 'name')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Dispute.countDocuments(query);

  res.status(200).json(
    new ApiResponse(200, {
      disputes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    }, 'Disputes retrieved successfully')
  );
});

// @desc    Get dispute by ID
// @route   GET /api/v1/disputes/:id
// @access  Private
exports.getDisputeById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const isAdmin = req.user.role === 'Admin';

  const dispute = await Dispute.findById(id)
    .populate('reporter', 'name email avatar')
    .populate('reportedUser', 'name email avatar')
    .populate('assignedTo', 'name email')
    .populate('resolution.resolvedBy', 'name')
    .populate('messages.sender', 'name avatar')
    .populate('adminNotes.admin', 'name');

  if (!dispute) {
    throw new ApiError(404, 'Dispute not found');
  }

  // Check access
  if (!isAdmin && 
      dispute.reporter._id.toString() !== userId.toString() && 
      dispute.reportedUser?._id?.toString() !== userId.toString()) {
    throw new ApiError(403, 'Access denied');
  }

  // Filter out internal messages for non-admins
  if (!isAdmin) {
    dispute.messages = dispute.messages.filter(m => !m.isInternal);
    dispute.adminNotes = []; // Hide admin notes
  }

  res.status(200).json(
    new ApiResponse(200, dispute, 'Dispute retrieved successfully')
  );
});

// @desc    Add message to dispute
// @route   POST /api/v1/disputes/:id/messages
// @access  Private
exports.addDisputeMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { message, attachments } = req.body;
  const userId = req.user._id;
  const isAdmin = req.user.role === 'Admin';

  const dispute = await Dispute.findById(id);

  if (!dispute) {
    throw new ApiError(404, 'Dispute not found');
  }

  // Check access
  const isReporter = dispute.reporter.toString() === userId.toString();
  const isReported = dispute.reportedUser?.toString() === userId.toString();

  if (!isAdmin && !isReporter && !isReported) {
    throw new ApiError(403, 'Access denied');
  }

  // Determine sender role
  let senderRole = 'admin';
  if (isReporter) senderRole = 'reporter';
  else if (isReported) senderRole = 'reported';

  await dispute.addMessage(userId, message, senderRole, false, attachments);

  // Notify other parties
  const notifyUsers = [];
  if (!isReporter) notifyUsers.push(dispute.reporter);
  if (!isReported && dispute.reportedUser) notifyUsers.push(dispute.reportedUser);
  if (!isAdmin && dispute.assignedTo) notifyUsers.push(dispute.assignedTo);

  for (const recipientId of notifyUsers) {
    await notificationService.createNotification({
      recipient: recipientId,
      type: 'system',
      title: 'New Message in Dispute',
      message: `New message in dispute ${dispute.disputeNumber}`,
      data: { disputeId: dispute._id },
    });
  }

  res.status(200).json(
    new ApiResponse(200, dispute, 'Message added successfully')
  );
});

// ============================================
// ADMIN ENDPOINTS
// ============================================

// @desc    Get all disputes (Admin)
// @route   GET /api/v1/disputes/admin/all
// @access  Private (Admin)
exports.getAllDisputes = asyncHandler(async (req, res) => {
  const { 
    status, 
    type, 
    priority, 
    assignedTo, 
    page = 1, 
    limit = 20,
    search,
  } = req.query;

  const query = {};

  if (status) query.status = status;
  if (type) query.type = type;
  if (priority) query.priority = priority;
  if (assignedTo) query.assignedTo = assignedTo;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { disputeNumber: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const disputes = await Dispute.find(query)
    .populate('reporter', 'name email avatar')
    .populate('reportedUser', 'name email avatar')
    .populate('assignedTo', 'name email')
    .sort({ priority: -1, createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Dispute.countDocuments(query);

  res.status(200).json(
    new ApiResponse(200, {
      disputes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    }, 'Disputes retrieved successfully')
  );
});

// @desc    Get dispute statistics (Admin)
// @route   GET /api/v1/disputes/admin/statistics
// @access  Private (Admin)
exports.getDisputeStatistics = asyncHandler(async (req, res) => {
  const stats = await Dispute.getStatistics();

  // Get recent disputes
  const recentDisputes = await Dispute.find()
    .populate('reporter', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(5);

  // Get open count
  const openCount = await Dispute.getOpenCount();

  res.status(200).json(
    new ApiResponse(200, {
      ...stats,
      openCount,
      recentDisputes,
    }, 'Dispute statistics retrieved successfully')
  );
});

// @desc    Update dispute status (Admin)
// @route   PUT /api/v1/disputes/:id/status
// @access  Private (Admin)
exports.updateDisputeStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, note } = req.body;
  const adminId = req.user._id;

  const dispute = await Dispute.findById(id);

  if (!dispute) {
    throw new ApiError(404, 'Dispute not found');
  }

  const validStatuses = ['pending', 'under-review', 'investigating', 'resolved', 'rejected', 'escalated', 'closed'];
  if (!validStatuses.includes(status)) {
    throw new ApiError(400, 'Invalid status');
  }

  await dispute.updateStatus(status, adminId);

  if (note) {
    await dispute.addAdminNote(adminId, note);
  }

  // Notify reporter
  await notificationService.createNotification({
    recipient: dispute.reporter,
    type: 'system',
    title: 'Dispute Status Updated',
    message: `Your dispute ${dispute.disputeNumber} status has been updated to: ${status}`,
    data: { disputeId: dispute._id },
  });

  res.status(200).json(
    new ApiResponse(200, dispute, 'Dispute status updated successfully')
  );
});

// @desc    Assign dispute to admin
// @route   PUT /api/v1/disputes/:id/assign
// @access  Private (Admin)
exports.assignDispute = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { adminId } = req.body;

  const dispute = await Dispute.findById(id);

  if (!dispute) {
    throw new ApiError(404, 'Dispute not found');
  }

  // Verify admin exists
  const admin = await User.findOne({ _id: adminId, role: 'Admin' });
  if (!admin) {
    throw new ApiError(400, 'Invalid admin ID');
  }

  dispute.assignedTo = adminId;
  if (dispute.status === 'pending') {
    dispute.status = 'under-review';
  }
  await dispute.save();

  // Notify assigned admin
  await notificationService.createNotification({
    recipient: adminId,
    type: 'system',
    title: 'Dispute Assigned to You',
    message: `Dispute ${dispute.disputeNumber} has been assigned to you`,
    data: { disputeId: dispute._id },
  });

  res.status(200).json(
    new ApiResponse(200, dispute, 'Dispute assigned successfully')
  );
});

// @desc    Resolve dispute (Admin)
// @route   PUT /api/v1/disputes/:id/resolve
// @access  Private (Admin)
exports.resolveDispute = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { outcome, description, actions, refundAmount } = req.body;
  const adminId = req.user._id;

  const dispute = await Dispute.findById(id)
    .populate('reporter', 'name email')
    .populate('reportedUser', 'name email');

  if (!dispute) {
    throw new ApiError(404, 'Dispute not found');
  }

  if (!outcome || !description) {
    throw new ApiError(400, 'Outcome and description are required');
  }

  // Process actions
  const processedActions = [];
  if (actions && Array.isArray(actions)) {
    for (const action of actions) {
      // Execute actions (warn, ban, etc.)
      if (action.action === 'warn' && action.targetUser) {
        await User.findByIdAndUpdate(action.targetUser, {
          $push: {
            warnings: {
              reason: action.details,
              issuedBy: adminId,
              issuedAt: new Date(),
            },
          },
        });
      } else if (action.action === 'suspend' && action.targetUser) {
        await User.findByIdAndUpdate(action.targetUser, {
          status: 'suspended',
        });
      } else if (action.action === 'ban' && action.targetUser) {
        await User.findByIdAndUpdate(action.targetUser, {
          status: 'banned',
        });
      }

      processedActions.push({
        ...action,
        executedAt: new Date(),
      });
    }
  }

  // Resolve the dispute
  await dispute.resolve(outcome, description, adminId, processedActions);

  if (refundAmount) {
    dispute.resolution.refundAmount = refundAmount;
    await dispute.save();
  }

  // Notify both parties
  const notifyMessage = `Your dispute ${dispute.disputeNumber} has been resolved. Outcome: ${outcome}`;
  
  await notificationService.createNotification({
    recipient: dispute.reporter._id || dispute.reporter,
    type: 'system',
    title: 'Dispute Resolved',
    message: notifyMessage,
    data: { disputeId: dispute._id },
  });

  if (dispute.reportedUser) {
    await notificationService.createNotification({
      recipient: dispute.reportedUser._id || dispute.reportedUser,
      type: 'system',
      title: 'Dispute Resolved',
      message: notifyMessage,
      data: { disputeId: dispute._id },
    });
  }

  res.status(200).json(
    new ApiResponse(200, dispute, 'Dispute resolved successfully')
  );
});

// @desc    Add admin note (Admin)
// @route   POST /api/v1/disputes/:id/notes
// @access  Private (Admin)
exports.addAdminNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { note } = req.body;
  const adminId = req.user._id;

  const dispute = await Dispute.findById(id);

  if (!dispute) {
    throw new ApiError(404, 'Dispute not found');
  }

  if (!note) {
    throw new ApiError(400, 'Note is required');
  }

  await dispute.addAdminNote(adminId, note);

  res.status(200).json(
    new ApiResponse(200, dispute, 'Note added successfully')
  );
});

// @desc    Add internal message (Admin)
// @route   POST /api/v1/disputes/:id/internal-message
// @access  Private (Admin)
exports.addInternalMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  const adminId = req.user._id;

  const dispute = await Dispute.findById(id);

  if (!dispute) {
    throw new ApiError(404, 'Dispute not found');
  }

  await dispute.addMessage(adminId, message, 'admin', true);

  res.status(200).json(
    new ApiResponse(200, dispute, 'Internal message added successfully')
  );
});

// ============================================
// HELPER FUNCTIONS
// ============================================

function determinePriority(type, category) {
  // High priority for fraud, harassment
  if (category === 'fraud' || category === 'harassment') {
    return 'high';
  }
  
  // Urgent for payment issues
  if (type === 'payment' || type === 'refund') {
    return 'high';
  }

  // Medium for most others
  if (type === 'skill-exchange' || type === 'course-content') {
    return 'medium';
  }

  return 'low';
}

module.exports = {
  createDispute: exports.createDispute,
  getMyDisputes: exports.getMyDisputes,
  getDisputeById: exports.getDisputeById,
  addDisputeMessage: exports.addDisputeMessage,
  getAllDisputes: exports.getAllDisputes,
  getDisputeStatistics: exports.getDisputeStatistics,
  updateDisputeStatus: exports.updateDisputeStatus,
  assignDispute: exports.assignDispute,
  resolveDispute: exports.resolveDispute,
  addAdminNote: exports.addAdminNote,
  addInternalMessage: exports.addInternalMessage,
};
