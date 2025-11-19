// Payment routes
// ============================================
// PAYMENT ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const {
  createPaymentIntent,
  createCheckoutSession,
  handleWebhook,
  getPaymentById,
  getMyPayments,
  getMyEarnings,
  requestRefund,
  getPaymentStatistics,
  processPayout,
} = require('../controllers/payment.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/roleCheck.middleware');
const { paymentLimiter } = require('../middlewares/rateLimiter.middleware');
const { validateMongoId, validate } = require('../middlewares/validation.middleware');

// Public routes (Stripe webhook)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Protected routes
router.use(protect);

router.post('/create-intent', paymentLimiter, createPaymentIntent);
router.post('/create-checkout', paymentLimiter, createCheckoutSession);
router.get('/my-payments', getMyPayments);
router.get('/:id', validateMongoId('id'), validate, getPaymentById);
router.post('/:id/refund', requestRefund);

// Protected routes - Educator
router.get('/my/earnings', authorize('educator', 'admin'), getMyEarnings);

// Protected routes - Admin
router.get('/admin/statistics', authorize('admin'), getPaymentStatistics);
router.post('/:id/payout', authorize('admin'), processPayout);

module.exports = router;