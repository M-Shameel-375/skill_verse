import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import {
  FaBook,
  FaDollarSign,
  FaUsers,
  FaStar,
  FaArrowRight,
  FaPlus,
  FaChartLine,
  FaCalendar,
  FaSpinner,
  FaEye,
  FaEdit,
  FaComments,
} from 'react-icons/fa';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getEducatorStats, getEducatorCourses, getAllReviews } from '@/api/educatorApi';
import { getUpcomingSessions } from '@/api/liveSessionApi';
import toast from 'react-hot-toast';

// ============================================
// STAT CARD COMPONENT
// ============================================
const StatCard = ({ title, value, icon, change, changeType, prefix = '', suffix = '' }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className="p-2 bg-blue-100 rounded-lg">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
        </div>
        {change && (
          <p className={`text-xs mt-1 ${changeType === 'increase' ? 'text-green-600' : changeType === 'decrease' ? 'text-red-600' : 'text-gray-500'}`}>
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================
// COURSE CARD COMPONENT
// ============================================
const CourseCard = ({ course, onView, onEdit }) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex">
        <div className="w-32 h-24 flex-shrink-0">
          <img
            src={course.thumbnail?.url || 'https://via.placeholder.com/128x96'}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        </div>
        <CardContent className="flex-1 p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 truncate mb-1">
                {course.title}
              </h4>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                <span className="flex items-center gap-1">
                  <FaUsers className="text-gray-400" />
                  {course.stats?.enrolledStudents || 0} students
                </span>
                <span className="flex items-center gap-1">
                  <FaStar className="text-yellow-500" />
                  {course.stats?.averageRating || 0} ({course.stats?.totalReviews || 0})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  course.status === 'published' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {course.status}
                </span>
                <span className="text-sm text-green-600 font-medium">
                  ${course.stats?.totalEarnings?.toLocaleString() || 0} earned
                </span>
              </div>
            </div>
            <div className="flex gap-2 ml-4">
              <Button size="sm" variant="outline" onClick={() => onView(course._id)}>
                <FaEye className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => onEdit(course._id)}>
                <FaEdit className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

// ============================================
// REVIEW CARD COMPONENT
// ============================================
const ReviewCard = ({ review }) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <img
            src={review.user?.avatar?.url || 'https://via.placeholder.com/40'}
            alt={`${review.user?.firstName} ${review.user?.lastName}`}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h5 className="font-medium text-gray-900">
                {review.user?.firstName} {review.user?.lastName}
              </h5>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={`h-3 w-3 ${i < review.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-2">
              on {review.course?.title}
            </p>
            <p className="text-sm text-gray-700 line-clamp-2">
              {review.comment}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================
// UPCOMING SESSION CARD
// ============================================
const UpcomingSessionCard = ({ session }) => {
  const navigate = useNavigate();
  
  return (
    <Card className="cursor-pointer hover:bg-gray-50" onClick={() => navigate(`/educator/live-sessions/${session._id}`)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <FaCalendar className="text-xl text-purple-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 truncate">{session.title}</h4>
            <p className="text-sm text-gray-600">
              {new Date(session.scheduledAt).toLocaleDateString()} at {new Date(session.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="text-right">
            <span className="text-sm font-medium text-purple-600">
              {session.participants?.length || 0} registered
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================
// MAIN EDUCATOR DASHBOARD COMPONENT
// ============================================
const EducatorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  
  // State
  const [stats, setStats] = useState({
    totalCourses: 0,
    publishedCourses: 0,
    totalStudents: 0,
    totalEarnings: 0,
    monthlyEarnings: 0,
    averageRating: 0,
    totalReviews: 0,
    pendingPayouts: 0
  });
  const [courses, setCourses] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all data in parallel
      const [statsRes, coursesRes, reviewsRes, sessionsRes] = await Promise.allSettled([
        getEducatorStats(),
        getEducatorCourses({ limit: 5 }),
        getAllReviews({ limit: 5 }),
        getUpcomingSessions({ limit: 3 }),
      ]);

      // Handle stats
      if (statsRes.status === 'fulfilled' && statsRes.value?.data) {
        setStats(statsRes.value.data);
      }

      // Handle courses
      if (coursesRes.status === 'fulfilled' && coursesRes.value?.data?.courses) {
        setCourses(coursesRes.value.data.courses);
      }

      // Handle reviews
      if (reviewsRes.status === 'fulfilled' && reviewsRes.value?.data?.reviews) {
        setReviews(reviewsRes.value.data.reviews);
      }

      // Handle upcoming sessions
      if (sessionsRes.status === 'fulfilled' && sessionsRes.value?.data) {
        setUpcomingSessions(sessionsRes.value.data.slice(0, 3));
      }

    } catch (err) {
      console.error('Failed to fetch educator dashboard data:', err);
      setError('Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const userName = user?.firstName || 'Educator';

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="animate-pulse space-y-8">
      <div className="h-8 bg-gray-200 rounded w-1/3"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
      <div className="h-64 bg-gray-200 rounded-lg"></div>
    </div>
  );

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Educator Dashboard | SkillVerse</title>
        </Helmet>
        <div className="p-6">
          <LoadingSkeleton />
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Educator Dashboard | SkillVerse</title>
      </Helmet>

      <div className="p-6 space-y-8">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {getGreeting()}, {userName}! 👋
            </h1>
            <p className="text-gray-600">
              Here's how your courses are performing
            </p>
          </div>
          <Button onClick={() => navigate('/educator/courses/create')}>
            <FaPlus className="mr-2 h-4 w-4" /> Create Course
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Courses"
            value={stats.totalCourses}
            icon={<FaBook className="h-5 w-5 text-blue-600" />}
            change={`${stats.publishedCourses} published, ${stats.draftCourses || 0} drafts`}
          />
          
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={<FaUsers className="h-5 w-5 text-green-600" />}
            change={`+${stats.enrollmentsThisMonth || 0} this month`}
            changeType="increase"
          />
          
          <StatCard
            title="Total Earnings"
            value={stats.totalEarnings}
            prefix="$"
            icon={<FaDollarSign className="h-5 w-5 text-yellow-600" />}
            change={`$${stats.monthlyEarnings?.toLocaleString() || 0} this month`}
            changeType="increase"
          />
          
          <StatCard
            title="Average Rating"
            value={stats.averageRating}
            suffix="/5"
            icon={<FaStar className="h-5 w-5 text-orange-500" />}
            change={`${stats.totalReviews} reviews`}
          />
        </div>

        {/* Pending Payout Banner */}
        {stats.pendingPayouts > 0 && (
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <FaDollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-800">Pending Payout</h3>
                    <p className="text-sm text-green-600">
                      You have ${stats.pendingPayouts.toLocaleString()} ready for withdrawal
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="border-green-600 text-green-600 hover:bg-green-50"
                  onClick={() => navigate('/educator/earnings')}
                >
                  View Earnings
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Courses & Sessions */}
          <div className="lg:col-span-2 space-y-8">
            {/* My Courses */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  My Courses
                </h2>
                <Link
                  to="/educator/courses"
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                >
                  View All <FaArrowRight />
                </Link>
              </div>

              {courses.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="text-5xl mb-4">📚</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No courses yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Start sharing your knowledge by creating your first course
                    </p>
                    <Button onClick={() => navigate('/educator/courses/create')}>
                      <FaPlus className="mr-2 h-4 w-4" /> Create Your First Course
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {courses.map((course) => (
                    <CourseCard
                      key={course._id}
                      course={course}
                      onView={(id) => navigate(`/courses/${id}`)}
                      onEdit={(id) => navigate(`/educator/courses/${id}/edit`)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Live Sessions */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Upcoming Live Sessions
                </h2>
                <Link
                  to="/educator/live-sessions"
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                >
                  Manage <FaArrowRight />
                </Link>
              </div>

              {upcomingSessions.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-3">📅</div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      No upcoming sessions
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm">
                      Schedule a live session with your students
                    </p>
                    <Button variant="outline" onClick={() => navigate('/educator/live-sessions/create')}>
                      Schedule Session
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <UpcomingSessionCard key={session._id} session={session} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Quick Actions & Reviews */}
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
                    onClick={() => navigate('/educator/courses/create')}
                  >
                    <FaPlus className="mr-2 h-4 w-4" /> Create New Course
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    onClick={() => navigate('/educator/live-sessions/create')}
                  >
                    <FaCalendar className="mr-2 h-4 w-4" /> Schedule Live Session
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    onClick={() => navigate('/educator/analytics')}
                  >
                    <FaChartLine className="mr-2 h-4 w-4" /> View Analytics
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    onClick={() => navigate('/educator/students')}
                  >
                    <FaUsers className="mr-2 h-4 w-4" /> Manage Students
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Reviews */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">
                  Recent Reviews
                </h2>
                <Link
                  to="/educator/reviews"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                >
                  View All <FaArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {reviews.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-3">⭐</div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      No reviews yet
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Reviews will appear here once students start rating your courses
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {reviews.slice(0, 3).map((review) => (
                    <ReviewCard key={review._id} review={review} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EducatorDashboard;
