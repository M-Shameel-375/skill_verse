// Error handler middleware
// ============================================
// GLOBAL ERROR HANDLER MIDDLEWARE
// ============================================

const ApiError = require('../utils/ApiError');
const config = require('../config/config');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Log error for debugging (only in development)
  if (config.server.env === 'development') {
    console.error('Error Stack:', err.stack);
    console.error('Error Details:', err);
  }

  // ============================================
  // MONGOOSE BAD OBJECTID ERROR
  // ============================================
  if (err.name === 'CastError') {
    const message = `Resource not found with id: ${err.value}`;
    error = ApiError.notFound(message);
  }

  // ============================================
  // MONGOOSE DUPLICATE KEY ERROR
  // ============================================
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} already exists`;
    error = ApiError.conflict(message);
  }

  // ============================================
  // MONGOOSE VALIDATION ERROR
  // ============================================
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((val) => ({
      field: val.path,
      message: val.message,
    }));
    error = ApiError.validationError(errors);
  }

  // ============================================
  // JWT ERROR
  // ============================================
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Please login again';
    error = ApiError.unauthorized(message);
  }

  // ============================================
  // JWT EXPIRED ERROR
  // ============================================
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired. Please login again';
    error = ApiError.unauthorized(message);
  }

  // ============================================
  // MULTER FILE SIZE ERROR
  // ============================================
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File size too large. Maximum allowed size is 10MB';
    error = ApiError.badRequest(message);
  }

  // ============================================
  // MULTER FILE TYPE ERROR
  // ============================================
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Invalid file type';
    error = ApiError.badRequest(message);
  }

  // ============================================
  // STRIPE ERROR
  // ============================================
  if (err.type && err.type.includes('Stripe')) {
    error = ApiError.badRequest(err.message || 'Payment processing failed');
  }

  // ============================================
  // SEND ERROR RESPONSE
  // ============================================
  res.status(error.statusCode || 500).json({
    success: false,
    statusCode: error.statusCode || 500,
    message: error.message || 'Internal Server Error',
    errors: error.errors || undefined,
    stack: config.server.env === 'development' ? err.stack : undefined,
  });
};

module.exports = errorHandler;