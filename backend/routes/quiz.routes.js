// Quiz routes
// ============================================
// QUIZ ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  startQuizAttempt,
  submitQuiz,
  getSubmissionResults,
  getMyAttempts,
  gradeQuizManually,
  getQuizzesByCourse,
  publishQuiz,
  getQuizStatistics,
  trackTabSwitch,
  getAllSubmissions,
  duplicateQuiz,
} = require('../controllers/quiz.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/roleCheck.middleware');
const { validateQuiz, validateMongoId, validate } = require('../middlewares/validation.middleware');

// Protected routes - Educator/Admin
router.post('/', protect, authorize('educator', 'admin'), validateQuiz, validate, createQuiz);

// Protected routes - General
router.get('/', protect, getAllQuizzes);
router.get('/course/:courseId', protect, getQuizzesByCourse);
router.get('/:id', protect, validateMongoId('id'), validate, getQuizById);

// Protected routes - Quiz management (Owner)
router.put('/:id', protect, updateQuiz);
router.delete('/:id', protect, deleteQuiz);
router.put('/:id/publish', protect, publishQuiz);
router.post('/:id/duplicate', protect, duplicateQuiz);

// Protected routes - Taking quiz
router.post('/:id/start', protect, startQuizAttempt);
router.post('/:id/submit', protect, submitQuiz);
router.get('/:id/my-attempts', protect, getMyAttempts);
router.get('/:id/submissions/:submissionId', protect, getSubmissionResults);
router.post('/:id/submissions/:submissionId/tab-switch', protect, trackTabSwitch);

// Protected routes - Grading (Educator)
router.get('/:id/all-submissions', protect, getAllSubmissions);
router.put('/:id/submissions/:submissionId/grade', protect, gradeQuizManually);

// Protected routes - Statistics (Educator)
router.get('/:id/statistics', protect, getQuizStatistics);

module.exports = router;