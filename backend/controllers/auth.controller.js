// Auth controller
// ============================================
// AUTHENTICATION CONTROLLER
// ============================================

const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const User = require('../models/User.model');
const {
  generateTokens,
  generateEmailVerificationToken,
  generatePasswordResetToken,
  verifyAccessToken,
  verifyRefreshToken,
} = require('../utils/generateToken');
const { sendEmail } = require('../services/email.service');
const config = require('../config/config');

// ============================================
// @desc    Register new user
// @route   POST /api/v1/auth/register
// @access  Public
// ============================================
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw ApiError.conflict('User with this email already exists');
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'learner',
    phone,
  });

  // Generate email verification token
  const verificationToken = generateEmailVerificationToken(user._id);
  user.emailVerificationToken = verificationToken;
  user.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  await user.save();

  // Send verification email
  const verificationUrl = `${config.frontend.url}/verify-email/${verificationToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Email Verification - SkillVerse',
    template: 'email-verification',
    data: {
      name: user.name,
      verificationUrl,
    },
  });

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id, user.role);

  // Save refresh token
  user.refreshToken = refreshToken;
  await user.save();

  // Remove password from output
  user.password = undefined;

  ApiResponse.created(res, {
    user,
    accessToken,
    refreshToken,
  }, 'Registration successful. Please verify your email.');
});

// ============================================
// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
// ============================================
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw ApiError.unauthorized('Invalid credentials');
  }

  // Check if account is locked
  if (user.isAccountLocked()) {
    throw ApiError.forbidden(
      'Account is temporarily locked due to multiple failed login attempts. Please try again later.'
    );
  }

  // Check password
  const isPasswordMatch = await user.matchPassword(password);
  if (!isPasswordMatch) {
    await user.incrementLoginAttempts();
    throw ApiError.unauthorized('Invalid credentials');
  }

  // Reset login attempts on successful login
  await user.resetLoginAttempts();

  // Check if account is active
  if (user.status !== 'active') {
    throw ApiError.forbidden(`Your account is ${user.status}`);
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id, user.role);

  // Save refresh token and update last login
  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save();

  // Remove password from output
  user.password = undefined;

  ApiResponse.success(res, {
    user,
    accessToken,
    refreshToken,
  }, 'Login successful');
});

// ============================================
// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
// ============================================
exports.logout = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  // Clear refresh token
  user.refreshToken = undefined;
  await user.save();

  ApiResponse.success(res, null, 'Logout successful');
});

// ============================================
// @desc    Refresh access token
// @route   POST /api/v1/auth/refresh-token
// @access  Public
// ============================================
exports.refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw ApiError.badRequest('Refresh token is required');
  }

  // Verify refresh token
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  // Find user
  const user = await User.findById(decoded.id);
  if (!user || user.refreshToken !== refreshToken) {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  // Generate new tokens
  const tokens = generateTokens(user._id, user.role);

  // Update refresh token
  user.refreshToken = tokens.refreshToken;
  await user.save();

  ApiResponse.success(res, tokens, 'Token refreshed successfully');
});

// ============================================
// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
// ============================================
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('learnerProfile.enrolledCourses', 'title thumbnail')
    .populate('learnerProfile.certificates')
    .populate('gamification.badges');

  ApiResponse.success(res, user, 'User retrieved successfully');
});

// ============================================
// @desc    Verify email
// @route   GET /api/v1/auth/verify-email/:token
// @access  Public
// ============================================
exports.verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  // Find user with valid token
  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw ApiError.badRequest('Invalid or expired verification token');
  }

  // Update user
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  await user.save();

  ApiResponse.success(res, null, 'Email verified successfully');
});

// ============================================
// @desc    Resend email verification
// @route   POST /api/v1/auth/resend-verification
// @access  Private
// ============================================
exports.resendVerificationEmail = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user.isEmailVerified) {
    throw ApiError.badRequest('Email is already verified');
  }

  // Generate new verification token
  const verificationToken = generateEmailVerificationToken(user._id);
  user.emailVerificationToken = verificationToken;
  user.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000;
  await user.save();

  // Send verification email
  const verificationUrl = `${config.frontend.url}/verify-email/${verificationToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Email Verification - SkillVerse',
    template: 'email-verification',
    data: {
      name: user.name,
      verificationUrl,
    },
  });

  ApiResponse.success(res, null, 'Verification email sent successfully');
});

// ============================================
// @desc    Forgot password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
// ============================================
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal if user exists or not
    ApiResponse.success(
      res,
      null,
      'If an account exists with this email, you will receive a password reset link'
    );
    return;
  }

  // Generate reset token
  const resetToken = generatePasswordResetToken(user._id);
  user.passwordResetToken = resetToken;
  user.passwordResetExpire = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save();

  // Send reset email
  const resetUrl = `${config.frontend.url}/reset-password/${resetToken}`;
  try {
    await sendEmail({
      to: user.email,
      subject: 'Password Reset - SkillVerse',
      template: 'password-reset',
      data: {
        name: user.name,
        resetUrl,
      },
    });

    ApiResponse.success(
      res,
      null,
      'Password reset link sent to your email'
    );
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save();

    throw ApiError.internal('Error sending email. Please try again later.');
  }
});

// ============================================
// @desc    Reset password
// @route   POST /api/v1/auth/reset-password/:token
// @access  Public
// ============================================
exports.resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  // Find user with valid reset token
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw ApiError.badRequest('Invalid or expired reset token');
  }

  // Update password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpire = undefined;
  await user.save();

  // Send confirmation email
  await sendEmail({
    to: user.email,
    subject: 'Password Changed - SkillVerse',
    template: 'password-changed',
    data: {
      name: user.name,
    },
  });

  ApiResponse.success(res, null, 'Password reset successful');
});

// ============================================
// @desc    Change password
// @route   PUT /api/v1/auth/change-password
// @access  Private
// ============================================
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  // Verify current password
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    throw ApiError.badRequest('Current password is incorrect');
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Send notification email
  await sendEmail({
    to: user.email,
    subject: 'Password Changed - SkillVerse',
    template: 'password-changed',
    data: {
      name: user.name,
    },
  });

  ApiResponse.success(res, null, 'Password changed successfully');
});

// ============================================
// @desc    Update user details
// @route   PUT /api/v1/auth/update-details
// @access  Private
// ============================================
exports.updateDetails = asyncHandler(async (req, res) => {
  const allowedUpdates = ['name', 'phone', 'bio', 'title', 'location'];
  const updates = {};

  Object.keys(req.body).forEach((key) => {
    if (allowedUpdates.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    {
      new: true,
      runValidators: true,
    }
  );

  ApiResponse.success(res, user, 'Profile updated successfully');
});

// ============================================
// @desc    Delete account
// @route   DELETE /api/v1/auth/delete-account
// @access  Private
// ============================================
exports.deleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  // Verify password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw ApiError.badRequest('Password is incorrect');
  }

  // Soft delete (mark as deleted)
  user.status = 'inactive';
  user.deletedAt = new Date();
  await user.save();

  // Send confirmation email
  await sendEmail({
    to: user.email,
    subject: 'Account Deleted - SkillVerse',
    template: 'account-deleted',
    data: {
      name: user.name,
    },
  });

  ApiResponse.success(res, null, 'Account deleted successfully');
});

// ============================================
// @desc    Check email availability
// @route   POST /api/v1/auth/check-email
// @access  Public
// ============================================
exports.checkEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  ApiResponse.success(res, {
    available: !user,
  });
});

// ============================================
// @desc    Social login (Google, Facebook, etc.)
// @route   POST /api/v1/auth/social-login
// @access  Public
// ============================================
exports.socialLogin = asyncHandler(async (req, res) => {
  const { provider, token, userData } = req.body;

  // Verify token with provider (implementation depends on provider)
  // This is a simplified example

  let user = await User.findOne({ email: userData.email });

  if (!user) {
    // Create new user
    user = await User.create({
      name: userData.name,
      email: userData.email,
      profileImage: {
        url: userData.picture,
      },
      isEmailVerified: true,
      role: 'learner',
    });
  }

  // Generate tokens
  const tokens = generateTokens(user._id, user.role);

  // Update refresh token and last login
  user.refreshToken = tokens.refreshToken;
  user.lastLogin = new Date();
  await user.save();

  user.password = undefined;

  ApiResponse.success(res, {
    user,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  }, 'Login successful');
});