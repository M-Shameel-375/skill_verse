import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Trophy,
  Medal,
  Star,
  Target,
  Zap,
  Award,
  Flame,
  BookOpen,
  Users,
  TrendingUp,
  Gift,
  Lock,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getMyBadges, getAvailableBadges, getBadgeProgress } from '@/api/badgeApi';
import useAuth from '@/hooks/useAuth';
import toast from 'react-hot-toast';

// ============================================
// HELPER FUNCTIONS
// ============================================
const getIconByCategory = (category) => {
  const iconMap = {
    learning: <BookOpen className="w-6 h-6" />,
    social: <Users className="w-6 h-6" />,
    exchange: <Award className="w-6 h-6" />,
    streak: <Flame className="w-6 h-6" />,
    special: <Star className="w-6 h-6" />,
    quiz: <Target className="w-6 h-6" />,
    course: <BookOpen className="w-6 h-6" />,
    achievement: <Trophy className="w-6 h-6" />,
  };
  return iconMap[category] || <Trophy className="w-6 h-6" />;
};

const getBadgeEmoji = (tier) => {
  const emojis = {
    bronze: '🥉',
    silver: '🥈',
    gold: '🥇',
    platinum: '💎',
    diamond: '👑',
  };
  return emojis[tier?.toLowerCase()] || '🏆';
};

const getRarityColor = (rarity) => {
  const colors = {
    common: 'from-gray-400 to-gray-500',
    uncommon: 'from-green-400 to-green-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-orange-500',
  };
  return colors[rarity] || colors.common;
};

const getRarityBg = (rarity) => {
  const colors = {
    common: 'bg-gray-100 text-gray-700',
    uncommon: 'bg-green-100 text-green-700',
    rare: 'bg-blue-100 text-blue-700',
    epic: 'bg-purple-100 text-purple-700',
    legendary: 'bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700',
  };
  return colors[rarity] || colors.common;
};

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// ============================================
// CATEGORY TABS
// ============================================
const CATEGORIES = [
  { id: 'all', label: 'All', icon: <Trophy className="w-4 h-4" /> },
  { id: 'learning', label: 'Learning', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'social', label: 'Social', icon: <Users className="w-4 h-4" /> },
  { id: 'exchange', label: 'Exchange', icon: <Award className="w-4 h-4" /> },
  { id: 'streak', label: 'Streaks', icon: <Flame className="w-4 h-4" /> },
  { id: 'special', label: 'Special', icon: <Star className="w-4 h-4" /> },
];

// ============================================
// ACHIEVEMENTS PAGE COMPONENT
// ============================================
const Achievements = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [achievements, setAchievements] = useState([]);
  const [badges, setBadges] = useState([]);
  const [stats, setStats] = useState({
    totalPoints: 0,
    level: 1,
    nextLevelPoints: 1000,
    achievementsEarned: 0,
    totalAchievements: 0,
    currentStreak: 0,
    longestStreak: 0,
  });

  // Fetch achievements data
  const fetchAchievements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [myBadgesRes, availableBadgesRes, progressRes] = await Promise.allSettled([
        getMyBadges(),
        getAvailableBadges(),
        getBadgeProgress(),
      ]);

      // Process earned badges
      const earnedBadges =
        myBadgesRes.status === 'fulfilled'
          ? myBadgesRes.value?.data?.data || myBadgesRes.value?.data || []
          : [];

      // Process available badges
      const availableBadgesList =
        availableBadgesRes.status === 'fulfilled'
          ? availableBadgesRes.value?.data?.data || availableBadgesRes.value?.data || []
          : [];

      // Process badge progress
      const badgeProgress =
        progressRes.status === 'fulfilled'
          ? progressRes.value?.data?.data || progressRes.value?.data || []
          : [];

      // Map earned badge IDs
      const earnedBadgeIds = new Set(
        earnedBadges.map((b) => b.badge?._id || b._id)
      );

      // Combine into achievements format
      let allAchievements = availableBadgesList.map((badge) => {
        const isEarned = earnedBadgeIds.has(badge._id);
        const earnedBadge = earnedBadges.find(
          (b) => (b.badge?._id || b._id) === badge._id
        );
        const progress = badgeProgress.find((p) => p.badgeId === badge._id);

        return {
          id: badge._id,
          title: badge.name,
          description: badge.description,
          icon: getIconByCategory(badge.category),
          category: badge.category || 'achievement',
          points: badge.points || 50,
          earned: isEarned,
          earnedAt: isEarned ? formatDate(earnedBadge?.earnedAt) : null,
          rarity: badge.rarity || 'common',
          progress: progress?.current || 0,
          total: progress?.required || badge.requirement?.count || 1,
          imageUrl: badge.icon?.url,
        };
      });

      // Add earned badges not in available list
      if (allAchievements.length === 0 && earnedBadges.length > 0) {
        allAchievements = earnedBadges.map((eb) => {
          const badge = eb.badge || eb;
          return {
            id: badge._id,
            title: badge.name,
            description: badge.description,
            icon: getIconByCategory(badge.category),
            category: badge.category || 'achievement',
            points: badge.points || 50,
            earned: true,
            earnedAt: formatDate(eb.earnedAt),
            rarity: badge.rarity || 'common',
          };
        });
      }

      setAchievements(allAchievements);

      // Build tier badges
      const tierBadges = earnedBadges
        .filter((b) => (b.badge?.type || b.type) === 'tier')
        .map((eb) => ({
          id: eb.badge?._id || eb._id,
          name: eb.badge?.name || eb.name,
          icon: getBadgeEmoji(eb.badge?.tier || eb.tier),
          requirement: eb.badge?.description || eb.description,
          earned: true,
        }));

      setBadges(tierBadges);

      // Calculate stats
      const userPoints = user?.gamification?.points || 0;
      const userLevel = user?.gamification?.level || 1;
      const userStreak = user?.gamification?.streak || 0;

      setStats({
        totalPoints: userPoints,
        level: userLevel,
        nextLevelPoints: userLevel * 1000,
        achievementsEarned: allAchievements.filter((a) => a.earned).length,
        totalAchievements: allAchievements.length || earnedBadges.length,
        currentStreak: userStreak,
        longestStreak: user?.gamification?.longestStreak || userStreak,
      });
    } catch (err) {
      console.error('Error fetching achievements:', err);
      setError('Failed to load achievements');
      toast.error('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  }, [user?.gamification]);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  // Filter achievements
  const filteredAchievements =
    activeTab === 'all'
      ? achievements
      : achievements.filter((a) => a.category === activeTab);

  // Loading state
  if (loading) {
    return (
      <>
        <Helmet>
          <title>Achievements | SkillVerse</title>
        </Helmet>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading achievements...</p>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <Helmet>
          <title>Achievements | SkillVerse</title>
        </Helmet>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchAchievements}>Try Again</Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Achievements | SkillVerse</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-4xl font-bold flex items-center gap-3">
                  <Trophy className="w-10 h-10" />
                  Achievements
                </h1>
                <p className="text-purple-100 mt-2">
                  Track your progress and unlock rewards
                </p>
              </div>

              {/* Level Progress */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 min-w-[280px]">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-2xl font-bold">
                    {stats.level}
                  </div>
                  <div>
                    <p className="text-sm text-purple-200">Current Level</p>
                    <p className="text-xl font-bold">{stats.totalPoints.toLocaleString()} XP</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Progress to Level {stats.level + 1}</span>
                    <span>
                      {stats.totalPoints} / {stats.nextLevelPoints}
                    </span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all"
                      style={{
                        width: `${Math.min((stats.totalPoints / stats.nextLevelPoints) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {stats.achievementsEarned}/{stats.totalAchievements}
                </p>
                <p className="text-sm text-gray-600">Achievements</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Zap className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalPoints.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Total Points</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{stats.currentStreak}</p>
                <p className="text-sm text-gray-600">Day Streak</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{stats.longestStreak}</p>
                <p className="text-sm text-gray-600">Best Streak</p>
              </CardContent>
            </Card>
          </div>

          {/* Tier Badges */}
          {badges.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Medal className="w-5 h-5" /> Your Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  {badges.map((badge) => (
                    <div
                      key={badge.id}
                      className="flex items-center gap-3 p-4 rounded-xl border-2 border-yellow-400 bg-yellow-50"
                    >
                      <span className="text-3xl">{badge.icon}</span>
                      <div>
                        <p className="font-semibold text-gray-900">{badge.name}</p>
                        <p className="text-xs text-gray-500">{badge.requirement}</p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Category Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${activeTab === cat.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </div>

          {/* Achievements Grid */}
          {filteredAchievements.length === 0 ? (
            <Card className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No achievements in this category
              </h3>
              <p className="text-gray-600">Keep learning to unlock achievements!</p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAchievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`overflow-hidden ${!achievement.earned && 'opacity-70'}`}>
                    <div className={`h-2 bg-gradient-to-r ${getRarityColor(achievement.rarity)}`} />
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${achievement.earned
                              ? `bg-gradient-to-br ${getRarityColor(achievement.rarity)} text-white`
                              : 'bg-gray-200 text-gray-400'
                            }`}
                        >
                          {achievement.earned ? achievement.icon : <Lock className="w-6 h-6" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1 gap-2">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {achievement.title}
                            </h3>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${getRarityBg(achievement.rarity)}`}>
                              {achievement.rarity}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {achievement.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-purple-600">
                              +{achievement.points} XP
                            </span>
                            {achievement.earned ? (
                              <span className="text-xs text-green-600 flex items-center gap-1">
                                <CheckCircle className="w-4 h-4" />
                                {achievement.earnedAt}
                              </span>
                            ) : achievement.progress !== undefined && achievement.total ? (
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-purple-500 rounded-full"
                                    style={{
                                      width: `${(achievement.progress / achievement.total) * 100}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-xs text-gray-500">
                                  {achievement.progress}/{achievement.total}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">Locked</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Rewards Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5" /> Redeem Rewards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-xl text-center">
                  <div className="text-4xl mb-2">🎁</div>
                  <h4 className="font-semibold">10% Course Discount</h4>
                  <p className="text-sm text-gray-500 mb-3">1,000 points</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    disabled={stats.totalPoints < 1000}
                  >
                    {stats.totalPoints >= 1000 ? 'Redeem' : `Need ${1000 - stats.totalPoints} more`}
                  </Button>
                </div>
                <div className="p-4 border rounded-xl text-center">
                  <div className="text-4xl mb-2">📚</div>
                  <h4 className="font-semibold">Free Course Access</h4>
                  <p className="text-sm text-gray-500 mb-3">5,000 points</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    disabled={stats.totalPoints < 5000}
                  >
                    {stats.totalPoints >= 5000 ? 'Redeem' : `Need ${5000 - stats.totalPoints} more`}
                  </Button>
                </div>
                <div className="p-4 border rounded-xl text-center">
                  <div className="text-4xl mb-2">⭐</div>
                  <h4 className="font-semibold">Premium Badge</h4>
                  <p className="text-sm text-gray-500 mb-3">10,000 points</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    disabled={stats.totalPoints < 10000}
                  >
                    {stats.totalPoints >= 10000 ? 'Redeem' : `Need ${10000 - stats.totalPoints} more`}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Achievements;