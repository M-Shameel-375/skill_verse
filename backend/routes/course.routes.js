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
  getEnrolledCourses,
  getCourseProgress,
  getCourseReviews,
  addCourseReview,
  searchCourses,
  getRecommendedCourses,
  getCourseAnalytics,
  getCourseStudents,
  getCourseCategories,
} = require('../controllers/course.controller');
const { protect, optionalAuth } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/roleCheck.middleware');
const { uploadSingleImage, uploadCourseFiles } = require('../middlewares/upload.middleware');
const { validateCourse, validateMongoId, validatePagination, validate } = require('../middlewares/validation.middleware');

// Public routes - Specific routes MUST come before :id parameter routes
router.get('/', validatePagination, validate, getAllCourses);
router.get('/featured', getFeaturedCourses);
router.get('/top-rated', getTopRatedCourses);
router.get('/trending', getTrendingCourses);
router.get('/popular', getTrendingCourses);  // Alias for popular courses
router.get('/search', searchCourses);
router.get('/categories', getCourseCategories);
router.get('/slug/:slug', optionalAuth, getCourseBySlug);

// Protected routes - Learner
router.get('/enrolled', protect, getEnrolledCourses);
router.get('/recommended', protect, getRecommendedCourses);

// Protected routes - Educator/Admin (MUST come before /:id routes)
router.post('/', protect, authorize('educator', 'admin'), uploadCourseFiles, validateCourse, validate, createCourse);
router.get('/my-courses', protect, getMyCoursesAsEducator); // All users can see their courses
router.get('/my/courses', protect, getMyCoursesAsEducator); // All users can see their courses

// This route must be LAST among GET routes because :id matches anything
router.get('/:id', validateMongoId('id'), validate, optionalAuth, getCourseById);

// Protected routes - Course owner/Admin
router.put('/:id', protect, validateMongoId('id'), validate, updateCourse);
router.delete('/:id', protect, validateMongoId('id'), validate, deleteCourse);
router.put('/:id/thumbnail', protect, uploadSingleImage('thumbnail'), uploadCourseThumbnail);
router.put('/:id/publish', protect, publishCourse);
router.put('/:id/unpublish', protect, unpublishCourse);

// Course progress & reviews
router.get('/:id/progress', protect, getCourseProgress);
router.get('/:id/reviews', getCourseReviews);
router.post('/:id/reviews', protect, addCourseReview);

// Course analytics (educator only)
router.get('/:id/analytics', protect, authorize('educator', 'admin'), getCourseAnalytics);
router.get('/:id/students', protect, authorize('educator', 'admin'), getCourseStudents);

// Student routes
router.post('/:id/enroll', protect, enrollInCourse);
router.get('/:id/curriculum', protect, getCourseCurriculum);
router.put('/:id/progress', protect, updateCourseProgress);
router.post('/:id/wishlist', protect, addToWishlist);
router.delete('/:id/wishlist', protect, removeFromWishlist);

module.exports = router;