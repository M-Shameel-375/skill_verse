// Validation middleware
// ============================================
// VALIDATION MIDDLEWARE (EXPRESS-VALIDATOR)
// ============================================

const { body, param, query, validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

// ============================================
// HANDLE VALIDATION ERRORS
// ============================================
exports.validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));

    throw ApiError.validationError(extractedErrors);
  }

  next();
};

// ============================================
// USER REGISTRATION VALIDATION
// ============================================
exports.validateRegistration = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/)
    .withMessage(
      'Password must contain at least one uppercase, one lowercase, one number and one special character'
    ),

  body('role')
    .optional()
    .isIn(['learner', 'educator', 'skillExchanger'])
    .withMessage('Invalid role'),

  body('phone')
    .optional()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please provide a valid phone number'),
];

// ============================================
// USER LOGIN VALIDATION
// ============================================
exports.validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password').notEmpty().withMessage('Password is required'),
];

// ============================================
// UPDATE PROFILE VALIDATION
// ============================================
exports.validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('phone')
    .optional()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please provide a valid phone number'),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters'),

  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),

  body('socialLinks.linkedin')
    .optional()
    .isURL()
    .withMessage('Please provide a valid LinkedIn URL'),

  body('socialLinks.github')
    .optional()
    .isURL()
    .withMessage('Please provide a valid GitHub URL'),

  body('socialLinks.website')
    .optional()
    .isURL()
    .withMessage('Please provide a valid website URL'),
];

// ============================================
// CHANGE PASSWORD VALIDATION
// ============================================
exports.validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/)
    .withMessage(
      'Password must contain at least one uppercase, one lowercase, one number and one special character'
    ),

  body('confirmPassword')
    .notEmpty()
    .withMessage('Confirm password is required')
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('Passwords do not match'),
];

// ============================================
// COURSE CREATION VALIDATION
// ============================================
exports.validateCourse = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Course title is required')
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Course description is required')
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be between 20 and 2000 characters'),

  body('category')
    .trim()
    .notEmpty()
    .withMessage('Course category is required'),

  body('level')
    .notEmpty()
    .withMessage('Course level is required')
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Invalid course level'),

  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  body('duration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer'),

  body('language')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Language must be between 2 and 50 characters'),
];

// ============================================
// QUIZ CREATION VALIDATION
// ============================================
exports.validateQuiz = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Quiz title is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),

  body('course')
    .notEmpty()
    .withMessage('Course ID is required')
    .isMongoId()
    .withMessage('Invalid course ID'),

  body('questions')
    .isArray({ min: 1 })
    .withMessage('At least one question is required'),

  body('questions.*.questionText')
    .trim()
    .notEmpty()
    .withMessage('Question text is required'),

  body('questions.*.options')
    .isArray({ min: 2, max: 6 })
    .withMessage('Each question must have between 2 and 6 options'),

  body('questions.*.correctAnswer')
    .notEmpty()
    .withMessage('Correct answer is required')
    .isInt({ min: 0 })
    .withMessage('Correct answer must be a valid option index'),

  body('passingScore')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Passing score must be between 0 and 100'),

  body('timeLimit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Time limit must be a positive integer'),
];

// ============================================
// REVIEW VALIDATION
// ============================================
exports.validateReview = [
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),

  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment must not exceed 500 characters'),
];

// ============================================
// MONGODB ID VALIDATION
// ============================================
exports.validateMongoId = (paramName = 'id') => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName}`),
];

// ============================================
// PAGINATION VALIDATION
// ============================================
exports.validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('sort')
    .optional()
    .isString()
    .withMessage('Sort must be a string'),
];

// ============================================
// SKILL EXCHANGE VALIDATION
// ============================================
exports.validateSkillExchange = [
  body('offeredSkills')
    .isArray({ min: 1 })
    .withMessage('At least one offered skill is required'),

  body('desiredSkills')
    .isArray({ min: 1 })
    .withMessage('At least one desired skill is required'),

  body('availability')
    .optional()
    .isArray()
    .withMessage('Availability must be an array'),
];

// ============================================
// LIVE SESSION VALIDATION
// ============================================
exports.validateLiveSession = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Session title is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Session description is required'),

  body('scheduledAt')
    .notEmpty()
    .withMessage('Scheduled date is required')
    .isISO8601()
    .withMessage('Invalid date format')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Scheduled date must be in the future');
      }
      return true;
    }),

  body('duration')
    .notEmpty()
    .withMessage('Duration is required')
    .isInt({ min: 15, max: 480 })
    .withMessage('Duration must be between 15 and 480 minutes'),

  body('maxParticipants')
    .optional()
    .isInt({ min: 1, max: 500 })
    .withMessage('Max participants must be between 1 and 500'),
];

module.exports.validate = exports.validate;