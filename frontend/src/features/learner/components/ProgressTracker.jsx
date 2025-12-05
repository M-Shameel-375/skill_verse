// ============================================
// PROGRESS TRACKER COMPONENT
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import { FaChartLine, FaBook, FaClock, FaTrophy, FaSpinner, FaFire } from 'react-icons/fa';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { getEnrolledCourses } from '@/api/courseApi';
import { getUserStatistics } from '@/api/userApi';
import { motion } from 'framer-motion';

const ProgressTracker = ({ userId }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    totalHoursLearned: 0,
    currentStreak: 0,
    averageProgress: 0,
  });
  const [recentProgress, setRecentProgress] = useState([]);

  // Fetch progress data
  const fetchProgress = useCallback(async () => {
    try {
      setLoading(true);
      
      const [coursesRes, statsRes] = await Promise.all([
        getEnrolledCourses().catch(() => ({ data: { courses: [] } })),
        getUserStatistics().catch(() => ({ data: {} })),
      ]);

      const courses = coursesRes.data?.courses || [];
      const userStats = statsRes.data || {};

      const completed = courses.filter(c => c.progress >= 100).length;
      const inProgress = courses.filter(c => c.progress > 0 && c.progress < 100).length;
      const avgProgress = courses.length > 0 
        ? courses.reduce((acc, c) => acc + (c.progress || 0), 0) / courses.length 
        : 0;

      setStats({
        totalCourses: courses.length,
        completedCourses: completed,
        inProgressCourses: inProgress,
        totalHoursLearned: userStats.totalHoursLearned || Math.floor(avgProgress * courses.length / 10),
        currentStreak: userStats.currentStreak || 0,
        averageProgress: Math.round(avgProgress),
      });

      // Get recent progress for chart
      setRecentProgress(courses.slice(0, 5).map(course => ({
        name: course.title?.substring(0, 20) + '...' || 'Course',
        progress: course.progress || 0,
      })));

    } catch (error) {
      console.error('Failed to fetch progress:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <FaSpinner className="animate-spin text-2xl text-blue-600" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <FaBook className="mx-auto text-2xl text-blue-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
            <p className="text-sm text-gray-600">Total Courses</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <FaTrophy className="mx-auto text-2xl text-green-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.completedCourses}</p>
            <p className="text-sm text-gray-600">Completed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <FaClock className="mx-auto text-2xl text-purple-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.totalHoursLearned}h</p>
            <p className="text-sm text-gray-600">Hours Learned</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <FaFire className="mx-auto text-2xl text-orange-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.currentStreak}</p>
            <p className="text-sm text-gray-600">Day Streak</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Circle */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="relative w-32 h-32">
              <svg className="transform -rotate-90" width="128" height="128">
                <circle cx="64" cy="64" r="56" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                <motion.circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="12"
                  strokeDasharray="352"
                  initial={{ strokeDashoffset: 352 }}
                  animate={{ strokeDashoffset: 352 * (1 - stats.averageProgress / 100) }}
                  transition={{ duration: 1, ease: 'easeInOut' }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-gray-900">{stats.averageProgress}%</span>
              </div>
            </div>
          </div>
          <p className="text-center text-gray-600">
            {stats.completedCourses} of {stats.totalCourses} courses completed
          </p>
        </CardContent>
      </Card>

      {/* Recent Progress */}
      {recentProgress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProgress.map((course, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 truncate">{course.name}</span>
                    <span className="text-gray-600">{course.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-blue-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${course.progress}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProgressTracker;
