// ============================================
// AUTHENTICATION API ENDPOINTS
// ============================================

import axios from './axios';

const AUTH_ENDPOINTS = {
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh-token',
  GET_ME: '/auth/me',
  VERIFY_EMAIL: '/auth/verify-email',
  RESEND_VERIFICATION: '/auth/resend-verification',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  CHANGE_PASSWORD: '/auth/change-password',
  UPDATE_DETAILS: '/auth/update-details',
  DELETE_ACCOUNT: '/auth/delete-account',
  CHECK_EMAIL: '/auth/check-email',
  SOCIAL_LOGIN: '/auth/social-login',
};

// ============================================
// REGISTER NEW USER
// ============================================
/**
 * Register a new user
 * @param {Object} userData - { name, email, password, role, phone }
 * @returns {Promise}
 */
export const register = (userData) => {
  return axios.post(AUTH_ENDPOINTS.REGISTER, userData);
};

// ============================================
// LOGIN USER
// ============================================
/**
 * Login user with email and password
 * @param {Object} credentials - { email, password }
 * @returns {Promise}
 */
export const login = (credentials) => {
  return axios.post(AUTH_ENDPOINTS.LOGIN, credentials);
};

// ============================================
// LOGOUT USER
// ============================================
/**
 * Logout current user
 * @returns {Promise}
 */
export const logout = () => {
  return axios.post(AUTH_ENDPOINTS.LOGOUT);
};

// ============================================
// REFRESH ACCESS TOKEN
// ============================================
/**
 * Refresh access token using refresh token
 * @param {string} refreshToken
 * @returns {Promise}
 */
export const refreshToken = (refreshToken) => {
  return axios.post(AUTH_ENDPOINTS.REFRESH_TOKEN, { refreshToken });
};

// ============================================
// GET CURRENT USER
// ============================================
/**
 * Get current logged in user details
 * @returns {Promise}
 */
export const getMe = () => {
  return axios.get(AUTH_ENDPOINTS.GET_ME);
};

// ============================================
// VERIFY EMAIL
// ============================================
/**
 * Verify user email with token
 * @param {string} token - Email verification token
 * @returns {Promise}
 */
export const verifyEmail = (token) => {
  return axios.get(`${AUTH_ENDPOINTS.VERIFY_EMAIL}/${token}`);
};

// ============================================
// RESEND EMAIL VERIFICATION
// ============================================
/**
 * Resend email verification link
 * @returns {Promise}
 */
export const resendVerificationEmail = () => {
  return axios.post(AUTH_ENDPOINTS.RESEND_VERIFICATION);
};

// ============================================
// FORGOT PASSWORD
// ============================================
/**
 * Request password reset link
 * @param {string} email - User email
 * @returns {Promise}
 */
export const forgotPassword = (email) => {
  return axios.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email });
};

// ============================================
// RESET PASSWORD
// ============================================
/**
 * Reset password with token
 * @param {string} token - Password reset token
 * @param {string} password - New password
 * @returns {Promise}
 */
export const resetPassword = (token, password) => {
  return axios.post(`${AUTH_ENDPOINTS.RESET_PASSWORD}/${token}`, { password });
};

// ============================================
// CHANGE PASSWORD
// ============================================
/**
 * Change password for logged in user
 * @param {Object} passwords - { currentPassword, newPassword }
 * @returns {Promise}
 */
export const changePassword = (passwords) => {
  return axios.put(AUTH_ENDPOINTS.CHANGE_PASSWORD, passwords);
};

// ============================================
// UPDATE USER DETAILS
// ============================================
/**
 * Update user profile details
 * @param {Object} updates - { name, phone, bio, title, location }
 * @returns {Promise}
 */
export const updateDetails = (updates) => {
  return axios.put(AUTH_ENDPOINTS.UPDATE_DETAILS, updates);
};

// ============================================
// DELETE ACCOUNT
// ============================================
/**
 * Delete user account
 * @param {string} password - User password for confirmation
 * @returns {Promise}
 */
export const deleteAccount = (password) => {
  return axios.delete(AUTH_ENDPOINTS.DELETE_ACCOUNT, { data: { password } });
};

// ============================================
// CHECK EMAIL AVAILABILITY
// ============================================
/**
 * Check if email is available for registration
 * @param {string} email
 * @returns {Promise}
 */
export const checkEmailAvailability = (email) => {
  return axios.post(AUTH_ENDPOINTS.CHECK_EMAIL, { email });
};

// ============================================
// SOCIAL LOGIN
// ============================================
/**
 * Login with social provider (Google, Facebook, GitHub)
 * @param {Object} socialData - { provider, token, userData }
 * @returns {Promise}
 */
export const socialLogin = (socialData) => {
  return axios.post(AUTH_ENDPOINTS.SOCIAL_LOGIN, socialData);
};

// ============================================
// GOOGLE LOGIN
// ============================================
/**
 * Login with Google
 * @param {string} googleToken - Google OAuth token
 * @returns {Promise}
 */
export const loginWithGoogle = (googleToken) => {
  return socialLogin({
    provider: 'google',
    token: googleToken,
  });
};

// ============================================
// FACEBOOK LOGIN
// ============================================
/**
 * Login with Facebook
 * @param {string} facebookToken - Facebook OAuth token
 * @returns {Promise}
 */
export const loginWithFacebook = (facebookToken) => {
  return socialLogin({
    provider: 'facebook',
    token: facebookToken,
  });
};

// ============================================
// GITHUB LOGIN
// ============================================
/**
 * Login with GitHub
 * @param {string} githubToken - GitHub OAuth token
 * @returns {Promise}
 */
export const loginWithGitHub = (githubToken) => {
  return socialLogin({
    provider: 'github',
    token: githubToken,
  });
};

// ============================================
// VALIDATE SESSION
// ============================================
/**
 * Validate if current session is valid
 * @returns {Promise}
 */
export const validateSession = async () => {
  try {
    const response = await getMe();
    return { valid: true, user: response.data };
  } catch (error) {
    return { valid: false, error };
  }
};

// ============================================
// EXPORT ALL AUTH API METHODS
// ============================================
const authApi = {
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
  checkEmailAvailability,
  socialLogin,
  loginWithGoogle,
  loginWithFacebook,
  loginWithGitHub,
  validateSession,
};

export default authApi;