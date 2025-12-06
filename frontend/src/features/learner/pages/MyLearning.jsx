import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  FaPlay,
  FaCheck,
  FaClock,
  FaBook,
  FaFilter,
  FaSpinner,
} from 'react-icons/fa';
import { getEnrolledCourses } from '@/api/courseApi';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

// ============================================
// HELPER FUNCTIONS
// ============================================
const formatDuration = (minutes) => {
  if (!minutes) return 'N/A';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
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
// STATS CARD COMPONENT
// ============================================
const StatsCard = ({ icon: Icon, title, value, color }) => (
  <Card>
    <CardContent className="p-6 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="text-2xl text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </CardContent>
  </Card>
);

// ============================================
// LEARNING COURSE CARD COMPONENT
// ============================================
const LearningCourseCard = ({ course, onContinue }) => {
  const progress = course.progress || 0;
  const completedLectures = course.completedLectures || 0;
  const totalLectures = course.totalLectures || course.lessonsCount || 0;

  return (
    <Card>
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Thumbnail */}
        <div className="w-full sm:w-48 h-32 flex-shrink-0 overflow-hidden">
          <img
            src={course.thumbnail?.url || course.thumbnail || '/placeholder-course.jpg'}
            alt={course.title}
            className="w-full h-full object-cover rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none"
            onError={(e) => {
              e.target.src = '/placeholder-course.jpg';
            }}
          />
        </div>

        {/* Content */}
        <CardContent className="flex-1 p-4 sm:p-0 sm:pr-4 sm:py-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {course.title}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                By {course.instructor?.name || 'Unknown Instructor'}
              </p>
            </div>

            {progress >= 100 && (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center gap-1">
                <FaCheck className="h-3 w-3" />
                Completed
              </span>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-700 font-medium">{Math.round(progress)}% complete</span>
              <span className="text-gray-600">{completedLectures}/{totalLectures} lectures</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>

          {/* Stats & Last Accessed */}
          <div className="flex items-center gap-6 mb-3 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <FaClock className="h-3 w-3" />
              <span>{formatDuration(course.duration)}</span>
            </div>
            <div className="flex items-center gap-1">
              <FaBook className="h-3 w-3" />
              <span>{totalLectures} lectures</span>
            </div>
          </div>

          {course.lastAccessed && (
            <p className="text-xs text-gray-500 mb-3">
              Last accessed {formatDate(course.lastAccessed)}
            </p>
          )}

          {/* Action Button */}
          <Button
            variant={progress >= 100 ? 'outline' : 'default'}
            size="sm"
            onClick={() => onContinue(course._id)}
          >
            {progress >= 100 ? (
              <>
                <FaCheck className="mr-2 h-3 w-3" /> Review Course
              </>
            ) : progress > 0 ? (
              <>
                <FaPlay className="mr-2 h-3 w-3" /> Continue
              </>
            ) : (
              <>
                <FaPlay className="mr-2 h-3 w-3" /> Start
              </>
            )}
          </Button>
        </CardContent>
      </div>
    </Card>
  );
};

// ============================================
// MY LEARNING PAGE COMPONENT
// ============================================
const MyLearning = () => {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Fetch enrolled courses
  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getEnrolledCourses();
      const data = response?.data?.data || response?.data || [];
      setCourses(Array.isArray(data) ? data : data.courses || []);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Calculate statistics
  const stats = {
    total: courses.length,
    inProgress: courses.filter((c) => (c.progress || 0) > 0 && (c.progress || 0) < 100).length,
    completed: courses.filter((c) => (c.progress || 0) >= 100).length,
    totalHours: Math.round(
      courses.reduce((sum, c) => sum + ((c.duration || 0) / 60), 0)
    ),
  };

  // Filter courses
  const filteredCourses = courses.filter((course) => {
    const progress = course.progress || 0;
    if (filter === 'in-progress') return progress > 0 && progress < 100;
    if (filter === 'completed') return progress >= 100;
    if (filter === 'not-started') return progress === 0;
    return true;
  });

  // Sort by last accessed
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    if (!a.lastAccessed) return 1;
    if (!b.lastAccessed) return -1;
    return new Date(b.lastAccessed) - new Date(a.lastAccessed);
  });

  const handleContinue = (courseId) => {
    navigate(`/courses/${courseId}/learn`);
  };

  return (
    <>
      <Helmet>
        <title>My Learning | SkillVerse</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Learning</h1>
          <p className="text-gray-600">
            Track your progress and continue where you left off
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            icon={FaBook}
            title="Total Courses"
            value={stats.total}
            color="bg-blue-600"
          />
          <StatsCard
            icon={FaPlay}
            title="In Progress"
            value={stats.inProgress}
            color="bg-yellow-600"
          />
          <StatsCard
            icon={FaCheck}
            title="Completed"
            value={stats.completed}
            color="bg-green-600"
          />
          <StatsCard
            icon={FaClock}
            title="Total Hours"
            value={stats.totalHours}
            color="bg-purple-600"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter:</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {[
              { value: 'all', label: 'All Courses' },
              { value: 'in-progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' },
              { value: 'not-started', label: 'Not Started' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === option.value
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
          <div className="flex items-center justify-center py-12">
            <FaSpinner className="animate-spin text-3xl text-blue-600 mr-3" />
            <span className="text-gray-600">Loading courses...</span>
          </div>
        ) : sortedCourses.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">
              {filter === 'completed' ? '🎓' : filter === 'in-progress' ? '📖' : '📚'}
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              {filter === 'completed'
                ? 'No completed courses yet'
                : filter === 'in-progress'
                  ? 'No courses in progress'
                  : filter === 'not-started'
                    ? 'All courses have been started'
                    : 'No enrolled courses'}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all'
                ? 'Start your learning journey by enrolling in a course'
                : 'Try a different filter to see your courses'}
            </p>
            {filter === 'all' && (
              <Button onClick={() => navigate('/courses')}>
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
                onContinue={handleContinue}
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
                  <span>Set aside dedicated time each day for learning</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Take notes and practice what you learn</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Complete one course before starting another</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Join discussions to enhance your learning</span>
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