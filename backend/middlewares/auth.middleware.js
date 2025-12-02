// Auth middleware
// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================

const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

// ============================================
// PROTECT ROUTES - VERIFY CLERK SESSION
// ============================================
exports.protect = ClerkExpressRequireAuth();

// ============================================
// OPTIONAL AUTH
// ============================================
exports.optionalAuth = (req, res, next) => {
  next();
};