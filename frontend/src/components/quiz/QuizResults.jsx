import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle, FaTrophy, FaArrowLeft, FaDownload } from 'react-icons/fa';
import Button from '../common/Button';
import Card from '../common/Card';
import toast from 'react-hot-toast';

const QuizResults = ({ results, quiz, onRetry, onExit }) => {
  const navigate = useNavigate();
  const isPassed = results.score >= (quiz?.passingScore || 60);
  const correctAnswers = results.correctCount || 0;
  const totalQuestions = quiz?.questions?.length || 1;

  const handleDownloadCertificate = () => {
    toast.success('Certificate download started');
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-2xl w-full">
        <Card>
          <div className="p-8 text-center space-y-8">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
              {isPassed ? (
                <FaCheckCircle className="text-6xl text-green-500 mx-auto" />
              ) : (
                <FaTimesCircle className="text-6xl text-red-500 mx-auto" />
              )}
            </motion.div>

            <div>
              <h1 className={`text-4xl font-bold mb-2 ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
                {isPassed ? 'Congratulations!' : 'Try Again'}
              </h1>
              <p className="text-gray-600">
                {isPassed ? 'You have passed the quiz!' : 'You did not pass this time. Keep learning!'}
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-50 rounded-lg p-8 space-y-4"
            >
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-gray-600 text-sm">Score</p>
                  <p className="text-3xl font-bold text-gray-900">{results.score}%</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Correct</p>
                  <p className="text-3xl font-bold text-green-600">
                    {correctAnswers}/{totalQuestions}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Time</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {Math.floor(results.timeUsed / 60)}m {results.timeUsed % 60}s
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="space-y-2 text-left">
              <h3 className="text-lg font-semibold text-gray-900">Performance Breakdown</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                  <span className="text-gray-700">Correct Answers</span>
                  <span className="font-semibold text-green-600">{correctAnswers}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded">
                  <span className="text-gray-700">Incorrect Answers</span>
                  <span className="font-semibold text-red-600">{totalQuestions - correctAnswers}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button variant="outline" fullWidth onClick={onExit || (() => navigate(-1))} icon={<FaArrowLeft />}>
                Exit
              </Button>
              {isPassed && (
                <Button variant="primary" fullWidth onClick={handleDownloadCertificate} icon={<FaDownload />}>
                  Download Certificate
                </Button>
              )}
              <Button variant="primary" fullWidth onClick={onRetry} icon={<FaTrophy />}>
                Retake Quiz
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default QuizResults;
