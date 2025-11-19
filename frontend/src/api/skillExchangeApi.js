// ============================================
// SKILL EXCHANGE API ENDPOINTS
// ============================================

import axios from './axios';

const EXCHANGE_ENDPOINTS = {
  GET_EXCHANGES: '/skill-exchanges',
  GET_EXCHANGE: '/skill-exchanges',
  CREATE_EXCHANGE: '/skill-exchanges',
  UPDATE_EXCHANGE: '/skill-exchanges',
  DELETE_EXCHANGE: '/skill-exchanges',
  ACCEPT_REQUEST: '/skill-exchanges/accept',
  REJECT_REQUEST: '/skill-exchanges/reject',
  COMPLETE_EXCHANGE: '/skill-exchanges/complete',
  CANCEL_EXCHANGE: '/skill-exchanges/cancel',
  GET_MY_EXCHANGES: '/skill-exchanges/my-exchanges',
  GET_RECEIVED: '/skill-exchanges/received',
  GET_SENT: '/skill-exchanges/sent',
  FIND_MATCHES: '/skill-exchanges/find-matches',
  RATE_PARTNER: '/skill-exchanges/rate',
  GET_AVAILABILITY: '/skill-exchanges/availability',
  SET_AVAILABILITY: '/skill-exchanges/availability',
  SEARCH_SKILLS: '/skill-exchanges/search',
};

// ============================================
// GET ALL SKILL EXCHANGES
// ============================================
/**
 * Get all skill exchange requests with filters
 * @param {Object} params - { page, limit, offeredSkill, desiredSkill, status }
 * @returns {Promise}
 */
export const getSkillExchanges = (params = {}) => {
  return axios.get(EXCHANGE_ENDPOINTS.GET_EXCHANGES, { params });
};

// ============================================
// GET EXCHANGE BY ID
// ============================================
/**
 * Get skill exchange details
 * @param {string} exchangeId - Exchange ID
 * @returns {Promise}
 */
export const getExchangeById = (exchangeId) => {
  return axios.get(`${EXCHANGE_ENDPOINTS.GET_EXCHANGE}/${exchangeId}`);
};

// ============================================
// CREATE SKILL EXCHANGE REQUEST
// ============================================
/**
 * Create new skill exchange request
 * @param {Object} exchangeData - { offeredSkill, desiredSkill, description, targetUserId }
 * @returns {Promise}
 */
export const createSkillExchange = (exchangeData) => {
  return axios.post(EXCHANGE_ENDPOINTS.CREATE_EXCHANGE, exchangeData);
};

// ============================================
// UPDATE SKILL EXCHANGE
// ============================================
/**
 * Update skill exchange request
 * @param {string} exchangeId - Exchange ID
 * @param {Object} updates - Exchange updates
 * @returns {Promise}
 */
export const updateSkillExchange = (exchangeId, updates) => {
  return axios.put(`${EXCHANGE_ENDPOINTS.UPDATE_EXCHANGE}/${exchangeId}`, updates);
};

// ============================================
// DELETE SKILL EXCHANGE
// ============================================
/**
 * Delete skill exchange request
 * @param {string} exchangeId - Exchange ID
 * @returns {Promise}
 */
export const deleteSkillExchange = (exchangeId) => {
  return axios.delete(`${EXCHANGE_ENDPOINTS.DELETE_EXCHANGE}/${exchangeId}`);
};

// ============================================
// ACCEPT EXCHANGE REQUEST
// ============================================
/**
 * Accept a skill exchange request
 * @param {string} exchangeId - Exchange ID
 * @returns {Promise}
 */
export const acceptExchangeRequest = (exchangeId) => {
  return axios.post(`${EXCHANGE_ENDPOINTS.ACCEPT_REQUEST}/${exchangeId}`);
};

// ============================================
// REJECT EXCHANGE REQUEST
// ============================================
/**
 * Reject a skill exchange request
 * @param {string} exchangeId - Exchange ID
 * @param {string} reason - Rejection reason
 * @returns {Promise}
 */
export const rejectExchangeRequest = (exchangeId, reason) => {
  return axios.post(`${EXCHANGE_ENDPOINTS.REJECT_REQUEST}/${exchangeId}`, { reason });
};

// ============================================
// COMPLETE EXCHANGE
// ============================================
/**
 * Mark exchange as completed
 * @param {string} exchangeId - Exchange ID
 * @returns {Promise}
 */
export const completeExchange = (exchangeId) => {
  return axios.post(`${EXCHANGE_ENDPOINTS.COMPLETE_EXCHANGE}/${exchangeId}`);
};

// ============================================
// CANCEL EXCHANGE
// ============================================
/**
 * Cancel a skill exchange
 * @param {string} exchangeId - Exchange ID
 * @param {string} reason - Cancellation reason
 * @returns {Promise}
 */
export const cancelExchange = (exchangeId, reason) => {
  return axios.post(`${EXCHANGE_ENDPOINTS.CANCEL_EXCHANGE}/${exchangeId}`, { reason });
};

// ============================================
// GET MY EXCHANGES
// ============================================
/**
 * Get all exchanges (sent + received)
 * @returns {Promise}
 */
export const getMyExchanges = () => {
  return axios.get(EXCHANGE_ENDPOINTS.GET_MY_EXCHANGES);
};

// ============================================
// GET RECEIVED REQUESTS
// ============================================
/**
 * Get received skill exchange requests
 * @returns {Promise}
 */
export const getReceivedRequests = () => {
  return axios.get(EXCHANGE_ENDPOINTS.GET_RECEIVED);
};

// ============================================
// GET SENT REQUESTS
// ============================================
/**
 * Get sent skill exchange requests
 * @returns {Promise}
 */
export const getSentRequests = () => {
  return axios.get(EXCHANGE_ENDPOINTS.GET_SENT);
};

// ============================================
// FIND MATCHES
// ============================================
/**
 * Find matching users for skill exchange
 * @param {Object} matchData - { offeredSkill, desiredSkill }
 * @returns {Promise}
 */
export const findMatches = (matchData) => {
  return axios.post(EXCHANGE_ENDPOINTS.FIND_MATCHES, matchData);
};

// ============================================
// RATE EXCHANGE PARTNER
// ============================================
/**
 * Rate exchange partner after completion
 * @param {string} exchangeId - Exchange ID
 * @param {Object} ratingData - { rating, review }
 * @returns {Promise}
 */
export const rateExchangePartner = (exchangeId, ratingData) => {
  return axios.post(`${EXCHANGE_ENDPOINTS.RATE_PARTNER}/${exchangeId}`, ratingData);
};

// ============================================
// GET USER AVAILABILITY
// ============================================
/**
 * Get user's availability for skill exchange
 * @param {string} userId - User ID
 * @returns {Promise}
 */
export const getUserAvailability = (userId) => {
  return axios.get(`${EXCHANGE_ENDPOINTS.GET_AVAILABILITY}/${userId}`);
};

// ============================================
// SET AVAILABILITY
// ============================================
/**
 * Set availability for skill exchange
 * @param {Array} availability - Array of { day, timeSlots: [{ start, end }] }
 * @returns {Promise}
 */
export const setAvailability = (availability) => {
  return axios.post(EXCHANGE_ENDPOINTS.SET_AVAILABILITY, { availability });
};

// ============================================
// SEARCH SKILLS
// ============================================
/**
 * Search for skills
 * @param {string} query - Search query
 * @returns {Promise}
 */
export const searchSkills = (query) => {
  return axios.get(`${EXCHANGE_ENDPOINTS.SEARCH_SKILLS}?q=${query}`);
};

// ============================================
// SCHEDULE EXCHANGE SESSION
// ============================================
/**
 * Schedule an exchange session
 * @param {string} exchangeId - Exchange ID
 * @param {Object} scheduleData - { date, time, duration, platform }
 * @returns {Promise}
 */
export const scheduleExchangeSession = (exchangeId, scheduleData) => {
  return axios.post(`/skill-exchanges/${exchangeId}/schedule`, scheduleData);
};

// ============================================
// RESCHEDULE EXCHANGE SESSION
// ============================================
/**
 * Reschedule an exchange session
 * @param {string} exchangeId - Exchange ID
 * @param {Object} scheduleData - { date, time }
 * @returns {Promise}
 */
export const rescheduleExchangeSession = (exchangeId, scheduleData) => {
  return axios.put(`/skill-exchanges/${exchangeId}/reschedule`, scheduleData);
};

// ============================================
// GET EXCHANGE HISTORY
// ============================================
/**
 * Get user's exchange history
 * @returns {Promise}
 */
export const getExchangeHistory = () => {
  return axios.get('/skill-exchanges/history');
};

// ============================================
// REPORT EXCHANGE
// ============================================
/**
 * Report an exchange or user
 * @param {string} exchangeId - Exchange ID
 * @param {Object} reportData - { reason, description }
 * @returns {Promise}
 */
export const reportExchange = (exchangeId, reportData) => {
  return axios.post(`/skill-exchanges/${exchangeId}/report`, reportData);
};

// ============================================
// EXPORT ALL SKILL EXCHANGE API METHODS
// ============================================
const skillExchangeApi = {
  getSkillExchanges,
  getExchangeById,
  createSkillExchange,
  updateSkillExchange,
  deleteSkillExchange,
  acceptExchangeRequest,
  rejectExchangeRequest,
  completeExchange,
  cancelExchange,
  getMyExchanges,
  getReceivedRequests,
  getSentRequests,
  findMatches,
  rateExchangePartner,
  getUserAvailability,
  setAvailability,
  searchSkills,
  scheduleExchangeSession,
  rescheduleExchangeSession,
  getExchangeHistory,
  reportExchange,
};

export default skillExchangeApi;