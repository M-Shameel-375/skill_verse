// LiveSession routes
// ============================================
// LIVE SESSION ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const {
  createLiveSession,
  getAllLiveSessions,
  getLiveSessionById,
  updateLiveSession,
  deleteLiveSession,
  registerForSession,
  unregisterFromSession,
  startSession,
  endSession,
  cancelSession,
  postponeSession,
  addFeedback,
  getUpcomingSessions,
  getLiveSessions,
  getMySessionsAsHost,
  getMyRegisteredSessions,
  addQuestion,
  answerQuestion,
  createPoll,
  voteOnPoll,
  getPopularSessions,
} = require('../controllers/liveSession.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/roleCheck.middleware');
const {
  validateLiveSession,
  validateMongoId,
  validatePagination,
  validate,
} = require('../middlewares/validation.middleware');

// Public routes
router.get('/', validatePagination, validate, getAllLiveSessions);
router.get('/upcoming', getUpcomingSessions);
router.get('/live', getLiveSessions);
router.get('/popular', getPopularSessions);
router.get('/:id', validateMongoId('id'), validate, getLiveSessionById);

// Protected routes - Educator/Admin
router.post('/', protect, authorize('educator', 'admin'), validateLiveSession, validate, createLiveSession);
router.get('/my/sessions', protect, authorize('educator', 'admin'), getMySessionsAsHost);

// Protected routes - Session management
router.put('/:id', protect, updateLiveSession);
router.delete('/:id', protect, deleteLiveSession);
router.post('/:id/start', protect, startSession);
router.post('/:id/end', protect, endSession);
router.post('/:id/cancel', protect, cancelSession);
router.post('/:id/postpone', protect, postponeSession);

// Protected routes - Participation
router.post('/:id/register', protect, registerForSession);
router.delete('/:id/register', protect, unregisterFromSession);
router.get('/my/registered', protect, getMyRegisteredSessions);
router.post('/:id/feedback', protect, addFeedback);

// Protected routes - Interaction
router.post('/:id/questions', protect, addQuestion);
router.put('/:id/questions/:questionId/answer', protect, answerQuestion);
router.post('/:id/polls', protect, createPoll);
router.post('/:id/polls/:pollId/vote', protect, voteOnPoll);

module.exports = router;