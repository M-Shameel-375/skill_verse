// SkillExchange routes
// ============================================
// SKILL EXCHANGE ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const {
  createSkillExchange,
  getAllSkillExchanges,
  getSkillExchangeById,
  updateSkillExchange,
  acceptSkillExchange,
  rejectSkillExchange,
  startSkillExchange,
  completeSkillExchange,
  cancelSkillExchange,
  addMessage,
  markMessagesAsRead,
  addSession,
  completeSession,
  addFeedback,
  endorseSkill,
  updateProgress,
  agreeToTerms,
  raiseDispute,
  getPendingRequests,
  getActiveExchanges,
  getCompletedExchanges,
  findMatches,
  addSharedResource,
} = require('../controllers/skillExchange.controller');
const { protect } = require('../middlewares/auth.middleware');
const {
  validateSkillExchange,
  validateMongoId,
  validate,
} = require('../middlewares/validation.middleware');
const { uploadSingleDocument } = require('../middlewares/upload.middleware');

// Protected routes only
router.use(protect);

router.post('/', validateSkillExchange, validate, createSkillExchange);
router.get('/', getAllSkillExchanges);
router.get('/pending', getPendingRequests);
router.get('/active', getActiveExchanges);
router.get('/completed', getCompletedExchanges);
router.get('/matches', findMatches);
router.get('/:id', validateMongoId('id'), validate, getSkillExchangeById);

router.put('/:id', updateSkillExchange);
router.post('/:id/accept', acceptSkillExchange);
router.post('/:id/reject', rejectSkillExchange);
router.post('/:id/start', startSkillExchange);
router.post('/:id/complete', completeSkillExchange);
router.post('/:id/cancel', cancelSkillExchange);

// Messages
router.post('/:id/messages', addMessage);
router.put('/:id/messages/read', markMessagesAsRead);

// Sessions
router.post('/:id/sessions', addSession);
router.put('/:id/sessions/:sessionId/complete', completeSession);

// Feedback & Progress
router.post('/:id/feedback', addFeedback);
router.post('/:id/endorse', endorseSkill);
router.put('/:id/progress', updateProgress);

// Terms & Disputes
router.post('/:id/agree-terms', agreeToTerms);
router.post('/:id/dispute', raiseDispute);

// Resources
router.post('/:id/resources', uploadSingleDocument('resource'), addSharedResource);

module.exports = router;