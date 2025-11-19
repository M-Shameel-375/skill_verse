// Rate limiter middleware
// ============================================
// RATE LIMITING MIDDLEWARE
// ============================================

const rateLimit = require('express-rate-limit');
const config = require('../config/config');

// ============================================
// GENERAL API RATE LIMITER
// ============================================
const generalLimiter = rateLimit({
  windowMs: config.security.rateLimitWindowMs, // 15 minutes
  max: config.security.rateLimitMaxRequests, // 100 requests per window
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================
// AUTH ROUTE RATE LIMITER (More Strict)
// ============================================
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Too many login attempts, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================
// PASSWORD RESET RATE LIMITER
// ============================================
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per hour
  message: {
    success: false,
    message: 'Too many password reset attempts, please try again after an hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================
// EMAIL VERIFICATION RATE LIMITER
// ============================================
const emailVerificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per hour
  message: {
    success: false,
    message: 'Too many verification email requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================
// FILE UPLOAD RATE LIMITER
// ============================================
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 uploads per hour
  message: {
    success: false,
    message: 'Too many file uploads, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================
// PAYMENT RATE LIMITER
// ============================================
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 payment attempts per window
  message: {
    success: false,
    message: 'Too many payment attempts, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================
// EXPORTS
// ============================================
module.exports = generalLimiter;

module.exports.authLimiter = authLimiter;
module.exports.passwordResetLimiter = passwordResetLimiter;
module.exports.emailVerificationLimiter = emailVerificationLimiter;
module.exports.uploadLimiter = uploadLimiter;
module.exports.paymentLimiter = paymentLimiter;