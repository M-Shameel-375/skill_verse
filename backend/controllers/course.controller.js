// Course controller
// ============================================
// COURSE CONTROLLER
// ============================================

const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const Course = require('../models/Course.model');
const User = require('../models/User.model');
const { getPagination } = require('../utils/helpers');
const { deleteFromCloudinary } = require('../services/cloudinary.service');

// ============================================
// @desc    Create new course
// @route   POST /api/v1/courses
// @access  Private (Educator/Admin)
// ============================================
exports.createCourse = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    shortDescription,
    category,
    subcategory,
    tags,
    level,
    prerequisites,
    targetAudience,
    price,
    originalPrice,
    currency,
    learningOutcomes,
    requirements,
    language,
  } = req.body;

  // Map category to correct enum value (handle case-insensitivity)
  const categoryMap = {
    'programming': 'Programming',
    'design': 'Design',
    'business': 'Business',
    'marketing': 'Marketing',
    'photography': 'Photography',
    'music': 'Music',
    'health & fitness': 'Health & Fitness',
    'health': 'Health & Fitness',
    'language': 'Language',
    'personal development': 'Personal Development',
    'personal-development': 'Personal Development',
    'science': 'Science',
    'mathematics': 'Mathematics',
    'art & craft': 'Art & Craft',
    'art': 'Art & Craft',
    'cooking': 'Cooking',
    'other': 'Other',
  };

  const normalizedCategory = category ? 
    (categoryMap[category.toLowerCase()] || category) : 
    'Other';

  // Map level to correct enum value
  const levelMap = {
    'beginner': 'beginner',
    'intermediate': 'intermediate',
    'advanced': 'advanced',
    'all-levels': 'all-levels',
    'all levels': 'all-levels',
  };

  const normalizedLevel = level ? 
    (levelMap[level.toLowerCase()] || 'beginner') : 
    'beginner';

  // Default placeholder thumbnail if not provided
  const defaultThumbnail = {
    url: 'https://placehold.co/800x450/3b82f6/ffffff?text=Course+Thumbnail',
    publicId: 'placeholder',
  };

  // Create course (auto-published)
  const course = await Course.create({
    title,
    description,
    shortDescription,
    category: normalizedCategory,
    subcategory,
    tags,
    level: normalizedLevel,
    prerequisites,
    targetAudience,
    price: price || 0,
    originalPrice: originalPrice || price || 0,
    currency,
    learningOutcomes,
    requirements,
    language,
    instructor: req.user._id,
    status: 'published', // Auto-publish (no admin approval needed)
    isPublished: true,
    publishedAt: new Date(),
    thumbnail: req.files?.thumbnail
      ? {
          url: req.files.thumbnail[0].path,
          publicId: req.files.thumbnail[0].filename,
        }
      : defaultThumbnail,
  });

  // Update educator's course count
  await User.findByIdAndUpdate(req.user._id, {
    $inc: { 'educatorProfile.totalCourses': 1 },
  });

  ApiResponse.created(res, course, 'Course created successfully');
});

// ============================================
// @desc    Get all courses (with filters)
// @route   GET /api/v1/courses
// @access  Public
// ============================================
exports.getAllCourses = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    category,
    level,
    search,
    priceMin,
    priceMax,
    rating,
    sort = '-createdAt',
    isFree,
    language,
    tags,
  } = req.query;

  // Build query
  const query = { status: 'published', isPublished: true };

  if (category) {
    query.category = category;
  }

  if (level) {
    query.level = level;
  }

  if (search) {
    query.$text = { $search: search };
  }

  if (priceMin || priceMax) {
    query.price = {};
    if (priceMin) query.price.$gte = parseFloat(priceMin);
    if (priceMax) query.price.$lte = parseFloat(priceMax);
  }

  if (rating) {
    query['rating.average'] = { $gte: parseFloat(rating) };
  }

  if (isFree !== undefined) {
    query.isFree = isFree === 'true';
  }

  if (language) {
    query.language = language;
  }

  if (tags) {
    const tagsArray = tags.split(',');
    query.tags = { $in: tagsArray };
  }

  // Execute query
  const courses = await Course.find(query)
    .populate('instructor', 'name profileImage educatorProfile.rating')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .select('-enrolledStudents -sections');

  const total = await Course.countDocuments(query);

  const pagination = getPagination(page, limit, total);

  ApiResponse.paginated(res, courses, pagination, 'Courses retrieved successfully');
});

// ============================================
// @desc    Get single course by ID
// @route   GET /api/v1/courses/:id
// @access  Public
// ============================================
exports.getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate('instructor', 'name profileImage bio educatorProfile')
    .populate('coInstructors', 'name profileImage')
    .populate({
      path: 'reviews',
      populate: {
        path: 'user',
        select: 'name profileImage',
      },
      options: {
        limit: 10,
        sort: '-createdAt',
      },
    });

  if (!course) {
    throw ApiError.notFound('Course not found');
  }

  // Increment views
  await course.incrementViews();

  // Check if user is enrolled (if authenticated)
  let isEnrolled = false;
  if (req.user) {
    isEnrolled = course.isUserEnrolled(req.user._id);
  }

  const courseData = course.toObject();
  courseData.isEnrolled = isEnrolled;

  ApiResponse.success(res, courseData, 'Course retrieved successfully');
});

// ============================================
// @desc    Get course by slug
// @route   GET /api/v1/courses/slug/:slug
// @access  Public
// ============================================
exports.getCourseBySlug = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ slug: req.params.slug })
    .populate('instructor', 'name profileImage bio educatorProfile')
    .populate('coInstructors', 'name profileImage');

  if (!course) {
    throw ApiError.notFound('Course not found');
  }

  await course.incrementViews();

  let isEnrolled = false;
  if (req.user) {
    isEnrolled = course.isUserEnrolled(req.user._id);
  }

  const courseData = course.toObject();
  courseData.isEnrolled = isEnrolled;

  ApiResponse.success(res, courseData, 'Course retrieved successfully');
});

// ============================================
// @desc    Update course
// @route   PUT /api/v1/courses/:id
// @access  Private (Educator/Admin - Course Owner)
// ============================================
exports.updateCourse = asyncHandler(async (req, res) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    throw ApiError.notFound('Course not found');
  }

  // Check ownership
  if (
    course.instructor.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    throw ApiError.forbidden('Not authorized to update this course');
  }

  const allowedUpdates = [
    'title',
    'description',
    'shortDescription',
    'category',
    'subcategory',
    'tags',
    'level',
    'prerequisites',
    'targetAudience',
    'price',
    'originalPrice',
    'discount',
    'learningOutcomes',
    'requirements',
    'language',
    'maxStudents',
  ];

  const updates = {};
  Object.keys(req.body).forEach((key) => {
    if (allowedUpdates.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  updates.updatedBy = req.user._id;

  course = await Course.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  ApiResponse.success(res, course, 'Course updated successfully');
});

// ============================================
// @desc    Delete course
// @route   DELETE /api/v1/courses/:id
// @access  Private (Educator/Admin - Course Owner)
// ============================================
exports.deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    throw ApiError.notFound('Course not found');
  }

  // Check ownership
  if (
    course.instructor.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    throw ApiError.forbidden('Not authorized to delete this course');
  }

  // Delete associated files from cloudinary
  if (course.thumbnail?.publicId) {
    await deleteFromCloudinary(course.thumbnail.publicId);
  }

  await course.deleteOne();

  // Update educator's course count
  await User.findByIdAndUpdate(course.instructor, {
    $inc: { 'educatorProfile.totalCourses': -1 },
  });

  ApiResponse.success(res, null, 'Course deleted successfully');
});

// ============================================
// @desc    Upload course thumbnail
// @route   PUT /api/v1/courses/:id/thumbnail
// @access  Private (Educator - Course Owner)
// ============================================
exports.uploadCourseThumbnail = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    throw ApiError.notFound('Course not found');
  }

  // Check ownership
  if (course.instructor.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not authorized to update this course');
  }

  if (!req.file) {
    throw ApiError.badRequest('Please upload a thumbnail image');
  }

  // Delete old thumbnail if exists
  if (course.thumbnail?.publicId) {
    await deleteFromCloudinary(course.thumbnail.publicId);
  }

  course.thumbnail = {
    url: req.file.path,
    publicId: req.file.filename,
  };

  await course.save();

  ApiResponse.success(
    res,
    { thumbnail: course.thumbnail },
    'Thumbnail uploaded successfully'
  );
});

// ============================================
// @desc    Add course section
// @route   POST /api/v1/courses/:id/sections
// @access  Private (Educator - Course Owner)
// ============================================
exports.addSection = asyncHandler(async (req, res) => {
  const { title, description, order } = req.body;

  const course = await Course.findById(req.params.id);

  if (!course) {
    throw ApiError.notFound('Course not found');
  }

  // Check ownership
  if (course.instructor.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not authorized to update this course');
  }

  course.sections.push({
    title,
    description,
    order: order || course.sections.length + 1,
    lectures: [],
  });

  await course.save();

  ApiResponse.created(
    res,
    { sections: course.sections },
    'Section added successfully'
  );
});

// ============================================
// @desc    Update course section
// @route   PUT /api/v1/courses/:id/sections/:sectionId
// @access  Private (Educator - Course Owner)
// ============================================
exports.updateSection = asyncHandler(async (req, res) => {
  const { title, description, order } = req.body;

  const course = await Course.findById(req.params.id);

  if (!course) {
    throw ApiError.notFound('Course not found');
  }

  // Check ownership
  if (course.instructor.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not authorized to update this course');
  }

  const section = course.sections.id(req.params.sectionId);

  if (!section) {
    throw ApiError.notFound('Section not found');
  }

  if (title) section.title = title;
  if (description) section.description = description;
  if (order) section.order = order;

  await course.save();

  ApiResponse.success(res, { section }, 'Section updated successfully');
});

// ============================================
// @desc    Delete course section
// @route   DELETE /api/v1/courses/:id/sections/:sectionId
// @access  Private (Educator - Course Owner)
// ============================================
exports.deleteSection = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    throw ApiError.notFound('Course not found');
  }

  // Check ownership
  if (course.instructor.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not authorized to update this course');
  }

  course.sections = course.sections.filter(
    (section) => section._id.toString() !== req.params.sectionId
  );

  await course.save();

  ApiResponse.success(res, null, 'Section deleted successfully');
});

// ============================================
// @desc    Add lecture to section
// @route   POST /api/v1/courses/:id/sections/:sectionId/lectures
// @access  Private (Educator - Course Owner)
// ============================================
exports.addLecture = asyncHandler(async (req, res) => {
  const { title, description, type, content, order, isFree } = req.body;

  const course = await Course.findById(req.params.id);

  if (!course) {
    throw ApiError.notFound('Course not found');
  }

  // Check ownership
  if (course.instructor.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not authorized to update this course');
  }

  const section = course.sections.id(req.params.sectionId);

  if (!section) {
    throw ApiError.notFound('Section not found');
  }

  section.lectures.push({
    title,
    description,
    type: type || 'video',
    content,
    order: order || section.lectures.length + 1,
    isFree: isFree || false,
  });

  await course.save();

  ApiResponse.created(
    res,
    { lectures: section.lectures },
    'Lecture added successfully'
  );
});

// ============================================
// @desc    Update lecture
// @route   PUT /api/v1/courses/:id/sections/:sectionId/lectures/:lectureId
// @access  Private (Educator - Course Owner)
// ============================================
exports.updateLecture = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    throw ApiError.notFound('Course not found');
  }

  // Check ownership
  if (course.instructor.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not authorized to update this course');
  }

  const section = course.sections.id(req.params.sectionId);

  if (!section) {
    throw ApiError.notFound('Section not found');
  }

  const lecture = section.lectures.id(req.params.lectureId);

  if (!lecture) {
    throw ApiError.notFound('Lecture not found');
  }

  const allowedUpdates = ['title', 'description', 'type', 'content', 'order', 'isFree'];

  Object.keys(req.body).forEach((key) => {
    if (allowedUpdates.includes(key)) {
      lecture[key] = req.body[key];
    }
  });

  await course.save();

  ApiResponse.success(res, { lecture }, 'Lecture updated successfully');
});

// ============================================
// @desc    Delete lecture
// @route   DELETE /api/v1/courses/:id/sections/:sectionId/lectures/:lectureId
// @access  Private (Educator - Course Owner)
// ============================================
exports.deleteLecture = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    throw ApiError.notFound('Course not found');
  }

  // Check ownership
  if (course.instructor.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not authorized to update this course');
  }

  const section = course.sections.id(req.params.sectionId);

  if (!section) {
    throw ApiError.notFound('Section not found');
  }

  section.lectures = section.lectures.filter(
    (lecture) => lecture._id.toString() !== req.params.lectureId
  );

  await course.save();

  ApiResponse.success(res, null, 'Lecture deleted successfully');
});

// ============================================
// @desc    Enroll in course
// @route   POST /api/v1/courses/:id/enroll
// @access  Private
// ============================================
exports.enrollInCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    throw ApiError.notFound('Course not found');
  }

  // Check if already enrolled
  if (course.isUserEnrolled(req.user._id)) {
    throw ApiError.conflict('Already enrolled in this course');
  }

  // Check if course is full
  if (course.maxStudents && course.totalStudents >= course.maxStudents) {
    throw ApiError.badRequest('Course is full');
  }

  // Add student to course
  course.enrolledStudents.push({
    user: req.user._id,
    enrolledAt: new Date(),
    progress: 0,
    completedLectures: [],
  });

  await course.updateStudentCount();

  // Update user's enrolled courses
  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { 'learnerProfile.enrolledCourses': course._id },
  });

  // Update educator's total students
  await User.findByIdAndUpdate(course.instructor, {
    $inc: { 'educatorProfile.totalStudents': 1 },
  });

  ApiResponse.success(res, { courseId: course._id }, 'Enrolled successfully');
});

// ============================================
// @desc    Get course curriculum (enrolled students only)
// @route   GET /api/v1/courses/:id/curriculum
// @access  Private
// ============================================
exports.getCourseCurriculum = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).select('sections title');

  if (!course) {
    throw ApiError.notFound('Course not found');
  }

  // Check if user is enrolled
  if (!course.isUserEnrolled(req.user._id)) {
    throw ApiError.forbidden('You must be enrolled to view the curriculum');
  }

  ApiResponse.success(res, course, 'Curriculum retrieved successfully');
});

// ============================================
// @desc    Update course progress
// @route   PUT /api/v1/courses/:id/progress
// @access  Private
// ============================================
exports.updateCourseProgress = asyncHandler(async (req, res) => {
  const { lectureId } = req.body;

  const course = await Course.findById(req.params.id);

  if (!course) {
    throw ApiError.notFound('Course not found');
  }

  const enrollment = course.enrolledStudents.find(
    (e) => e.user.toString() === req.user._id.toString()
  );

  if (!enrollment) {
    throw ApiError.forbidden('You are not enrolled in this course');
  }

  // Add lecture to completed if not already
  if (!enrollment.completedLectures.includes(lectureId)) {
    enrollment.completedLectures.push(lectureId);

    // Calculate progress
    const totalLectures = course.totalLectures;
    enrollment.progress = Math.round(
      (enrollment.completedLectures.length / totalLectures) * 100
    );

    enrollment.lastAccessedAt = new Date();
  }

  await course.save();

  // Update user's streak
  const user = await User.findById(req.user._id);
  await user.updateStreak();

  ApiResponse.success(
    res,
    { progress: enrollment.progress },
    'Progress updated successfully'
  );
});

// ============================================
// @desc    Get my courses (educator: created, learner: enrolled)
// @route   GET /api/v1/courses/my-courses
// @access  Private (All roles)
// ============================================
exports.getMyCoursesAsEducator = asyncHandler(async (req, res) => {
  let courses;

  // If user is educator or admin, show courses they created
  if (req.user.role === 'educator' || req.user.role === 'admin') {
    courses = await Course.find({ instructor: req.user._id })
      .sort('-createdAt')
      .select('-enrolledStudents -sections');
  } 
  // If user is learner or skillExchanger, show courses they're enrolled in
  else {
    courses = await Course.find({ 
      'enrolledStudents.user': req.user._id 
    })
      .populate('instructor', 'name profileImage')
      .sort('-createdAt')
      .select('-sections');
      
    // Add progress for each course
    courses = courses.map((course) => {
      const enrollment = course.enrolledStudents.find(
        (e) => e.user.toString() === req.user._id.toString()
      );
      return {
        ...course.toObject(),
        progress: enrollment?.progress || 0,
        completedLectures: enrollment?.completedLectures?.length || 0,
        lastAccessed: enrollment?.lastAccessedAt,
        enrolledAt: enrollment?.enrolledAt,
      };
    });
  }

  ApiResponse.success(res, courses, 'Courses retrieved successfully');
});

// ============================================
// @desc    Get featured courses
// @route   GET /api/v1/courses/featured
// @access  Public
// ============================================
exports.getFeaturedCourses = asyncHandler(async (req, res) => {
  const { limit = 6 } = req.query;

  const courses = await Course.getFeaturedCourses(parseInt(limit));

  ApiResponse.success(res, courses, 'Featured courses retrieved successfully');
});

// ============================================
// @desc    Get top rated courses
// @route   GET /api/v1/courses/top-rated
// @access  Public
// ============================================
exports.getTopRatedCourses = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const courses = await Course.getTopRatedCourses(parseInt(limit));

  ApiResponse.success(res, courses, 'Top rated courses retrieved successfully');
});

// ============================================
// @desc    Get trending courses
// @route   GET /api/v1/courses/trending
// @access  Public
// ============================================
exports.getTrendingCourses = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const courses = await Course.getTrendingCourses(parseInt(limit));

  ApiResponse.success(res, courses, 'Trending courses retrieved successfully');
});

// ============================================
// @desc    Add course to wishlist
// @route   POST /api/v1/courses/:id/wishlist
// @access  Private
// ============================================
exports.addToWishlist = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    throw ApiError.notFound('Course not found');
  }

  if (course.wishlist.includes(req.user._id)) {
    throw ApiError.conflict('Course already in wishlist');
  }

  course.wishlist.push(req.user._id);
  await course.save();

  ApiResponse.success(res, null, 'Added to wishlist successfully');
});

// ============================================
// @desc    Remove course from wishlist
// @route   DELETE /api/v1/courses/:id/wishlist
// @access  Private
// ============================================
exports.removeFromWishlist = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    throw ApiError.notFound('Course not found');
  }

  course.wishlist = course.wishlist.filter(
    (id) => id.toString() !== req.user._id.toString()
  );

  await course.save();

  ApiResponse.success(res, null, 'Removed from wishlist successfully');
});

// ============================================
// @desc    Publish course
// @route   PUT /api/v1/courses/:id/publish
// @access  Private (Educator - Course Owner)
// ============================================
exports.publishCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    throw ApiError.notFound('Course not found');
  }

  // Check ownership
  if (course.instructor.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not authorized to publish this course');
  }

  course.status = 'published';
  course.isPublished = true;
  course.publishedAt = new Date();

  await course.save();

  ApiResponse.success(res, course, 'Course published successfully');
});

// ============================================
// @desc    Unpublish course
// @route   PUT /api/v1/courses/:id/unpublish
// @access  Private (Educator - Course Owner)
// ============================================
exports.unpublishCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    throw ApiError.notFound('Course not found');
  }

  // Check ownership
  if (course.instructor.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not authorized to unpublish this course');
  }

  course.status = 'draft';
  course.isPublished = false;

  await course.save();

  ApiResponse.success(res, course, 'Course unpublished successfully');
});

// ============================================
// @desc    Get enrolled courses for current user
// @route   GET /api/v1/courses/enrolled
// @access  Private
// ============================================
exports.getEnrolledCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({
    'enrolledStudents.user': req.user._id,
  })
    .populate('instructor', 'name profileImage')
    .select('title thumbnail instructor rating totalLectures enrolledStudents');

  // Add progress for each course
  const coursesWithProgress = courses.map((course) => {
    const enrollment = course.enrolledStudents.find(
      (e) => e.user.toString() === req.user._id.toString()
    );
    return {
      _id: course._id,
      title: course.title,
      thumbnail: course.thumbnail,
      instructor: course.instructor,
      rating: course.rating,
      totalLectures: course.totalLectures,
      progress: enrollment?.progress || 0,
      completedLectures: enrollment?.completedLectures?.length || 0,
      lastAccessed: enrollment?.lastAccessedAt,
      enrolledAt: enrollment?.enrolledAt,
    };
  });

  ApiResponse.success(res, coursesWithProgress, 'Enrolled courses retrieved');
});

// ============================================
// @desc    Get course progress
// @route   GET /api/v1/courses/:id/progress
// @access  Private
// ============================================
exports.getCourseProgress = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  
  if (!course) {
    throw ApiError.notFound('Course not found');
  }

  const enrollment = course.enrolledStudents.find(
    (e) => e.user.toString() === req.user._id.toString()
  );

  if (!enrollment) {
    throw ApiError.forbidden('Not enrolled in this course');
  }

  ApiResponse.success(res, {
    progress: enrollment.progress,
    completedLectures: enrollment.completedLectures,
    totalLectures: course.totalLectures,
    lastAccessed: enrollment.lastAccessedAt,
    enrolledAt: enrollment.enrolledAt,
  }, 'Progress retrieved');
});

// ============================================
// @desc    Get course reviews
// @route   GET /api/v1/courses/:id/reviews
// @access  Public
// ============================================
exports.getCourseReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const Review = require('../models/Review.model');

  const course = await Course.findById(req.params.id);

  if (!course) {
    throw ApiError.notFound('Course not found');
  }

  // Get reviews from Review model
  const reviews = await Review.find({ course: req.params.id })
    .populate('user', 'name profileImage')
    .sort('-createdAt')
    .limit(parseInt(limit))
    .skip((page - 1) * limit);

  const total = await Review.countDocuments({ course: req.params.id });

  ApiResponse.paginated(res, reviews, getPagination(page, limit, total), 'Reviews retrieved');
});

// ============================================
// @desc    Add course review
// @route   POST /api/v1/courses/:id/reviews
// @access  Private
// ============================================
exports.addCourseReview = asyncHandler(async (req, res) => {
  const { rating, comment, title } = req.body;
  const Review = require('../models/Review.model');
  
  const course = await Course.findById(req.params.id);

  if (!course) {
    throw ApiError.notFound('Course not found');
  }

  // Check if user is enrolled
  if (!course.isUserEnrolled(req.user._id)) {
    throw ApiError.forbidden('Must be enrolled to review');
  }

  // Check if user already reviewed
  const existingReview = await Review.findOne({
    user: req.user._id,
    course: req.params.id,
  });

  if (existingReview) {
    throw ApiError.conflict('You have already reviewed this course');
  }

  // Create review
  const review = await Review.create({
    user: req.user._id,
    course: req.params.id,
    rating,
    comment,
    title,
  });

  // Add review to course
  course.reviews.push(review._id);
  
  // Update course rating
  await course.updateRating();
  await course.save();

  // Populate user data
  await review.populate('user', 'name profileImage');

  ApiResponse.created(res, review, 'Review added successfully');
});

// ============================================
// @desc    Search courses
// @route   GET /api/v1/courses/search
// @access  Public
// ============================================
exports.searchCourses = asyncHandler(async (req, res) => {
  const { q, limit = 10, category, level } = req.query;

  if (!q) {
    throw ApiError.badRequest('Search query required');
  }

  const query = {
    status: 'published',
    isPublished: true,
    $or: [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { tags: { $in: [new RegExp(q, 'i')] } },
    ],
  };

  if (category) query.category = category;
  if (level) query.level = level;

  const courses = await Course.find(query)
    .populate('instructor', 'name profileImage')
    .limit(parseInt(limit))
    .select('title thumbnail instructor rating price category level');

  ApiResponse.success(res, courses, 'Search results');
});

// ============================================
// @desc    Get recommended courses
// @route   GET /api/v1/courses/recommended
// @access  Private
// ============================================
exports.getRecommendedCourses = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  
  // Get user's enrolled course categories
  const enrolledCourses = await Course.find({
    'enrolledStudents.user': req.user._id,
  }).select('category tags');

  const categories = [...new Set(enrolledCourses.map((c) => c.category))];
  const tags = [...new Set(enrolledCourses.flatMap((c) => c.tags || []))];

  let recommended;

  if (categories.length > 0 || tags.length > 0) {
    // Find similar courses user hasn't enrolled in
    recommended = await Course.find({
      status: 'published',
      isPublished: true,
      'enrolledStudents.user': { $ne: req.user._id },
      $or: [
        { category: { $in: categories } },
        { tags: { $in: tags } },
      ],
    })
      .populate('instructor', 'name profileImage')
      .sort('-rating.average -totalStudents')
      .limit(parseInt(limit))
      .select('title thumbnail instructor rating price category');
  } else {
    // If no enrolled courses, return top-rated courses
    recommended = await Course.find({
      status: 'published',
      isPublished: true,
      'enrolledStudents.user': { $ne: req.user._id },
    })
      .populate('instructor', 'name profileImage')
      .sort('-rating.average -totalStudents')
      .limit(parseInt(limit))
      .select('title thumbnail instructor rating price category');
  }

  ApiResponse.success(res, recommended, 'Recommended courses');
});

// ============================================
// @desc    Get course analytics (for educator)
// @route   GET /api/v1/courses/:id/analytics
// @access  Private (Educator)
// ============================================
exports.getCourseAnalytics = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    throw ApiError.notFound('Course not found');
  }

  if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw ApiError.forbidden('Not authorized');
  }

  const enrolledCount = course.enrolledStudents?.length || 0;
  const completedCount = course.enrolledStudents?.filter((e) => e.progress >= 100).length || 0;

  const analytics = {
    totalStudents: course.totalStudents || enrolledCount,
    totalViews: course.viewCount || 0,
    averageRating: course.rating?.average || 0,
    totalReviews: course.rating?.count || 0,
    completionRate: enrolledCount > 0 ? Math.round((completedCount / enrolledCount) * 100) : 0,
    totalLectures: course.totalLectures || 0,
    enrollmentTrend: [], // Could be calculated from enrolledStudents dates
    recentEnrollments: course.enrolledStudents
      ?.sort((a, b) => new Date(b.enrolledAt) - new Date(a.enrolledAt))
      .slice(0, 10)
      .map((e) => ({ enrolledAt: e.enrolledAt, progress: e.progress })),
  };

  ApiResponse.success(res, analytics, 'Analytics retrieved');
});

// ============================================
// @desc    Get course students (for educator)
// @route   GET /api/v1/courses/:id/students
// @access  Private (Educator)
// ============================================
exports.getCourseStudents = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const course = await Course.findById(req.params.id)
    .populate('enrolledStudents.user', 'name email profileImage');

  if (!course) {
    throw ApiError.notFound('Course not found');
  }

  if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw ApiError.forbidden('Not authorized');
  }

  const allStudents = course.enrolledStudents.map((e) => ({
    user: e.user,
    progress: e.progress,
    enrolledAt: e.enrolledAt,
    lastAccessed: e.lastAccessedAt,
    completedLectures: e.completedLectures?.length || 0,
    certificateIssued: e.certificateIssued,
  }));

  // Paginate
  const startIndex = (page - 1) * limit;
  const students = allStudents.slice(startIndex, startIndex + parseInt(limit));

  ApiResponse.paginated(res, students, getPagination(page, limit, allStudents.length), 'Students retrieved');
});

// ============================================
// @desc    Get course categories
// @route   GET /api/v1/courses/categories
// @access  Public
// ============================================
exports.getCourseCategories = asyncHandler(async (req, res) => {
  const categories = [
    'Programming',
    'Design',
    'Business',
    'Marketing',
    'Photography',
    'Music',
    'Health & Fitness',
    'Language',
    'Personal Development',
    'Science',
    'Mathematics',
    'Art & Craft',
    'Cooking',
    'Other',
  ];

  // Get count for each category
  const categoryCounts = await Course.aggregate([
    { $match: { status: 'published', isPublished: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);

  const categoriesWithCount = categories.map((cat) => ({
    name: cat,
    count: categoryCounts.find((c) => c._id === cat)?.count || 0,
  }));

  ApiResponse.success(res, categoriesWithCount, 'Categories retrieved');
});