// ============================================
// AI ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const {
  getSkillRecommendations,
  getCourseRecommendations,
  getLearningPathRecommendation,
  generateCourseDescription,
  generateQuizQuestions,
  analyzeSentiment,
  getAIStatus,
} = require('../controllers/ai.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/roleCheck.middleware');

// Public routes
router.get('/status', getAIStatus);

// Protected routes - Recommendations
router.get('/recommendations/skills', protect, getSkillRecommendations);
router.get('/recommendations/courses', protect, getCourseRecommendations);
router.get('/recommendations/learning-path', protect, getLearningPathRecommendation);

// Protected routes - Generation (Instructors only)
router.post('/generate/course-description', protect, authorize('Instructor', 'Admin'), generateCourseDescription);
router.post('/generate/quiz', protect, authorize('Instructor', 'Admin'), generateQuizQuestions);

// Protected routes - Analysis
router.post('/analyze/sentiment', protect, analyzeSentiment);

module.exports = router;
