// ============================================
// DASHBOARD PAGE
// ============================================

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  FaBook,
  FaCertificate,
  FaTrophy,
  FaFire,
  FaClock,
  FaChartLine,
  FaArrowRight,
  FaPlay,
  FaCalendar,
  FaUsers,
} from 'react-icons/fa';
import {
  getEnrolledCourses,
  selectEnrolledCourses,
  selectCourseLoading,
} from '../redux/slices/courseSlice';
import {
  getUpcomingSessions,
  selectUpcomingSessions,
} from '../redux/slices/sessionSlice';
import {
  getUserStatistics,
  selectUserStatistics,
  selectUserLoading,
} from '../redux/slices/userSlice';
import useAuth from '../hooks/useAuth';
import config from '../config';
import Card, { StatsCard, CardImage } from '../components/common/Card';
import Button from '../components/common/Button';
import { SkeletonLoader, CardSkeletonLoader } from '../components/common/Loader';
import { formatDate, formatDuration } from '../utils/helpers';

// ============================================
// CONTINUE LEARNING CARD
// ============================================
const ContinueLearningCard = ({ course }) => {
  const navigate = useNavigate();
  const progress = course.progress || 0;

  return (
    <Card hoverable onClick={() => navigate(`/courses/${course._id}/learn`)}>
      <div className="flex gap-4">
        <div className="w-32 h-20 flex-shrink-0">
          <CardImage
            src={course.thumbnail?.url || 'https://via.placeholder.com/200x120'}
            alt={course.title}
            objectFit="cover"
            className="rounded-lg"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 mb-1 truncate">
            {course.title}
          </h4>
          <p className="text-sm text-gray-600 mb-2">
            By {course.instructor?.name}
          </p>
          
          {/* Progress Bar */}
          <div className="mb-2">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>{progress}% complete</span>
              <span>{course.completedLectures || 0}/{course.totalLectures || 0} lectures</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
        
        <Button
          variant="primary"
          size="sm"
          icon={<FaPlay />}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/courses/${course._id}/learn`);
          }}
        >
          Continue
        </Button>
      </div>
    </Card>
  );
};

// ============================================
// UPCOMING SESSION CARD
// ============================================
const UpcomingSessionCard = ({ session }) => {
  const navigate = useNavigate();

  return (
    <Card hoverable onClick={() => navigate(`/live-sessions/${session._id}`)}>
      <div className="flex items-start gap-4">
        <div className="p-3 bg-blue-100 rounded-lg">
          <FaCalendar className="text-2xl text-blue-600" />
        </div>
        
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-1">{session.title}</h4>
          <p className="text-sm text-gray-600 mb-2">
            By {session.instructor?.name}
          </p>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <FaClock />
              <span>{formatDate(session.scheduledAt, 'MMM dd, yyyy')}</span>
            </div>
            <div className="flex items-center gap-1">
              <FaUsers />
              <span>{session.participants?.length || 0} joined</span>
            </div>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/live-sessions/${session._id}/room`);
          }}
        >
          Join
        </Button>
      </div>
    </Card>
  );
};

// ============================================
// ACHIEVEMENT BADGE
// ============================================
const AchievementBadge = ({ badge }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="flex flex-col items-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
    >
      <div className="text-4xl mb-2">{badge.icon}</div>
      <h4 className="font-semibold text-gray-900 text-sm text-center mb-1">
        {badge.name}
      </h4>
      <p className="text-xs text-gray-600 text-center">
        {badge.description}
      </p>
    </motion.div>
  );
};

// ============================================
// DASHBOARD PAGE COMPONENT
// ============================================
const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const enrolledCourses = useSelector(selectEnrolledCourses);
  const upcomingSessions = useSelector(selectUpcomingSessions);
  const statistics = useSelector(selectUserStatistics);
  const courseLoading = useSelector(selectCourseLoading);
  const userLoading = useSelector(selectUserLoading);

  // ============================================
  // FETCH DATA
  // ============================================
  useEffect(() => {
    dispatch(getEnrolledCourses());
    dispatch(getUpcomingSessions());
    if (user) {
      dispatch(getUserStatistics(user._id));
    }
  }, [dispatch, user]);

  // ============================================
  // GREETING MESSAGE
  // ============================================
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // ============================================
  // RECENT BADGES
  // ============================================
  const recentBadges = user?.gamification?.badges?.slice(0, 4) || [];

  return (
    <>
      <Helmet>
        <title>Dashboard | {config.app.name}</title>
      </Helmet>

      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getGreeting()}, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-600">
            Welcome back to your learning dashboard. Let's continue your journey!
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Courses Enrolled"
            value={statistics.coursesCompleted || 0}
            icon={<FaBook />}
            change="+3 this month"
            changeType="increase"
          />
          
          <StatsCard
            title="Certificates Earned"
            value={statistics.certificatesEarned || 0}
            icon={<FaCertificate />}
            change="+2 this month"
            changeType="increase"
          />
          
          <StatsCard
            title="Total Points"
            value={statistics.totalPoints || 0}
            icon={<FaTrophy />}
            change="+150 this week"
            changeType="increase"
          />
          
          <StatsCard
            title="Current Streak"
            value={`${statistics.currentStreak || 0} days`}
            icon={<FaFire />}
            change={statistics.currentStreak > 0 ? 'Keep it up!' : 'Start today!'}
            changeType={statistics.currentStreak > 0 ? 'increase' : 'decrease'}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Continue Learning & Upcoming Sessions */}
          <div className="lg:col-span-2 space-y-8">
            {/* Continue Learning */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Continue Learning
                </h2>
                <Link
                  to={config.routes.myLearning}
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                >
                  View All <FaArrowRight />
                </Link>
              </div>

              {courseLoading ? (
                <div className="space-y-4">
                  <SkeletonLoader className="h-24" count={3} />
                </div>
              ) : enrolledCourses.length === 0 ? (
                <Card padding="lg" className="text-center">
                  <div className="text-5xl mb-4">📚</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No courses yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Start your learning journey by enrolling in a course
                  </p>
                  <Button onClick={() => navigate(config.routes.courses)}>
                    Explore Courses
                  </Button>
                </Card>
              ) : (
                <div className="space-y-4">
                  {enrolledCourses.slice(0, 3).map((course) => (
                    <ContinueLearningCard key={course._id} course={course} />
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Live Sessions */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Upcoming Live Sessions
                </h2>
                <Link
                  to={config.routes.liveSessions}
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                >
                  View All <FaArrowRight />
                </Link>
              </div>

              {upcomingSessions.length === 0 ? (
                <Card padding="lg" className="text-center">
                  <div className="text-5xl mb-4">📅</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No upcoming sessions
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Check out available live sessions
                  </p>
                  <Button onClick={() => navigate(config.routes.liveSessions)}>
                    Browse Sessions
                  </Button>
                </Card>
              ) : (
                <div className="space-y-4">
                  {upcomingSessions.slice(0, 3).map((session) => (
                    <UpcomingSessionCard key={session._id} session={session} />
                  ))}
                </div>
              )}
            </div>

            {/* Learning Progress Chart */}
            <Card>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Learning Progress
                </h3>
                
                <div className="space-y-4">
                  {/* Weekly Activity */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">This Week</span>
                      <span className="text-sm text-gray-600">{statistics.learningHours || 0}h</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: '75%' }}
                      />
                    </div>
                  </div>

                  {/* Monthly Goal */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Monthly Goal</span>
                      <span className="text-sm text-gray-600">12/20 hours</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: '60%' }}
                      />
                    </div>
                  </div>

                  {/* Total Learning Time */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FaClock className="text-gray-400" />
                        <span className="text-sm text-gray-700">Total Learning Time</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {statistics.learningHours || 0} hours
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Quick Stats & Achievements */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <Card>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Quick Actions
                </h3>
                
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    fullWidth
                    icon={<FaBook />}
                    onClick={() => navigate(config.routes.courses)}
                  >
                    Browse Courses
                  </Button>
                  
                  <Button
                    variant="outline"
                    fullWidth
                    icon={<FaCalendar />}
                    onClick={() => navigate(config.routes.liveSessions)}
                  >
                    Join Live Session
                  </Button>
                  
                  <Button
                    variant="outline"
                    fullWidth
                    icon={<FaUsers />}
                    onClick={() => navigate(config.routes.skillExchange)}
                  >
                    Skill Exchange
                  </Button>
                  
                  <Button
                    variant="outline"
                    fullWidth
                    icon={<FaCertificate />}
                    onClick={() => navigate(config.routes.certificates)}
                  >
                    My Certificates
                  </Button>
                </div>
              </div>
            </Card>

            {/* Current Level */}
            <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
              <div className="p-6 text-center">
                <div className="text-5xl mb-3">🏆</div>
                <h3 className="text-2xl font-bold mb-2">
                  Level {statistics.level || 1}
                </h3>
                <p className="text-blue-100 mb-4">
                  {statistics.totalPoints || 0} Total Points
                </p>
                
                <div className="mb-2">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Progress to Level {(statistics.level || 1) + 1}</span>
                    <span>{((statistics.totalPoints || 0) % 1000)} / 1000</span>
                  </div>
                  <div className="w-full bg-blue-800 rounded-full h-2">
                    <div
                      className="bg-white h-2 rounded-full"
                      style={{ width: `${((statistics.totalPoints || 0) % 1000) / 10}%` }}
                    />
                  </div>
                </div>
                
                <p className="text-xs text-blue-200">
                  {1000 - ((statistics.totalPoints || 0) % 1000)} points to next level
                </p>
              </div>
            </Card>

            {/* Recent Achievements */}
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    Recent Achievements
                  </h3>
                  <Link
                    to="/achievements"
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    View All
                  </Link>
                </div>

                {recentBadges.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">🎯</div>
                    <p className="text-sm text-gray-600">
                      Complete courses to earn badges
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {recentBadges.map((badge) => (
                      <AchievementBadge key={badge._id} badge={badge} />
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Streak Calendar */}
            <Card>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Learning Streak
                </h3>
                
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">🔥</div>
                  <div className="text-3xl font-bold text-orange-600 mb-1">
                    {statistics.currentStreak || 0} Days
                  </div>
                  <p className="text-sm text-gray-600">
                    Longest: {statistics.longestStreak || 0} days
                  </p>
                </div>

                {/* Simple calendar visualization */}
                <div className="grid grid-cols-7 gap-1">
                  {[...Array(7)].map((_, i) => (
                    <div
                      key={i}
                      className={`aspect-square rounded ${
                        i < (statistics.currentStreak || 0)
                          ? 'bg-orange-500'
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;