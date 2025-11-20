import React from 'react';
import { motion } from 'framer-motion';
import { FaMedal, FaTrophy, FaFire, FaCertificate } from 'react-icons/fa';
import Card from '../common/Card';

const BadgesList = ({ badges }) => {
  const badgeIcons = {
    rookie: <FaMedal className="text-gray-400" />,
    achiever: <FaTrophy className="text-yellow-500" />,
    expert: <FaFire className="text-red-500" />,
    master: <FaCertificate className="text-purple-600" />,
  };

  const badgeDescriptions = {
    rookie: 'Completed your first course',
    achiever: 'Earned a certificate',
    expert: 'Completed 5 courses',
    master: 'Achieved expert level in a skill',
    quickLearner: 'Completed a course in record time',
    activeParticipant: 'Participated in 10 live sessions',
  };

  return (
    <Card>
      <div className="p-6 space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Badges & Achievements</h2>

        {badges && badges.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {badges.map((badge, index) => (
              <motion.div
                key={badge._id || index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="group relative"
              >
                <div className="flex flex-col items-center text-center p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="text-4xl mb-2">{badgeIcons[badge.type] || <FaMedal />}</div>
                  <h3 className="font-semibold text-sm text-gray-900 line-clamp-2">{badge.name}</h3>
                  <p className=\"text-xs text-gray-600 mt-1\">{badge.earnedDate ? new Date(badge.earnedDate).toLocaleDateString() : 'Earned'}</p>\n                </div>\n                {/* Tooltip */}\n                <div className=\"absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-40 p-2 bg-gray-900 text-white text-xs rounded-lg whitespace-normal\">\n                  {badgeDescriptions[badge.type] || badge.description}\n                </div>\n              </motion.div>\n            ))}\n          </div>\n        ) : (\n          <div className=\"text-center py-12\">\n            <p className=\"text-gray-600 mb-4\">No badges earned yet</p>\n            <p className=\"text-sm text-gray-500\">Complete courses and participate in live sessions to earn badges!</p>\n          </div>\n        )}\n      </div>\n    </Card>\n  );\n};\n\nexport default BadgesList;
