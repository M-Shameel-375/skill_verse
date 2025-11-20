import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaTrash, FaCheck } from 'react-icons/fa';
import Button from '../common/Button';
import Card from '../common/Card';

const QuestionBuilder = ({ question, onUpdate, onDelete, questionIndex }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [options, setOptions] = useState(question?.options || ['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(question?.correctAnswer || 0);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
      if (correctAnswer >= newOptions.length) {
        setCorrectAnswer(newOptions.length - 1);
      }
    }
  };

  const handleSave = () => {
    onUpdate({
      ...question,
      question: question.question,
      options,
      correctAnswer,
    });
    setIsExpanded(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mb-4"
    >
      <Card>
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
        >
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Question {questionIndex + 1}</h3>
            <p className="text-sm text-gray-600 line-clamp-1">{question?.question || 'Click to edit'}</p>
          </div>
          <div className="text-right">
            {options.length > 0 && (
              <p className="text-xs text-gray-500">{options.length} options</p>
            )}
          </div>
        </div>

        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="border-t border-gray-200 p-4 space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
              <textarea
                value={question?.question || ''}
                onChange={(e) => onUpdate({ ...question, question: e.target.value })}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter question text"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
              <div className="space-y-2">
                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <input
                      type="radio"
                      checked={correctAnswer === idx}
                      onChange={() => setCorrectAnswer(idx)}
                      className="w-4 h-4"
                    />
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      placeholder={`Option ${idx + 1}`}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    {options.length > 2 && (
                      <button
                        onClick={() => handleRemoveOption(idx)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddOption}
                icon={<FaPlus />}
              >
                Add Option
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={handleSave}
                icon={<FaCheck />}
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => onDelete(questionIndex)}
                icon={<FaTrash />}
              >
                Delete
              </Button>
            </div>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
};

export default QuestionBuilder;
