import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FaStar, FaUsers, FaHeart, FaRegHeart, FaClock } from 'react-icons/fa';
import Button from '../common/Button';
import Card from '../common/Card';
import { formatCurrency, formatDuration } from '../../utils/helpers';
import toast from 'react-hot-toast';

const CourseCard = ({ course, onWishlistChange, loading = false }) => {
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleWishlist = (e) => {
    e.preventDefault();
    setIsWishlisted(!isWishlisted);
    if (onWishlistChange) {
      onWishlistChange(course._id, !isWishlisted);
    }
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleCourseClick = () => {
    navigate(`/courses/${course._id}`);
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Card
        hoverable
        onClick={handleCourseClick}
        className="h-full cursor-pointer flex flex-col overflow-hidden"
      >
        {/* Course Image */}
        <div className="relative h-48 overflow-hidden bg-gray-200">
          {course.thumbnail?.url ? (
            <img
              src={course.thumbnail.url}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <FaClock className="text-3xl" />
            </div>
          )}

          {/* Badge */}
          <div className="absolute top-3 right-3">
            {course.price === 0 ? (
              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Free
              </span>
            ) : (
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {course.level?.charAt(0).toUpperCase() + course.level?.slice(1)}
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlist}
            className="absolute top-3 left-3 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow"
          >
            {isWishlisted ? (
              <FaHeart className="text-red-500" />
            ) : (
              <FaRegHeart className="text-gray-400" />
            )}
          </button>
        </div>

        {/* Course Content */}
        <div className="flex flex-col flex-1 p-4">
          {/* Category */}
          <div className="mb-2">
            <span className="text-xs font-semibold text-blue-600 uppercase">
              {course.category}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
            {course.title}
          </h3>

          {/* Instructor */}
          <p className="text-sm text-gray-600 mb-3">
            By {course.instructor?.name || 'Unknown'}
          </p>

          {/* Short Description */}
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {course.shortDescription}
          </p>

          {/* Rating & Students */}
          <div className="flex items-center justify-between mb-3 py-2 border-y border-gray-200">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={i < Math.floor(course.rating?.average || 0) ? 'text-yellow-400' : 'text-gray-300'}
                    size={12}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {course.rating?.average?.toFixed(1) || '0.0'}
              </span>
            </div>

            <div className="flex items-center gap-1 text-sm text-gray-600">
              <FaUsers size={12} />
              <span>{course.enrolledCount || 0}</span>
            </div>
          </div>

          {/* Duration */}
          <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
            <FaClock size={14} />
            <span>{formatDuration(course.duration)}</span>
          </div>

          {/* Price & Button */}
          <div className="mt-auto space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(course.price)}
                </div>
                {course.originalPrice && course.originalPrice > course.price && (
                  <div className="text-sm text-gray-500 line-through">
                    {formatCurrency(course.originalPrice)}
                  </div>
                )}
              </div>
            </div>

            <Button
              variant="primary"
              fullWidth
              size="sm"
              onClick={handleCourseClick}
              loading={loading}
            >
              View Course
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default CourseCard;
