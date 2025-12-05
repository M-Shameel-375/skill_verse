// ============================================
// ANALYTICS API ENDPOINTS
// ============================================

import axios from './axios';

const ANALYTICS_ENDPOINTS = {
  GET_LEARNER_ANALYTICS: '/analytics/learner',
  GET_INSTRUCTOR_ANALYTICS: '/analytics/instructor',
  GET_COURSE_ANALYTICS: '/analytics/courses',
  EXPORT_PROGRESS_PDF: '/analytics/export/progress',
  EXPORT_PROGRESS_JSON: '/analytics/export/json',
};

// ============================================
// GET LEARNER ANALYTICS
// ============================================
/**
 * Get learner analytics (enrolled, completed, certificates, etc.)
 * @returns {Promise}
 */
export const getLearnerAnalytics = () => {
  return axios.get(ANALYTICS_ENDPOINTS.GET_LEARNER_ANALYTICS);
};

// ============================================
// GET INSTRUCTOR ANALYTICS
// ============================================
/**
 * Get instructor analytics (courses, students, earnings)
 * @returns {Promise}
 */
export const getInstructorAnalytics = () => {
  return axios.get(ANALYTICS_ENDPOINTS.GET_INSTRUCTOR_ANALYTICS);
};

// ============================================
// GET COURSE ANALYTICS
// ============================================
/**
 * Get analytics for a specific course
 * @param {string} courseId - Course ID
 * @returns {Promise}
 */
export const getCourseAnalytics = (courseId) => {
  return axios.get(`${ANALYTICS_ENDPOINTS.GET_COURSE_ANALYTICS}/${courseId}`);
};

// ============================================
// EXPORT PROGRESS REPORT AS PDF
// ============================================
/**
 * Download learner progress report as PDF
 * @returns {Promise} - Blob response for download
 */
export const exportProgressPDF = async () => {
  const response = await axios.get(ANALYTICS_ENDPOINTS.EXPORT_PROGRESS_PDF, {
    responseType: 'blob',
  });
  
  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `progress-report-${Date.now()}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
  
  return response;
};

// ============================================
// EXPORT PROGRESS REPORT AS JSON
// ============================================
/**
 * Download learner progress report as JSON
 * @returns {Promise} - Blob response for download
 */
export const exportProgressJSON = async () => {
  const response = await axios.get(ANALYTICS_ENDPOINTS.EXPORT_PROGRESS_JSON, {
    responseType: 'blob',
  });
  
  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `progress-report-${Date.now()}.json`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
  
  return response;
};

export default {
  getLearnerAnalytics,
  getInstructorAnalytics,
  getCourseAnalytics,
  exportProgressPDF,
  exportProgressJSON,
};
