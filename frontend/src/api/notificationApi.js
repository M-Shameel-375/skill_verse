// ============================================
// NOTIFICATION API ENDPOINTS
// ============================================

import axios from './axios';

const NOTIFICATION_ENDPOINTS = {
  GET_NOTIFICATIONS: '/notifications',
  GET_NOTIFICATION: '/notifications',
  MARK_AS_READ: '/notifications/read',
  MARK_ALL_READ: '/notifications/read-all',
  DELETE_NOTIFICATION: '/notifications',
  DELETE_ALL: '/notifications/delete-all',
  GET_UNREAD_COUNT: '/notifications/unread-count',
  GET_SETTINGS: '/notifications/settings',
  UPDATE_SETTINGS: '/notifications/settings',
  SUBSCRIBE_PUSH: '/notifications/subscribe',
  UNSUBSCRIBE_PUSH: '/notifications/unsubscribe',
  TEST_NOTIFICATION: '/notifications/test',
  MUTE_NOTIFICATIONS: '/notifications/mute',
  UNMUTE_NOTIFICATIONS: '/notifications/unmute',
};

// ============================================
// GET ALL NOTIFICATIONS
// ============================================
/**
 * Get user's notifications
 * @param {Object} params - { page, limit, type, read, startDate, endDate }
 * @returns {Promise}
 */
export const getNotifications = (params = {}) => {
  return axios.get(NOTIFICATION_ENDPOINTS.GET_NOTIFICATIONS, { params });
};

// ============================================
// GET NOTIFICATION BY ID
// ============================================
/**
 * Get notification details by ID
 * @param {string} notificationId - Notification ID
 * @returns {Promise}
 */
export const getNotificationById = (notificationId) => {
  return axios.get(`${NOTIFICATION_ENDPOINTS.GET_NOTIFICATION}/${notificationId}`);
};

// ============================================
// MARK NOTIFICATION AS READ
// ============================================
/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise}
 */
export const markAsRead = (notificationId) => {
  return axios.put(`${NOTIFICATION_ENDPOINTS.MARK_AS_READ}/${notificationId}`);
};

// ============================================
// MARK ALL NOTIFICATIONS AS READ
// ============================================
/**
 * Mark all notifications as read
 * @returns {Promise}
 */
export const markAllAsRead = () => {
  return axios.put(NOTIFICATION_ENDPOINTS.MARK_ALL_READ);
};

// ============================================
// DELETE NOTIFICATION
// ============================================
/**
 * Delete notification
 * @param {string} notificationId - Notification ID
 * @returns {Promise}
 */
export const deleteNotification = (notificationId) => {
  return axios.delete(`${NOTIFICATION_ENDPOINTS.DELETE_NOTIFICATION}/${notificationId}`);
};

// ============================================
// DELETE ALL NOTIFICATIONS
// ============================================
/**
 * Delete all notifications
 * @returns {Promise}
 */
export const deleteAllNotifications = () => {
  return axios.delete(NOTIFICATION_ENDPOINTS.DELETE_ALL);
};

// ============================================
// GET UNREAD COUNT
// ============================================
/**
 * Get unread notifications count
 * @returns {Promise}
 */
export const getUnreadCount = () => {
  return axios.get(NOTIFICATION_ENDPOINTS.GET_UNREAD_COUNT);
};

// ============================================
// GET NOTIFICATION SETTINGS
// ============================================
/**
 * Get notification preferences
 * @returns {Promise}
 */
export const getNotificationSettings = () => {
  return axios.get(NOTIFICATION_ENDPOINTS.GET_SETTINGS);
};

// ============================================
// UPDATE NOTIFICATION SETTINGS
// ============================================
/**
 * Update notification preferences
 * @param {Object} settings - Notification settings
 * @returns {Promise}
 */
export const updateNotificationSettings = (settings) => {
  return axios.put(NOTIFICATION_ENDPOINTS.UPDATE_SETTINGS, settings);
};

// ============================================
// SUBSCRIBE TO PUSH NOTIFICATIONS
// ============================================
/**
 * Subscribe to push notifications
 * @param {Object} subscription - Push subscription object
 * @returns {Promise}
 */
export const subscribeToPush = (subscription) => {
  return axios.post(NOTIFICATION_ENDPOINTS.SUBSCRIBE_PUSH, subscription);
};

// ============================================
// UNSUBSCRIBE FROM PUSH NOTIFICATIONS
// ============================================
/**
 * Unsubscribe from push notifications
 * @returns {Promise}
 */
export const unsubscribeFromPush = () => {
  return axios.post(NOTIFICATION_ENDPOINTS.UNSUBSCRIBE_PUSH);
};

// ============================================
// SEND TEST NOTIFICATION
// ============================================
/**
 * Send test notification (development)
 * @param {Object} testData - { type, title, message }
 * @returns {Promise}
 */
export const sendTestNotification = (testData) => {
  return axios.post(NOTIFICATION_ENDPOINTS.TEST_NOTIFICATION, testData);
};

// ============================================
// MUTE NOTIFICATIONS
// ============================================
/**
 * Mute notifications for a period
 * @param {Object} muteData - { duration, unit } (e.g., { duration: 1, unit: 'hour' })
 * @returns {Promise}
 */
export const muteNotifications = (muteData) => {
  return axios.post(NOTIFICATION_ENDPOINTS.MUTE_NOTIFICATIONS, muteData);
};

// ============================================
// UNMUTE NOTIFICATIONS
// ============================================
/**
 * Unmute notifications
 * @returns {Promise}
 */
export const unmuteNotifications = () => {
  return axios.post(NOTIFICATION_ENDPOINTS.UNMUTE_NOTIFICATIONS);
};

// ============================================
// GET NOTIFICATIONS BY TYPE
// ============================================
/**
 * Get notifications filtered by type
 * @param {string} type - Notification type
 * @param {Object} params - { page, limit }
 * @returns {Promise}
 */
export const getNotificationsByType = (type, params = {}) => {
  return axios.get(`/notifications/type/${type}`, { params });
};

// ============================================
// BATCH DELETE NOTIFICATIONS
// ============================================
/**
 * Delete multiple notifications
 * @param {Array} notificationIds - Array of notification IDs
 * @returns {Promise}
 */
export const batchDeleteNotifications = (notificationIds) => {
  return axios.post('/notifications/batch-delete', { ids: notificationIds });
};

// ============================================
// BATCH MARK AS READ
// ============================================
/**
 * Mark multiple notifications as read
 * @param {Array} notificationIds - Array of notification IDs
 * @returns {Promise}
 */
export const batchMarkAsRead = (notificationIds) => {
  return axios.post('/notifications/batch-read', { ids: notificationIds });
};

// ============================================
// GET NOTIFICATION PREFERENCES
// ============================================
/**
 * Get detailed notification preferences
 * @returns {Promise}
 */
export const getNotificationPreferences = () => {
  return axios.get('/notifications/preferences');
};

// ============================================
// UPDATE NOTIFICATION PREFERENCES
// ============================================
/**
 * Update specific notification preferences
 * @param {Object} preferences - Preference updates
 * @returns {Promise}
 */
export const updateNotificationPreferences = (preferences) => {
  return axios.put('/notifications/preferences', preferences);
};

// ============================================
// EXPORT ALL NOTIFICATION API METHODS
// ============================================
const notificationApi = {
  getNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadCount,
  getNotificationSettings,
  updateNotificationSettings,
  subscribeToPush,
  unsubscribeFromPush,
  sendTestNotification,
  muteNotifications,
  unmuteNotifications,
  getNotificationsByType,
  batchDeleteNotifications,
  batchMarkAsRead,
  getNotificationPreferences,
  updateNotificationPreferences,
};

export default notificationApi;