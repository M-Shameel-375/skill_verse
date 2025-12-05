// ============================================
// CHAT API ENDPOINTS
// ============================================

import axios from './axios';

const CHAT_ENDPOINTS = {
  GET_CONVERSATIONS: '/chats',
  GET_CONVERSATION: '/chats',
  CREATE_CONVERSATION: '/chats',
  GET_MESSAGES: '/chats/messages',
  SEND_MESSAGE: '/chats/messages',
  MARK_AS_READ: '/chats/read',
  DELETE_MESSAGE: '/chats/messages',
  GET_EXCHANGE_CHAT: '/chats/exchange',
};

// ============================================
// GET ALL CONVERSATIONS
// ============================================
/**
 * Get all user's conversations
 * @returns {Promise}
 */
export const getConversations = () => {
  return axios.get(CHAT_ENDPOINTS.GET_CONVERSATIONS);
};

// ============================================
// GET CONVERSATION BY ID
// ============================================
/**
 * Get conversation details
 * @param {string} conversationId - Conversation ID
 * @returns {Promise}
 */
export const getConversationById = (conversationId) => {
  return axios.get(`${CHAT_ENDPOINTS.GET_CONVERSATION}/${conversationId}`);
};

// ============================================
// CREATE OR GET DIRECT CONVERSATION
// ============================================
/**
 * Create or get direct conversation with a user
 * @param {string} userId - Target user ID
 * @returns {Promise}
 */
export const createOrGetConversation = (userId) => {
  return axios.post(CHAT_ENDPOINTS.CREATE_CONVERSATION, { userId });
};

// ============================================
// GET MESSAGES
// ============================================
/**
 * Get messages for a conversation
 * @param {string} conversationId - Conversation ID
 * @param {Object} params - { page, limit }
 * @returns {Promise}
 */
export const getMessages = (conversationId, params = {}) => {
  return axios.get(`${CHAT_ENDPOINTS.GET_MESSAGES}/${conversationId}`, { params });
};

// ============================================
// SEND MESSAGE
// ============================================
/**
 * Send a message in a conversation
 * @param {string} conversationId - Conversation ID
 * @param {Object} messageData - { content, type, attachments }
 * @returns {Promise}
 */
export const sendMessage = (conversationId, messageData) => {
  return axios.post(`${CHAT_ENDPOINTS.SEND_MESSAGE}/${conversationId}`, messageData);
};

// ============================================
// MARK AS READ
// ============================================
/**
 * Mark conversation as read
 * @param {string} conversationId - Conversation ID
 * @returns {Promise}
 */
export const markAsRead = (conversationId) => {
  return axios.put(`${CHAT_ENDPOINTS.MARK_AS_READ}/${conversationId}`);
};

// ============================================
// DELETE MESSAGE
// ============================================
/**
 * Delete a message
 * @param {string} messageId - Message ID
 * @returns {Promise}
 */
export const deleteMessage = (messageId) => {
  return axios.delete(`${CHAT_ENDPOINTS.DELETE_MESSAGE}/${messageId}`);
};

// ============================================
// GET EXCHANGE CHAT
// ============================================
/**
 * Get or create chat for a skill exchange
 * @param {string} exchangeId - Skill exchange ID
 * @returns {Promise}
 */
export const getExchangeChat = (exchangeId) => {
  return axios.get(`${CHAT_ENDPOINTS.GET_EXCHANGE_CHAT}/${exchangeId}`);
};

// ============================================
// EXPORT ALL FUNCTIONS
// ============================================
export default {
  getConversations,
  getConversationById,
  createOrGetConversation,
  getMessages,
  sendMessage,
  markAsRead,
  deleteMessage,
  getExchangeChat,
};
