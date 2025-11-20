// Course routes
// ============================================
// COURSE ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const {
  createCourse,
  getAllCourses,
  getCourseById,
  getCourseBySlug,
  updateCourse,
  deleteCourse,
  uploadCourseThumbnail,
  addSection,
  updateSection,
  deleteSection,
  addLecture,
  updateLecture,
  deleteLecture,
  enrollInCourse,
  getCourseCurriculum,
  updateCourseProgress,
  getMyCoursesAsEducator,
  getFeaturedCourses,
  getTopRatedCourses,
  getTrendingCourses,
  addToWishlist,
  removeFromWishlist,
  publishCourse,
  unpublishCourse,
} = require('../controllers/course.controller');
const { protect, optionalAuth } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/roleCheck.middleware');
const { uploadSingleImage, uploadCourseFiles } = require('../middlewares/upload.middleware');
const { validateCourse, validateMongoId, validatePagination, validate } = require('../middlewares/validation.middleware');

// Public routes
router.get('/', validatePagination, validate, getAllCourses);
router.get('/featured', getFeaturedCourses);
router.get('/top-rated', getTopRatedCourses);
router.get('/trending', getTrendingCourses);
router.get('/slug/:slug', optionalAuth, getCourseBySlug);
router.get('/:id', validateMongoId('id'), validate, optionalAuth, getCourseById);

// Protected routes - Educator/Admin
router.post('/', protect, authorize('educator', 'admin'), uploadCourseFiles, validateCourse, validate, createCourse);
router.get('/my/courses', protect, authorize('educator', 'admin'), getMyCoursesAsEducator);

// Protected routes - Course owner/Admin
router.put('/:id', protect, validateMongoId('id'), validate, updateCourse);
router.delete('/:id', protect, validateMongoId('id'), validate, deleteCourse);
router.put('/:id/thumbnail', protect, uploadSingleImage('thumbnail'), uploadCourseThumbnail);
router.put('/:id/publish', protect, publishCourse);
router.put('/:id/unpublish', protect, unpublishCourse);

// Student routes
router.post('/:id/enroll', protect, enrollInCourse);
router.get('/:id/curriculum', protect, getCourseCurriculum);
router.put('/:id/progress', protect, updateCourseProgress);
router.post('/:id/wishlist', protect, addToWishlist);
router.delete('/:id/wishlist', protect, removeFromWishlist);

module.exports = router;