// ============================================
// CHAT CONTROLLER
// ============================================

const Chat = require('../models/Chat.model');
const User = require('../models/User.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// ============================================
// GET ALL CONVERSATIONS
// ============================================
exports.getConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const conversations = await Chat.find({
    'participants.user': userId,
    'participants.isActive': true,
  })
    .populate('participants.user', 'name avatar')
    .populate('lastMessage.sender', 'name')
    .sort({ 'lastMessage.sentAt': -1 })
    .limit(50);

  res.status(200).json(
    new ApiResponse(200, conversations, 'Conversations retrieved successfully')
  );
});

// ============================================
// GET CONVERSATION BY ID
// ============================================
exports.getConversationById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const conversation = await Chat.findOne({
    _id: id,
    'participants.user': userId,
  })
    .populate('participants.user', 'name avatar email')
    .populate('messages.sender', 'name avatar');

  if (!conversation) {
    throw new ApiError(404, 'Conversation not found');
  }

  // Mark as read
  await Chat.updateOne(
    { _id: id, 'participants.user': userId },
    { $set: { 'participants.$.lastReadAt': new Date() } }
  );

  res.status(200).json(
    new ApiResponse(200, conversation, 'Conversation retrieved successfully')
  );
});

// ============================================
// CREATE OR GET DIRECT CONVERSATION
// ============================================
exports.createOrGetConversation = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { targetUserId } = req.body;

  if (!targetUserId) {
    throw new ApiError(400, 'Target user ID is required');
  }

  if (userId.toString() === targetUserId) {
    throw new ApiError(400, 'Cannot create conversation with yourself');
  }

  // Check if target user exists
  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    throw new ApiError(404, 'Target user not found');
  }

  // Check for existing conversation
  let conversation = await Chat.findOne({
    conversationType: 'direct',
    'participants.user': { $all: [userId, targetUserId] },
  }).populate('participants.user', 'name avatar');

  if (!conversation) {
    // Create new conversation
    conversation = await Chat.create({
      conversationType: 'direct',
      participants: [
        { user: userId, role: 'member' },
        { user: targetUserId, role: 'member' },
      ],
      messages: [],
    });

    conversation = await Chat.findById(conversation._id).populate(
      'participants.user',
      'name avatar'
    );
  }

  res.status(200).json(
    new ApiResponse(200, conversation, 'Conversation retrieved successfully')
  );
});

// ============================================
// GET MESSAGES
// ============================================
exports.getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user._id;
  const { page = 1, limit = 50 } = req.query;

  const conversation = await Chat.findOne({
    _id: conversationId,
    'participants.user': userId,
  });

  if (!conversation) {
    throw new ApiError(404, 'Conversation not found');
  }

  // Get messages with pagination (newest first)
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const messages = conversation.messages
    .sort((a, b) => b.sentAt - a.sentAt)
    .slice(skip, skip + parseInt(limit))
    .reverse();

  // Mark messages as read
  await Chat.updateOne(
    { _id: conversationId, 'participants.user': userId },
    { $set: { 'participants.$.lastReadAt': new Date() } }
  );

  res.status(200).json(
    new ApiResponse(200, {
      messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: conversation.messages.length,
        pages: Math.ceil(conversation.messages.length / parseInt(limit)),
      },
    }, 'Messages retrieved successfully')
  );
});

// ============================================
// SEND MESSAGE
// ============================================
exports.sendMessage = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user._id;
  const { content, type = 'text', attachments = [] } = req.body;

  if (!content && attachments.length === 0) {
    throw new ApiError(400, 'Message content or attachments required');
  }

  const conversation = await Chat.findOne({
    _id: conversationId,
    'participants.user': userId,
  });

  if (!conversation) {
    throw new ApiError(404, 'Conversation not found');
  }

  const newMessage = {
    sender: userId,
    messageType: type,
    content: content || '',
    attachments,
    sentAt: new Date(),
    status: 'sent',
    reactions: [],
    metadata: {},
  };

  conversation.messages.push(newMessage);
  conversation.lastMessage = {
    content: content || '[Attachment]',
    sender: userId,
    sentAt: new Date(),
    messageType: type,
  };

  await conversation.save();

  // Get the saved message with populated sender
  const savedMessage = conversation.messages[conversation.messages.length - 1];

  res.status(201).json(
    new ApiResponse(201, {
      ...savedMessage.toObject(),
      isOwn: true,
    }, 'Message sent successfully')
  );
});

// ============================================
// MARK AS READ
// ============================================
exports.markAsRead = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user._id;

  await Chat.updateOne(
    { _id: conversationId, 'participants.user': userId },
    { $set: { 'participants.$.lastReadAt': new Date() } }
  );

  res.status(200).json(
    new ApiResponse(200, null, 'Conversation marked as read')
  );
});

// ============================================
// DELETE MESSAGE
// ============================================
exports.deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user._id;

  const conversation = await Chat.findOne({
    'messages._id': messageId,
    'participants.user': userId,
  });

  if (!conversation) {
    throw new ApiError(404, 'Message not found');
  }

  const message = conversation.messages.id(messageId);
  if (!message) {
    throw new ApiError(404, 'Message not found');
  }

  if (message.sender.toString() !== userId.toString()) {
    throw new ApiError(403, 'You can only delete your own messages');
  }

  // Soft delete - mark as deleted
  message.isDeleted = true;
  message.deletedAt = new Date();
  message.content = 'This message has been deleted';

  await conversation.save();

  res.status(200).json(
    new ApiResponse(200, null, 'Message deleted successfully')
  );
});

// ============================================
// GET OR CREATE EXCHANGE CHAT
// ============================================
exports.getExchangeChat = asyncHandler(async (req, res) => {
  const { exchangeId } = req.params;
  const userId = req.user._id;

  // Find the skill exchange
  const SkillExchange = require('../models/SkillExchange.model');
  const exchange = await SkillExchange.findById(exchangeId)
    .populate('requester', 'name avatar')
    .populate('provider', 'name avatar');

  if (!exchange) {
    throw new ApiError(404, 'Exchange not found');
  }

  // Check if user is part of this exchange
  const isRequester = exchange.requester._id.toString() === userId.toString();
  const isProvider = exchange.provider && exchange.provider._id.toString() === userId.toString();

  if (!isRequester && !isProvider) {
    throw new ApiError(403, 'You are not part of this exchange');
  }

  // Determine the partner
  const partner = isRequester ? exchange.provider : exchange.requester;

  // Find or create chat for this exchange
  let chat = await Chat.findOne({
    relatedTo: {
      model: 'SkillExchange',
      id: exchangeId,
    },
  }).populate('participants.user', 'name avatar');

  if (!chat && partner) {
    // Create new chat
    chat = await Chat.create({
      conversationType: 'session',
      participants: [
        { user: exchange.requester._id, role: 'member' },
        { user: exchange.provider._id, role: 'member' },
      ],
      relatedTo: {
        model: 'SkillExchange',
        id: exchangeId,
      },
      messages: [],
    });

    chat = await Chat.findById(chat._id).populate(
      'participants.user',
      'name avatar'
    );
  }

  res.status(200).json(
    new ApiResponse(200, {
      ...chat?.toObject(),
      partner: partner ? {
        _id: partner._id,
        name: partner.name,
        avatar: partner.avatar,
        offeredSkill: isRequester ? exchange.desiredSkill : exchange.offeredSkill,
      } : null,
    }, 'Exchange chat retrieved successfully')
  );
});
