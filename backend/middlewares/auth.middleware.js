// Auth middleware
// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================

const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { verifyAccessToken } = require('../utils/generateToken');
const User = require('../models/User.model');

// ============================================
// PROTECT ROUTES - VERIFY JWT TOKEN
// ============================================
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check for token in cookies (optional)
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Verify token exists
  if (!token) {
    throw ApiError.unauthorized('Not authorized to access this route');
  }

  try {
    // Verify token
    const decoded = verifyAccessToken(token);

    // Get user from token
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      throw ApiError.unauthorized('User no longer exists');
    }

    // Check if user is active
    if (user.status === 'inactive' || user.status === 'banned') {
      throw ApiError.forbidden('Your account has been deactivated');
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    throw ApiError.unauthorized('Not authorized to access this route');
  }
});

// ============================================
// OPTIONAL AUTH - DOESN'T FAIL IF NO TOKEN
// ============================================
exports.optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.status === 'active') {
        req.user = user;
      }
    } catch (error) {
      // Silently fail - continue without user
    }
  }

  next();
});

// ============================================
// VERIFY EMAIL
// ============================================
exports.verifyEmail = asyncHandler(async (req, res, next) => {
  if (!req.user.isEmailVerified) {
    throw ApiError.forbidden('Please verify your email to access this resource');
  }
  next();
});

// ============================================
// CHECK ACCOUNT STATUS
// ============================================
exports.checkAccountStatus = asyncHandler(async (req, res, next) => {
  const user = req.user;

  if (user.status === 'suspended') {
    throw ApiError.forbidden('Your account has been suspended');
  }

  if (user.status === 'banned') {
    throw ApiError.forbidden('Your account has been banned');
  }

  if (user.status === 'inactive') {
    throw ApiError.forbidden('Your account is inactive');
  }

  next();
});