import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaStar, FaClock, FaArrowRight } from 'react-icons/fa';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const ExchangeCard = ({ exchange }) => {
  const navigate = useNavigate();

  const handleViewDetail = () => {
    navigate(`/skill-exchange/${exchange._id}`);
  };

  // Safe data access with fallbacks
  const title = exchange.title || `${exchange.offering} ↔ ${exchange.seeking}`;
  const userName = exchange.user?.name || 'Unknown User';
  const userAvatar = exchange.user?.avatar || exchange.user?.profileImage?.url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}`;
  const userRating = exchange.user?.rating || 0;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full hover:shadow-lg transition-shadow">
        <div className="p-6 space-y-4">
          {/* Header - Skills */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                  Offers: {exchange.offering || 'N/A'}
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                  Seeks: {exchange.seeking || 'N/A'}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{title}</h3>
            </div>
          </div>

          {/* Description */}
          {exchange.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{exchange.description}</p>
          )}

          {/* User Info */}
          <div className="flex items-center justify-between py-3 border-y border-gray-200 text-sm">
            <div className="flex items-center gap-2">
              <img
                src={userAvatar}
                alt={userName}
                className="w-8 h-8 rounded-full object-cover"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}`;
                }}
              />
              <span className="text-gray-700 font-medium">{userName}</span>
            </div>
            {userRating > 0 && (
              <div className="flex items-center gap-1">
                <FaStar className="text-yellow-500 h-3 w-3" />
                <span className="font-semibold">{userRating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <FaClock className="h-3 w-3" />
              <span>{exchange.duration || '1-2'} hours/session</span>
            </div>
            <span className="text-gray-400">{exchange.matchCount || 0} interested</span>
          </div>

          {/* Action Button */}
          <Button
            variant="primary"
            fullWidth
            onClick={handleViewDetail}
            className="mt-2"
          >
            View Details <FaArrowRight className="ml-2 h-3 w-3" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default ExchangeCard;