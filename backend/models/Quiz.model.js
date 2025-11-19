// Quiz model
// ============================================
// QUIZ MODEL
// ============================================

const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema(
  {
    // ============================================
    // BASIC INFORMATION
    // ============================================
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },

    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },

    // ============================================
    // RELATED COURSE & INSTRUCTOR
    // ============================================
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
    },

    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Instructor is required'],
    },

    section: {
      type: String,
      trim: true,
    },

    lecture: {
      type: mongoose.Schema.Types.ObjectId,
    },

    // ============================================
    // QUIZ TYPE & SETTINGS
    // ============================================
    quizType: {
      type: String,
      enum: ['practice', 'graded', 'assignment', 'final-exam', 'survey'],
      default: 'practice',
    },

    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'mixed'],
      default: 'medium',
    },

    // ============================================
    // QUESTIONS
    // ============================================
    questions: [
      {
        questionText: {
          type: String,
          required: [true, 'Question text is required'],
          trim: true,
        },

        questionType: {
          type: String,
          enum: [
            'multiple-choice',
            'true-false',
            'short-answer',
            'essay',
            'fill-in-blank',
            'matching',
          ],
          default: 'multiple-choice',
        },

        // For multiple-choice questions
        options: [
          {
            text: {
              type: String,
              required: true,
              trim: true,
            },
            isCorrect: {
              type: Boolean,
              default: false,
            },
          },
        ],

        // For true-false questions
        correctAnswer: {
          type: mongoose.Schema.Types.Mixed, // Can be Boolean, String, Number, Array
        },

        // For essay/short-answer
        sampleAnswer: String,

        // For fill-in-blank
        blanks: [
          {
            position: Number,
            correctAnswer: String,
            caseSensitive: {
              type: Boolean,
              default: false,
            },
          },
        ],

        // For matching
        matchingPairs: [
          {
            left: String,
            right: String,
          },
        ],

        // Question metadata
        points: {
          type: Number,
          default: 1,
          min: [0, 'Points cannot be negative'],
        },

        explanation: {
          type: String,
          maxlength: [500, 'Explanation cannot exceed 500 characters'],
        },

        image: {
          url: String,
          publicId: String,
        },

        order: {
          type: Number,
          required: true,
        },

        tags: [String],

        difficulty: {
          type: String,
          enum: ['easy', 'medium', 'hard'],
          default: 'medium',
        },
      },
    ],

    // ============================================
    // QUIZ SETTINGS
    // ============================================
    settings: {
      timeLimit: {
        type: Number, // in minutes
        min: [0, 'Time limit cannot be negative'],
        default: null, // null = no time limit
      },

      passingScore: {
        type: Number,
        default: 70,
        min: [0, 'Passing score cannot be less than 0'],
        max: [100, 'Passing score cannot exceed 100'],
      },

      maxAttempts: {
        type: Number,
        default: null, // null = unlimited attempts
        min: [1, 'At least 1 attempt must be allowed'],
      },

      shuffleQuestions: {
        type: Boolean,
        default: false,
      },

      shuffleOptions: {
        type: Boolean,
        default: false,
      },

      showCorrectAnswers: {
        type: Boolean,
        default: true,
      },

      showResultsImmediately: {
        type: Boolean,
        default: true,
      },

      allowReview: {
        type: Boolean,
        default: true,
      },

      requireFullCompletion: {
        type: Boolean,
        default: false,
      },

      randomizeFromPool: {
        enabled: {
          type: Boolean,
          default: false,
        },
        questionsToShow: Number,
      },

      proctoring: {
        enabled: {
          type: Boolean,
          default: false,
        },
        preventTabSwitch: {
          type: Boolean,
          default: false,
        },
        preventCopyPaste: {
          type: Boolean,
          default: false,
        },
        webcamRequired: {
          type: Boolean,
          default: false,
        },
      },
    },

    // ============================================
    // AVAILABILITY
    // ============================================
    availability: {
      startDate: Date,
      endDate: Date,
      isAvailable: {
        type: Boolean,
        default: true,
      },
    },

    // ============================================
    // SUBMISSIONS
    // ============================================
    submissions: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        attemptNumber: {
          type: Number,
          required: true,
          default: 1,
        },
        answers: [
          {
            questionId: {
              type: mongoose.Schema.Types.ObjectId,
              required: true,
            },
            answer: mongoose.Schema.Types.Mixed, // Can be String, Number, Array, Boolean
            isCorrect: Boolean,
            pointsEarned: {
              type: Number,
              default: 0,
            },
            timeSpent: Number, // in seconds
          },
        ],
        score: {
          obtained: {
            type: Number,
            default: 0,
          },
          total: {
            type: Number,
            required: true,
          },
          percentage: {
            type: Number,
            default: 0,
          },
        },
        passed: {
          type: Boolean,
          default: false,
        },
        startedAt: {
          type: Date,
          default: Date.now,
        },
        submittedAt: Date,
        timeSpent: Number, // total time in minutes
        status: {
          type: String,
          enum: ['in-progress', 'submitted', 'graded', 'abandoned'],
          default: 'in-progress',
        },
        feedback: String,
        gradedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        gradedAt: Date,
        ipAddress: String,
        userAgent: String,
        tabSwitches: {
          type: Number,
          default: 0,
        },
      },
    ],

    // ============================================
    // STATISTICS
    // ============================================
    statistics: {
      totalAttempts: {
        type: Number,
        default: 0,
      },
      totalSubmissions: {
        type: Number,
        default: 0,
      },
      averageScore: {
        type: Number,
        default: 0,
      },
      highestScore: {
        type: Number,
        default: 0,
      },
      lowestScore: {
        type: Number,
        default: 0,
      },
      passRate: {
        type: Number,
        default: 0,
      },
      averageTimeSpent: {
        type: Number,
        default: 0,
      },
      questionStats: [
        {
          questionId: mongoose.Schema.Types.ObjectId,
          correctAttempts: {
            type: Number,
            default: 0,
          },
          incorrectAttempts: {
            type: Number,
            default: 0,
          },
          difficulty: Number, // calculated based on success rate
        },
      ],
    },

    // ============================================
    // CERTIFICATE
    // ============================================
    certificate: {
      enabled: {
        type: Boolean,
        default: false,
      },
      minimumScore: {
        type: Number,
        default: 70,
      },
    },

    // ============================================
    // STATUS
    // ============================================
    status: {
      type: String,
      enum: ['draft', 'published', 'archived', 'scheduled'],
      default: 'draft',
    },

    isPublished: {
      type: Boolean,
      default: false,
    },

    publishedAt: Date,

    // ============================================
    // METADATA
    // ============================================
    totalQuestions: {
      type: Number,
      default: 0,
    },

    totalPoints: {
      type: Number,
      default: 0,
    },

    estimatedDuration: {
      type: Number, // in minutes
      default: 0,
    },

    tags: [String],

    isRequired: {
      type: Boolean,
      default: false,
    },

    weight: {
      type: Number,
      default: 1, // For weighted grading
      min: [0, 'Weight cannot be negative'],
    },

    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ============================================
// INDEXES
// ============================================
quizSchema.index({ course: 1, status: 1 });
quizSchema.index({ instructor: 1 });
quizSchema.index({ slug: 1 });
quizSchema.index({ 'submissions.student': 1 });
quizSchema.index({ createdAt: -1 });

// ============================================
// VIRTUAL PROPERTIES
// ============================================

// Total submissions count
quizSchema.virtual('submissionsCount').get(function () {
  return this.submissions?.filter((s) => s.status === 'submitted').length || 0;
});

// Completion rate
quizSchema.virtual('completionRate').get(function () {
  if (this.statistics.totalAttempts === 0) return 0;
  return Math.round(
    (this.statistics.totalSubmissions / this.statistics.totalAttempts) * 100
  );
});

// Average difficulty
quizSchema.virtual('averageDifficulty').get(function () {
  if (!this.questions || this.questions.length === 0) return 'medium';
  const difficultyMap = { easy: 1, medium: 2, hard: 3 };
  const sum = this.questions.reduce(
    (acc, q) => acc + (difficultyMap[q.difficulty] || 2),
    0
  );
  const avg = sum / this.questions.length;
  if (avg < 1.5) return 'easy';
  if (avg < 2.5) return 'medium';
  return 'hard';
});

// ============================================
// MIDDLEWARE - PRE SAVE
// ============================================

// Generate slug
quizSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();

    this.slug += '-' + Date.now().toString(36).substring(2, 7);
  }
  next();
});

// Calculate total questions and points
quizSchema.pre('save', function (next) {
  if (this.isModified('questions')) {
    this.totalQuestions = this.questions.length;
    this.totalPoints = this.questions.reduce((sum, q) => sum + (q.points || 1), 0);

    // Estimate duration (2 minutes per question + extra for difficult ones)
    this.estimatedDuration = this.questions.reduce((time, q) => {
      const baseTime = 2;
      const difficultyBonus = q.difficulty === 'hard' ? 1 : 0;
      return time + baseTime + difficultyBonus;
    }, 0);
  }
  next();
});

// Set published date
quizSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
    this.isPublished = true;
  }
  next();
});

// Update statistics
quizSchema.pre('save', function (next) {
  if (this.isModified('submissions')) {
    const completedSubmissions = this.submissions.filter(
      (s) => s.status === 'submitted' || s.status === 'graded'
    );

    this.statistics.totalSubmissions = completedSubmissions.length;
    this.statistics.totalAttempts = this.submissions.length;

    if (completedSubmissions.length > 0) {
      const scores = completedSubmissions.map((s) => s.score.percentage);
      const passedCount = completedSubmissions.filter((s) => s.passed).length;

      this.statistics.averageScore =
        scores.reduce((a, b) => a + b, 0) / scores.length;
      this.statistics.highestScore = Math.max(...scores);
      this.statistics.lowestScore = Math.min(...scores);
      this.statistics.passRate = (passedCount / completedSubmissions.length) * 100;

      const times = completedSubmissions
        .filter((s) => s.timeSpent)
        .map((s) => s.timeSpent);
      if (times.length > 0) {
        this.statistics.averageTimeSpent =
          times.reduce((a, b) => a + b, 0) / times.length;
      }
    }
  }
  next();
});

// ============================================
// INSTANCE METHODS
// ============================================

// Get student's submissions
quizSchema.methods.getStudentSubmissions = function (studentId) {
  return this.submissions.filter(
    (s) => s.student.toString() === studentId.toString()
  );
};

// Get student's best score
quizSchema.methods.getStudentBestScore = function (studentId) {
  const studentSubmissions = this.getStudentSubmissions(studentId);
  if (studentSubmissions.length === 0) return 0;

  return Math.max(...studentSubmissions.map((s) => s.score.percentage));
};

// Get student's attempt count
quizSchema.methods.getStudentAttemptCount = function (studentId) {
  return this.getStudentSubmissions(studentId).length;
};

// Check if student can attempt
quizSchema.methods.canStudentAttempt = function (studentId) {
  if (this.settings.maxAttempts === null) return true;

  const attemptCount = this.getStudentAttemptCount(studentId);
  return attemptCount < this.settings.maxAttempts;
};

// Check if quiz is available
quizSchema.methods.isAvailable = function () {
  if (!this.availability.isAvailable) return false;

  const now = new Date();

  if (this.availability.startDate && now < this.availability.startDate) {
    return false;
  }

  if (this.availability.endDate && now > this.availability.endDate) {
    return false;
  }

  return true;
};

// Start quiz attempt
quizSchema.methods.startAttempt = async function (studentId, ipAddress, userAgent) {
  const attemptNumber = this.getStudentAttemptCount(studentId) + 1;

  this.submissions.push({
    student: studentId,
    attemptNumber: attemptNumber,
    answers: [],
    score: {
      obtained: 0,
      total: this.totalPoints,
      percentage: 0,
    },
    startedAt: new Date(),
    status: 'in-progress',
    ipAddress: ipAddress,
    userAgent: userAgent,
  });

  await this.save();
  return this.submissions[this.submissions.length - 1];
};

// Submit quiz
quizSchema.methods.submitQuiz = async function (submissionId, answers) {
  const submission = this.submissions.id(submissionId);

  if (!submission) {
    throw new Error('Submission not found');
  }

  if (submission.status !== 'in-progress') {
    throw new Error('Submission already completed');
  }

  // Grade answers
  let totalObtained = 0;
  const gradedAnswers = [];

  for (const answer of answers) {
    const question = this.questions.id(answer.questionId);
    if (!question) continue;

    const graded = this.gradeAnswer(question, answer.answer);
    gradedAnswers.push({
      questionId: answer.questionId,
      answer: answer.answer,
      isCorrect: graded.isCorrect,
      pointsEarned: graded.pointsEarned,
      timeSpent: answer.timeSpent || 0,
    });

    totalObtained += graded.pointsEarned;
  }

  submission.answers = gradedAnswers;
  submission.score.obtained = totalObtained;
  submission.score.percentage = (totalObtained / this.totalPoints) * 100;
  submission.passed = submission.score.percentage >= this.settings.passingScore;
  submission.submittedAt = new Date();
  submission.timeSpent = Math.round(
    (submission.submittedAt - submission.startedAt) / 60000
  ); // in minutes
  submission.status = 'submitted';

  await this.save();
  return submission;
};

// Grade a single answer
quizSchema.methods.gradeAnswer = function (question, studentAnswer) {
  let isCorrect = false;
  let pointsEarned = 0;

  switch (question.questionType) {
    case 'multiple-choice':
      const correctOption = question.options.find((o) => o.isCorrect);
      isCorrect = studentAnswer === correctOption?._id.toString();
      break;

    case 'true-false':
      isCorrect = studentAnswer === question.correctAnswer;
      break;

    case 'fill-in-blank':
      // Check all blanks
      isCorrect = question.blanks.every((blank) => {
        const studentBlank = studentAnswer[blank.position];
        if (blank.caseSensitive) {
          return studentBlank === blank.correctAnswer;
        }
        return studentBlank?.toLowerCase() === blank.correctAnswer?.toLowerCase();
      });
      break;

    case 'short-answer':
      // For short answer, manual grading required
      isCorrect = null; // null means requires manual grading
      break;

    case 'essay':
      // Essays always require manual grading
      isCorrect = null;
      break;

    default:
      isCorrect = false;
  }

  if (isCorrect === true) {
    pointsEarned = question.points;
  } else if (isCorrect === null) {
    // Requires manual grading
    pointsEarned = 0;
  }

  return { isCorrect, pointsEarned };
};

// Manual grading
quizSchema.methods.gradeManually = async function (
  submissionId,
  answerGrades,
  feedback,
  gradedBy
) {
  const submission = this.submissions.id(submissionId);

  if (!submission) {
    throw new Error('Submission not found');
  }

  let totalObtained = 0;

  answerGrades.forEach((grade) => {
    const answer = submission.answers.id(grade.answerId);
    if (answer) {
      answer.isCorrect = grade.isCorrect;
      answer.pointsEarned = grade.pointsEarned;
      totalObtained += grade.pointsEarned;
    }
  });

  submission.score.obtained = totalObtained;
  submission.score.percentage = (totalObtained / this.totalPoints) * 100;
  submission.passed = submission.score.percentage >= this.settings.passingScore;
  submission.feedback = feedback;
  submission.gradedBy = gradedBy;
  submission.gradedAt = new Date();
  submission.status = 'graded';

  await this.save();
  return submission;
};

// Track tab switch
quizSchema.methods.trackTabSwitch = async function (submissionId) {
  const submission = this.submissions.id(submissionId);
  if (submission) {
    submission.tabSwitches += 1;
    await this.save();
  }
};

// Update question statistics
quizSchema.methods.updateQuestionStats = async function () {
  const questionStatsMap = new Map();

  this.submissions
    .filter((s) => s.status === 'submitted' || s.status === 'graded')
    .forEach((submission) => {
      submission.answers.forEach((answer) => {
        const qId = answer.questionId.toString();
        if (!questionStatsMap.has(qId)) {
          questionStatsMap.set(qId, { correct: 0, incorrect: 0 });
        }
        const stats = questionStatsMap.get(qId);
        if (answer.isCorrect) {
          stats.correct++;
        } else {
          stats.incorrect++;
        }
      });
    });

  this.statistics.questionStats = Array.from(questionStatsMap.entries()).map(
    ([qId, stats]) => ({
      questionId: qId,
      correctAttempts: stats.correct,
      incorrectAttempts: stats.incorrect,
      difficulty: stats.incorrect / (stats.correct + stats.incorrect),
    })
  );

  await this.save();
};

// ============================================
// STATIC METHODS
// ============================================

// Get quizzes by course
quizSchema.statics.getQuizzesByCourse = function (courseId) {
  return this.find({ course: courseId, status: 'published' }).sort({
    createdAt: 1,
  });
};

// Get student's quizzes
quizSchema.statics.getStudentQuizzes = function (studentId, courseId) {
  return this.find({
    course: courseId,
    status: 'published',
    'submissions.student': studentId,
  });
};

// ============================================
// EXPORT MODEL
// ============================================
module.exports = mongoose.model('Quiz', quizSchema);