// Courses page
// ============================================
// COURSES PAGE
// ============================================

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  FaSearch,
  FaFilter,
  FaStar,
  FaUsers,
  FaClock,
  FaBookmark,
  FaRegBookmark,
  FaChevronDown,
} from 'react-icons/fa';
import {
  getCourses,
  searchCourses,
  selectCourses,
  selectCourseLoading,
  selectCoursePagination,
  selectCourseFilters,
  setFilters,
  clearFilters,
  setCurrentPage,
} from '../redux/slices/courseSlice';
import config from '../config';
import { COURSE_CATEGORIES, COURSE_LEVELS } from '../utils/constants';
import Card, { CardImage, CardBadge } from '../components/common/Card';
import Button from '../components/common/Button';
import { CardSkeletonLoader } from '../components/common/Loader';
import { formatCurrency, formatDuration } from '../utils/helpers';
import { useDebounce } from '../hooks/useDebounce';

// ============================================
// COURSE CARD COMPONENT
// ============================================
const CourseCard = ({ course }) => {
  const navigate = useNavigate();
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
    // TODO: Implement bookmark API call
  };

  return (
    <Card 
      hoverable 
      className="h-full cursor-pointer"
      onClick={() => navigate(`/courses/${course._id}`)}
    >
      <div className="relative">
        <CardImage
          src={course.thumbnail?.url || 'https://via.placeholder.com/400x225'}
          alt={course.title}
          aspectRatio="16/9"
        />
        
        {/* Bookmark Button */}
        <button
          onClick={handleBookmark}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
        >
          {isBookmarked ? (
            <FaBookmark className="text-blue-600" />
          ) : (
            <FaRegBookmark className="text-gray-600" />
          )}
        </button>

        {/* Bestseller Badge */}
        {course.isBestseller && (
          <div className="absolute top-2 left-2">
            <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded">
              BESTSELLER
            </span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        {/* Category */}
        <CardBadge variant="primary" className="mb-2">
          {course.category}
        </CardBadge>
        
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {course.title}
        </h3>
        
        {/* Instructor */}
        <p className="text-sm text-gray-600 mb-3">
          By {course.instructor?.name}
        </p>
        
        {/* Rating & Students */}
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1">
            <FaStar className="text-yellow-500 text-sm" />
            <span className="text-sm font-medium">
              {course.rating?.average?.toFixed(1) || '0.0'}
            </span>
            <span className="text-sm text-gray-500">
              ({course.rating?.count || 0})
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <FaUsers className="text-sm" />
            <span>{course.enrolledCount || 0}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <FaClock className="text-sm" />
            <span>{formatDuration(course.duration)}</span>
          </div>
        </div>
        
        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {course.description}
        </p>
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div>
            {course.price === 0 ? (
              <span className="text-lg font-bold text-green-600">Free</span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-gray-900">
                  {formatCurrency(course.price)}
                </span>
                {course.originalPrice && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatCurrency(course.originalPrice)}
                  </span>
                )}
              </div>
            )}
          </div>
          
          <span className="text-xs px-2 py-1 bg-gray-100 rounded-full capitalize">
            {course.level}
          </span>
        </div>
      </div>
    </Card>
  );
};

// ============================================
// FILTER SIDEBAR COMPONENT
// ============================================
const FilterSidebar = ({ filters, onFilterChange, onClearFilters }) => {
  const [priceRange, setPriceRange] = useState([0, 1000]);

  const handleCategoryChange = (category) => {
    onFilterChange({ category: filters.category === category ? '' : category });
  };

  const handleLevelChange = (level) => {
    onFilterChange({ level: filters.level === level ? '' : level });
  };

  const handlePriceChange = (price) => {
    onFilterChange({ price });
  };

  const handleRatingChange = (rating) => {
    onFilterChange({ rating: filters.rating === rating ? '' : rating });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <button
          onClick={onClearFilters}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Clear All
        </button>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Category</h4>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {COURSE_CATEGORIES.map((category) => (
            <label key={category} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.category === category}
                onChange={() => handleCategoryChange(category)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Level Filter */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Level</h4>
        <div className="space-y-2">
          {COURSE_LEVELS.map((level) => (
            <label key={level} className="flex items-center cursor-pointer">
              <input
                type="radio"
                checked={filters.level === level}
                onChange={() => handleLevelChange(level)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 capitalize">{level}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Price</h4>
        <div className="space-y-2">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              checked={filters.price === 'free'}
              onChange={() => handlePriceChange('free')}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Free</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              checked={filters.price === 'paid'}
              onChange={() => handlePriceChange('paid')}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Paid</span>
          </label>
        </div>
      </div>

      {/* Rating Filter */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Rating</h4>
        <div className="space-y-2">
          {[4.5, 4, 3.5, 3].map((rating) => (
            <label key={rating} className="flex items-center cursor-pointer">
              <input
                type="radio"
                checked={filters.rating === rating.toString()}
                onChange={() => handleRatingChange(rating.toString())}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 flex items-center gap-1 text-sm">
                <FaStar className="text-yellow-500" />
                <span>{rating} & up</span>
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================
// COURSES PAGE COMPONENT
// ============================================
const Courses = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const courses = useSelector(selectCourses);
  const loading = useSelector(selectCourseLoading);
  const pagination = useSelector(selectCoursePagination);
  const filters = useSelector(selectCourseFilters);
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('popular');

  const debouncedSearch = useDebounce(searchTerm, 500);

  // ============================================
  // FETCH COURSES
  // ============================================
  useEffect(() => {
    if (debouncedSearch) {
      dispatch(searchCourses(debouncedSearch));
    } else {
      dispatch(getCourses({ 
        page: pagination.currentPage, 
        limit: 12,
        filters: { ...filters, sort: sortBy }
      }));
    }
  }, [dispatch, debouncedSearch, pagination.currentPage, filters, sortBy]);

  // ============================================
  // HANDLE FILTER CHANGE
  // ============================================
  const handleFilterChange = (newFilters) => {
    dispatch(setFilters(newFilters));
    dispatch(setCurrentPage(1));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    setSearchTerm('');
    setSearchParams({});
  };

  // ============================================
  // HANDLE SEARCH
  // ============================================
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value) {
      setSearchParams({ q: value });
    } else {
      setSearchParams({});
    }
  };

  // ============================================
  // HANDLE PAGE CHANGE
  // ============================================
  const handlePageChange = (page) => {
    dispatch(setCurrentPage(page));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Helmet>
        <title>All Courses | {config.app.name}</title>
        <meta name="description" content="Browse all available courses" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              All Courses
            </h1>
            <p className="text-gray-600">
              Explore {pagination.totalCourses} courses to learn new skills
            </p>
          </div>

          {/* Search & Filters Bar */}
          <div className="mb-8 space-y-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter & Sort */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <Button
                variant="outline"
                icon={<FaFilter />}
                onClick={() => setShowFilters(!showFilters)}
                className="sm:hidden"
              >
                Filters
              </Button>

              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  Showing {courses.length} of {pagination.totalCourses} courses
                </span>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest First</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar - Desktop */}
            <div className="hidden lg:block">
              <FilterSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
              />
            </div>

            {/* Courses Grid */}
            <div className="lg:col-span-3">
              {loading ? (
                <CardSkeletonLoader count={9} />
              ) : courses.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                    No courses found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your filters or search terms
                  </p>
                  <Button onClick={handleClearFilters}>
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {courses.map((course) => (
                      <CourseCard key={course._id} course={course} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="mt-12 flex justify-center">
                      <nav className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={pagination.currentPage === 1}
                          onClick={() => handlePageChange(pagination.currentPage - 1)}
                        >
                          Previous
                        </Button>

                        {[...Array(pagination.totalPages)].map((_, index) => {
                          const page = index + 1;
                          // Show first, last, current, and adjacent pages
                          if (
                            page === 1 ||
                            page === pagination.totalPages ||
                            (page >= pagination.currentPage - 1 && page <= pagination.currentPage + 1)
                          ) {
                            return (
                              <Button
                                key={page}
                                variant={pagination.currentPage === page ? 'primary' : 'outline'}
                                size="sm"
                                onClick={() => handlePageChange(page)}
                              >
                                {page}
                              </Button>
                            );
                          } else if (
                            page === pagination.currentPage - 2 ||
                            page === pagination.currentPage + 2
                          ) {
                            return <span key={page}>...</span>;
                          }
                          return null;
                        })}

                        <Button
                          variant="outline"
                          size="sm"
                          disabled={pagination.currentPage === pagination.totalPages}
                          onClick={() => handlePageChange(pagination.currentPage + 1)}
                        >
                          Next
                        </Button>
                      </nav>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Mobile Filters Drawer */}
          {showFilters && (
            <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
              <div className="absolute right-0 top-0 bottom-0 w-80 bg-white overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Filters</h3>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                  <FilterSidebar
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onClearFilters={handleClearFilters}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Courses;