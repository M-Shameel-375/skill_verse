// Routes index
// ============================================
// MAIN ROUTES INDEX
// ============================================

const express = require('express');
const router = express.Router();

// Import all route modules
const userRoutes = require('./user.routes');
const courseRoutes = require('./course.routes');
const liveSessionRoutes = require('./liveSession.routes');
const skillExchangeRoutes = require('./skillExchange.routes');
const quizRoutes = require('./quiz.routes');
const certificateRoutes = require('./certificate.routes');
const paymentRoutes = require('./payment.routes');
const reviewRoutes = require('./review.routes');
const badgeRoutes = require('./badge.routes');
const notificationRoutes = require('./notification.routes');
const adminRoutes = require('./admin.routes');
const analyticsRoutes = require('./analytics.routes');

// Mount routes
router.use('/users', userRoutes);
router.use('/courses', courseRoutes);
router.use('/live-sessions', liveSessionRoutes);
router.use('/skill-exchanges', skillExchangeRoutes);
router.use('/quizzes', quizRoutes);
router.use('/certificates', certificateRoutes);
router.use('/payments', paymentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/badges', badgeRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);
router.use('/analytics', analyticsRoutes);

module.exports = router;