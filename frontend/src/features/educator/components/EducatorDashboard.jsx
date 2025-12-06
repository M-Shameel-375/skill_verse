import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Helmet } from 'react-helmet-async';
import {
  FaChalkboardTeacher,
  FaPlus,
  FaUsers,
  FaMoneyBillWave,
  FaStar,
  FaSpinner,
  FaArrowRight,
  FaEdit,
  FaEye,
} from 'react-icons/fa';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getMyCourses } from '@/api/courseApi';
import { getEarnings } from '@/api/paymentApi';
import { getEducatorStats } from '@/api/educatorApi';
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

const formatCurrency = (amount) => `$${(amount || 0).toLocaleString()}`;

// ============================================
// STATS CARD COMPONENT
// ============================================
const StatsCard = ({ title, value, icon, color, subtitle }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
          <div className={`p-2 rounded-lg ${colorClasses[color]}`}>{icon}</div>
        </div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
};

// ============================================
// COURSE ROW COMPONENT
// ============================================
const CourseRow = ({ course, onEdit, onView }) => {
  const statusColors = {
    published: 'bg-green-100 text-green-700',
    draft: 'bg-yellow-100 text-yellow-700',
    pending: 'bg-blue-100 text-blue-700',
    rejected: 'bg-red-100 text-red-700',
  };

  return (
    <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-4">
        <img
          src={course.thumbnail?.url || course.thumbnail || '/placeholder-course.jpg'}
          alt={course.title}
          className="w-16 h-10 object-cover rounded"
          onError={(e) => {
            e.target.src = '/placeholder-course.jpg';
          }}
        />
        <div>
          <h4 className="font-medium text-gray-900">{course.title}</h4>
          <p className="text-sm text-gray-500">
            {course.enrolledStudents?.length || course.enrolledCount || 0} students •{' '}
            {formatCurrency(course.price)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[course.status] || statusColors.draft
            }`}
        >
          {course.status || 'Draft'}
        </span>
        <Button variant="ghost" size="sm" onClick={() => onView(course._id)}>
          <FaEye className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onEdit(course._id)}>
          <FaEdit className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// ============================================
// EDUCATOR DASHBOARD COMPONENT
// ============================================
const EducatorDashboard = ({ user: dbUser }) => {
  const navigate = useNavigate();
  const { user: clerkUser } = useUser();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalEarnings: 0,
    averageRating: 0,
    pendingPayouts: 0,
    thisMonthEarnings: 0,
  });
  const [recentCourses, setRecentCourses] = useState([]);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [coursesRes, earningsRes, statsRes] = await Promise.allSettled([
        getMyCourses(),
        getEarnings({ period: 'month' }),
        getEducatorStats(),
      ]);

      // Process courses
      const courses =
        coursesRes.status === 'fulfilled'
          ? coursesRes.value?.data?.data || coursesRes.value?.data || []
          : [];

      // Process earnings
      const earnings =
        earningsRes.status === 'fulfilled'
          ? earningsRes.value?.data?.data || earningsRes.value?.data || {}
          : {};

      // Process stats from API or calculate from courses
      const apiStats =
        statsRes.status === 'fulfilled'
          ? statsRes.value?.data?.data || statsRes.value?.data || {}
          : {};

      // Calculate stats
      const totalStudents =
        apiStats.totalStudents ||
        courses.reduce((acc, course) => acc + (course.enrolledStudents?.length || course.enrolledCount || 0), 0);

      const totalEarnings = earnings.summary?.total || earnings.totalEarnings || 0;
      const thisMonthEarnings = earnings.summary?.thisMonth || earnings.monthlyEarnings || 0;

      const ratings = courses.filter((c) => c.rating?.average).map((c) => c.rating.average);
      const avgRating =
        apiStats.averageRating ||
        (ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0);

      setStats({
        totalStudents,
        totalCourses: courses.length,
        totalEarnings,
        thisMonthEarnings,
        averageRating: avgRating.toFixed(1),
        pendingPayouts: earnings.pending || 0,
      });

      // Sort courses by creation date and take recent ones
      setRecentCourses(
        [...courses]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
      );
    } catch (error) {
      console.error('Error fetching educator data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleEditCourse = (courseId) => {
    navigate(`/educator/courses/${courseId}/edit`);
  };

  const handleViewCourse = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  const userName = dbUser?.name || clerkUser?.firstName || 'Educator';

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Educator Dashboard | SkillVerse</title>
      </Helmet>

      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {getGreeting()}, {userName}! 📚
            </h1>
            <p className="text-gray-600">
              Manage your courses and track your teaching progress.
            </p>
          </div>
          <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            👨‍🏫 Educator
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3 flex-wrap">
          <Button variant="outline" onClick={() => navigate('/educator/quiz/create')}>
            <FaPlus className="mr-2 h-4 w-4" /> Create Quiz
          </Button>
          <Button onClick={() => navigate('/educator/courses/create')}>
            <FaPlus className="mr-2 h-4 w-4" /> Create New Course
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Students"
            value={stats.totalStudents.toLocaleString()}
            icon={<FaUsers className="text-xl" />}
            color="blue"
          />
          <StatsCard
            title="Total Earnings"
            value={formatCurrency(stats.totalEarnings)}
            icon={<FaMoneyBillWave className="text-xl" />}
            color="green"
            subtitle={`This month: ${formatCurrency(stats.thisMonthEarnings)}`}
          />
          <StatsCard
            title="Total Courses"
            value={stats.totalCourses}
            icon={<FaChalkboardTeacher className="text-xl" />}
            color="purple"
          />
          <StatsCard
            title="Average Rating"
            value={`⭐ ${stats.averageRating}`}
            icon={<FaStar className="text-xl" />}
            color="yellow"
          />
        </div>

        {/* Recent Courses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Courses</CardTitle>
            <Link
              to="/educator/courses"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
            >
              View All <FaArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <div className="divide-y divide-gray-100">
            {recentCourses.length > 0 ? (
              recentCourses.map((course) => (
                <CourseRow
                  key={course._id}
                  course={course}
                  onEdit={handleEditCourse}
                  onView={handleViewCourse}
                />
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <FaChalkboardTeacher className="mx-auto text-4xl text-gray-300 mb-4" />
                <p className="text-lg font-medium">No courses yet</p>
                <p className="text-sm mt-1 mb-4">Create your first course to get started!</p>
                <Button onClick={() => navigate('/educator/courses/create')}>
                  <FaPlus className="mr-2 h-4 w-4" /> Create Course
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Quick Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate('/educator/analytics')}
          >
            <CardContent className="p-6 text-center">
              <FaUsers className="mx-auto text-3xl text-blue-600 mb-3" />
              <h3 className="font-semibold text-gray-900">Student Analytics</h3>
              <p className="text-sm text-gray-600 mt-1">View student progress and engagement</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate('/educator/earnings')}
          >
            <CardContent className="p-6 text-center">
              <FaMoneyBillWave className="mx-auto text-3xl text-green-600 mb-3" />
              <h3 className="font-semibold text-gray-900">Earnings Report</h3>
              <p className="text-sm text-gray-600 mt-1">Track your revenue and payouts</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate('/educator/sessions')}
          >
            <CardContent className="p-6 text-center">
              <FaChalkboardTeacher className="mx-auto text-3xl text-purple-600 mb-3" />
              <h3 className="font-semibold text-gray-900">Live Sessions</h3>
              <p className="text-sm text-gray-600 mt-1">Schedule and manage live classes</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default EducatorDashboard;