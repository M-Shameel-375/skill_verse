// ============================================
// LEARNER DASHBOARD PAGE
// ============================================

import React, { useEffect, useState } from 'react';
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
} from 'react-icons/fa';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

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
  
  // Mock data for now
  const [enrolledCourses] = useState([
    {
      _id: '1',
      title: 'Complete React Developer Course',
      thumbnail: { url: 'https://via.placeholder.com/200x120' },
      instructor: { name: 'John Doe' },
      progress: 65,
      completedLectures: 13,
      totalLectures: 20,
    },
    {
      _id: '2',
      title: 'Node.js Masterclass',
      thumbnail: { url: 'https://via.placeholder.com/200x120' },
      instructor: { name: 'Jane Smith' },
      progress: 30,
      completedLectures: 6,
      totalLectures: 20,
    },
  ]);

  const statistics = {
    coursesCompleted: 5,
    certificatesEarned: 3,
    totalPoints: 2450,
    currentStreak: 7,
    learningHours: 45,
  };

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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Courses Enrolled"
            value={statistics.coursesCompleted || 0}
            icon={<FaBook className="h-4 w-4 text-muted-foreground" />}
            change="+3 this month"
            changeType="increase"
          />
          
          <StatsCard
            title="Certificates Earned"
            value={statistics.certificatesEarned || 0}
            icon={<FaCertificate className="h-4 w-4 text-muted-foreground" />}
            change="+2 this month"
            changeType="increase"
          />
          
          <StatsCard
            title="Total Points"
            value={statistics.totalPoints || 0}
            icon={<FaTrophy className="h-4 w-4 text-muted-foreground" />}
            change="+150 this week"
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
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Monthly Goal</span>
                      <span className="text-sm text-gray-600">12/20 hours</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
      </div>
    </>
  );
};

export default LearnerDashboard;
