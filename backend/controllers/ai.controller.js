// ============================================
// AI CONTROLLER
// ============================================

const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const aiService = require('../services/ai.service');
const User = require('../models/User.model');
const Course = require('../models/Course.model');
const config = require('../config/config');

// ============================================
// GET SKILL RECOMMENDATIONS
// ============================================
// @desc    Get AI-powered skill recommendations for a user
// @route   GET /api/v1/ai/recommendations/skills
// @access  Private
const getSkillRecommendations = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  
  // Get user profile with relevant data
  const user = await User.findById(userId).select('skills interests learningGoals role completedCourses');
  
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  
  // Prepare user profile for AI
  const userProfile = {
    skills: user.skills?.map(s => typeof s === 'string' ? s : s.name) || [],
    interests: user.interests || [],
    learningGoals: user.learningGoals || [],
    role: user.role || 'Learner',
  };
  
  // Get recommendations from AI service
  const recommendations = await aiService.generateSkillRecommendations(userProfile);
  
  res.status(200).json(
    new ApiResponse(200, recommendations, 'Skill recommendations generated successfully')
  );
});

// ============================================
// GET COURSE RECOMMENDATIONS
// ============================================
// @desc    Get AI-powered course recommendations for a user
// @route   GET /api/v1/ai/recommendations/courses
// @access  Private
const getCourseRecommendations = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  
  // Get user profile
  const user = await User.findById(userId).select('skills interests learningGoals enrolledCourses completedCourses');
  
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  
  // Get available courses
  const enrolledIds = user.enrolledCourses?.map(c => c.course || c) || [];
  const completedIds = user.completedCourses?.map(c => c.course || c) || [];
  const excludeIds = [...enrolledIds, ...completedIds];
  
  // Find courses matching user interests/skills that they haven't taken
  const userSkills = user.skills?.map(s => typeof s === 'string' ? s : s.name) || [];
  const userInterests = user.interests || [];
  const searchTerms = [...userSkills, ...userInterests];
  
  let courses = await Course.find({
    _id: { $nin: excludeIds },
    status: 'published',
    $or: searchTerms.length > 0 ? [
      { title: { $regex: searchTerms.join('|'), $options: 'i' } },
      { category: { $in: searchTerms } },
      { tags: { $in: searchTerms } },
      { 'skills.name': { $in: searchTerms } },
    ] : [{}],
  })
    .populate('instructor', 'name avatar')
    .limit(10)
    .sort({ rating: -1, enrolledCount: -1 });
  
  // If no matching courses, get top-rated courses
  if (courses.length === 0) {
    courses = await Course.find({
      _id: { $nin: excludeIds },
      status: 'published',
    })
      .populate('instructor', 'name avatar')
      .limit(10)
      .sort({ rating: -1, enrolledCount: -1 });
  }
  
  // Score and rank courses
  const recommendations = courses.map(course => {
    let score = 0;
    const reasons = [];
    
    // Check skill match
    const courseSkills = course.skills?.map(s => s.name || s) || [];
    const skillMatch = courseSkills.some(skill => 
      userSkills.includes(skill) || userInterests.includes(skill)
    );
    if (skillMatch) {
      score += 30;
      reasons.push('Matches your skills/interests');
    }
    
    // Check rating
    if (course.rating >= 4.5) {
      score += 25;
      reasons.push('Highly rated course');
    } else if (course.rating >= 4) {
      score += 15;
      reasons.push('Well-rated course');
    }
    
    // Check popularity
    if (course.enrolledCount > 100) {
      score += 20;
      reasons.push('Popular among learners');
    } else if (course.enrolledCount > 50) {
      score += 10;
      reasons.push('Growing in popularity');
    }
    
    // Check level appropriateness
    const userLevel = user.skills?.[0]?.level || 'beginner';
    if (course.level === userLevel) {
      score += 15;
      reasons.push(`Suitable for ${userLevel} level`);
    }
    
    // Instructor rating bonus
    if (course.instructor?.rating >= 4.5) {
      score += 10;
      reasons.push('Expert instructor');
    }
    
    return {
      course: {
        _id: course._id,
        title: course.title,
        description: course.description?.substring(0, 150) + '...',
        thumbnail: course.thumbnail,
        price: course.price,
        rating: course.rating,
        level: course.level,
        duration: course.duration,
        instructor: course.instructor,
        category: course.category,
        enrolledCount: course.enrolledCount,
      },
      matchScore: Math.min(score, 100),
      reasons,
    };
  });
  
  // Sort by score
  recommendations.sort((a, b) => b.matchScore - a.matchScore);
  
  res.status(200).json(
    new ApiResponse(200, recommendations, 'Course recommendations generated successfully')
  );
});

// ============================================
// GET LEARNING PATH RECOMMENDATION
// ============================================
// @desc    Get AI-powered learning path recommendations
// @route   GET /api/v1/ai/recommendations/learning-path
// @access  Private
const getLearningPathRecommendation = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const { goalSkill } = req.query;
  
  const user = await User.findById(userId).select('skills interests learningGoals completedCourses');
  
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  
  const currentSkills = user.skills?.map(s => typeof s === 'string' ? s : s.name) || [];
  const targetSkill = goalSkill || user.learningGoals?.[0] || 'Web Development';
  
  // Define learning paths (can be enhanced with AI)
  const learningPaths = {
    'Web Development': [
      { skill: 'HTML/CSS', level: 'beginner', description: 'Foundation of web pages' },
      { skill: 'JavaScript', level: 'beginner', description: 'Add interactivity' },
      { skill: 'React/Vue', level: 'intermediate', description: 'Modern frameworks' },
      { skill: 'Node.js', level: 'intermediate', description: 'Backend development' },
      { skill: 'Full Stack', level: 'advanced', description: 'Complete applications' },
    ],
    'Data Science': [
      { skill: 'Python Basics', level: 'beginner', description: 'Programming foundation' },
      { skill: 'Statistics', level: 'beginner', description: 'Mathematical foundation' },
      { skill: 'Data Analysis', level: 'intermediate', description: 'Pandas, NumPy' },
      { skill: 'Machine Learning', level: 'intermediate', description: 'ML algorithms' },
      { skill: 'Deep Learning', level: 'advanced', description: 'Neural networks' },
    ],
    'Mobile Development': [
      { skill: 'Programming Basics', level: 'beginner', description: 'Core concepts' },
      { skill: 'React Native / Flutter', level: 'intermediate', description: 'Cross-platform' },
      { skill: 'Native Development', level: 'intermediate', description: 'iOS/Android' },
      { skill: 'App Architecture', level: 'advanced', description: 'Design patterns' },
      { skill: 'App Publishing', level: 'advanced', description: 'Store deployment' },
    ],
    'Cloud Computing': [
      { skill: 'Linux Basics', level: 'beginner', description: 'System administration' },
      { skill: 'Networking', level: 'beginner', description: 'Network fundamentals' },
      { skill: 'AWS/Azure Basics', level: 'intermediate', description: 'Cloud platforms' },
      { skill: 'DevOps', level: 'intermediate', description: 'CI/CD, containers' },
      { skill: 'Cloud Architecture', level: 'advanced', description: 'Design solutions' },
    ],
  };
  
  const path = learningPaths[targetSkill] || learningPaths['Web Development'];
  
  // Mark completed steps
  const pathWithProgress = path.map((step, index) => {
    const completed = currentSkills.some(s => 
      s.toLowerCase().includes(step.skill.toLowerCase()) ||
      step.skill.toLowerCase().includes(s.toLowerCase())
    );
    
    return {
      ...step,
      step: index + 1,
      completed,
      current: !completed && (index === 0 || path[index - 1]?.completed),
    };
  });
  
  // Find related courses for current step
  const currentStep = pathWithProgress.find(s => s.current);
  let recommendedCourses = [];
  
  if (currentStep) {
    recommendedCourses = await Course.find({
      status: 'published',
      $or: [
        { title: { $regex: currentStep.skill, $options: 'i' } },
        { tags: { $regex: currentStep.skill, $options: 'i' } },
      ],
    })
      .populate('instructor', 'name avatar')
      .limit(3)
      .sort({ rating: -1 });
  }
  
  res.status(200).json(
    new ApiResponse(200, {
      targetSkill,
      learningPath: pathWithProgress,
      currentStep,
      recommendedCourses,
      estimatedTime: `${path.length * 4} weeks`,
    }, 'Learning path generated successfully')
  );
});

// ============================================
// GENERATE COURSE DESCRIPTION
// ============================================
// @desc    Generate AI course description
// @route   POST /api/v1/ai/generate/course-description
// @access  Private (Instructors)
const generateCourseDescription = asyncHandler(async (req, res) => {
  const { title, topics } = req.body;
  
  if (!title || !topics || !Array.isArray(topics)) {
    throw new ApiError(400, 'Title and topics array are required');
  }
  
  const description = await aiService.generateCourseDescription(title, topics);
  
  res.status(200).json(
    new ApiResponse(200, { description }, 'Course description generated successfully')
  );
});

// ============================================
// GENERATE QUIZ QUESTIONS
// ============================================
// @desc    Generate AI quiz questions
// @route   POST /api/v1/ai/generate/quiz
// @access  Private (Instructors)
const generateQuizQuestions = asyncHandler(async (req, res) => {
  const { topic, difficulty, count } = req.body;
  
  if (!topic) {
    throw new ApiError(400, 'Topic is required');
  }
  
  const questions = await aiService.generateQuizQuestions(
    topic,
    difficulty || 'intermediate',
    count || 5
  );
  
  res.status(200).json(
    new ApiResponse(200, { questions }, 'Quiz questions generated successfully')
  );
});

// ============================================
// ANALYZE SENTIMENT
// ============================================
// @desc    Analyze text sentiment
// @route   POST /api/v1/ai/analyze/sentiment
// @access  Private
const analyzeSentiment = asyncHandler(async (req, res) => {
  const { text } = req.body;
  
  if (!text) {
    throw new ApiError(400, 'Text is required');
  }
  
  const sentiment = await aiService.analyzeSentiment(text);
  
  res.status(200).json(
    new ApiResponse(200, { sentiment }, 'Sentiment analyzed successfully')
  );
});

// ============================================
// CHECK AI SERVICE STATUS
// ============================================
// @desc    Check if AI service is available
// @route   GET /api/v1/ai/status
// @access  Public
const getAIStatus = asyncHandler(async (req, res) => {
  const hasOpenAIKey = !!config.ai.openaiApiKey;
  
  res.status(200).json(
    new ApiResponse(200, {
      available: hasOpenAIKey,
      model: config.ai.model,
      features: {
        skillRecommendations: true,
        courseRecommendations: true,
        learningPaths: true,
        courseDescriptionGenerator: hasOpenAIKey,
        quizGenerator: hasOpenAIKey,
        sentimentAnalysis: hasOpenAIKey,
      },
    }, 'AI service status retrieved')
  );
});

module.exports = {
  getSkillRecommendations,
  getCourseRecommendations,
  getLearningPathRecommendation,
  generateCourseDescription,
  generateQuizQuestions,
  analyzeSentiment,
  getAIStatus,
};
