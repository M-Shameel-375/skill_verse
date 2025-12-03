// ============================================
// ACHIEVEMENTS PAGE
// ============================================
// Display user achievements, badges, and gamification progress

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Trophy,
  Medal,
  Star,
  Target,
  Zap,
  Award,
  Crown,
  Flame,
  BookOpen,
  Users,
  MessageCircle,
  Clock,
  TrendingUp,
  Gift,
  Lock,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const Achievements = () => {
  const { user } = useSelector((state) => state.auth || {});
  const [activeTab, setActiveTab] = useState('all');

  // Mock achievements data
  const achievements = [
    {
      id: 1,
      title: 'First Steps',
      description: 'Complete your first course',
      icon: <BookOpen className="w-6 h-6" />,
      category: 'learning',
      points: 50,
      earned: true,
      earnedAt: '2024-11-15',
      rarity: 'common',
    },
    {
      id: 2,
      title: 'Quick Learner',
      description: 'Complete 5 courses',
      icon: <Zap className="w-6 h-6" />,
      category: 'learning',
      points: 100,
      earned: true,
      earnedAt: '2024-11-20',
      rarity: 'uncommon',
    },
    {
      id: 3,
      title: 'Knowledge Seeker',
      description: 'Complete 10 courses',
      icon: <Target className="w-6 h-6" />,
      category: 'learning',
      points: 200,
      earned: false,
      progress: 7,
      total: 10,
      rarity: 'rare',
    },
    {
      id: 4,
      title: 'Social Butterfly',
      description: 'Connect with 10 learners',
      icon: <Users className="w-6 h-6" />,
      category: 'social',
      points: 75,
      earned: true,
      earnedAt: '2024-11-18',
      rarity: 'common',
    },
    {
      id: 5,
      title: 'Helpful Hand',
      description: 'Answer 20 questions in discussions',
      icon: <MessageCircle className="w-6 h-6" />,
      category: 'social',
      points: 150,
      earned: false,
      progress: 12,
      total: 20,
      rarity: 'uncommon',
    },
    {
      id: 6,
      title: 'Skill Exchanger',
      description: 'Complete your first skill exchange',
      icon: <Award className="w-6 h-6" />,
      category: 'exchange',
      points: 100,
      earned: true,
      earnedAt: '2024-11-25',
      rarity: 'uncommon',
    },
    {
      id: 7,
      title: 'Master Trader',
      description: 'Complete 10 skill exchanges',
      icon: <Crown className="w-6 h-6" />,
      category: 'exchange',
      points: 300,
      earned: false,
      progress: 3,
      total: 10,
      rarity: 'epic',
    },
    {
      id: 8,
      title: 'On Fire',
      description: 'Maintain a 7-day learning streak',
      icon: <Flame className="w-6 h-6" />,
      category: 'streak',
      points: 100,
      earned: true,
      earnedAt: '2024-11-22',
      rarity: 'uncommon',
    },
    {
      id: 9,
      title: 'Unstoppable',
      description: 'Maintain a 30-day learning streak',
      icon: <Trophy className="w-6 h-6" />,
      category: 'streak',
      points: 500,
      earned: false,
      progress: 14,
      total: 30,
      rarity: 'legendary',
    },
    {
      id: 10,
      title: 'Early Bird',
      description: 'Complete a lesson before 7 AM',
      icon: <Clock className="w-6 h-6" />,
      category: 'special',
      points: 50,
      earned: false,
      rarity: 'rare',
    },
    {
      id: 11,
      title: 'Night Owl',
      description: 'Complete a lesson after midnight',
      icon: <Star className="w-6 h-6" />,
      category: 'special',
      points: 50,
      earned: true,
      earnedAt: '2024-11-28',
      rarity: 'rare',
    },
    {
      id: 12,
      title: 'Perfectionist',
      description: 'Score 100% on 5 quizzes',
      icon: <Medal className="w-6 h-6" />,
      category: 'learning',
      points: 250,
      earned: false,
      progress: 2,
      total: 5,
      rarity: 'epic',
    },
  ];

  const badges = [
    {
      id: 1,
      name: 'Bronze Learner',
      icon: '🥉',
      requirement: 'Earn 500 points',
      earned: true,
    },
    {
      id: 2,
      name: 'Silver Scholar',
      icon: '🥈',
      requirement: 'Earn 2,000 points',
      earned: true,
    },
    {
      id: 3,
      name: 'Gold Expert',
      icon: '🥇',
      requirement: 'Earn 5,000 points',
      earned: false,
    },
    {
      id: 4,
      name: 'Platinum Master',
      icon: '💎',
      requirement: 'Earn 10,000 points',
      earned: false,
    },
    {
      id: 5,
      name: 'Diamond Legend',
      icon: '👑',
      requirement: 'Earn 25,000 points',
      earned: false,
    },
  ];

  const stats = {
    totalPoints: 2450,
    level: 12,
    nextLevelPoints: 3000,
    achievementsEarned: achievements.filter((a) => a.earned).length,
    totalAchievements: achievements.length,
    currentStreak: 14,
    longestStreak: 21,
  };

  const categories = [
    { id: 'all', label: 'All', icon: <Trophy className="w-4 h-4" /> },
    { id: 'learning', label: 'Learning', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'social', label: 'Social', icon: <Users className="w-4 h-4" /> },
    { id: 'exchange', label: 'Exchange', icon: <Award className="w-4 h-4" /> },
    { id: 'streak', label: 'Streaks', icon: <Flame className="w-4 h-4" /> },
    { id: 'special', label: 'Special', icon: <Star className="w-4 h-4" /> },
  ];

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
      common: 'bg-gray-100',
      uncommon: 'bg-green-100',
      rare: 'bg-blue-100',
      epic: 'bg-purple-100',
      legendary: 'bg-gradient-to-r from-yellow-100 to-orange-100',
    };
    return colors[rarity] || colors.common;
  };

  const filteredAchievements =
    activeTab === 'all'
      ? achievements
      : achievements.filter((a) => a.category === activeTab);

  return (
    <>
      <Helmet>
        <title>Achievements - SkillVerse</title>
        <meta
          name="description"
          content="View your achievements, badges, and progress on SkillVerse"
        />
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
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 min-w-[300px]">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-2xl font-bold">
                    {stats.level}
                  </div>
                  <div>
                    <p className="text-sm text-purple-200">Current Level</p>
                    <p className="text-xl font-bold">{stats.totalPoints} XP</p>
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
                      className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                      style={{
                        width: `${(stats.totalPoints / stats.nextLevelPoints) * 100}%`,
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
                  {stats.totalPoints}
                </p>
                <p className="text-sm text-gray-600">Total Points</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {stats.currentStreak}
                </p>
                <p className="text-sm text-gray-600">Day Streak</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {stats.longestStreak}
                </p>
                <p className="text-sm text-gray-600">Best Streak</p>
              </CardContent>
            </Card>
          </div>

          {/* Badges Section */}
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
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 ${
                      badge.earned
                        ? 'border-yellow-400 bg-yellow-50'
                        : 'border-gray-200 bg-gray-50 opacity-50'
                    }`}
                  >
                    <span className="text-3xl">{badge.icon}</span>
                    <div>
                      <p className="font-semibold text-gray-900">{badge.name}</p>
                      <p className="text-xs text-gray-500">{badge.requirement}</p>
                    </div>
                    {badge.earned ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Lock className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Category Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  activeTab === cat.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </div>

          {/* Achievements Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={`overflow-hidden ${
                    !achievement.earned && 'opacity-70'
                  }`}
                >
                  <div
                    className={`h-2 bg-gradient-to-r ${getRarityColor(
                      achievement.rarity
                    )}`}
                  />
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                          achievement.earned
                            ? `bg-gradient-to-br ${getRarityColor(
                                achievement.rarity
                              )} text-white`
                            : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        {achievement.earned ? (
                          achievement.icon
                        ) : (
                          <Lock className="w-6 h-6" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900">
                            {achievement.title}
                          </h3>
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full ${getRarityBg(
                              achievement.rarity
                            )}`}
                          >
                            {achievement.rarity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {achievement.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-purple-600">
                            +{achievement.points} XP
                          </span>
                          {achievement.earned ? (
                            <span className="text-xs text-green-600 flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" />
                              Earned {achievement.earnedAt}
                            </span>
                          ) : achievement.progress !== undefined ? (
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-purple-500 rounded-full"
                                  style={{
                                    width: `${
                                      (achievement.progress / achievement.total) *
                                      100
                                    }%`,
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
                  <Button variant="outline" size="sm" className="w-full">
                    Redeem
                  </Button>
                </div>
                <div className="p-4 border rounded-xl text-center">
                  <div className="text-4xl mb-2">📚</div>
                  <h4 className="font-semibold">Free Course Access</h4>
                  <p className="text-sm text-gray-500 mb-3">5,000 points</p>
                  <Button variant="outline" size="sm" className="w-full" disabled>
                    Need 2,550 more
                  </Button>
                </div>
                <div className="p-4 border rounded-xl text-center">
                  <div className="text-4xl mb-2">⭐</div>
                  <h4 className="font-semibold">Premium Badge</h4>
                  <p className="text-sm text-gray-500 mb-3">10,000 points</p>
                  <Button variant="outline" size="sm" className="w-full" disabled>
                    Need 7,550 more
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
