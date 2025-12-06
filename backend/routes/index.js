// Routes index
// ============================================
// MAIN ROUTES INDEX
// ============================================

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

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
const chatRoutes = require('./chat.routes');
const aiRoutes = require('./ai.routes');
const disputeRoutes = require('./dispute.routes');
const educatorRoutes = require('./educator.routes');

// Health check endpoint for production monitoring
router.get('/health', (req, res) => {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    version: process.env.npm_package_version || '1.0.0'
  };

  // Check database connection
  if (mongoose.connection.readyState !== 1) {
    healthCheck.status = 'unhealthy';
    return res.status(503).json(healthCheck);
  }

  res.status(200).json(healthCheck);
});

// Readiness probe for Kubernetes/container orchestration
router.get('/ready', async (req, res) => {
  try {
    // Check database
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected');
    }
    
    // Ping database
    await mongoose.connection.db.admin().ping();
    
    res.status(200).json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'not ready', error: error.message });
  }
});

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
router.use('/chats', chatRoutes);
router.use('/ai', aiRoutes);
router.use('/disputes', disputeRoutes);
router.use('/educators', educatorRoutes);

module.exports = router;