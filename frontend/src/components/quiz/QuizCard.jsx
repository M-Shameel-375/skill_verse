import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaClock, FaQuestionCircle, FaTrophy, FaArrowRight } from 'react-icons/fa';
import Button from '../common/Button';
import Card from '../common/Card';

const QuizCard = ({ quiz, courseId, onStart }) => {
  const navigate = useNavigate();
  const [hasAttempted, setHasAttempted] = useState(false);

  const handleStart = () => {
    if (onStart) onStart(quiz._id);
    else navigate(`/courses/${courseId}/quiz/${quiz._id}/attempt`);
  };

  const score = quiz.userAttempts?.[0]?.score || null;
  const isPassed = score >= (quiz.passingScore || 60);

  return (
    <motion.div whileHover={{ y: -4 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card hoverable>
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{quiz.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">{quiz.description}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FaQuestionCircle className="text-blue-600 text-xl" />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600 py-3 border-y border-gray-200">
            <div className="flex items-center gap-2">
              <FaQuestionCircle className="text-blue-600" />
              <span>{quiz.questions?.length || 0} questions</span>
            </div>
            <div className="flex items-center gap-2">
              <FaClock className="text-blue-600" />
              <span>{quiz.timeLimit}m</span>
            </div>
            <div className="flex items-center gap-2">
              <FaTrophy className="text-blue-600" />
              <span>Pass: {quiz.passingScore || 60}%</span>
            </div>
          </div>

          {score !== null && (
            <div className={`p-3 rounded-lg ${isPassed ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className="text-sm text-gray-600">Your Score</p>
              <div className={`text-2xl font-bold ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
                {score}%
              </div>
            </div>
          )}

          <Button
            variant={score !== null && isPassed ? 'outline' : 'primary'}
            fullWidth
            onClick={handleStart}
            icon={<FaArrowRight />}
          >
            {score !== null ? 'Retake Quiz' : 'Start Quiz'}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default QuizCard;
