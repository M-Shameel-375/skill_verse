// Matching service
// ============================================
// MATCHING SERVICE (Skill Exchange)
// ============================================

const User = require('../models/User.model');
const SkillExchange = require('../models/SkillExchange.model');

// ============================================
// FIND SKILL MATCHES
// ============================================
const findSkillMatches = async (userId, offeredSkill, desiredSkill) => {
  try {
    // Find users who offer the desired skill and want the offered skill
    const potentialMatches = await User.find({
      _id: { $ne: userId },
      status: 'active',
      'skillExchangeProfile.offeredSkills': desiredSkill,
      'skillExchangeProfile.desiredSkills': offeredSkill,
    })
      .select('name profileImage skills skillExchangeProfile')
      .limit(20);

    // Calculate match scores
    const scoredMatches = potentialMatches.map((match) => {
      const score = calculateMatchScore(userId, match, offeredSkill, desiredSkill);
      return {
        user: match,
        matchScore: score.total,
        factors: score.factors,
      };
    });

    // Sort by match score
    return scoredMatches.sort((a, b) => b.matchScore - a.matchScore);
  } catch (error) {
    console.error('Find skill matches error:', error);
    throw error;
  }
};

// ============================================
// CALCULATE MATCH SCORE
// ============================================
const calculateMatchScore = (userId, matchUser, offeredSkill, desiredSkill) => {
  let totalScore = 0;
  const factors = {};

  // 1. Skill Compatibility (40 points)
  const hasDesiredSkill = matchUser.skillExchangeProfile?.offeredSkills?.includes(desiredSkill);
  const wantsOfferedSkill = matchUser.skillExchangeProfile?.desiredSkills?.includes(offeredSkill);

  if (hasDesiredSkill && wantsOfferedSkill) {
    factors.skillCompatibility = 40;
    totalScore += 40;
  } else if (hasDesiredSkill || wantsOfferedSkill) {
    factors.skillCompatibility = 20;
    totalScore += 20;
  } else {
    factors.skillCompatibility = 0;
  }

  // 2. User Rating (20 points)
  const rating = matchUser.skillExchangeProfile?.rating?.average || 0;
  factors.rating = Math.round((rating / 5) * 20);
  totalScore += factors.rating;

  // 3. Completed Exchanges (15 points)
  const completedExchanges = matchUser.skillExchangeProfile?.completedExchanges || 0;
  factors.experience = Math.min(completedExchanges * 3, 15);
  totalScore += factors.experience;

  // 4. Availability (15 points)
  const hasAvailability = matchUser.skillExchangeProfile?.availability?.length > 0;
  factors.availability = hasAvailability ? 15 : 5;
  totalScore += factors.availability;

  // 5. Response Rate (10 points)
  // This would require tracking response times in the database
  factors.responseRate = 10; // Default for now
  totalScore += factors.responseRate;

  return {
    total: Math.round(totalScore),
    factors,
  };
};

// ============================================
// GET RECOMMENDED SKILL EXCHANGES
// ============================================
const getRecommendedExchanges = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user || !user.skillExchangeProfile) {
      return [];
    }

    const offeredSkills = user.skillExchangeProfile.offeredSkills || [];
    const desiredSkills = user.skillExchangeProfile.desiredSkills || [];

    const allMatches = [];

    // Find matches for each combination of offered and desired skills
    for (const offered of offeredSkills) {
      for (const desired of desiredSkills) {
        const matches = await findSkillMatches(userId, offered, desired);
        allMatches.push(...matches);
      }
    }

    // Remove duplicates and sort by score
    const uniqueMatches = Array.from(
      new Map(allMatches.map((m) => [m.user._id.toString(), m])).values()
    ).sort((a, b) => b.matchScore - a.matchScore);

    return uniqueMatches.slice(0, 10); // Return top 10
  } catch (error) {
    console.error('Get recommended exchanges error:', error);
    throw error;
  }
};

// ============================================
// CHECK MUTUAL INTEREST
// ============================================
const checkMutualInterest = async (user1Id, user2Id) => {
  try {
    const [user1, user2] = await Promise.all([
      User.findById(user1Id),
      User.findById(user2Id),
    ]);

    if (!user1 || !user2) {
      return { mutual: false, reason: 'User not found' };
    }

    const user1Offers = user1.skillExchangeProfile?.offeredSkills || [];
    const user1Desires = user1.skillExchangeProfile?.desiredSkills || [];
    const user2Offers = user2.skillExchangeProfile?.offeredSkills || [];
    const user2Desires = user2.skillExchangeProfile?.desiredSkills || [];

    // Check if there's mutual interest
    const user1OffersWhatUser2Wants = user1Offers.some((skill) =>
      user2Desires.includes(skill)
    );
    const user2OffersWhatUser1Wants = user2Offers.some((skill) =>
      user1Desires.includes(skill)
    );

    return {
      mutual: user1OffersWhatUser2Wants && user2OffersWhatUser1Wants,
      oneWay: user1OffersWhatUser2Wants || user2OffersWhatUser1Wants,
      matchingSkills: {
        user1Offers: user1Offers.filter((s) => user2Desires.includes(s)),
        user2Offers: user2Offers.filter((s) => user1Desires.includes(s)),
      },
    };
  } catch (error) {
    console.error('Check mutual interest error:', error);
    throw error;
  }
};

// ============================================
// GET SIMILAR USERS
// ============================================
const getSimilarUsers = async (userId, limit = 10) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      return [];
    }

    const userSkills = user.skills?.map((s) => s.name) || [];
    const userInterests = user.interests || [];

    // Find users with similar skills or interests
    const similarUsers = await User.find({
      _id: { $ne: userId },
      status: 'active',
      $or: [
        { 'skills.name': { $in: userSkills } },
        { interests: { $in: userInterests } },
      ],
    })
      .select('name profileImage skills interests skillExchangeProfile')
      .limit(limit * 2); // Get more to filter

    // Calculate similarity scores
    const scoredUsers = similarUsers.map((similarUser) => {
      let score = 0;

      // Skill similarity
      const similarUserSkills = similarUser.skills?.map((s) => s.name) || [];
      const commonSkills = userSkills.filter((s) => similarUserSkills.includes(s));
      score += commonSkills.length * 10;

      // Interest similarity
      const similarUserInterests = similarUser.interests || [];
      const commonInterests = userInterests.filter((i) =>
        similarUserInterests.includes(i)
      );
      score += commonInterests.length * 5;

      return {
        user: similarUser,
        similarityScore: score,
        commonSkills,
        commonInterests,
      };
    });

    return scoredUsers
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, limit);
  } catch (error) {
    console.error('Get similar users error:', error);
    throw error;
  }
};

// ============================================
// EXPORTS
// ============================================
module.exports = {
  findSkillMatches,
  calculateMatchScore,
  getRecommendedExchanges,
  checkMutualInterest,
  getSimilarUsers,
};