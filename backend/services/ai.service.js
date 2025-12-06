// AI service
// ============================================
// AI SERVICE (OpenAI Integration)
// ============================================

const axios = require('axios');
const config = require('../config/config');

// ============================================
// GENERATE SKILL RECOMMENDATIONS
// ============================================
const generateSkillRecommendations = async (userProfile) => {
  try {
    const prompt = `Based on the following user profile, recommend 5 skills they should learn next:
    
Current Skills: ${userProfile.skills.join(', ')}
Interests: ${userProfile.interests.join(', ')}
Learning Goals: ${userProfile.learningGoals.join(', ')}
Current Role: ${userProfile.role}

Please provide specific, actionable skill recommendations with brief explanations.`;

    const response = await callOpenAI(prompt);
    return parseSkillRecommendations(response);
  } catch (error) {
    console.error('AI recommendation error:', error);
    // Fallback to rule-based recommendations
    return getFallbackRecommendations(userProfile);
  }
};

// ============================================
// MATCH SKILL EXCHANGERS
// ============================================
const matchSkillExchangers = async (user, potentialMatches) => {
  try {
    const scores = potentialMatches.map((match) => {
      let score = 0;

      // Skill compatibility (40%)
      const hasDesiredSkill = match.offeredSkills?.some((skill) =>
        user.desiredSkills?.includes(skill)
      );
      const wantsUserSkill = match.desiredSkills?.some((skill) =>
        user.offeredSkills?.includes(skill)
      );

      if (hasDesiredSkill && wantsUserSkill) score += 40;
      else if (hasDesiredSkill || wantsUserSkill) score += 20;

      // Experience level match (20%)
      const skillLevelMatch = calculateSkillLevelMatch(user, match);
      score += skillLevelMatch * 20;

      // Availability match (20%)
      const availabilityScore = calculateAvailabilityMatch(user, match);
      score += availabilityScore * 20;

      // Rating history (10%)
      if (match.rating?.average >= 4) score += 10;
      else if (match.rating?.average >= 3) score += 5;

      // Response time (10%)
      if (match.responseTime < 24) score += 10;
      else if (match.responseTime < 48) score += 5;

      return {
        user: match,
        matchScore: Math.round(score),
        factors: {
          skillCompatibility: hasDesiredSkill && wantsUserSkill ? 40 : 20,
          experienceLevel: skillLevelMatch * 20,
          availability: availabilityScore * 20,
          ratingHistory: match.rating?.average >= 4 ? 10 : 5,
          responseTime: match.responseTime < 24 ? 10 : 5,
        },
      };
    });

    // Sort by match score
    return scores.sort((a, b) => b.matchScore - a.matchScore);
  } catch (error) {
    console.error('Matching error:', error);
    throw error;
  }
};

// ============================================
// GENERATE COURSE DESCRIPTION
// ============================================
const generateCourseDescription = async (courseTitle, topics) => {
  try {
    const prompt = `Generate an engaging course description for:
    
Course Title: ${courseTitle}
Topics Covered: ${topics.join(', ')}

The description should be:
- Compelling and professional
- 100-150 words
- Include learning outcomes
- Target audience appropriate`;

    const response = await callOpenAI(prompt, { max_tokens: 200 });
    return response;
  } catch (error) {
    console.error('Course description generation error:', error);
    return `Learn ${courseTitle} with comprehensive coverage of ${topics.join(', ')} and more.`;
  }
};

// ============================================
// GENERATE QUIZ QUESTIONS
// ============================================
const generateQuizQuestions = async (topic, difficulty, count = 5) => {
  try {
    const prompt = `Generate ${count} multiple-choice quiz questions about ${topic} at ${difficulty} level.

Format each question as JSON with:
- questionText
- options (array of 4 options)
- correctAnswer (index 0-3)
- explanation

Example:
{
  "questionText": "What is...",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "correctAnswer": 0,
  "explanation": "This is correct because..."
}`;

    const response = await callOpenAI(prompt, { max_tokens: 1000 });
    return JSON.parse(response);
  } catch (error) {
    console.error('Quiz generation error:', error);
    return [];
  }
};

// ============================================
// CONTENT MODERATION
// ============================================
const moderateContent = async (content) => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/moderations',
      {
        input: content,
      },
      {
        headers: {
          Authorization: `Bearer ${config.ai.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const result = response.data.results[0];
    return {
      flagged: result.flagged,
      categories: result.categories,
      categoryScores: result.category_scores,
    };
  } catch (error) {
    console.error('Content moderation error:', error);
    return { flagged: false, categories: {}, categoryScores: {} };
  }
};

// ============================================
// SENTIMENT ANALYSIS
// ============================================
const analyzeSentiment = async (text) => {
  try {
    const prompt = `Analyze the sentiment of the following text and respond with only one word: positive, negative, or neutral.

Text: "${text}"`;

    const response = await callOpenAI(prompt, { max_tokens: 10, temperature: 0 });
    return response.toLowerCase().trim();
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    return 'neutral';
  }
};

// ============================================
// CALL OPENAI API
// ============================================
const callOpenAI = async (prompt, options = {}) => {
  // Check if OpenAI API key is configured
  if (!config.ai.apiKey || config.ai.apiKey === 'sk-your_openai_api_key' || config.ai.apiKey.startsWith('sk-your_')) {
    throw new Error('OpenAI API key is not configured. Please add a valid API key to your .env file.');
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: config.ai.model || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant for an educational platform.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: options.max_tokens || config.ai.maxTokens,
        temperature: options.temperature || config.ai.temperature,
      },
      {
        headers: {
          Authorization: `Bearer ${config.ai.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI API error:', error.response?.data || error.message);
    throw error;
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

const parseSkillRecommendations = (response) => {
  // Parse AI response into structured recommendations
  const lines = response.split('\n').filter((line) => line.trim());
  const recommendations = [];

  lines.forEach((line) => {
    if (line.match(/^\d+\./)) {
      const parts = line.split(':');
      if (parts.length >= 2) {
        recommendations.push({
          skill: parts[0].replace(/^\d+\.\s*/, '').trim(),
          reason: parts.slice(1).join(':').trim(),
        });
      }
    }
  });

  return recommendations;
};

const getFallbackRecommendations = (userProfile) => {
  // Simple rule-based fallback
  const recommendations = [
    { skill: 'Communication Skills', reason: 'Essential for all professionals' },
    { skill: 'Time Management', reason: 'Improve productivity and efficiency' },
    { skill: 'Problem Solving', reason: 'Critical thinking enhancement' },
    { skill: 'Leadership', reason: 'Advance your career potential' },
    { skill: 'Digital Literacy', reason: 'Stay relevant in digital age' },
  ];

  return recommendations;
};

const calculateSkillLevelMatch = (user1, user2) => {
  // Simple level matching algorithm
  const levelMap = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
  
  const user1Level = user1.skills?.[0]?.level || 'beginner';
  const user2Level = user2.skills?.[0]?.level || 'beginner';
  
  const diff = Math.abs(levelMap[user1Level] - levelMap[user2Level]);
  
  if (diff === 0) return 1;
  if (diff === 1) return 0.7;
  if (diff === 2) return 0.4;
  return 0.1;
};

const calculateAvailabilityMatch = (user1, user2) => {
  // Simplified availability matching
  if (!user1.availability || !user2.availability) return 0.5;
  
  // Check for overlapping availability
  const hasOverlap = user1.availability.some((slot1) =>
    user2.availability.some(
      (slot2) => slot1.day === slot2.day && hasTimeOverlap(slot1, slot2)
    )
  );
  
  return hasOverlap ? 1 : 0.3;
};

const hasTimeOverlap = (slot1, slot2) => {
  // Simple time overlap check
  return true; // Simplified for now
};

// ============================================
// EXPORTS
// ============================================
module.exports = {
  generateSkillRecommendations,
  matchSkillExchangers,
  generateCourseDescription,
  generateQuizQuestions,
  moderateContent,
  analyzeSentiment,
  callOpenAI,
};