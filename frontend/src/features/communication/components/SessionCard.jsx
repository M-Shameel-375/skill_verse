import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaClock, FaUsers, FaMapPin, FaArrowRight, FaCheck } from 'react-icons/fa';
import Button from '../common/Button';
import Card from '../common/Card';

const SessionCard = ({ session, isRegistered, onRegister }) => {
  const navigate = useNavigate();

  const handleViewDetail = () => {
    navigate(`/live-sessions/${session._id}`);
  };

  const handleRegister = () => {
    if (onRegister) onRegister(session._id);
  };

  return (
    <motion.div whileHover={{ y: -4 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card hoverable>
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{session.title}</h3>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{session.description}</p>
            </div>
            {isRegistered && (
              <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                <FaCheck />
                Registered
              </div>
            )}
          </div>

          {/* Instructor */}
          <div className="flex items-center gap-2 py-3 border-y border-gray-200">
            <img
              src={session.instructor?.avatar || `https://i.pravatar.cc/32?img=${session.instructor?._id}`}
              alt={session.instructor?.name}
              className="w-8 h-8 rounded-full"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{session.instructor?.name}</p>
              <p className="text-xs text-gray-600">{session.instructor?.expertise}</p>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <FaClock className="text-blue-600" />
              <span>{new Date(session.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaUsers className="text-blue-600" />
              <span>{session.registeredCount}/{session.maxParticipants}</span>
            </div>
            <div className="flex items-center gap-2 col-span-2">
              <FaMapPin className="text-blue-600" />
              <span>{session.location}</span>
            </div>
          </div>

          {/* Category Tag */}
          <div className="flex gap-2">
            {session.category && (
              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                {session.category}
              </span>
            )}
            {session.difficulty && (
              <span className={`px-2 py-1 text-xs font-semibold rounded ${
                session.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                session.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {session.difficulty}
              </span>
            )}
          </div>

          {/* Action */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              fullWidth
              onClick={handleViewDetail}
              icon={<FaArrowRight />}
            >
              Details
            </Button>
            {!isRegistered && (
              <Button
                variant="primary"
                fullWidth
                onClick={handleRegister}
              >
                Register
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default SessionCard;
