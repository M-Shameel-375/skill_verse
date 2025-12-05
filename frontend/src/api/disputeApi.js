// ============================================
// DISPUTE API CLIENT
// ============================================

import api from './axios';

// ============================================
// USER ENDPOINTS
// ============================================

/**
 * Create a new dispute
 * @param {Object} disputeData - Dispute details
 * @returns {Promise} Created dispute
 */
export const createDispute = async (disputeData) => {
  const response = await api.post('/disputes', disputeData);
  return response;
};

/**
 * Get my disputes
 * @param {Object} params - Query parameters
 * @returns {Promise} List of disputes
 */
export const getMyDisputes = async (params = {}) => {
  const response = await api.get('/disputes/my', { params });
  return response;
};

/**
 * Get dispute by ID
 * @param {string} id - Dispute ID
 * @returns {Promise} Dispute details
 */
export const getDisputeById = async (id) => {
  const response = await api.get(`/disputes/${id}`);
  return response;
};

/**
 * Add message to dispute
 * @param {string} id - Dispute ID
 * @param {string} message - Message content
 * @param {Array} attachments - Optional attachments
 * @returns {Promise} Updated dispute
 */
export const addDisputeMessage = async (id, message, attachments = []) => {
  const response = await api.post(`/disputes/${id}/messages`, {
    message,
    attachments,
  });
  return response;
};

// ============================================
// ADMIN ENDPOINTS
// ============================================

/**
 * Get all disputes (Admin)
 * @param {Object} params - Query parameters
 * @returns {Promise} List of all disputes
 */
export const getAllDisputes = async (params = {}) => {
  const response = await api.get('/disputes/admin/all', { params });
  return response;
};

/**
 * Get dispute statistics (Admin)
 * @returns {Promise} Dispute statistics
 */
export const getDisputeStatistics = async () => {
  const response = await api.get('/disputes/admin/statistics');
  return response;
};

/**
 * Update dispute status (Admin)
 * @param {string} id - Dispute ID
 * @param {string} status - New status
 * @param {string} note - Optional note
 * @returns {Promise} Updated dispute
 */
export const updateDisputeStatus = async (id, status, note = '') => {
  const response = await api.put(`/disputes/${id}/status`, { status, note });
  return response;
};

/**
 * Assign dispute to admin
 * @param {string} id - Dispute ID
 * @param {string} adminId - Admin user ID
 * @returns {Promise} Updated dispute
 */
export const assignDispute = async (id, adminId) => {
  const response = await api.put(`/disputes/${id}/assign`, { adminId });
  return response;
};

/**
 * Resolve dispute (Admin)
 * @param {string} id - Dispute ID
 * @param {Object} resolution - Resolution details
 * @returns {Promise} Resolved dispute
 */
export const resolveDispute = async (id, resolution) => {
  const response = await api.put(`/disputes/${id}/resolve`, resolution);
  return response;
};

/**
 * Add admin note (Admin)
 * @param {string} id - Dispute ID
 * @param {string} note - Note content
 * @returns {Promise} Updated dispute
 */
export const addAdminNote = async (id, note) => {
  const response = await api.post(`/disputes/${id}/notes`, { note });
  return response;
};

/**
 * Add internal message (Admin)
 * @param {string} id - Dispute ID
 * @param {string} message - Message content
 * @returns {Promise} Updated dispute
 */
export const addInternalMessage = async (id, message) => {
  const response = await api.post(`/disputes/${id}/internal-message`, { message });
  return response;
};

export default {
  createDispute,
  getMyDisputes,
  getDisputeById,
  addDisputeMessage,
  getAllDisputes,
  getDisputeStatistics,
  updateDisputeStatus,
  assignDispute,
  resolveDispute,
  addAdminNote,
  addInternalMessage,
};
