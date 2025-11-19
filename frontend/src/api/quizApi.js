// ============================================
// QUIZ API ENDPOINTS
// ============================================

import axios from './axios';

const QUIZ_ENDPOINTS = {
  GET_QUIZZES: '/quizzes',
  GET_QUIZ: '/quizzes',
  CREATE_QUIZ: '/quizzes',
  UPDATE_QUIZ: '/quizzes',
  DELETE_QUIZ: '/quizzes',
  START_QUIZ: '/quizzes/start',
  SUBMIT_QUIZ: '/quizzes/submit',
  GET_RESULTS: '/quizzes/results',
  GET_ATTEMPTS: '/quizzes/attempts',
  RETAKE_QUIZ: '/quizzes/retake',
  GET_LEADERBOARD: '/quizzes/leaderboard',
  GET_COURSE_QUIZZES: '/courses/quizzes',
};

// ============================================
// GET ALL QUIZZES
// ============================================
/**
 * Get all quizzes
 * @param {Object} params - { page, limit, courseId }
 * @returns {Promise}
 */
export const getQuizzes = (params = {}) => {
  return axios.get(QUIZ_ENDPOINTS.GET_QUIZZES, { params });
};

// ============================================
// GET QUIZ BY ID
// ============================================
/**
 * Get quiz details
 * @param {string} quizId - Quiz ID
 * @returns {Promise}
 */
export const getQuizById = (quizId) => {
  return axios.get(`${QUIZ_ENDPOINTS.GET_QUIZ}/${quizId}`);
};

// ============================================
// CREATE QUIZ
// ============================================
/**
 * Create new quiz
 * @param {Object} quizData - Quiz data
 * @returns {Promise}
 */
export const createQuiz = (quizData) => {
  return axios.post(QUIZ_ENDPOINTS.CREATE_QUIZ, quizData);
};

// ============================================
// UPDATE QUIZ
// ============================================
/**
 * Update quiz
 * @param {string} quizId - Quiz ID
 * @param {Object} updates - Quiz updates
 * @returns {Promise}
 */
export const updateQuiz = (quizId, updates) => {
  return axios.put(`${QUIZ_ENDPOINTS.UPDATE_QUIZ}/${quizId}`, updates);
};

// ============================================
// DELETE QUIZ
// ============================================
/**
 * Delete quiz
 * @param {string} quizId - Quiz ID
 * @returns {Promise}
 */
export const deleteQuiz = (quizId) => {
  return axios.delete(`${QUIZ_ENDPOINTS.DELETE_QUIZ}/${quizId}`);
};

// ============================================
// START QUIZ
// ============================================
/**
 * Start a quiz attempt
 * @param {string} quizId - Quiz ID
 * @returns {Promise}
 */
export const startQuiz = (quizId) => {
  return axios.post(`${QUIZ_ENDPOINTS.START_QUIZ}/${quizId}`);
};

// ============================================
// SUBMIT QUIZ
// ============================================
/**
 * Submit quiz answers
 * @param {string} quizId - Quiz ID
 * @param {Object} submissionData - { answers: [{ questionId, answer }], timeSpent }
 * @returns {Promise}
 */
export const submitQuiz = (quizId, submissionData) => {
  return axios.post(`${QUIZ_ENDPOINTS.SUBMIT_QUIZ}/${quizId}`, submissionData);
};

// ============================================
// GET QUIZ RESULTS
// ============================================
/**
 * Get quiz attempt results
 * @param {string} quizId - Quiz ID
 * @param {string} attemptId - Attempt ID
 * @returns {Promise}
 */
export const getQuizResults = (quizId, attemptId) => {
  return axios.get(`${QUIZ_ENDPOINTS.GET_RESULTS}/${quizId}/${attemptId}`);
};

// ============================================
// GET USER QUIZ ATTEMPTS
// ============================================
/**
 * Get all attempts for a quiz
 * @param {string} quizId - Quiz ID
 * @returns {Promise}
 */
export const getUserQuizAttempts = (quizId) => {
  return axios.get(`${QUIZ_ENDPOINTS.GET_ATTEMPTS}/${quizId}`);
};

// ============================================
// RETAKE QUIZ
// ============================================
/**
 * Retake a quiz
 * @param {string} quizId - Quiz ID
 * @returns {Promise}
 */
export const retakeQuiz = (quizId) => {
  return axios.post(`${QUIZ_ENDPOINTS.RETAKE_QUIZ}/${quizId}`);
};

// ============================================
// GET QUIZ LEADERBOARD
// ============================================
/**
 * Get quiz leaderboard
 * @param {string} quizId - Quiz ID
 * @returns {Promise}
 */
export const getQuizLeaderboard = (quizId) => {
  return axios.get(`${QUIZ_ENDPOINTS.GET_LEADERBOARD}/${quizId}`);
};

// ============================================
// GET COURSE QUIZZES
// ============================================
/**
 * Get all quizzes for a course
 * @param {string} courseId - Course ID
 * @returns {Promise}
 */
export const getCourseQuizzes = (courseId) => {
  return axios.get(`${QUIZ_ENDPOINTS.GET_COURSE_QUIZZES}/${courseId}`);
};

// ============================================
// ADD QUESTION
// ============================================
/**
 * Add question to quiz
 * @param {string} quizId - Quiz ID
 * @param {Object} questionData - Question data
 * @returns {Promise}
 */
export const addQuestion = (quizId, questionData) => {
  return axios.post(`/quizzes/${quizId}/questions`, questionData);
};

// ============================================
// UPDATE QUESTION
// ============================================
/**
 * Update quiz question
 * @param {string} quizId - Quiz ID
 * @param {string} questionId - Question ID
 * @param {Object} updates - Question updates
 * @returns {Promise}
 */
export const updateQuestion = (quizId, questionId, updates) => {
  return axios.put(`/quizzes/${quizId}/questions/${questionId}`, updates);
};

// ============================================
// DELETE QUESTION
// ============================================
/**
 * Delete quiz question
 * @param {string} quizId - Quiz ID
 * @param {string} questionId - Question ID
 * @returns {Promise}
 */
export const deleteQuestion = (quizId, questionId) => {
  return axios.delete(`/quizzes/${quizId}/questions/${questionId}`);
};

// ============================================
// REORDER QUESTIONS
// ============================================
/**
 * Reorder quiz questions
 * @param {string} quizId - Quiz ID
 * @param {Array} questionOrder - Array of question IDs in new order
 * @returns {Promise}
 */
export const reorderQuestions = (quizId, questionOrder) => {
  return axios.put(`/quizzes/${quizId}/questions/reorder`, { questionOrder });
};

// ============================================
// SAVE ANSWER (AUTO-SAVE)
// ============================================
/**
 * Auto-save answer while taking quiz
 * @param {string} quizId - Quiz ID
 * @param {string} attemptId - Attempt ID
 * @param {Object} answerData - { questionId, answer }
 * @returns {Promise}
 */
export const saveAnswer = (quizId, attemptId, answerData) => {
  return axios.post(`/quizzes/${quizId}/attempts/${attemptId}/save`, answerData);
};

// ============================================
// GET QUIZ STATISTICS
// ============================================
/**
 * Get quiz statistics for educator
 * @param {string} quizId - Quiz ID
 * @returns {Promise}
 */
export const getQuizStatistics = (quizId) => {
  return axios.get(`/quizzes/${quizId}/statistics`);
};

// ============================================
// PUBLISH QUIZ
// ============================================
/**
 * Publish quiz
 * @param {string} quizId - Quiz ID
 * @returns {Promise}
 */
export const publishQuiz = (quizId) => {
  return axios.post(`/quizzes/${quizId}/publish`);
};

// ============================================
// UNPUBLISH QUIZ
// ============================================
/**
 * Unpublish quiz
 * @param {string} quizId - Quiz ID
 * @returns {Promise}
 */
export const unpublishQuiz = (quizId) => {
  return axios.post(`/quizzes/${quizId}/unpublish`);
};

// ============================================
// EXPORT ALL QUIZ API METHODS
// ============================================
const quizApi = {
  getQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  startQuiz,
  submitQuiz,
  getQuizResults,
  getUserQuizAttempts,
  retakeQuiz,
  getQuizLeaderboard,
  getCourseQuizzes,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  reorderQuestions,
  saveAnswer,
  getQuizStatistics,
  publishQuiz,
  unpublishQuiz,
};

export default quizApi;