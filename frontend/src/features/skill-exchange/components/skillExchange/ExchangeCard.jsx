import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUser, FaStar, FaClock, FaArrowRight } from 'react-icons/fa';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

const ExchangeCard = ({ exchange }) => {
  const navigate = useNavigate();

  const handleViewDetail = () => {
    navigate(`/skill-exchange/${exchange._id}`);
  };

  return (
    <motion.div whileHover={{ y: -4 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card hoverable>
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                  {exchange.offering}
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                  Seeking: {exchange.seeking}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">{exchange.title}</h3>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 line-clamp-2">{exchange.description}</p>

          {/* User & Stats */}
          <div className="flex items-center justify-between py-3 border-y border-gray-200 text-sm">
            <div className="flex items-center gap-2">
              <img
                src={exchange.user?.avatar || `https://i.pravatar.cc/32?img=${exchange.user?._id}`}
                alt={exchange.user?.name}
                className="w-8 h-8 rounded-full"
              />
              <span className="text-gray-700">{exchange.user?.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <FaStar className="text-yellow-500" />
              <span className="font-semibold">{exchange.user?.rating || 0}</span>
            </div>
          </div>

          {/* Info */}
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <FaClock />
              <span>{exchange.duration || '1-2 hours'}/session</span>
            </div>
            <span className="text-gray-400">{exchange.matchCount || 0} interested</span>
          </div>

          {/* Action */}
          <Button
            variant="primary"
            fullWidth
            onClick={handleViewDetail}
            icon={<FaArrowRight />}
          >
            View Details
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default ExchangeCard;
