// ============================================
// AI API CLIENT
// ============================================

import api from './axios';

// ============================================
// RECOMMENDATIONS
// ============================================

/**
 * Get AI-powered skill recommendations
 * @returns {Promise} Skill recommendations
 */
export const getSkillRecommendations = async () => {
  const response = await api.get('/ai/recommendations/skills');
  return response;
};

/**
 * Get AI-powered course recommendations
 * @returns {Promise} Course recommendations
 */
export const getCourseRecommendations = async () => {
  const response = await api.get('/ai/recommendations/courses');
  return response;
};

/**
 * Get AI-powered learning path recommendation
 * @param {string} goalSkill - Target skill to learn
 * @returns {Promise} Learning path recommendation
 */
export const getLearningPathRecommendation = async (goalSkill) => {
  const response = await api.get('/ai/recommendations/learning-path', {
    params: goalSkill ? { goalSkill } : {},
  });
  return response;
};

// ============================================
// CONTENT GENERATION
// ============================================

/**
 * Generate AI course description
 * @param {string} title - Course title
 * @param {Array} topics - Course topics
 * @returns {Promise} Generated description
 */
export const generateCourseDescription = async (title, topics) => {
  const response = await api.post('/ai/generate/course-description', {
    title,
    topics,
  });
  return response;
};

/**
 * Generate AI quiz questions
 * @param {string} topic - Quiz topic
 * @param {string} difficulty - Difficulty level
 * @param {number} count - Number of questions
 * @returns {Promise} Generated questions
 */
export const generateQuizQuestions = async (topic, difficulty = 'intermediate', count = 5) => {
  const response = await api.post('/ai/generate/quiz', {
    topic,
    difficulty,
    count,
  });
  return response;
};

// ============================================
// ANALYSIS
// ============================================

/**
 * Analyze text sentiment
 * @param {string} text - Text to analyze
 * @returns {Promise} Sentiment result
 */
export const analyzeSentiment = async (text) => {
  const response = await api.post('/ai/analyze/sentiment', { text });
  return response;
};

// ============================================
// STATUS
// ============================================

/**
 * Get AI service status
 * @returns {Promise} AI service status
 */
export const getAIStatus = async () => {
  const response = await api.get('/ai/status');
  return response;
};

export default {
  getSkillRecommendations,
  getCourseRecommendations,
  getLearningPathRecommendation,
  generateCourseDescription,
  generateQuizQuestions,
  analyzeSentiment,
  getAIStatus,
};
