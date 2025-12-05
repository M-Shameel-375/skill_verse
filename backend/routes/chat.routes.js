// ============================================
// CHAT ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { protect } = require('../middlewares/auth.middleware');

// All chat routes require authentication
router.use(protect);

// Get all conversations
router.get('/', chatController.getConversations);

// Create or get direct conversation
router.post('/', chatController.createOrGetConversation);

// Get conversation by ID
router.get('/:id', chatController.getConversationById);

// Get messages for a conversation
router.get('/messages/:conversationId', chatController.getMessages);

// Send a message
router.post('/messages/:conversationId', chatController.sendMessage);

// Mark conversation as read
router.put('/read/:conversationId', chatController.markAsRead);

// Delete a message
router.delete('/messages/:messageId', chatController.deleteMessage);

// Get or create exchange chat
router.get('/exchange/:exchangeId', chatController.getExchangeChat);

module.exports = router;
