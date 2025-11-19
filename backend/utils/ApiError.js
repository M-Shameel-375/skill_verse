// API Error utility
// ============================================
// CUSTOM API ERROR HANDLER
// ============================================

class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.success = false;
    
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // ============================================
  // PREDEFINED ERROR TYPES
  // ============================================

  static badRequest(message = 'Bad Request') {
    return new ApiError(400, message);
  }

  static unauthorized(message = 'Unauthorized - Please login') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Forbidden - You do not have permission') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }

  static conflict(message = 'Conflict - Resource already exists') {
    return new ApiError(409, message);
  }

  static unprocessableEntity(message = 'Unprocessable Entity') {
    return new ApiError(422, message);
  }

  static tooManyRequests(message = 'Too many requests - Please try again later') {
    return new ApiError(429, message);
  }

  static internal(message = 'Internal Server Error') {
    return new ApiError(500, message);
  }

  static notImplemented(message = 'Not Implemented') {
    return new ApiError(501, message);
  }

  static serviceUnavailable(message = 'Service Unavailable') {
    return new ApiError(503, message);
  }

  // ============================================
  // VALIDATION ERROR
  // ============================================

  static validationError(errors) {
    const error = new ApiError(422, 'Validation Error');
    error.errors = errors;
    return error;
  }
}

module.exports = ApiError;