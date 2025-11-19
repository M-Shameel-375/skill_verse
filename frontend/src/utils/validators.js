// Validators
// ============================================
// VALIDATION FUNCTIONS
// ============================================

import { REGEX_PATTERNS } from './constants';

// ============================================
// EMAIL VALIDATION
// ============================================
export const validateEmail = (email) => {
  if (!email) {
    return 'Email is required';
  }
  if (!REGEX_PATTERNS.EMAIL.test(email)) {
    return 'Please enter a valid email address';
  }
  return null;
};

// ============================================
// PASSWORD VALIDATION
// ============================================
export const validatePassword = (password) => {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  if (password.length > 128) {
    return 'Password cannot exceed 128 characters';
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/(?=.*\d)/.test(password)) {
    return 'Password must contain at least one number';
  }
  if (!/(?=.*[@$!%*?&#])/.test(password)) {
    return 'Password must contain at least one special character (@$!%*?&#)';
  }
  return null;
};

// ============================================
// CONFIRM PASSWORD VALIDATION
// ============================================
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return null;
};

// ============================================
// NAME VALIDATION
// ============================================
export const validateName = (name) => {
  if (!name) {
    return 'Name is required';
  }
  if (name.trim().length < 2) {
    return 'Name must be at least 2 characters long';
  }
  if (name.trim().length > 50) {
    return 'Name cannot exceed 50 characters';
  }
  if (!/^[a-zA-Z\s]+$/.test(name)) {
    return 'Name can only contain letters and spaces';
  }
  return null;
};

// ============================================
// PHONE VALIDATION
// ============================================
export const validatePhone = (phone) => {
  if (!phone) {
    return null; // Phone is optional
  }
  if (!REGEX_PATTERNS.PHONE.test(phone)) {
    return 'Please enter a valid phone number';
  }
  return null;
};

// ============================================
// URL VALIDATION
// ============================================
export const validateUrl = (url) => {
  if (!url) {
    return null; // URL is optional
  }
  if (!REGEX_PATTERNS.URL.test(url)) {
    return 'Please enter a valid URL';
  }
  return null;
};

// ============================================
// REQUIRED FIELD VALIDATION
// ============================================
export const validateRequired = (value, fieldName = 'This field') => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required`;
  }
  return null;
};

// ============================================
// MIN LENGTH VALIDATION
// ============================================
export const validateMinLength = (value, min, fieldName = 'This field') => {
  if (value && value.length < min) {
    return `${fieldName} must be at least ${min} characters`;
  }
  return null;
};

// ============================================
// MAX LENGTH VALIDATION
// ============================================
export const validateMaxLength = (value, max, fieldName = 'This field') => {
  if (value && value.length > max) {
    return `${fieldName} cannot exceed ${max} characters`;
  }
  return null;
};

// ============================================
// NUMBER VALIDATION
// ============================================
export const validateNumber = (value, fieldName = 'This field') => {
  if (value && isNaN(value)) {
    return `${fieldName} must be a number`;
  }
  return null;
};

// ============================================
// MIN VALUE VALIDATION
// ============================================
export const validateMinValue = (value, min, fieldName = 'This field') => {
  if (value && parseFloat(value) < min) {
    return `${fieldName} must be at least ${min}`;
  }
  return null;
};

// ============================================
// MAX VALUE VALIDATION
// ============================================
export const validateMaxValue = (value, max, fieldName = 'This field') => {
  if (value && parseFloat(value) > max) {
    return `${fieldName} cannot exceed ${max}`;
  }
  return null;
};

// ============================================
// FILE SIZE VALIDATION
// ============================================
export const validateFileSize = (file, maxSize) => {
  if (!file) {
    return 'File is required';
  }
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
    return `File size must not exceed ${maxSizeMB}MB`;
  }
  return null;
};

// ============================================
// FILE TYPE VALIDATION
// ============================================
export const validateFileType = (file, allowedTypes) => {
  if (!file) {
    return 'File is required';
  }
  if (!allowedTypes.includes(file.type)) {
    return `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`;
  }
  return null;
};

// ============================================
// IMAGE FILE VALIDATION
// ============================================
export const validateImageFile = (file, maxSize = 10 * 1024 * 1024) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  const sizeError = validateFileSize(file, maxSize);
  if (sizeError) return sizeError;
  
  const typeError = validateFileType(file, allowedTypes);
  if (typeError) return typeError;
  
  return null;
};

// ============================================
// VIDEO FILE VALIDATION
// ============================================
export const validateVideoFile = (file, maxSize = 100 * 1024 * 1024) => {
  const allowedTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'];
  
  const sizeError = validateFileSize(file, maxSize);
  if (sizeError) return sizeError;
  
  const typeError = validateFileType(file, allowedTypes);
  if (typeError) return typeError;
  
  return null;
};

// ============================================
// ARRAY VALIDATION
// ============================================
export const validateArray = (arr, fieldName = 'This field') => {
  if (!Array.isArray(arr) || arr.length === 0) {
    return `${fieldName} must have at least one item`;
  }
  return null;
};

// ============================================
// DATE VALIDATION
// ============================================
export const validateDate = (date, fieldName = 'Date') => {
  if (!date) {
    return `${fieldName} is required`;
  }
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return `${fieldName} is invalid`;
  }
  return null;
};

// ============================================
// FUTURE DATE VALIDATION
// ============================================
export const validateFutureDate = (date, fieldName = 'Date') => {
  const dateError = validateDate(date, fieldName);
  if (dateError) return dateError;
  
  const dateObj = new Date(date);
  const now = new Date();
  
  if (dateObj <= now) {
    return `${fieldName} must be in the future`;
  }
  return null;
};

// ============================================
// PAST DATE VALIDATION
// ============================================
export const validatePastDate = (date, fieldName = 'Date') => {
  const dateError = validateDate(date, fieldName);
  if (dateError) return dateError;
  
  const dateObj = new Date(date);
  const now = new Date();
  
  if (dateObj >= now) {
    return `${fieldName} must be in the past`;
  }
  return null;
};

// ============================================
// RATING VALIDATION
// ============================================
export const validateRating = (rating) => {
  if (rating === null || rating === undefined) {
    return 'Rating is required';
  }
  if (rating < 1 || rating > 5) {
    return 'Rating must be between 1 and 5';
  }
  return null;
};

// ============================================
// PRICE VALIDATION
// ============================================
export const validatePrice = (price) => {
  if (!price && price !== 0) {
    return 'Price is required';
  }
  if (isNaN(price)) {
    return 'Price must be a number';
  }
  if (price < 0) {
    return 'Price cannot be negative';
  }
  return null;
};

// ============================================
// COMPOSITE VALIDATION
// ============================================
export const validateForm = (values, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach((field) => {
    const validators = Array.isArray(rules[field]) ? rules[field] : [rules[field]];
    
    for (const validator of validators) {
      const error = validator(values[field], values);
      if (error) {
        errors[field] = error;
        break;
      }
    }
  });
  
  return errors;
};

// ============================================
// CUSTOM VALIDATOR CREATOR
// ============================================
export const createValidator = (validatorFn, errorMessage) => {
  return (value) => {
    if (!validatorFn(value)) {
      return errorMessage;
    }
    return null;
  };
};