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
  // Fallback when Clerk is not configured - development mode
  exports.protect = [
    asyncHandler(async (req, res, next) => {
      console.warn('⚠️ Clerk not configured - using development auth bypass');
      
      // Try multiple ways to identify the user in dev mode
      let user = null;
      
      // Method 1: Check for Clerk ID from Bearer token (JWT decode attempt)
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          // Try to decode JWT to get user info (development only)
          const token = authHeader.split(' ')[1];
          const jwt = require('jsonwebtoken');
          // Clerk tokens are JWTs - try to decode without verification in dev
          const decoded = jwt.decode(token);
          if (decoded && decoded.sub) {
            // Clerk userId is in 'sub' claim
            user = await User.findOne({ clerkId: decoded.sub });
            if (user) {
              console.log('✅ Dev auth: Found user by Clerk ID from token');
            }
          }
        } catch (err) {
          // Token decode failed, continue to other methods
        }
      }
      
      // Method 2: Check x-user-email header
      if (!user) {
        const userEmail = req.headers['x-user-email'];
        if (userEmail) {
          user = await User.findOne({ email: userEmail });
          if (user) {
            console.log('✅ Dev auth: Found user by x-user-email header');
          }
        }
      }
      
      // Method 3: Check x-clerk-user-id header (custom header)
      if (!user) {
        const clerkUserId = req.headers['x-clerk-user-id'];
        if (clerkUserId) {
          user = await User.findOne({ clerkId: clerkUserId });
          if (user) {
            console.log('✅ Dev auth: Found user by x-clerk-user-id header');
          }
        }
      }
      
      // Method 4: Get most recently synced user (last resort in development)
      if (!user && process.env.NODE_ENV === 'development') {
        user = await User.findOne({}).sort({ updatedAt: -1 });
        if (user) {
          console.log('✅ Dev auth: Using most recently active user:', user.email);
        }
      }
      
      if (user) {
        req.user = user;
        return next();
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