// ============================================
// LIVE SESSION API ENDPOINTS
// ============================================

import axios from './axios';

const SESSION_ENDPOINTS = {
  GET_SESSIONS: '/live-sessions',
  GET_SESSION: '/live-sessions',
  CREATE_SESSION: '/live-sessions',
  UPDATE_SESSION: '/live-sessions',
  DELETE_SESSION: '/live-sessions',
  JOIN_SESSION: '/live-sessions/join',
  LEAVE_SESSION: '/live-sessions/leave',
  START_SESSION: '/live-sessions/start',
  END_SESSION: '/live-sessions/end',
  GET_MY_SESSIONS: '/live-sessions/my-sessions',
  GET_UPCOMING: '/live-sessions/upcoming',
  GET_PAST: '/live-sessions/past',
  GET_PARTICIPANTS: '/live-sessions/participants',
  GET_RECORDING: '/live-sessions/recording',
  SEND_MESSAGE: '/live-sessions/message',
  GET_MESSAGES: '/live-sessions/messages',
  GET_TOKEN: '/live-sessions/token',
};

// ============================================
// GET ALL LIVE SESSIONS
// ============================================
/**
 * Get all live sessions with filters
 * @param {Object} params - { page, limit, status, category }
 * @returns {Promise}
 */
export const getLiveSessions = (params = {}) => {
  return axios.get(SESSION_ENDPOINTS.GET_SESSIONS, { params });
};

// ============================================
// GET SESSION BY ID
// ============================================
/**
 * Get live session details
 * @param {string} sessionId - Session ID
 * @returns {Promise}
 */
export const getSessionById = (sessionId) => {
  return axios.get(`${SESSION_ENDPOINTS.GET_SESSION}/${sessionId}`);
};

// ============================================
// CREATE LIVE SESSION
// ============================================
/**
 * Create new live session
 * @param {Object} sessionData - Session data
 * @returns {Promise}
 */
export const createLiveSession = (sessionData) => {
  return axios.post(SESSION_ENDPOINTS.CREATE_SESSION, sessionData);
};

// ============================================
// UPDATE LIVE SESSION
// ============================================
/**
 * Update live session
 * @param {string} sessionId - Session ID
 * @param {Object} updates - Session updates
 * @returns {Promise}
 */
export const updateLiveSession = (sessionId, updates) => {
  return axios.put(`${SESSION_ENDPOINTS.UPDATE_SESSION}/${sessionId}`, updates);
};

// ============================================
// DELETE LIVE SESSION
// ============================================
/**
 * Delete live session
 * @param {string} sessionId - Session ID
 * @returns {Promise}
 */
export const deleteLiveSession = (sessionId) => {
  return axios.delete(`${SESSION_ENDPOINTS.DELETE_SESSION}/${sessionId}`);
};

// ============================================
// JOIN LIVE SESSION
// ============================================
/**
 * Join a live session
 * @param {string} sessionId - Session ID
 * @returns {Promise}
 */
export const joinLiveSession = (sessionId) => {
  return axios.post(`${SESSION_ENDPOINTS.JOIN_SESSION}/${sessionId}`);
};

// ============================================
// LEAVE LIVE SESSION
// ============================================
/**
 * Leave a live session
 * @param {string} sessionId - Session ID
 * @returns {Promise}
 */
export const leaveLiveSession = (sessionId) => {
  return axios.post(`${SESSION_ENDPOINTS.LEAVE_SESSION}/${sessionId}`);
};

// ============================================
// START LIVE SESSION
// ============================================
/**
 * Start a live session (educator only)
 * @param {string} sessionId - Session ID
 * @returns {Promise}
 */
export const startLiveSession = (sessionId) => {
  return axios.post(`${SESSION_ENDPOINTS.START_SESSION}/${sessionId}`);
};

// ============================================
// END LIVE SESSION
// ============================================
/**
 * End a live session (educator only)
 * @param {string} sessionId - Session ID
 * @returns {Promise}
 */
export const endLiveSession = (sessionId) => {
  return axios.post(`${SESSION_ENDPOINTS.END_SESSION}/${sessionId}`);
};

// ============================================
// GET MY SESSIONS
// ============================================
/**
 * Get sessions created by educator
 * @returns {Promise}
 */
export const getMySessions = () => {
  return axios.get(SESSION_ENDPOINTS.GET_MY_SESSIONS);
};

/**
 * Alias for createLiveSession
 * @param {Object} sessionData - Session data
 * @returns {Promise}
 */
export const createSession = createLiveSession;

/**
 * Alias for updateLiveSession
 * @param {string} sessionId - Session ID
 * @param {Object} data - Session updates
 * @returns {Promise}
 */
export const updateSession = updateLiveSession;

/**
 * Alias for deleteLiveSession
 * @param {string} sessionId - Session ID
 * @returns {Promise}
 */
export const deleteSession = deleteLiveSession;

/**
 * Alias for startLiveSession
 * @param {string} sessionId - Session ID
 * @returns {Promise}
 */
export const startSession = startLiveSession;

/**
 * Alias for endLiveSession
 * @param {string} sessionId - Session ID
 * @returns {Promise}
 */
export const endSession = endLiveSession;

/**
 * Alias for joinLiveSession
 * @param {string} sessionId - Session ID
 * @returns {Promise}
 */
export const joinSession = joinLiveSession;

/**
 * Alias for leaveLiveSession
 * @param {string} sessionId - Session ID
 * @returns {Promise}
 */
export const leaveSession = leaveLiveSession;

/**
 * Get session token (Agora token)
 * @param {string} sessionId - Session ID
 * @returns {Promise}
 */
export const getSessionToken = (sessionId) => {
  return axios.get(`/live-sessions/${sessionId}/video-token`);
};

// ============================================
// GET UPCOMING SESSIONS
// ============================================
/**
 * Get upcoming live sessions
 * @returns {Promise}
 */
export const getUpcomingSessions = () => {
  return axios.get(SESSION_ENDPOINTS.GET_UPCOMING);
};

// ============================================
// GET PAST SESSIONS
// ============================================
/**
 * Get past live sessions
 * @returns {Promise}
 */
export const getPastSessions = () => {
  return axios.get(SESSION_ENDPOINTS.GET_PAST);
};

// ============================================
// GET SESSION PARTICIPANTS
// ============================================
/**
 * Get participants in a live session
 * @param {string} sessionId - Session ID
 * @returns {Promise}
 */
export const getSessionParticipants = (sessionId) => {
  return axios.get(`${SESSION_ENDPOINTS.GET_PARTICIPANTS}/${sessionId}`);
};

// ============================================
// GET SESSION RECORDING
// ============================================
/**
 * Get session recording URL
 * @param {string} sessionId - Session ID
 * @returns {Promise}
 */
export const getSessionRecording = (sessionId) => {
  return axios.get(`${SESSION_ENDPOINTS.GET_RECORDING}/${sessionId}`);
};

// ============================================
// SEND SESSION MESSAGE
// ============================================
/**
 * Send message in live session chat
 * @param {string} sessionId - Session ID
 * @param {Object} messageData - { message, type }
 * @returns {Promise}
 */
export const sendSessionMessage = (sessionId, messageData) => {
  return axios.post(`${SESSION_ENDPOINTS.SEND_MESSAGE}/${sessionId}`, messageData);
};

// ============================================
// GET SESSION MESSAGES
// ============================================
/**
 * Get chat messages from live session
 * @param {string} sessionId - Session ID
 * @returns {Promise}
 */
export const getSessionMessages = (sessionId) => {
  return axios.get(`${SESSION_ENDPOINTS.GET_MESSAGES}/${sessionId}`);
};

// ============================================
// GET AGORA TOKEN
// ============================================
/**
 * Get Agora RTC token for video session
 * @param {string} sessionId - Session ID
 * @param {string} role - 'host' or 'audience'
 * @returns {Promise}
 */
export const getAgoraToken = (sessionId, role = 'audience') => {
  return axios.get(`/live-sessions/${sessionId}/video-token`, { params: { role } });
};

// ============================================
// GET VIDEO SERVICE STATUS
// ============================================
/**
 * Get video service configuration status
 * @returns {Promise}
 */
export const getVideoServiceStatus = () => {
  return axios.get('/live-sessions/video-status');
};

// ============================================
// CREATE MEETING ROOM
// ============================================
/**
 * Create meeting room for a session (generates Agora channel)
 * @param {string} sessionId - Session ID
 * @returns {Promise}
 */
export const createMeetingRoom = (sessionId) => {
  return axios.post(`/live-sessions/${sessionId}/meeting-room`);
};

// ============================================
// SET MEETING LINK (FALLBACK)
// ============================================
/**
 * Set external meeting link (Zoom, Google Meet, etc.)
 * @param {string} sessionId - Session ID
 * @param {string} meetingLink - External meeting URL
 * @param {string} platform - Platform name (zoom, google-meet, etc.)
 * @returns {Promise}
 */
export const setMeetingLink = (sessionId, meetingLink, platform = 'custom') => {
  return axios.put(`/live-sessions/${sessionId}/meeting-link`, { meetingLink, platform });
};

// ============================================
// SCHEDULE SESSION
// ============================================
/**
 * Schedule a live session
 * @param {Object} scheduleData - { title, description, scheduledAt, duration }
 * @returns {Promise}
 */
export const scheduleSession = (scheduleData) => {
  return axios.post('/live-sessions/schedule', scheduleData);
};

// ============================================
// RESCHEDULE SESSION
// ============================================
/**
 * Reschedule a live session
 * @param {string} sessionId - Session ID
 * @param {Object} scheduleData - { scheduledAt }
 * @returns {Promise}
 */
export const rescheduleSession = (sessionId, scheduleData) => {
  return axios.put(`/live-sessions/${sessionId}/reschedule`, scheduleData);
};

// ============================================
// CANCEL SESSION
// ============================================
/**
 * Cancel a live session
 * @param {string} sessionId - Session ID
 * @param {string} reason - Cancellation reason
 * @returns {Promise}
 */
export const cancelSession = (sessionId, reason) => {
  return axios.post(`/live-sessions/${sessionId}/cancel`, { reason });
};

// ============================================
// MUTE PARTICIPANT
// ============================================
/**
 * Mute a participant (host only)
 * @param {string} sessionId - Session ID
 * @param {string} participantId - Participant ID
 * @returns {Promise}
 */
export const muteParticipant = (sessionId, participantId) => {
  return axios.post(`/live-sessions/${sessionId}/mute/${participantId}`);
};

// ============================================
// REMOVE PARTICIPANT
// ============================================
/**
 * Remove a participant (host only)
 * @param {string} sessionId - Session ID
 * @param {string} participantId - Participant ID
 * @returns {Promise}
 */
export const removeParticipant = (sessionId, participantId) => {
  return axios.post(`/live-sessions/${sessionId}/remove/${participantId}`);
};

// ============================================
// EXPORT ALL LIVE SESSION API METHODS
// ============================================
const liveSessionApi = {
  getLiveSessions,
  getSessionById,
  createLiveSession,
  createSession,
  updateLiveSession,
  updateSession,
  deleteLiveSession,
  deleteSession,
  joinLiveSession,
  joinSession,
  leaveLiveSession,
  leaveSession,
  startLiveSession,
  startSession,
  endLiveSession,
  endSession,
  getMySessions,
  getUpcomingSessions,
  getPastSessions,
  getSessionParticipants,
  getSessionRecording,
  getSessionToken,
  sendSessionMessage,
  getSessionMessages,
  getAgoraToken,
  getVideoServiceStatus,
  createMeetingRoom,
  setMeetingLink,
  scheduleSession,
  rescheduleSession,
  cancelSession,
  muteParticipant,
  removeParticipant,
};

export default liveSessionApi;