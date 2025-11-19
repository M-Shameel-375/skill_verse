// Validators utility
// ============================================
// VALIDATION UTILITIES
// ============================================

const { validationResult } = require('express-validator');
const ApiError = require('./ApiError');

// ============================================
// VALIDATE REQUEST
// ============================================
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => ({
      field: err.param,
      message: err.msg,
    }));

    throw ApiError.validationError(extractedErrors);
  }
  
  next();
};

// ============================================
// EMAIL VALIDATOR
// ============================================
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ============================================
// PASSWORD STRENGTH VALIDATOR
// ============================================
const isStrongPassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
  return passwordRegex.test(password);
};

// ============================================
// USERNAME VALIDATOR
// ============================================
const isValidUsername = (username) => {
  // 3-30 characters, alphanumeric and underscores only
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  return usernameRegex.test(username);
};

// ============================================
// PHONE NUMBER VALIDATOR
// ============================================
const isValidPhoneNumber = (phone) => {
  // Basic international phone format
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
};

// ============================================
// URL VALIDATOR
// ============================================
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

// ============================================
// MONGODB OBJECTID VALIDATOR
// ============================================
const isValidObjectId = (id) => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

// ============================================
// SANITIZE INPUT
// ============================================
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript:
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers
};

// ============================================
// VALIDATE FILE TYPE
// ============================================
const isValidFileType = (mimetype, allowedTypes) => {
  return allowedTypes.includes(mimetype);
};

// ============================================
// VALIDATE FILE SIZE
// ============================================
const isValidFileSize = (size, maxSize) => {
  return size <= maxSize;
};

// ============================================
// VALIDATE DATE RANGE
// ============================================
const isValidDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start < end;
};

// ============================================
// VALIDATE PRICE
// ============================================
const isValidPrice = (price) => {
  return typeof price === 'number' && price >= 0;
};

// ============================================
// EXPORTS
// ============================================
module.exports = {
  validateRequest,
  isValidEmail,
  isStrongPassword,
  isValidUsername,
  isValidPhoneNumber,
  isValidUrl,
  isValidObjectId,
  sanitizeInput,
  isValidFileType,
  isValidFileSize,
  isValidDateRange,
  isValidPrice,
};