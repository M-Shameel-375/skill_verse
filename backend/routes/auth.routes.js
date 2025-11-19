// Auth routes
// ============================================
// AUTH ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  updateDetails,
  deleteAccount,
  checkEmail,
  socialLogin,
} = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authLimiter, passwordResetLimiter, emailVerificationLimiter } = require('../middlewares/rateLimiter.middleware');
const {
  validateRegistration,
  validateLogin,
  validateChangePassword,
  validate,
} = require('../middlewares/validation.middleware');

// Public routes
router.post('/register', authLimiter, validateRegistration, validate, register);
router.post('/login', authLimiter, validateLogin, validate, login);
router.post('/refresh-token', refreshToken);
router.post('/check-email', checkEmail);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.post('/reset-password/:token', passwordResetLimiter, resetPassword);
router.post('/social-login', socialLogin);

// Protected routes
router.use(protect); // All routes below require authentication

router.get('/me', getMe);
router.post('/logout', logout);
router.post('/resend-verification', emailVerificationLimiter, resendVerificationEmail);
router.put('/change-password', validateChangePassword, validate, changePassword);
router.put('/update-details', updateDetails);
router.delete('/delete-account', deleteAccount);

module.exports = router;