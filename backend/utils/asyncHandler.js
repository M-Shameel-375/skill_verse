// Async handler utility
// ============================================
// ASYNC HANDLER - WRAPS ASYNC FUNCTIONS
// ============================================

/**
 * Wraps async route handlers to catch errors
 * Eliminates the need for try-catch blocks in controllers
 */

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = asyncHandler;