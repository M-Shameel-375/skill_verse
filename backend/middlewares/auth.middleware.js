// Auth middleware
// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================

const User = require('../models/User.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// Check if Clerk is configured
const isClerkConfigured = !!process.env.CLERK_SECRET_KEY;

let ClerkExpressRequireAuth, ClerkExpressWithAuth;

if (isClerkConfigured) {
  try {
    const clerk = require('@clerk/clerk-sdk-node');
    ClerkExpressRequireAuth = clerk.ClerkExpressRequireAuth;
    ClerkExpressWithAuth = clerk.ClerkExpressWithAuth;
  } catch (err) {
    console.warn('⚠️ Clerk SDK not available:', err.message);
  }
}

// ============================================
// LOAD USER FROM CLERK AUTH
// ============================================
const loadUser = asyncHandler(async (req, res, next) => {
  // If Clerk is not configured, try to get user from header or skip
  if (!isClerkConfigured) {
    // In development without Clerk, check for user email in header
    const userEmail = req.headers['x-user-email'];
    if (userEmail) {
      const user = await User.findOne({ email: userEmail });
      if (user) {
        req.user = user;
        return next();
      }
    }
    return next(ApiError.unauthorized('Authentication required. Clerk is not configured.'));
  }

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
if (isClerkConfigured && ClerkExpressRequireAuth) {
  exports.protect = [
    ClerkExpressRequireAuth({
      onError: (error) => {
        console.error('Clerk auth error:', error.message);
      }
    }),
    loadUser
  ];
} else {
  // Fallback when Clerk is not configured
  exports.protect = [
    asyncHandler(async (req, res, next) => {
      console.warn('⚠️ Clerk not configured - using development auth bypass');
      // In development, try to get user from localStorage sync
      const userEmail = req.headers['x-user-email'];
      if (userEmail) {
        const user = await User.findOne({ email: userEmail });
        if (user) {
          req.user = user;
          return next();
        }
      }
      return next(ApiError.unauthorized('Authentication required'));
    })
  ];
}

// ============================================
// OPTIONAL AUTH - USER MAY OR MAY NOT BE LOGGED IN
// ============================================
if (isClerkConfigured && ClerkExpressWithAuth) {
  exports.optionalAuth = [
    ClerkExpressWithAuth(),
    asyncHandler(async (req, res, next) => {
      if (req.auth && req.auth.userId) {
        const user = await User.findOne({ clerkId: req.auth.userId });
        if (user) {
          req.user = user;
        }
      }
      next();
    })
  ];
} else {
  exports.optionalAuth = [
    asyncHandler(async (req, res, next) => {
      const userEmail = req.headers['x-user-email'];
      if (userEmail) {
        const user = await User.findOne({ email: userEmail });
        if (user) {
          req.user = user;
        }
      }
      next();
    })
  ];
}