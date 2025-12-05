// ============================================
// VIDEO SERVICE (Agora RTC Token Generation)
// ============================================

const config = require('../config/config');

// Agora token types
const RtcRole = {
  PUBLISHER: 1,
  SUBSCRIBER: 2,
};

// Privilege expiration constants
const PRIVILEGE_EXPIRATION_TIME = 3600; // 1 hour in seconds

/**
 * Generate Agora RTC Token
 * @param {string} channelName - The channel name (usually session ID)
 * @param {string|number} uid - User ID (can be 0 for dynamic assignment)
 * @param {string} role - 'host' or 'audience'
 * @param {number} expireTime - Token expiration time in seconds
 * @returns {Object} - Token info object
 */
const generateAgoraToken = (channelName, uid = 0, role = 'audience', expireTime = PRIVILEGE_EXPIRATION_TIME) => {
  const { appId, appCertificate } = config.video.agora;

  // Validate Agora credentials
  if (!appId || !appCertificate || appId === 'your_agora_app_id') {
    console.warn('Agora credentials not configured. Returning mock token for development.');
    return {
      token: null,
      appId: appId || 'DEMO_APP_ID',
      channel: channelName,
      uid: uid,
      role: role,
      expireTime: expireTime,
      message: 'Agora not configured. Use external meeting link or configure Agora credentials.',
      useFallback: true,
    };
  }

  try {
    // Dynamic import of agora-access-token (if available)
    const { RtcTokenBuilder, RtcRole: AgoraRtcRole } = require('agora-access-token');
    
    const rtcRole = role === 'host' ? AgoraRtcRole.PUBLISHER : AgoraRtcRole.SUBSCRIBER;
    
    // Calculate privilege expire time
    const currentTime = Math.floor(Date.now() / 1000);
    const privilegeExpireTime = currentTime + expireTime;
    
    // Generate token
    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid,
      rtcRole,
      privilegeExpireTime
    );

    return {
      token,
      appId,
      channel: channelName,
      uid,
      role,
      expireTime: privilegeExpireTime,
      useFallback: false,
    };
  } catch (error) {
    console.error('Agora token generation error:', error.message);
    
    // Return fallback response
    return {
      token: null,
      appId: appId,
      channel: channelName,
      uid: uid,
      role: role,
      expireTime: expireTime,
      message: 'Token generation failed. Use external meeting link.',
      useFallback: true,
      error: error.message,
    };
  }
};

/**
 * Generate a unique channel name for a session
 * @param {string} sessionId - Live session MongoDB ID
 * @returns {string} - Channel name
 */
const generateChannelName = (sessionId) => {
  return `skillverse_session_${sessionId}`;
};

/**
 * Validate if video service is configured
 * @returns {Object} - Configuration status
 */
const getVideoServiceStatus = () => {
  const { provider, agora, twilio } = config.video;

  const agoraConfigured = agora.appId && 
    agora.appCertificate && 
    agora.appId !== 'your_agora_app_id';

  const twilioConfigured = twilio.accountSid && 
    twilio.authToken && 
    twilio.accountSid !== 'your_twilio_account_sid';

  return {
    provider,
    configured: provider === 'agora' ? agoraConfigured : twilioConfigured,
    agora: {
      configured: agoraConfigured,
      appId: agoraConfigured ? agora.appId : null,
    },
    twilio: {
      configured: twilioConfigured,
    },
    fallbackAvailable: true,
    fallbackMessage: 'External meeting links (Zoom, Google Meet) can be used as fallback',
  };
};

/**
 * Create meeting room info
 * @param {string} sessionId - Session ID
 * @param {string} hostId - Host user ID
 * @returns {Object} - Room information
 */
const createMeetingRoom = (sessionId, hostId) => {
  const channelName = generateChannelName(sessionId);
  const hostToken = generateAgoraToken(channelName, 0, 'host');
  
  return {
    channelName,
    hostToken: hostToken.token,
    appId: hostToken.appId,
    useFallback: hostToken.useFallback,
    createdAt: new Date(),
  };
};

module.exports = {
  generateAgoraToken,
  generateChannelName,
  getVideoServiceStatus,
  createMeetingRoom,
  RtcRole,
};
