// ============================================
// MY LEARNING PAGE
// ============================================

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  FaPlay,
  FaCheck,
  FaClock,
  FaBook,
  FaChartLine,
  FaFilter,
} from 'react-icons/fa';
import {
  getEnrolledCourses,
  selectEnrolledCourses,
  selectCourseLoading,
} from '../redux/slices/courseSlice';
import config from '../config';
import Card, { CardImage, CardBadge } from '../components/common/Card';
import Button from '../components/common/Button';
import { CardSkeletonLoader } from '../components/common/Loader';
import { formatDuration, formatDate } from '../utils/helpers';

// ============================================
// LEARNING COURSE CARD
// ============================================
const LearningCourseCard = ({ course, onContinue }) => {
  const progress = course.progress || 0;
  const completedLectures = course.completedLectures || 0;
  const totalLectures = course.totalLectures || 0;

  return (
    <Card hoverable>
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Thumbnail */}
        <div className="w-full sm:w-48 flex-shrink-0">
          <CardImage
            src={course.thumbnail?.url || 'https://via.placeholder.com/400x225'}
            alt={course.title}
            aspectRatio="16/9"
            className="rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none"
          />
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-0 sm:pr-4 sm:py-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {course.title}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                By {course.instructor?.name}
              </p>
            </div>

            {progress === 100 && (
              <CardBadge variant="success">
                <FaCheck className="inline mr-1" />
                Completed
              </CardBadge>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-700 font-medium">
                {progress}% complete
              </span>
              <span className="text-gray-600">
                {completedLectures}/{totalLectures} lectures
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mb-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <FaClock />
              <span>{formatDuration(course.duration)}</span>
            </div>
            <div className="flex items-center gap-1">
              <FaBook />
              <span>{totalLectures} lectures</span>
            </div>
          </div>

          {/* Last Accessed */}
          {course.lastAccessed && (
            <p className="text-xs text-gray-500 mb-3">
              Last accessed {formatDate(course.lastAccessed, 'MMM dd, yyyy')}
            </p>
          )}

          {/* Action Button */}
          <Button
            variant={progress === 100 ? 'outline' : 'primary'}
            size="sm"
            icon={progress === 100 ? <FaCheck /> : <FaPlay />}
            onClick={() => onContinue(course._id)}
          >
            {progress === 100 ? 'Review Course' : progress > 0 ? 'Continue Learning' : 'Start Course'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

// ============================================
// STATS CARD
// ============================================
const StatsCard = ({ icon: Icon, title, value, color }) => {
  return (
    <Card>
      <div className="p-6 flex items-center gap-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="text-2xl text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </Card>
  );
};

// ============================================
// MY LEARNING PAGE
// ============================================
const MyLearning = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const enrolledCourses = useSelector(selectEnrolledCourses);
  const loading = useSelector(selectCourseLoading);
  
  const [filter, setFilter] = useState('all'); // all, in-progress, completed

  useEffect(() => {
    dispatch(getEnrolledCourses());
  }, [dispatch]);

  // Calculate statistics
  const totalCourses = enrolledCourses.length;
  const inProgressCourses = enrolledCourses.filter(c => c.progress > 0 && c.progress < 100).length;
  const completedCourses = enrolledCourses.filter(c => c.progress === 100).length;
  const totalHours = enrolledCourses.reduce((sum, course) => sum + (course.duration || 0), 0);

  // Filter courses
  const filteredCourses = enrolledCourses.filter(course => {
    if (filter === 'in-progress') return course.progress > 0 && course.progress < 100;
    if (filter === 'completed') return course.progress === 100;
    return true;
  });

  // Sort by last accessed
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    if (!a.lastAccessed) return 1;
    if (!b.lastAccessed) return -1;
    return new Date(b.lastAccessed) - new Date(a.lastAccessed);
  });

  return (
    <>
      <Helmet>
        <title>My Learning | {config.app.name}</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Learning</h1>
          <p className="text-gray-600">Track your learning progress and continue where you left off</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            icon={FaBook}
            title="Total Courses"
            value={totalCourses}
            color="bg-blue-600"
          />
          <StatsCard
            icon={FaPlay}
            title="In Progress"
            value={inProgressCourses}
            color="bg-yellow-600"
          />
          <StatsCard
            icon={FaCheck}
            title="Completed"
            value={completedCourses}
            color="bg-green-600"
          />
          <StatsCard
            icon={FaClock}
            title="Learning Hours"
            value={Math.round(totalHours / 3600)}
            color="bg-purple-600"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter:</span>
          </div>
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'All Courses' },
              { value: 'in-progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Courses List */}
        {loading ? (
          <CardSkeletonLoader count={4} />
        ) : sortedCourses.length === 0 ? (
          <Card padding="xl" className="text-center">
            <div className="text-6xl mb-4">
              {filter === 'completed' ? '🎓' : filter === 'in-progress' ? '📖' : '📚'}
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              {filter === 'completed' 
                ? 'No completed courses yet'
                : filter === 'in-progress'
                ? 'No courses in progress'
                : 'No enrolled courses'}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? 'Start your learning journey by enrolling in a course'
                : `Switch to "All Courses" to see your enrolled courses`}
            </p>
            {filter === 'all' && (
              <Button
                variant="primary"
                onClick={() => navigate(config.routes.courses)}
              >
                Browse Courses
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {sortedCourses.map((course) => (
              <LearningCourseCard
                key={course._id}
                course={course}
                onContinue={(id) => navigate(`/courses/${id}/learn`)}
              />
            ))}
          </div>
        )}

        {/* Learning Tips */}
        {sortedCourses.length > 0 && (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                💡 Learning Tips
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Set aside dedicated time each day for learning to build consistency</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Take notes and practice what you learn to reinforce your understanding</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Complete one course before starting another to avoid overwhelm</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Join live sessions and discussions to enhance your learning experience</span>
                </li>
              </ul>
            </div>
          </Card>
        )}
      </div>
    </>
  );
};

export default MyLearning;