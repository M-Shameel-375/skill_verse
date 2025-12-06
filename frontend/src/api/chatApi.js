// ============================================
// CHAT API
// ============================================

import axios from './axios';

/**
 * Get all conversations
 */
export const getConversations = async () => {
  return axios.get('/chat/conversations');
};

/**
 * Get or create conversation for an exchange
 */
export const getExchangeChat = async (exchangeId) => {
  return axios.get(`/chat/exchange/${exchangeId}`);
};

/**
 * Get conversation by ID
 */
export const getConversationById = async (conversationId) => {
  return axios.get(`/chat/conversations/${conversationId}`);
};

/**
 * Get messages for a conversation
 */
export const getMessages = async (conversationId, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return axios.get(`/chat/conversations/${conversationId}/messages?${queryString}`);
};

/**
 * Send a message
 */
export const sendMessage = async (conversationId, data) => {
  return axios.post(`/chat/conversations/${conversationId}/messages`, data);
};

/**
 * Mark messages as read
 */
export const markAsRead = async (conversationId) => {
  return axios.post(`/chat/conversations/${conversationId}/read`);
};

/**
 * Delete a message
 */
export const deleteMessage = async (conversationId, messageId) => {
  return axios.delete(`/chat/conversations/${conversationId}/messages/${messageId}`);
};

/**
 * Start a direct conversation with a user
 */
export const startConversation = async (userId) => {
  return axios.post('/chat/conversations', { userId });
};

/**
 * Get unread message count
 */
export const getUnreadCount = async () => {
  return axios.get('/chat/unread-count');
};

export default {
  getConversations,
  getExchangeChat,
  getConversationById,
  getMessages,
  sendMessage,
  markAsRead,
  deleteMessage,
  startConversation,
  getUnreadCount,
};
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
