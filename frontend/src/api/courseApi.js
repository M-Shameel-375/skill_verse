// ============================================
// COURSE API ENDPOINTS
// ============================================

import axios from './axios';

const COURSE_ENDPOINTS = {
  GET_COURSES: '/courses',
  GET_COURSE: '/courses',
  CREATE_COURSE: '/courses',
  UPDATE_COURSE: '/courses',
  DELETE_COURSE: '/courses',
  ENROLL: '/courses/enroll',
  UNENROLL: '/courses/unenroll',
  GET_MY_COURSES: '/courses/my-courses',
  GET_ENROLLED: '/courses/enrolled',
  GET_FEATURED: '/courses/featured',
  GET_POPULAR: '/courses/popular',
  GET_RECOMMENDED: '/courses/recommended',
  SEARCH: '/courses/search',
  UPDATE_PROGRESS: '/courses/progress',
  COMPLETE_LECTURE: '/courses/complete-lecture',
  GET_CATEGORIES: '/courses/categories',
  UPLOAD_THUMBNAIL: '/courses/thumbnail',
  UPLOAD_VIDEO: '/courses/video',
  PUBLISH: '/courses/publish',
  UNPUBLISH: '/courses/unpublish',
};

// ============================================
// GET ALL COURSES
// ============================================
/**
 * Get all courses with filters and pagination
 * @param {Object} params - { page, limit, category, level, price, rating, search }
 * @returns {Promise}
 */
export const getCourses = (params = {}) => {
  return axios.get(COURSE_ENDPOINTS.GET_COURSES, { params });
};

// ============================================
// GET COURSE BY ID
// ============================================
/**
 * Get course details by ID
 * @param {string} courseId - Course ID
 * @returns {Promise}
 */
export const getCourseById = (courseId) => {
  return axios.get(`${COURSE_ENDPOINTS.GET_COURSE}/${courseId}`);
};

// ============================================
// CREATE COURSE
// ============================================
/**
 * Create new course
 * @param {Object} courseData - Course data
 * @returns {Promise}
 */
export const createCourse = (courseData) => {
  return axios.post(COURSE_ENDPOINTS.CREATE_COURSE, courseData);
};

// ============================================
// UPDATE COURSE
// ============================================
/**
 * Update course
 * @param {string} courseId - Course ID
 * @param {Object} updates - Course updates
 * @returns {Promise}
 */
export const updateCourse = (courseId, updates) => {
  return axios.put(`${COURSE_ENDPOINTS.UPDATE_COURSE}/${courseId}`, updates);
};

// ============================================
// DELETE COURSE
// ============================================
/**
 * Delete course
 * @param {string} courseId - Course ID
 * @returns {Promise}
 */
export const deleteCourse = (courseId) => {
  return axios.delete(`${COURSE_ENDPOINTS.DELETE_COURSE}/${courseId}`);
};

// ============================================
// ENROLL IN COURSE
// ============================================
/**
 * Enroll in a course
 * @param {string} courseId - Course ID
 * @returns {Promise}
 */
export const enrollInCourse = (courseId) => {
  return axios.post(`${COURSE_ENDPOINTS.ENROLL}/${courseId}`);
};

// ============================================
// UNENROLL FROM COURSE
// ============================================
/**
 * Unenroll from a course
 * @param {string} courseId - Course ID
 * @returns {Promise}
 */
export const unenrollFromCourse = (courseId) => {
  return axios.post(`${COURSE_ENDPOINTS.UNENROLL}/${courseId}`);
};

// ============================================
// GET MY COURSES
// ============================================
/**
 * Get courses created by educator
 * @returns {Promise}
 */
export const getMyCourses = () => {
  return axios.get(COURSE_ENDPOINTS.GET_MY_COURSES);
};

// ============================================
// GET ENROLLED COURSES
// ============================================
/**
 * Get enrolled courses for learner
 * @returns {Promise}
 */
export const getEnrolledCourses = () => {
  return axios.get(COURSE_ENDPOINTS.GET_ENROLLED);
};

// ============================================
// GET FEATURED COURSES
// ============================================
/**
 * Get featured courses
 * @returns {Promise}
 */
export const getFeaturedCourses = () => {
  return axios.get(COURSE_ENDPOINTS.GET_FEATURED);
};

// ============================================
// GET POPULAR COURSES
// ============================================
/**
 * Get popular courses
 * @returns {Promise}
 */
export const getPopularCourses = () => {
  return axios.get(COURSE_ENDPOINTS.GET_POPULAR);
};

// ============================================
// GET RECOMMENDED COURSES
// ============================================
/**
 * Get recommended courses for user
 * @returns {Promise}
 */
export const getRecommendedCourses = () => {
  return axios.get(COURSE_ENDPOINTS.GET_RECOMMENDED);
};

// ============================================
// SEARCH COURSES
// ============================================
/**
 * Search courses
 * @param {string} query - Search query
 * @returns {Promise}
 */
export const searchCourses = (query) => {
  return axios.get(`${COURSE_ENDPOINTS.SEARCH}?q=${query}`);
};

// ============================================
// UPDATE COURSE PROGRESS
// ============================================
/**
 * Update course progress
 * @param {string} courseId - Course ID
 * @param {Object} progressData - { lectureId, progress, completed }
 * @returns {Promise}
 */
export const updateCourseProgress = (courseId, progressData) => {
  return axios.post(`${COURSE_ENDPOINTS.UPDATE_PROGRESS}/${courseId}`, progressData);
};

// ============================================
// COMPLETE LECTURE
// ============================================
/**
 * Mark lecture as completed
 * @param {string} courseId - Course ID
 * @param {string} lectureId - Lecture ID
 * @returns {Promise}
 */
export const completeLecture = (courseId, lectureId) => {
  return axios.post(`${COURSE_ENDPOINTS.COMPLETE_LECTURE}/${courseId}`, { lectureId });
};

// ============================================
// GET COURSE CATEGORIES
// ============================================
/**
 * Get all course categories
 * @returns {Promise}
 */
export const getCourseCategories = () => {
  return axios.get(COURSE_ENDPOINTS.GET_CATEGORIES);
};

// ============================================
// UPLOAD COURSE THUMBNAIL
// ============================================
/**
 * Upload course thumbnail
 * @param {string} courseId - Course ID
 * @param {FormData} formData - Image file
 * @returns {Promise}
 */
export const uploadCourseThumbnail = (courseId, formData) => {
  return axios.post(`${COURSE_ENDPOINTS.UPLOAD_THUMBNAIL}/${courseId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// ============================================
// UPLOAD COURSE VIDEO
// ============================================
/**
 * Upload course video/lecture
 * @param {string} courseId - Course ID
 * @param {FormData} formData - Video file
 * @param {Function} onProgress - Progress callback
 * @returns {Promise}
 */
export const uploadCourseVideo = (courseId, formData, onProgress) => {
  return axios.post(`${COURSE_ENDPOINTS.UPLOAD_VIDEO}/${courseId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    },
  });
};

// ============================================
// PUBLISH COURSE
// ============================================
/**
 * Publish course
 * @param {string} courseId - Course ID
 * @returns {Promise}
 */
export const publishCourse = (courseId) => {
  return axios.post(`${COURSE_ENDPOINTS.PUBLISH}/${courseId}`);
};

// ============================================
// UNPUBLISH COURSE
// ============================================
/**
 * Unpublish course
 * @param {string} courseId - Course ID
 * @returns {Promise}
 */
export const unpublishCourse = (courseId) => {
  return axios.post(`${COURSE_ENDPOINTS.UNPUBLISH}/${courseId}`);
};

// ============================================
// ADD SECTION
// ============================================
/**
 * Add section to course
 * @param {string} courseId - Course ID
 * @param {Object} sectionData - Section data
 * @returns {Promise}
 */
export const addSection = (courseId, sectionData) => {
  return axios.post(`/courses/${courseId}/sections`, sectionData);
};

// ============================================
// UPDATE SECTION
// ============================================
/**
 * Update course section
 * @param {string} courseId - Course ID
 * @param {string} sectionId - Section ID
 * @param {Object} updates - Section updates
 * @returns {Promise}
 */
export const updateSection = (courseId, sectionId, updates) => {
  return axios.put(`/courses/${courseId}/sections/${sectionId}`, updates);
};

// ============================================
// DELETE SECTION
// ============================================
/**
 * Delete course section
 * @param {string} courseId - Course ID
 * @param {string} sectionId - Section ID
 * @returns {Promise}
 */
export const deleteSection = (courseId, sectionId) => {
  return axios.delete(`/courses/${courseId}/sections/${sectionId}`);
};

// ============================================
// ADD LECTURE
// ============================================
/**
 * Add lecture to section
 * @param {string} courseId - Course ID
 * @param {string} sectionId - Section ID
 * @param {Object} lectureData - Lecture data
 * @returns {Promise}
 */
export const addLecture = (courseId, sectionId, lectureData) => {
  return axios.post(`/courses/${courseId}/sections/${sectionId}/lectures`, lectureData);
};

// ============================================
// EXPORT ALL COURSE API METHODS
// ============================================
const courseApi = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  unenrollFromCourse,
  getMyCourses,
  getEnrolledCourses,
  getFeaturedCourses,
  getPopularCourses,
  getRecommendedCourses,
  searchCourses,
  updateCourseProgress,
  completeLecture,
  getCourseCategories,
  uploadCourseThumbnail,
  uploadCourseVideo,
  publishCourse,
  unpublishCourse,
  addSection,
  updateSection,
  deleteSection,
  addLecture,
};

export default courseApi;