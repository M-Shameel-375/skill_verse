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
} from '../../../redux/slices/courseSlice';
import config from '../../../config';
import { COURSE_CATEGORIES, COURSE_LEVELS } from '../../../utils/constants';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { Checkbox } from '../../../components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../../../components/ui/radio-group';
import { CardSkeletonLoader } from '../../shared/components/Loader';
import { formatCurrency, formatDuration } from '../../../utils/helpers';
import { useDebounce } from '../../../hooks/useDebounce';

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
      className="h-full cursor-pointer flex flex-col"
      onClick={() => navigate(`/courses/${course._id}`)}
    >
      <CardHeader className="p-0 relative">
        <img
          src={course.thumbnail?.url || 'https://via.placeholder.com/400x225'}
          alt={course.title}
          className="aspect-[16/9] w-full rounded-t-lg object-cover"
        />
        
        <Button
          variant="secondary"
          size="icon"
          onClick={handleBookmark}
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm"
        >
          {isBookmarked ? (
            <FaBookmark className="text-blue-600 h-4 w-4" />
          ) : (
            <FaRegBookmark className="text-gray-600 h-4 w-4" />
          )}
        </Button>

        {course.isBestseller && (
          <Badge variant="destructive" className="absolute top-2 left-2">
            BESTSELLER
          </Badge>
        )}
      </CardHeader>
      
      <CardContent className="p-4 flex-grow flex flex-col">
        <Badge variant="default" className="mb-2 w-fit">{course.category}</Badge>
        
        <CardTitle className="text-lg mb-2 line-clamp-2 flex-grow">
          {course.title}
        </CardTitle>
        
        <p className="text-sm text-gray-600 mb-3">
          By {course.instructor?.name}
        </p>
        
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <FaStar className="text-yellow-500" />
            <span className="font-medium text-gray-800">
              {course.rating?.average?.toFixed(1) || '0.0'}
            </span>
            <span className="text-gray-500">
              ({course.rating?.count || 0})
            </span>
          </div>
          <div className="flex items-center gap-1">
            <FaUsers />
            <span>{course.enrolledCount || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <FaClock />
            <span>{formatDuration(course.duration)}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 flex items-center justify-between border-t">
        <div>
          {course.price === 0 ? (
            <span className="text-lg font-bold text-green-600">Free</span>
          ) : (
            <div className="flex items-baseline gap-2">
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
        
        <Badge variant="outline" className="capitalize">{course.level}</Badge>
      </CardFooter>
    </Card>
  );
};

// ============================================
// FILTER SIDEBAR COMPONENT
// ============================================
const FilterSidebar = ({ filters, onFilterChange, onClearFilters }) => {
  const handleCategoryChange = (category) => {
    onFilterChange({ category: filters.category === category ? '' : category });
  };

  const handleLevelChange = (level) => {
    onFilterChange({ level });
  };

  const handlePriceChange = (price) => {
    onFilterChange({ price });
  };

  const handleRatingChange = (rating) => {
    onFilterChange({ rating });
  };

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Filters</CardTitle>
          <Button
            variant="link"
            onClick={onClearFilters}
            className="p-0 h-auto"
          >
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Filter */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Category</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {COURSE_CATEGORIES.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`cat-${category}`}
                  checked={filters.category === category}
                  onCheckedChange={() => handleCategoryChange(category)}
                />
                <Label htmlFor={`cat-${category}`} className="font-normal cursor-pointer">
                  {category}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Level Filter */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Level</h4>
          <RadioGroup
            value={filters.level}
            onValueChange={handleLevelChange}
            className="space-y-2"
          >
            {COURSE_LEVELS.map((level) => (
              <div key={level} className="flex items-center space-x-2">
                <RadioGroupItem value={level} id={`level-${level}`} />
                <Label htmlFor={`level-${level}`} className="font-normal capitalize cursor-pointer">
                  {level}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Price Filter */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Price</h4>
          <RadioGroup
            value={filters.price}
            onValueChange={handlePriceChange}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="free" id="price-free" />
              <Label htmlFor="price-free" className="font-normal cursor-pointer">Free</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="paid" id="price-paid" />
              <Label htmlFor="price-paid" className="font-normal cursor-pointer">Paid</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Rating Filter */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Rating</h4>
          <RadioGroup
            value={filters.rating}
            onValueChange={handleRatingChange}
            className="space-y-2"
          >
            {[4.5, 4, 3.5, 3].map((rating) => (
              <div key={rating} className="flex items-center space-x-2">
                <RadioGroupItem value={rating.toString()} id={`rating-${rating}`} />
                <Label htmlFor={`rating-${rating}`} className="font-normal flex items-center gap-1 cursor-pointer">
                  <FaStar className="text-yellow-500" />
                  <span>{rating} & up</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================
// COURSES PAGE COMPONENT
// ============================================
const Courses = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const courses = useSelector(selectCourses) || [];
  const loading = useSelector(selectCourseLoading);
  const pagination = useSelector(selectCoursePagination) || { currentPage: 1, totalPages: 1, totalCourses: 0 };
  const filters = useSelector(selectCourseFilters) || {};
  
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

      <div className="min-h-screen bg-gray-50/50 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              All Courses
            </h1>
            <p className="text-gray-600">
              Explore {pagination.totalCourses} courses to learn new skills
            </p>
          </header>

          {/* Search & Filters Bar */}
          <div className="mb-8 space-y-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-12 pr-4 py-3 h-12 text-base"
              />
            </div>

            {/* Filter & Sort */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="sm:hidden"
              >
                <FaFilter className="mr-2 h-4 w-4" />
                Filters
              </Button>

              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  Showing {courses.length} of {pagination.totalCourses} courses
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Label htmlFor="sort-by" className="text-sm">Sort by:</Label>
                <select
                  id="sort-by"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
            <aside className="hidden lg:block">
              <FilterSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
              />
            </aside>

            {/* Courses Grid */}
            <main className="lg:col-span-3">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(9)].map((_, i) => (
                    <CardSkeletonLoader key={i} />
                  ))}
                </div>
              ) : courses.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-lg shadow">
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
                                variant={pagination.currentPage === page ? 'default' : 'outline'}
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
                            return <span key={page} className="px-2">...</span>;
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
            </main>
          </div>
        </div>
      </div>
    </>
  );
};

export default Courses;