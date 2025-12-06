// ============================================
// SKILL EXCHANGE API - COMPLETE
// ============================================

import axios from './axios';

// ==================== EXCHANGES ====================

/**
 * Get all skill exchanges (marketplace)
 */
export const getSkillExchanges = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return axios.get(`/skill-exchanges?${queryString}`);
};

/**
 * Get exchange by ID
 */
export const getExchangeById = async (exchangeId) => {
  return axios.get(`/skill-exchanges/${exchangeId}`);
};

/**
 * Get my exchanges (as participant)
 */
export const getMyExchanges = async (status) => {
  const url = status ? `/skill-exchanges/my?status=${status}` : '/skill-exchanges/my';
  return axios.get(url);
};

/**
 * Create new skill exchange listing
 */
export const createSkillExchange = async (data) => {
  return axios.post('/skill-exchanges', data);
};

/**
 * Update skill exchange
 */
export const updateSkillExchange = async (exchangeId, data) => {
  return axios.put(`/skill-exchanges/${exchangeId}`, data);
};

/**
 * Delete skill exchange
 */
export const deleteSkillExchange = async (exchangeId) => {
  return axios.delete(`/skill-exchanges/${exchangeId}`);
};

// ==================== REQUESTS ====================

/**
 * Get pending exchange requests (received)
 */
export const getPendingRequests = async () => {
  return axios.get('/skill-exchanges/requests/pending');
};

/**
 * Get received requests
 */
export const getReceivedRequests = async () => {
  return axios.get('/skill-exchanges/requests/received');
};

/**
 * Get sent requests
 */
export const getSentRequests = async () => {
  return axios.get('/skill-exchanges/requests/sent');
};

/**
 * Send exchange request
 */
export const sendExchangeRequest = async (exchangeId, data) => {
  return axios.post(`/skill-exchanges/${exchangeId}/request`, data);
};

/**
 * Accept exchange request
 */
export const acceptExchangeRequest = async (exchangeId) => {
  return axios.post(`/skill-exchanges/${exchangeId}/accept`);
};

/**
 * Reject exchange request
 */
export const rejectExchangeRequest = async (exchangeId, reason) => {
  return axios.post(`/skill-exchanges/${exchangeId}/reject`, { reason });
};

// Alias for component compatibility
export const acceptExchange = acceptExchangeRequest;
export const rejectExchange = rejectExchangeRequest;

// ==================== MATCHING ====================

/**
 * Find skill matches based on user's skills
 */
export const findMatches = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return axios.get(`/skill-exchanges/matches?${queryString}`);
};

/**
 * Get available matches
 */
export const getAvailableMatches = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return axios.get(`/skill-exchanges/matches/available?${queryString}`);
};

// ==================== SESSIONS ====================

/**
 * Complete an exchange
 */
export const completeExchange = async (exchangeId, data = {}) => {
  return axios.post(`/skill-exchanges/${exchangeId}/complete`, data);
};

/**
 * Rate an exchange partner
 */
export const rateExchange = async (exchangeId, data) => {
  return axios.post(`/skill-exchanges/${exchangeId}/rate`, data);
};

/**
 * Get exchange history
 */
export const getExchangeHistory = async (exchangeId) => {
  return axios.get(`/skill-exchanges/${exchangeId}/history`);
};

// ==================== SKILLS ====================

/**
 * Get my offered skills
 */
export const getMyOfferedSkills = async () => {
  return axios.get('/users/skills/offered');
};

/**
 * Get my desired skills
 */
export const getMyDesiredSkills = async () => {
  return axios.get('/users/skills/desired');
};

/**
 * Add offered skill
 */
export const addOfferedSkill = async (skillData) => {
  return axios.post('/users/skills/offered', skillData);
};

/**
 * Add desired skill
 */
export const addDesiredSkill = async (skillData) => {
  return axios.post('/users/skills/desired', skillData);
};

/**
 * Remove offered skill
 */
export const removeOfferedSkill = async (skillId) => {
  return axios.delete(`/users/skills/offered/${skillId}`);
};

/**
 * Remove desired skill
 */
export const removeDesiredSkill = async (skillId) => {
  return axios.delete(`/users/skills/desired/${skillId}`);
};

export default {
  // Exchanges
  getSkillExchanges,
  getExchangeById,
  getMyExchanges,
  createSkillExchange,
  updateSkillExchange,
  deleteSkillExchange,
  // Requests
  getPendingRequests,
  getReceivedRequests,
  getSentRequests,
  sendExchangeRequest,
  acceptExchangeRequest,
  rejectExchangeRequest,
  acceptExchange,
  rejectExchange,
  // Matching
  findMatches,
  getAvailableMatches,
  // Sessions
  completeExchange,
  rateExchange,
  getExchangeHistory,
  // Skills
  getMyOfferedSkills,
  getMyDesiredSkills,
  addOfferedSkill,
  addDesiredSkill,
  removeOfferedSkill,
  removeDesiredSkill,
};