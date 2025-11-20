import React from 'react';
import { motion } from 'framer-motion';
import { FaBook, FaCheckCircle, FaClock, FaFire } from 'react-icons/fa';
import Card from '../common/Card';

const ProgressChart = ({ progress = {} }) => {
  const defaultProgress = {
    coursesCompleted: 5,
    coursesInProgress: 3,
    hoursLearned: 148,
    streakDays: 12,
    skillsAcquired: 18,
  };

  const data = { ...defaultProgress, ...progress };

  const stats = [
    { icon: FaCheckCircle, label: 'Completed', value: data.coursesCompleted, color: 'green' },
    { icon: FaClock, label: 'In Progress', value: data.coursesInProgress, color: 'blue' },
    { icon: FaBook, label: 'Hours Learned', value: data.hoursLearned, color: 'purple' },
    { icon: FaFire, label: 'Learning Streak', value: `${data.streakDays}d`, color: 'orange' },
  ];

  const colorClasses = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <Card>
      <div className="p-6 space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Learning Progress</h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg ${colorClasses[stat.color]}`}
              >
                <Icon className="text-2xl mb-2" />
                <p className="text-sm font-medium opacity-80">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Progress Bars */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-semibold text-gray-900">Overall Learning Progress</label>
              <span className="text-sm text-gray-600">75%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '75%' }}
                transition={{ delay: 0.3, duration: 1 }}
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-semibold text-gray-900">Skills Mastery</label>
              <span className="text-sm text-gray-600">62%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '62%' }}
                transition={{ delay: 0.4, duration: 1 }}
                className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-semibold text-gray-900">Community Engagement</label>
              <span className="text-sm text-gray-600">88%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '88%' }}
                transition={{ delay: 0.5, duration: 1 }}
                className="h-full bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Recent Milestones</h3>
          <div className="space-y-2">
            {[
              '🎯 Completed React Advanced Course',
              '🔥 7-day learning streak achieved',
              '⭐ Earned Expert badge in JavaScript',
              '🏆 Reached top 10% of learners',
            ].map((milestone, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + idx * 0.1 }}
                className="p-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
              >
                {milestone}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProgressChart;
