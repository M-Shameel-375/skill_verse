// ============================================
// LEARNER DASHBOARD PAGE
// ============================================

import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
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
  FaSpinner,
  FaDownload,
  FaFilePdf,
  FaRobot,
} from 'react-icons/fa';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getEnrolledCourses } from '@/api/courseApi';
import { getUserStatistics, getUserCertificates } from '@/api/userApi';
import { getMyBadges } from '@/api/badgeApi';
import { exportProgressPDF, exportProgressJSON } from '@/api/analyticsApi';
import AIRecommendations from '../components/AIRecommendations';
import toast from 'react-hot-toast';

// ============================================
// CONTINUE LEARNING CARD
// ============================================
const ContinueLearningCard = ({ course }) => {
  const navigate = useNavigate();
  const progress = course.progress || 0;

  return (
    <Card className="cursor-pointer hover:bg-gray-50" onClick={() => navigate(`/courses/${course._id}/learn`)}>
      <CardContent className="p-4">
        <div className="flex gap-4 items-center">
          <div className="w-32 h-20 flex-shrink-0">
            <img
              src={course.thumbnail?.url || 'https://via.placeholder.com/200x120'}
              alt={course.title}
              className="w-full h-full object-cover rounded-lg"
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
            variant="default"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/courses/${course._id}/learn`);
            }}
          >
            <FaPlay className="mr-2 h-4 w-4" /> Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================
// STATS CARD
// ============================================
const StatsCard = ({ title, value, icon, change, changeType }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
          {change}
        </p>
      </CardContent>
    </Card>
  );
};

// ============================================
// LEARNER DASHBOARD COMPONENT
// ============================================
const LearnerDashboard = ({ user: dbUser }) => {
  const navigate = useNavigate();
  const { user } = useUser();
  
  // State for API data
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [statistics, setStatistics] = useState({
    coursesCompleted: 0,
    certificatesEarned: 0,
    totalPoints: 0,
    currentStreak: 0,
    learningHours: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingJSON, setExportingJSON] = useState(false);

  // Export progress report handler
  const handleExportPDF = async () => {
    try {
      setExportingPDF(true);
      await exportProgressPDF();
      toast.success('Progress report downloaded successfully!');
    } catch (err) {
      console.error('Export PDF error:', err);
      toast.error('Failed to download report. Please try again.');
    } finally {
      setExportingPDF(false);
    }
  };

  const handleExportJSON = async () => {
    try {
      setExportingJSON(true);
      await exportProgressJSON();
      toast.success('Progress data exported successfully!');
    } catch (err) {
      console.error('Export JSON error:', err);
      toast.error('Failed to export data. Please try again.');
    } finally {
      setExportingJSON(false);
    }
  };

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    if (!dbUser?._id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch enrolled courses and user stats in parallel
      const [coursesRes, statsRes, certsRes, badgesRes] = await Promise.allSettled([
        getEnrolledCourses(),
        getUserStatistics(dbUser._id),
        getUserCertificates(dbUser._id),
        getMyBadges(),
      ]);

      // Handle enrolled courses
      if (coursesRes.status === 'fulfilled' && coursesRes.value?.data?.data) {
        setEnrolledCourses(coursesRes.value.data.data.courses || coursesRes.value.data.data || []);
      }

      // Build statistics from various sources
      const stats = {
        coursesCompleted: 0,
        certificatesEarned: 0,
        totalPoints: dbUser?.gamification?.points || 0,
        currentStreak: dbUser?.gamification?.streak || 0,
        learningHours: 0,
      };

      // From user stats API
      if (statsRes.status === 'fulfilled' && statsRes.value?.data?.data) {
        const apiStats = statsRes.value.data.data;
        stats.coursesCompleted = apiStats.coursesCompleted || apiStats.completedCourses || 0;
        stats.learningHours = apiStats.learningHours || apiStats.totalHours || 0;
      }

      // From certificates API
      if (certsRes.status === 'fulfilled' && certsRes.value?.data?.data) {
        const certs = certsRes.value.data.data;
        stats.certificatesEarned = Array.isArray(certs) ? certs.length : certs.total || 0;
      }

      // From badges API
      if (badgesRes.status === 'fulfilled' && badgesRes.value?.data?.data) {
        const badges = badgesRes.value.data.data;
        // Add badge count if needed
      }

      setStatistics(stats);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [dbUser?._id, dbUser?.gamification?.points, dbUser?.gamification?.streak]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const userName = dbUser?.name || user?.firstName || 'Learner';

  return (
    <>
      <Helmet>
        <title>Dashboard | SkillVerse</title>
      </Helmet>

      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {getGreeting()}, {userName}! 👋
            </h1>
            <p className="text-gray-600">
              Welcome back to your learning dashboard. Let's continue your journey!
            </p>
          </div>
          <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            🎓 Learner
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <FaSpinner className="animate-spin text-3xl text-blue-600 mr-3" />
            <span className="text-gray-600">Loading your dashboard...</span>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchDashboardData}>Try Again</Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Courses Enrolled"
                value={enrolledCourses.length || 0}
                icon={<FaBook className="h-4 w-4 text-muted-foreground" />}
                change={`${statistics.coursesCompleted} completed`}
                changeType="increase"
              />
              
              <StatsCard
                title="Certificates Earned"
                value={statistics.certificatesEarned || 0}
                icon={<FaCertificate className="h-4 w-4 text-muted-foreground" />}
                change="Keep learning!"
                changeType="increase"
              />
              
              <StatsCard
                title="Total Points"
                value={statistics.totalPoints || 0}
                icon={<FaTrophy className="h-4 w-4 text-muted-foreground" />}
                change={`Level ${dbUser?.gamification?.level || 1}`}
                changeType="increase"
              />
          
              <StatsCard
                title="Current Streak"
                value={`${statistics.currentStreak || 0} days`}
                icon={<FaFire className="h-4 w-4 text-muted-foreground" />}
                change={statistics.currentStreak > 0 ? 'Keep it up!' : 'Start today!'}
                changeType={statistics.currentStreak > 0 ? 'increase' : 'decrease'}
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Continue Learning */}
              <div className="lg:col-span-2 space-y-8">
                {/* Continue Learning */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Continue Learning
                    </h2>
                    <Link
                      to="/my-learning"
                      className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                    >
                      View All <FaArrowRight />
                    </Link>
                  </div>

                  {enrolledCourses.length === 0 ? (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <div className="text-5xl mb-4">📚</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          No courses yet
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Start your learning journey by enrolling in a course
                        </p>
                        <Button onClick={() => navigate('/courses')}>
                          Explore Courses
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {enrolledCourses.slice(0, 3).map((course) => (
                        <ContinueLearningCard key={course._id} course={course} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Learning Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle>Learning Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">This Week</span>
                          <span className="text-sm text-gray-600">{statistics.learningHours || 0}h</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: `${Math.min((statistics.learningHours || 0) * 10, 100)}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Courses Progress</span>
                          <span className="text-sm text-gray-600">{statistics.coursesCompleted}/{enrolledCourses.length} completed</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${enrolledCourses.length > 0 ? (statistics.coursesCompleted / enrolledCourses.length) * 100 : 0}%` }} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Recommendations Section */}
                <AIRecommendations />
              </div>

              {/* Right Column - Quick Actions */}
              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/courses')}>
                        <FaBook className="mr-2 h-4 w-4" /> Browse Courses
                      </Button>
                      <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/certificates')}>
                        <FaCertificate className="mr-2 h-4 w-4" /> View Certificates
                      </Button>
                      <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/achievements')}>
                        <FaTrophy className="mr-2 h-4 w-4" /> View Achievements
                      </Button>
                      <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/skill-exchange')}>
                        <FaUsers className="mr-2 h-4 w-4" /> Skill Exchange
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Export Progress Report Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FaDownload className="h-4 w-4" />
                      Export Progress
                    </CardTitle>
                    <CardDescription>
                      Download your learning progress report
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start" 
                        onClick={handleExportPDF}
                        disabled={exportingPDF}
                      >
                        {exportingPDF ? (
                          <FaSpinner className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <FaFilePdf className="mr-2 h-4 w-4 text-red-500" />
                        )}
                        {exportingPDF ? 'Generating PDF...' : 'Download PDF Report'}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start" 
                        onClick={handleExportJSON}
                        disabled={exportingJSON}
                      >
                        {exportingJSON ? (
                          <FaSpinner className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <FaDownload className="mr-2 h-4 w-4 text-blue-500" />
                        )}
                        {exportingJSON ? 'Exporting...' : 'Export as JSON'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Want to Teach?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4 text-sm">
                      Share your knowledge and earn money by becoming an educator.
                    </p>
                    <Button onClick={() => navigate('/become-educator')} className="w-full">
                      Become an Educator
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default LearnerDashboard;
