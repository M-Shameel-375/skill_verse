import React from 'react';
import { FaCheckCircle, FaClock } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Card from '../common/Card';

const CourseProgress = ({ progress = {}, sections = [] }) => {
  const overallProgress = progress.percentage || 0;
  const completedLectures = progress.completedLectures || 0;
  const totalLectures = sections?.reduce((sum, sec) => sum + (sec.lectures?.length || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Course Progress</h3>
          <div className="flex items-center justify-between mb-6">
            <div className="relative w-24 h-24">
              <svg className="transform -rotate-90" width="100" height="100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                <motion.circle cx="50" cy="50" r="45" fill="none" stroke="#3b82f6" strokeWidth="8" strokeDasharray="282.7" initial={{ strokeDashoffset: 282.7 }} animate={{ strokeDashoffset: 282.7 * (1 - overallProgress / 100) }} transition={{ duration: 1, ease: 'easeInOut' }} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">{overallProgress}%</span>
              </div>
            </div>
            <div className="flex-1 ml-8 space-y-2">
              <div className="flex items-center gap-3">
                <FaCheckCircle className="text-green-600 text-xl" />
                <span className="text-gray-700">{completedLectures} of {totalLectures} lectures completed</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <FaClock className="text-xl" />
                <span>Continue learning</span>
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div className="bg-blue-600 h-3 rounded-full" initial={{ width: 0 }} animate={{ width: `${overallProgress}%` }} transition={{ duration: 0.5, ease: 'easeInOut' }} />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CourseProgress;
