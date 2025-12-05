import React, { useState, useEffect } from 'react';
import { FaClock, FaChevronRight, FaSpinner } from 'react-icons/fa';
import Button from '../common/Button';
import Card from '../common/Card';
import toast from 'react-hot-toast';
import { submitQuiz } from '../../../api/quizApi';

const QuizTaker = ({ quiz, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(quiz?.timeLimit * 60 || 1800);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAnswer = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (submitting || submitted) return;
    
    try {
      setSubmitting(true);
      const timeUsed = quiz.timeLimit * 60 - timeLeft;
      
      // Format answers for API
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
      }));
      
      const response = await submitQuiz(quiz._id, {
        answers: formattedAnswers,
        timeSpent: timeUsed,
      });
      
      const result = response.data?.data || response.data;
      setSubmitted(true);
      
      if (onComplete) {
        onComplete({
          answers,
          score: result.score || calculateScore(),
          correctCount: result.correctCount || 0,
          timeUsed,
          ...result,
        });
      }
      toast.success(`Quiz submitted! Score: ${result.score || calculateScore()}%`);
    } catch (error) {
      // Fallback to local calculation if API fails
      const score = calculateScore();
      setSubmitted(true);
      if (onComplete) {
        onComplete({ answers, score, timeUsed: quiz.timeLimit * 60 - timeLeft });
      }
      toast.success(`Quiz submitted! Score: ${score}%`);
    } finally {
      setSubmitting(false);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    quiz.questions.forEach((q) => {
      if (answers[q._id] === q.correctAnswer) {
        correct++;
      }
    });
    return Math.floor((correct / quiz.questions.length) * 100);
  };

  const question = quiz.questions[currentQuestion];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (submitted) {
    return <div>Quiz submitted successfully!</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{quiz.title}</h2>
              <p className="text-gray-600">
                Question {currentQuestion + 1} of {quiz.questions.length}
              </p>
            </div>
            <div className="flex items-center gap-2 text-lg font-semibold text-red-600">
              <FaClock />
              {minutes}:{seconds.toString().padStart(2, '0')}
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
            />
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">{question.question}</h3>
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(question._id, option)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    answers[question._id] === option
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="answer"
                    checked={answers[question._id] === option}
                    readOnly
                    className="mr-3"
                  />
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}>
              Previous
            </Button>
            {currentQuestion === quiz.questions.length - 1 ? (
              <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? <><FaSpinner className="animate-spin mr-2" /> Submitting...</> : 'Submit Quiz'}
              </Button>
            ) : (
              <Button variant="primary" onClick={handleNext}>
                Next <FaChevronRight />
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Questions</h3>
          <div className="grid grid-cols-5 gap-2">
            {quiz.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`p-2 rounded text-center font-medium transition ${
                  currentQuestion === index
                    ? 'bg-blue-600 text-white'
                    : answers[quiz.questions[index]._id]
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default QuizTaker;
