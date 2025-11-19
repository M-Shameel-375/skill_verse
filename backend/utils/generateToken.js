// Generate token utility
// ============================================
// JWT TOKEN GENERATION UTILITIES
// ============================================

const jwt = require('jsonwebtoken');
const config = require('../config/config');

// ============================================
// GENERATE ACCESS TOKEN
// ============================================
const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { 
      id: userId, 
      role: role 
    },
    config.jwt.secret,
    {
      expiresIn: config.jwt.expiry,
    }
  );
};

// ============================================
// GENERATE REFRESH TOKEN
// ============================================
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { 
      id: userId 
    },
    config.jwt.refreshSecret,
    {
      expiresIn: config.jwt.refreshExpiry,
    }
  );
};

// ============================================
// GENERATE BOTH TOKENS
// ============================================
const generateTokens = (userId, role) => {
  const accessToken = generateAccessToken(userId, role);
  const refreshToken = generateRefreshToken(userId);

  return {
    accessToken,
    refreshToken,
  };
};

// ============================================
// VERIFY ACCESS TOKEN
// ============================================
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
};

// ============================================
// VERIFY REFRESH TOKEN
// ============================================
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.refreshSecret);
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

// ============================================
// GENERATE EMAIL VERIFICATION TOKEN
// ============================================
const generateEmailVerificationToken = (userId) => {
  return jwt.sign(
    { 
      id: userId, 
      purpose: 'email_verification' 
    },
    config.jwt.secret,
    {
      expiresIn: '24h',
    }
  );
};

// ============================================
// GENERATE PASSWORD RESET TOKEN
// ============================================
const generatePasswordResetToken = (userId) => {
  return jwt.sign(
    { 
      id: userId, 
      purpose: 'password_reset' 
    },
    config.jwt.secret,
    {
      expiresIn: '1h',
    }
  );
};

// ============================================
// DECODE TOKEN (WITHOUT VERIFICATION)
// ============================================
const decodeToken = (token) => {
  return jwt.decode(token);
};

// ============================================
// EXPORTS
// ============================================
module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  generateEmailVerificationToken,
  generatePasswordResetToken,
  decodeToken,
};