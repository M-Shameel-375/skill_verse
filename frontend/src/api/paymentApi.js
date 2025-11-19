// ============================================
// PAYMENT API ENDPOINTS
// ============================================

import axios from './axios';

const PAYMENT_ENDPOINTS = {
  CREATE_PAYMENT_INTENT: '/payments/create-intent',
  PROCESS_PAYMENT: '/payments/process',
  GET_PAYMENT: '/payments',
  GET_PAYMENTS: '/payments/history',
  GET_EARNINGS: '/payments/earnings',
  GET_TRANSACTIONS: '/payments/transactions',
  REQUEST_PAYOUT: '/payments/payout',
  GET_PAYOUTS: '/payments/payouts',
  VERIFY_PAYMENT: '/payments/verify',
  REFUND_PAYMENT: '/payments/refund',
  GET_INVOICE: '/payments/invoice',
  DOWNLOAD_INVOICE: '/payments/invoice/download',
  GET_STATISTICS: '/payments/statistics',
  SETUP_STRIPE: '/payments/stripe/setup',
  GET_CARDS: '/payments/cards',
  ADD_CARD: '/payments/cards/add',
  REMOVE_CARD: '/payments/cards/remove',
  SET_DEFAULT_CARD: '/payments/cards/default',
  CANCEL_SUBSCRIPTION: '/payments/subscription/cancel',
};

// ============================================
// CREATE PAYMENT INTENT
// ============================================
/**
 * Create Stripe payment intent
 * @param {Object} data - { courseId, amount, currency }
 * @returns {Promise}
 */
export const createPaymentIntent = (data) => {
  return axios.post(PAYMENT_ENDPOINTS.CREATE_PAYMENT_INTENT, data);
};

// ============================================
// PROCESS PAYMENT
// ============================================
/**
 * Process payment for course enrollment
 * @param {Object} paymentData - { courseId, paymentMethodId, amount }
 * @returns {Promise}
 */
export const processPayment = (paymentData) => {
  return axios.post(PAYMENT_ENDPOINTS.PROCESS_PAYMENT, paymentData);
};

// ============================================
// GET PAYMENT BY ID
// ============================================
/**
 * Get payment details by ID
 * @param {string} paymentId - Payment ID
 * @returns {Promise}
 */
export const getPaymentById = (paymentId) => {
  return axios.get(`${PAYMENT_ENDPOINTS.GET_PAYMENT}/${paymentId}`);
};

// ============================================
// GET PAYMENT HISTORY
// ============================================
/**
 * Get user's payment history
 * @param {Object} params - { page, limit, status, startDate, endDate }
 * @returns {Promise}
 */
export const getPaymentHistory = (params = {}) => {
  return axios.get(PAYMENT_ENDPOINTS.GET_PAYMENTS, { params });
};

// ============================================
// GET EARNINGS
// ============================================
/**
 * Get educator earnings summary
 * @param {Object} params - { startDate, endDate, period }
 * @returns {Promise}
 */
export const getEarnings = (params = {}) => {
  return axios.get(PAYMENT_ENDPOINTS.GET_EARNINGS, { params });
};

// ============================================
// GET TRANSACTIONS
// ============================================
/**
 * Get all transactions (payments + payouts)
 * @param {Object} params - { page, limit, type, status }
 * @returns {Promise}
 */
export const getTransactions = (params = {}) => {
  return axios.get(PAYMENT_ENDPOINTS.GET_TRANSACTIONS, { params });
};

// ============================================
// REQUEST PAYOUT
// ============================================
/**
 * Request payout of earnings
 * @param {Object} payoutData - { amount, method, accountDetails }
 * @returns {Promise}
 */
export const requestPayout = (payoutData) => {
  return axios.post(PAYMENT_ENDPOINTS.REQUEST_PAYOUT, payoutData);
};

// ============================================
// GET PAYOUTS
// ============================================
/**
 * Get payout history
 * @param {Object} params - { page, limit, status }
 * @returns {Promise}
 */
export const getPayouts = (params = {}) => {
  return axios.get(PAYMENT_ENDPOINTS.GET_PAYOUTS, { params });
};

// ============================================
// VERIFY PAYMENT
// ============================================
/**
 * Verify payment status
 * @param {string} paymentId - Payment ID
 * @returns {Promise}
 */
export const verifyPayment = (paymentId) => {
  return axios.post(`${PAYMENT_ENDPOINTS.VERIFY_PAYMENT}/${paymentId}`);
};

// ============================================
// REFUND PAYMENT
// ============================================
/**
 * Request payment refund
 * @param {string} paymentId - Payment ID
 * @param {Object} refundData - { reason, amount }
 * @returns {Promise}
 */
export const refundPayment = (paymentId, refundData) => {
  return axios.post(`${PAYMENT_ENDPOINTS.REFUND_PAYMENT}/${paymentId}`, refundData);
};

// ============================================
// GET INVOICE
// ============================================
/**
 * Get invoice details
 * @param {string} invoiceId - Invoice ID
 * @returns {Promise}
 */
export const getInvoice = (invoiceId) => {
  return axios.get(`${PAYMENT_ENDPOINTS.GET_INVOICE}/${invoiceId}`);
};

// ============================================
// DOWNLOAD INVOICE
// ============================================
/**
 * Download invoice as PDF
 * @param {string} invoiceId - Invoice ID
 * @returns {Promise}
 */
export const downloadInvoice = (invoiceId) => {
  return axios.get(`${PAYMENT_ENDPOINTS.DOWNLOAD_INVOICE}/${invoiceId}`, {
    responseType: 'blob',
  });
};

// ============================================
// GET PAYMENT STATISTICS
// ============================================
/**
 * Get payment statistics for educator
 * @param {Object} params - { period, startDate, endDate }
 * @returns {Promise}
 */
export const getPaymentStatistics = (params = {}) => {
  return axios.get(PAYMENT_ENDPOINTS.GET_STATISTICS, { params });
};

// ============================================
// SETUP STRIPE ACCOUNT
// ============================================
/**
 * Setup Stripe connected account for educator
 * @param {Object} accountData - Stripe account details
 * @returns {Promise}
 */
export const setupStripeAccount = (accountData) => {
  return axios.post(PAYMENT_ENDPOINTS.SETUP_STRIPE, accountData);
};

// ============================================
// GET SAVED CARDS
// ============================================
/**
 * Get user's saved payment cards
 * @returns {Promise}
 */
export const getSavedCards = () => {
  return axios.get(PAYMENT_ENDPOINTS.GET_CARDS);
};

// ============================================
// ADD PAYMENT CARD
// ============================================
/**
 * Add new payment card
 * @param {Object} cardData - { paymentMethodId, setAsDefault }
 * @returns {Promise}
 */
export const addPaymentCard = (cardData) => {
  return axios.post(PAYMENT_ENDPOINTS.ADD_CARD, cardData);
};

// ============================================
// REMOVE PAYMENT CARD
// ============================================
/**
 * Remove saved payment card
 * @param {string} cardId - Card ID
 * @returns {Promise}
 */
export const removePaymentCard = (cardId) => {
  return axios.delete(`${PAYMENT_ENDPOINTS.REMOVE_CARD}/${cardId}`);
};

// ============================================
// SET DEFAULT CARD
// ============================================
/**
 * Set default payment card
 * @param {string} cardId - Card ID
 * @returns {Promise}
 */
export const setDefaultCard = (cardId) => {
  return axios.post(`${PAYMENT_ENDPOINTS.SET_DEFAULT_CARD}/${cardId}`);
};

// ============================================
// CANCEL SUBSCRIPTION
// ============================================
/**
 * Cancel course subscription
 * @param {string} subscriptionId - Subscription ID
 * @returns {Promise}
 */
export const cancelSubscription = (subscriptionId) => {
  return axios.post(`${PAYMENT_ENDPOINTS.CANCEL_SUBSCRIPTION}/${subscriptionId}`);
};

// ============================================
// APPLY COUPON CODE
// ============================================
/**
 * Apply coupon/discount code
 * @param {string} courseId - Course ID
 * @param {string} couponCode - Coupon code
 * @returns {Promise}
 */
export const applyCoupon = (courseId, couponCode) => {
  return axios.post('/payments/apply-coupon', { courseId, couponCode });
};

// ============================================
// GET PRICING
// ============================================
/**
 * Get course pricing with discounts
 * @param {string} courseId - Course ID
 * @param {string} couponCode - Optional coupon code
 * @returns {Promise}
 */
export const getCoursePricing = (courseId, couponCode = null) => {
  return axios.get(`/payments/pricing/${courseId}`, {
    params: { couponCode },
  });
};

// ============================================
// EXPORT ALL PAYMENT API METHODS
// ============================================
const paymentApi = {
  createPaymentIntent,
  processPayment,
  getPaymentById,
  getPaymentHistory,
  getEarnings,
  getTransactions,
  requestPayout,
  getPayouts,
  verifyPayment,
  refundPayment,
  getInvoice,
  downloadInvoice,
  getPaymentStatistics,
  setupStripeAccount,
  getSavedCards,
  addPaymentCard,
  removePaymentCard,
  setDefaultCard,
  cancelSubscription,
  applyCoupon,
  getCoursePricing,
};

export default paymentApi;