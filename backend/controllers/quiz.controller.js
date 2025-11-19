// Quiz controller
// ============================================
// QUIZ CONTROLLER
// ============================================

const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const Quiz = require('../models/Quiz.model');
const Course = require('../models/Course.model');
const User = require('../models/User.model');
const { getPagination } = require('../utils/helpers');

// ============================================
// @desc    Create new quiz
// @route   POST /api/v1/quizzes
// @access  Private (Educator/Admin)
// ============================================
exports.createQuiz = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    course,
    section,
    lecture,
    quizType,
    difficulty,
    questions,
    settings,
    availability,
    certificate,
  } = req.body;

  // Verify course exists and user is the instructor
  const courseData = await Course.findById(course);
  if (!courseData) {
    throw ApiError.notFound('Course not found');
  }

  if (
    courseData.instructor.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    throw ApiError.forbidden('Not authorized to create quiz for this course');
  }

  const quiz = await Quiz.create({
    title,
    description,
    course,
    instructor: req.user._id,
    section,
    lecture,
    quizType: quizType || 'practice',
    difficulty: difficulty || 'medium',
    questions,
    settings,
    availability,
    certificate,
  });

  // Update course total quizzes count
  await Course.findByIdAndUpdate(course, {
    $inc: { totalQuizzes: 1 },
  });

  ApiResponse.created(res, quiz, 'Quiz created successfully');
});

// ============================================
// @desc    Get all quizzes (with filters)
// @route   GET /api/v1/quizzes
// @access  Private
// ============================================
exports.getAllQuizzes = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    course,
    difficulty,
    quizType,
    status,
    sort = '-createdAt',
  } = req.query;

  // Build query
  const query = {};

  if (course) query.course = course;
  if (difficulty) query.difficulty = difficulty;
  if (quizType) query.quizType = quizType;
  if (status) query.status = status;

  // Execute query
  const quizzes = await Quiz.find(query)
    .populate('course', 'title')
    .populate('instructor', 'name profileImage')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .select('-submissions -questions.correctAnswer');

  const total = await Quiz.countDocuments(query);

  const pagination = getPagination(page, limit, total);

  ApiResponse.paginated(res, quizzes, pagination, 'Quizzes retrieved successfully');
});

// ============================================
// @desc    Get single quiz by ID
// @route   GET /api/v1/quizzes/:id
// @access  Private
// ============================================
exports.getQuizById = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id)
    .populate('course', 'title instructor')
    .populate('instructor', 'name profileImage');

  if (!quiz) {
    throw ApiError.notFound('Quiz not found');
  }

  // Check if quiz is available
  if (!quiz.isAvailable() && req.user.role !== 'admin') {
    throw ApiError.forbidden('Quiz is not available at this time');
  }

  // Hide correct answers for students
  let quizData = quiz.toObject();
  if (req.user._id.toString() !== quiz.instructor.toString() && req.user.role !== 'admin') {
    quizData.questions = quizData.questions.map((q) => {
      const { correctAnswer, ...questionWithoutAnswer } = q;
      return questionWithoutAnswer;
    });
  }

  // Get student's previous attempts
  const studentAttempts = quiz.getStudentSubmissions(req.user._id);
  quizData.studentAttempts = studentAttempts.length;
  quizData.canAttempt = quiz.canStudentAttempt(req.user._id);
  quizData.bestScore = quiz.getStudentBestScore(req.user._id);

  ApiResponse.success(res, quizData, 'Quiz retrieved successfully');
});

// ============================================
// @desc    Update quiz
// @route   PUT /api/v1/quizzes/:id
// @access  Private (Educator/Admin - Quiz Owner)
// ============================================
exports.updateQuiz = asyncHandler(async (req, res) => {
  let quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    throw ApiError.notFound('Quiz not found');
  }

  // Check ownership
  if (
    quiz.instructor.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    throw ApiError.forbidden('Not authorized to update this quiz');
  }

  const allowedUpdates = [
    'title',
    'description',
    'questions',
    'settings',
    'availability',
    'difficulty',
    'certificate',
  ];

  const updates = {};
  Object.keys(req.body).forEach((key) => {
    if (allowedUpdates.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  updates.lastModifiedBy = req.user._id;

  quiz = await Quiz.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  ApiResponse.success(res, quiz, 'Quiz updated successfully');
});

// ============================================
// @desc    Delete quiz
// @route   DELETE /api/v1/quizzes/:id
// @access  Private (Educator/Admin - Quiz Owner)
// ============================================
exports.deleteQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    throw ApiError.notFound('Quiz not found');
  }

  // Check ownership
  if (
    quiz.instructor.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    throw ApiError.forbidden('Not authorized to delete this quiz');
  }

  await quiz.deleteOne();

  // Update course quiz count
  await Course.findByIdAndUpdate(quiz.course, {
    $inc: { totalQuizzes: -1 },
  });

  ApiResponse.success(res, null, 'Quiz deleted successfully');
});

// ============================================
// @desc    Start quiz attempt
// @route   POST /api/v1/quizzes/:id/start
// @access  Private
// ============================================
exports.startQuizAttempt = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    throw ApiError.notFound('Quiz not found');
  }

  // Check if quiz is available
  if (!quiz.isAvailable()) {
    throw ApiError.forbidden('Quiz is not available at this time');
  }

  // Check if user can attempt
  if (!quiz.canStudentAttempt(req.user._id)) {
    throw ApiError.forbidden('Maximum attempts reached');
  }

  // Check if user is enrolled in the course
  const course = await Course.findById(quiz.course);
  if (!course.isUserEnrolled(req.user._id) && req.user.role !== 'admin') {
    throw ApiError.forbidden('You must be enrolled in the course to take this quiz');
  }

  // Start attempt
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];

  const submission = await quiz.startAttempt(req.user._id, ipAddress, userAgent);

  // Return quiz with questions (without correct answers)
  const quizData = quiz.toObject();
  quizData.questions = quizData.questions.map((q) => {
    const { correctAnswer, ...questionWithoutAnswer } = q;
    return questionWithoutAnswer;
  });

  ApiResponse.success(
    res,
    {
      quiz: quizData,
      submissionId: submission._id,
      startedAt: submission.startedAt,
      timeLimit: quiz.settings.timeLimit,
    },
    'Quiz attempt started successfully'
  );
});

// ============================================
// @desc    Submit quiz
// @route   POST /api/v1/quizzes/:id/submit
// @access  Private
// ============================================
exports.submitQuiz = asyncHandler(async (req, res) => {
  const { submissionId, answers } = req.body;

  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    throw ApiError.notFound('Quiz not found');
  }

  // Submit and grade quiz
  const submission = await quiz.submitQuiz(submissionId, answers);

  // Award points if passed
  if (submission.passed) {
    const user = await User.findById(req.user._id);
    await user.addPoints(50); // Points for passing quiz
  }

  // Prepare result
  const result = {
    submissionId: submission._id,
    score: submission.score,
    passed: submission.passed,
    timeSpent: submission.timeSpent,
    submittedAt: submission.submittedAt,
  };

  // Include answers with feedback if allowed
  if (quiz.settings.showCorrectAnswers && quiz.settings.showResultsImmediately) {
    result.answers = submission.answers.map((ans) => {
      const question = quiz.questions.id(ans.questionId);
      return {
        questionId: ans.questionId,
        questionText: question.questionText,
        yourAnswer: ans.answer,
        correctAnswer: question.correctAnswer,
        isCorrect: ans.isCorrect,
        pointsEarned: ans.pointsEarned,
        explanation: question.explanation,
      };
    });
  }

  ApiResponse.success(res, result, 'Quiz submitted successfully');
});

// ============================================
// @desc    Get quiz submission results
// @route   GET /api/v1/quizzes/:id/submissions/:submissionId
// @access  Private
// ============================================
exports.getSubmissionResults = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    throw ApiError.notFound('Quiz not found');
  }

  const submission = quiz.submissions.id(req.params.submissionId);

  if (!submission) {
    throw ApiError.notFound('Submission not found');
  }

  // Check authorization
  if (
    submission.student.toString() !== req.user._id.toString() &&
    quiz.instructor.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    throw ApiError.forbidden('Not authorized to view this submission');
  }

  // Prepare detailed results
  const results = {
    submissionId: submission._id,
    attemptNumber: submission.attemptNumber,
    score: submission.score,
    passed: submission.passed,
    status: submission.status,
    startedAt: submission.startedAt,
    submittedAt: submission.submittedAt,
    timeSpent: submission.timeSpent,
    feedback: submission.feedback,
  };

  // Include answers with correct answers if allowed or if instructor
  if (
    quiz.settings.showCorrectAnswers ||
    quiz.instructor.toString() === req.user._id.toString() ||
    req.user.role === 'admin'
  ) {
    results.answers = submission.answers.map((ans) => {
      const question = quiz.questions.id(ans.questionId);
      return {
        questionText: question.questionText,
        yourAnswer: ans.answer,
        correctAnswer: question.correctAnswer,
        isCorrect: ans.isCorrect,
        pointsEarned: ans.pointsEarned,
        explanation: question.explanation,
      };
    });
  }

  ApiResponse.success(res, results, 'Submission results retrieved successfully');
});

// ============================================
// @desc    Get student's quiz history
// @route   GET /api/v1/quizzes/:id/my-attempts
// @access  Private
// ============================================
exports.getMyAttempts = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    throw ApiError.notFound('Quiz not found');
  }

  const attempts = quiz.getStudentSubmissions(req.user._id);

  const attemptsData = attempts.map((attempt) => ({
    _id: attempt._id,
    attemptNumber: attempt.attemptNumber,
    score: attempt.score,
    passed: attempt.passed,
    status: attempt.status,
    startedAt: attempt.startedAt,
    submittedAt: attempt.submittedAt,
    timeSpent: attempt.timeSpent,
  }));

  ApiResponse.success(res, {
    attempts: attemptsData,
    totalAttempts: attempts.length,
    bestScore: quiz.getStudentBestScore(req.user._id),
    canAttempt: quiz.canStudentAttempt(req.user._id),
  }, 'Attempts retrieved successfully');
});

// ============================================
// @desc    Grade quiz manually (for essay/short answer)
// @route   PUT /api/v1/quizzes/:id/submissions/:submissionId/grade
// @access  Private (Educator - Quiz Owner)
// ============================================
exports.gradeQuizManually = asyncHandler(async (req, res) => {
  const { answerGrades, feedback } = req.body;

  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    throw ApiError.notFound('Quiz not found');
  }

  // Check ownership
  if (quiz.instructor.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not authorized to grade this quiz');
  }

  await quiz.gradeManually(
    req.params.submissionId,
    answerGrades,
    feedback,
    req.user._id
  );

  ApiResponse.success(res, null, 'Quiz graded successfully');
});

// ============================================
// @desc    Get quizzes by course
// @route   GET /api/v1/quizzes/course/:courseId
// @access  Private
// ============================================
exports.getQuizzesByCourse = asyncHandler(async (req, res) => {
  const quizzes = await Quiz.getQuizzesByCourse(req.params.courseId);

  ApiResponse.success(res, quizzes, 'Quizzes retrieved successfully');
});

// ============================================
// @desc    Publish quiz
// @route   PUT /api/v1/quizzes/:id/publish
// @access  Private (Educator - Quiz Owner)
// ============================================
exports.publishQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    throw ApiError.notFound('Quiz not found');
  }

  // Check ownership
  if (quiz.instructor.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not authorized to publish this quiz');
  }

  quiz.status = 'published';
  quiz.isPublished = true;
  quiz.publishedAt = new Date();

  await quiz.save();

  ApiResponse.success(res, quiz, 'Quiz published successfully');
});

// ============================================
// @desc    Get quiz statistics
// @route   GET /api/v1/quizzes/:id/statistics
// @access  Private (Educator - Quiz Owner)
// ============================================
exports.getQuizStatistics = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    throw ApiError.notFound('Quiz not found');
  }

  // Check ownership
  if (
    quiz.instructor.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    throw ApiError.forbidden('Not authorized to view statistics');
  }

  // Update question statistics
  await quiz.updateQuestionStats();

  const stats = {
    totalAttempts: quiz.statistics.totalAttempts,
    totalSubmissions: quiz.statistics.totalSubmissions,
    averageScore: quiz.statistics.averageScore,
    highestScore: quiz.statistics.highestScore,
    lowestScore: quiz.statistics.lowestScore,
    passRate: quiz.statistics.passRate,
    averageTimeSpent: quiz.statistics.averageTimeSpent,
    questionStats: quiz.statistics.questionStats,
  };

  ApiResponse.success(res, stats, 'Statistics retrieved successfully');
});

// ============================================
// @desc    Track tab switch (proctoring)
// @route   POST /api/v1/quizzes/:id/submissions/:submissionId/tab-switch
// @access  Private
// ============================================
exports.trackTabSwitch = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    throw ApiError.notFound('Quiz not found');
  }

  await quiz.trackTabSwitch(req.params.submissionId);

  ApiResponse.success(res, null, 'Tab switch recorded');
});

// ============================================
// @desc    Get all submissions for a quiz (Educator)
// @route   GET /api/v1/quizzes/:id/all-submissions
// @access  Private (Educator - Quiz Owner)
// ============================================
exports.getAllSubmissions = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id)
    .populate('submissions.student', 'name email profileImage');

  if (!quiz) {
    throw ApiError.notFound('Quiz not found');
  }

  // Check ownership
  if (
    quiz.instructor.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    throw ApiError.forbidden('Not authorized to view submissions');
  }

  const submissions = quiz.submissions
    .filter((s) => s.status === 'submitted' || s.status === 'graded')
    .map((s) => ({
      _id: s._id,
      student: s.student,
      attemptNumber: s.attemptNumber,
      score: s.score,
      passed: s.passed,
      status: s.status,
      submittedAt: s.submittedAt,
      timeSpent: s.timeSpent,
    }));

  ApiResponse.success(res, submissions, 'Submissions retrieved successfully');
});

// ============================================
// @desc    Duplicate quiz
// @route   POST /api/v1/quizzes/:id/duplicate
// @access  Private (Educator - Quiz Owner)
// ============================================
exports.duplicateQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    throw ApiError.notFound('Quiz not found');
  }

  // Check ownership
  if (quiz.instructor.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not authorized to duplicate this quiz');
  }

  const duplicatedQuiz = await Quiz.create({
    title: `${quiz.title} (Copy)`,
    description: quiz.description,
    course: quiz.course,
    instructor: req.user._id,
    quizType: quiz.quizType,
    difficulty: quiz.difficulty,
    questions: quiz.questions,
    settings: quiz.settings,
    availability: quiz.availability,
    certificate: quiz.certificate,
    status: 'draft',
  });

  ApiResponse.created(res, duplicatedQuiz, 'Quiz duplicated successfully');
});