import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useUser } from '@clerk/clerk-react';
import {
  FaBook,
  FaCertificate,
  FaTrophy,
  FaFire,
  FaClock,
  FaArrowRight,
  FaPlay,
  FaUsers,
  FaSpinner,
  FaDownload,
  FaFilePdf,
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
// HELPER FUNCTIONS
// ============================================
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

// ============================================
// STATS CARD COMPONENT
// ============================================
const StatsCard = ({ title, value, icon, subtitle, color = 'blue' }) => {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    orange: 'text-orange-600',
    purple: 'text-purple-600',
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <span className={colorClasses[color]}>{icon}</span>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </CardContent>
    </Card>
  );
};

// ============================================
// CONTINUE LEARNING CARD COMPONENT
// ============================================
const ContinueLearningCard = ({ course, onContinue }) => {
  const progress = course.progress || 0;
  const completedLectures = course.completedLectures || 0;
  const totalLectures = course.totalLectures || course.lessonsCount || 0;

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onContinue(course._id)}>
      <CardContent className="p-4">
        <div className="flex gap-4 items-center">
          {/* Thumbnail */}
          <div className="w-32 h-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
            <img
              src={course.thumbnail?.url || course.thumbnail || '/placeholder-course.jpg'}
              alt={course.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = '/placeholder-course.jpg';
              }}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 mb-1 truncate">
              {course.title}
            </h4>
            <p className="text-sm text-gray-600 mb-2">
              By {course.instructor?.name || 'Unknown Instructor'}
            </p>

            {/* Progress Bar */}
            <div className="mb-2">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>{progress}% complete</span>
                <span>{completedLectures}/{totalLectures} lectures</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <Button
            variant="default"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onContinue(course._id);
            }}
          >
            <FaPlay className="mr-2 h-3 w-3" />
            {progress > 0 ? 'Continue' : 'Start'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================
// LEARNER DASHBOARD COMPONENT
// ============================================
const LearnerDashboard = ({ user: dbUser }) => {
  const navigate = useNavigate();
  const { user: clerkUser } = useUser();

  // State
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [statistics, setStatistics] = useState({
    coursesCompleted: 0,
    certificatesEarned: 0,
    totalPoints: 0,
    currentStreak: 0,
    learningHours: 0,
    level: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingJSON, setExportingJSON] = useState(false);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [coursesRes, statsRes, certsRes, badgesRes] = await Promise.allSettled([
        getEnrolledCourses(),
        getUserStatistics(dbUser?._id),
        getUserCertificates(dbUser?._id),
        getMyBadges(),
      ]);

      // Process enrolled courses
      if (coursesRes.status === 'fulfilled') {
        const data = coursesRes.value?.data?.data || coursesRes.value?.data || [];
        setEnrolledCourses(Array.isArray(data) ? data : data.courses || []);
      }

      // Build statistics
      const stats = {
        coursesCompleted: 0,
        certificatesEarned: 0,
        totalPoints: dbUser?.gamification?.points || 0,
        currentStreak: dbUser?.gamification?.streak || 0,
        learningHours: 0,
        level: dbUser?.gamification?.level || 1,
      };

      // From stats API
      if (statsRes.status === 'fulfilled') {
        const apiStats = statsRes.value?.data?.data || statsRes.value?.data || {};
        stats.coursesCompleted = apiStats.coursesCompleted || apiStats.completedCourses || 0;
        stats.learningHours = apiStats.learningHours || apiStats.totalHours || 0;
      }

      // From certificates API
      if (certsRes.status === 'fulfilled') {
        const certs = certsRes.value?.data?.data || certsRes.value?.data || [];
        stats.certificatesEarned = Array.isArray(certs) ? certs.length : 0;
      }

      setStatistics(stats);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [dbUser?._id, dbUser?.gamification]);

  useEffect(() => {
    if (dbUser?._id) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [fetchDashboardData, dbUser?._id]);

  // Export handlers
  const handleExportPDF = async () => {
    try {
      setExportingPDF(true);
      await exportProgressPDF();
      toast.success('Progress report downloaded!');
    } catch (err) {
      console.error('Export PDF error:', err);
      toast.error('Failed to download report');
    } finally {
      setExportingPDF(false);
    }
  };

  const handleExportJSON = async () => {
    try {
      setExportingJSON(true);
      await exportProgressJSON();
      toast.success('Data exported successfully!');
    } catch (err) {
      console.error('Export JSON error:', err);
      toast.error('Failed to export data');
    } finally {
      setExportingJSON(false);
    }
  };

  const handleContinueCourse = (courseId) => {
    navigate(`/courses/${courseId}/learn`);
  };

  const userName = dbUser?.name || clerkUser?.firstName || 'Learner';

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <FaSpinner className="animate-spin text-3xl text-blue-600 mr-3" />
        <span className="text-gray-600">Loading your dashboard...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchDashboardData}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }

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
              Welcome back! Let's continue your learning journey.
            </p>
          </div>
          <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            🎓 Learner
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Courses Enrolled"
            value={enrolledCourses.length}
            icon={<FaBook className="h-4 w-4" />}
            subtitle={`${statistics.coursesCompleted} completed`}
            color="blue"
          />
          <StatsCard
            title="Certificates"
            value={statistics.certificatesEarned}
            icon={<FaCertificate className="h-4 w-4" />}
            subtitle="Keep learning!"
            color="green"
          />
          <StatsCard
            title="Total Points"
            value={statistics.totalPoints.toLocaleString()}
            icon={<FaTrophy className="h-4 w-4" />}
            subtitle={`Level ${statistics.level}`}
            color="yellow"
          />
          <StatsCard
            title="Current Streak"
            value={`${statistics.currentStreak} days`}
            icon={<FaFire className="h-4 w-4" />}
            subtitle={statistics.currentStreak > 0 ? 'Keep it up!' : 'Start today!'}
            color="orange"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-8">
            {/* Continue Learning Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Continue Learning</h2>
                <Link
                  to="/my-learning"
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                >
                  View All <FaArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {enrolledCourses.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
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
                    <ContinueLearningCard
                      key={course._id}
                      course={course}
                      onContinue={handleContinueCourse}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Learning Progress Card */}
            <Card>
              <CardHeader>
                <CardTitle>Learning Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">This Week</span>
                      <span className="text-sm text-gray-600">{statistics.learningHours}h</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(statistics.learningHours * 10, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Course Completion</span>
                      <span className="text-sm text-gray-600">
                        {statistics.coursesCompleted}/{enrolledCourses.length}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${enrolledCourses.length > 0
                            ? (statistics.coursesCompleted / enrolledCourses.length) * 100
                            : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Recommendations */}
            <AIRecommendations />
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate('/courses')}
                  >
                    <FaBook className="mr-2 h-4 w-4" /> Browse Courses
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate('/certificates')}
                  >
                    <FaCertificate className="mr-2 h-4 w-4" /> View Certificates
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate('/achievements')}
                  >
                    <FaTrophy className="mr-2 h-4 w-4" /> Achievements
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate('/skill-exchange')}
                  >
                    <FaUsers className="mr-2 h-4 w-4" /> Skill Exchange
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Export Progress */}
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
                    {exportingPDF ? 'Generating...' : 'Download PDF'}
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
                    {exportingJSON ? 'Exporting...' : 'Export JSON'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Become Educator CTA */}
            <Card>
              <CardHeader>
                <CardTitle>Want to Teach?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4 text-sm">
                  Share your knowledge and earn by becoming an educator.
                </p>
                <Button onClick={() => navigate('/become-educator')} className="w-full">
                  Become an Educator
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default LearnerDashboard;