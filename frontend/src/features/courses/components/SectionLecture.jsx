import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaPlay, FaLock, FaCheckCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDuration } from '../../utils/helpers';

const SectionLecture = ({ section, isEnrolled, onLectureSelect, currentLectureId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const completedLectures = section.lectures?.filter((l) => l.isCompleted)?.length || 0;
  const progressPercentage = section.lectures?.length ? Math.floor((completedLectures / section.lectures.length) * 100) : 0;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button onClick={() => setIsExpanded(!isExpanded)} className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors">
        <div className="flex items-center gap-4 flex-1">
          {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">{section.title}</h3>
            <p className="text-sm text-gray-600">{completedLectures} of {section.lectures?.length || 0} lectures completed</p>
          </div>
        </div>
        <div className="flex items-center gap-3 ml-4">
          <div className="w-20 h-2 bg-gray-300 rounded-full">
            <div className="h-2 bg-green-500 rounded-full transition-all" style={{ width: `${progressPercentage}%` }} />
          </div>
          <span className="text-sm font-medium text-gray-700 w-10 text-right">{progressPercentage}%</span>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="divide-y divide-gray-200">
            {section.lectures?.map((lecture, index) => (
              <div key={lecture._id} className={`px-6 py-3 flex items-center justify-between transition-colors ${currentLectureId === lecture._id ? 'bg-blue-50 border-l-4 border-blue-600' : 'hover:bg-gray-50'}`}>
                <button onClick={() => isEnrolled && onLectureSelect?.(lecture._id)} className="flex items-center gap-3 flex-1 text-left disabled:cursor-not-allowed" disabled={!isEnrolled}>
                  {isEnrolled ? (lecture.isCompleted ? <FaCheckCircle className="text-green-500 flex-shrink-0" /> : <FaPlay className="text-gray-400 flex-shrink-0 text-sm" />) : <FaLock className="text-gray-400 flex-shrink-0" />}
                  <div>
                    <h4 className={`font-medium ${isEnrolled ? (lecture.isCompleted ? 'text-gray-600 line-through' : currentLectureId === lecture._id ? 'text-blue-600' : 'text-gray-900') : 'text-gray-500'}`}>
                      {index + 1}. {lecture.title}
                    </h4>
                    {lecture.description && <p className="text-sm text-gray-600 line-clamp-1">{lecture.description}</p>}
                  </div>
                </button>
                <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                  <span className="text-sm text-gray-600">{formatDuration(lecture.duration)}</span>
                  {lecture.isCompleted && <FaCheckCircle className="text-green-500" />}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SectionLecture;
