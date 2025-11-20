import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaMapPin, FaLink, FaEdit, FaCamera } from 'react-icons/fa';
import Button from '../common/Button';
import Card from '../common/Card';

const ProfileHeader = ({ profile, isOwnProfile, onEdit }) => {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <Card>
      <div className="relative">
        {/* Cover Image */}
        <div
          className="h-40 bg-gradient-to-r from-blue-500 to-purple-600"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {isOwnProfile && isHovering && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 w-full h-full"
            >
              <FaCamera className="text-white text-3xl" />
            </motion.button>
          )}
        </div>

        {/* Profile Content */}
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-16 mb-4">
            {/* Avatar */}
            <div
              className="relative"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <img
                src={profile?.avatar || `https://i.pravatar.cc/128?img=${profile?._id}`}
                alt={profile?.name}
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
              />
              {isOwnProfile && isHovering && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                >
                  <FaCamera />
                </motion.button>
              )}
            </div>

            {/* Edit Button */}
            {isOwnProfile && (
              <Button icon={<FaEdit />} onClick={onEdit}>
                Edit Profile
              </Button>
            )}
          </div>

          {/* Info */}
          <div className="space-y-2 mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{profile?.name}</h1>
            <p className="text-lg text-gray-600">{profile?.title || 'Learning Enthusiast'}</p>

            {/* Bio */}
            <p className="text-gray-700 max-w-2xl">{profile?.bio}</p>

            {/* Details */}
            <div className="flex flex-wrap gap-4 pt-2 text-sm text-gray-600">
              {profile?.location && (
                <div className="flex items-center gap-1">
                  <FaMapPin className="text-gray-400" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile?.website && (
                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:text-blue-700">
                  <FaLink className="text-gray-400" />
                  <span>Website</span>
                </a>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-600">Rating</p>
              <div className="flex items-center gap-1">
                <FaStar className="text-yellow-500" />
                <p className="text-xl font-bold text-gray-900">{profile?.rating || 0}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Courses Taken</p>
              <p className="text-xl font-bold text-gray-900">{profile?.coursesTaken || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Skills</p>
              <p className="text-xl font-bold text-gray-900">{profile?.skillsCount || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Badges</p>
              <p className="text-xl font-bold text-gray-900">{profile?.badgesCount || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProfileHeader;
