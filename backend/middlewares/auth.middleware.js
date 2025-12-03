// Auth middleware
// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================

const { ClerkExpressRequireAuth, ClerkExpressWithAuth } = require('@clerk/clerk-sdk-node');
const User = require('../models/User.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// ============================================
// LOAD USER FROM CLERK AUTH
// ============================================
const loadUser = asyncHandler(async (req, res, next) => {
  // Clerk middleware adds auth to req.auth
  if (!req.auth || !req.auth.userId) {
    return next(ApiError.unauthorized('Authentication required'));
  }

  // Find user in MongoDB by Clerk ID
  const user = await User.findOne({ clerkId: req.auth.userId });

  if (!user) {
    return next(ApiError.unauthorized('User not found. Please complete registration.'));
  }

  // Attach user to request
  req.user = user;
  next();
});

// ============================================
// PROTECT ROUTES - VERIFY CLERK SESSION + LOAD USER
// ============================================
exports.protect = [
  ClerkExpressRequireAuth({
    // This catches the error and sends it down the middleware chain
    onError: (error) => {
      console.error('Clerk auth error:', error.message);
    }
  }),
  loadUser
];

// ============================================
// OPTIONAL AUTH - USER MAY OR MAY NOT BE LOGGED IN
// ============================================
exports.optionalAuth = [
  ClerkExpressWithAuth(),
  asyncHandler(async (req, res, next) => {
    // If user is authenticated, try to load them
    if (req.auth && req.auth.userId) {
      const user = await User.findOne({ clerkId: req.auth.userId });
      if (user) {
        req.user = user;
      }
    }
    next();
  })
];