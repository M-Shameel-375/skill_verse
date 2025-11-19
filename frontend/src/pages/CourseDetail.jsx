

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  FaStar,
  FaUsers,
  FaClock,
  FaGlobe,
  FaCertificate,
  FaInfinity,
  FaMobile,
  FaPlay,
  FaCheck,
  FaChevronDown,
  FaChevronUp,
  FaHeart,
  FaRegHeart,
  FaShare,
} from 'react-icons/fa';
import {
  getCourseById,
  enrollInCourse,
  selectCurrentCourse,
  selectCourseLoading,
  selectEnrollLoading,
} from '../redux/slices/courseSlice';
import useAuth from '../hooks/useAuth';
import config from '../config';
import Button from '../components/common/Button';
import Card, { CardBadge } from '../components/common/Card';
import { FullPageLoader } from '../components/common/Loader';
import Modal, { ConfirmModal } from '../components/common/Modal';
import { formatCurrency, formatDate, formatDuration } from '../utils/helpers';
import toast from 'react-hot-toast';

// ============================================
// CURRICULUM SECTION COMPONENT
// ============================================
const CurriculumSection = ({ section, index }) => {
  const [isExpanded, setIsExpanded] = useState(index === 0);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
          <span className="font-semibold text-gray-900">
            Section {index + 1}: {section.title}
          </span>
        </div>
        <span className="text-sm text-gray-600">
          {section.lectures?.length || 0} lectures • {formatDuration(section.duration)}
        </span>
      </button>

      {isExpanded && (
        <div className="divide-y divide-gray-200">
          {section.lectures?.map((lecture, lectureIndex) => (
            <div key={lectureIndex} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <FaPlay className="text-gray-400 text-sm" />
                <span className="text-gray-700">{lecture.title}</span>
              </div>
              <span className="text-sm text-gray-500">
                {formatDuration(lecture.duration)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// REVIEW COMPONENT
// ============================================
const ReviewItem = ({ review }) => {
  return (
    <div className="border-b border-gray-200 pb-6 last:border-0">
      <div className="flex items-start gap-4">
        <img
          src={review.user?.profileImage?.url || 'https://ui-avatars.com/api/?name=' + review.user?.name}
          alt={review.user?.name}
          className="w-12 h-12 rounded-full"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-semibold text-gray-900">{review.user?.name}</h4>
              <div className="flex items-center gap-1 mt-1">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={i < review.rating ? 'text-yellow-500' : 'text-gray-300'}
                  />
                ))}
              </div>
            </div>
            <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
          </div>
          <p className="text-gray-700">{review.comment}</p>
        </div>
      </div>
    </div>
  );
};

// ============================================
// COURSE DETAIL PAGE COMPONENT
// ============================================
const CourseDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const course = useSelector(selectCurrentCourse);
  const loading = useSelector(selectCourseLoading);
  const enrollLoading = useSelector(selectEnrollLoading);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // ============================================
  // FETCH COURSE
  // ============================================
  useEffect(() => {
    if (id) {
      dispatch(getCourseById(id));
    }
  }, [dispatch, id]);

  // ============================================
  // HANDLE ENROLL
  // ============================================
  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate(config.routes.login, { state: { from: `/courses/${id}` } });
      return;
    }

    try {
      await dispatch(enrollInCourse(id)).unwrap();
      toast.success('Successfully enrolled in the course!');
      setShowEnrollModal(false);
      navigate(config.routes.myLearning);
    } catch (error) {
      toast.error(error || 'Failed to enroll in course');
    }
  };

  // ============================================
  // HANDLE WISHLIST
  // ============================================
  const handleWishlist = () => {
    if (!isAuthenticated) {
      navigate(config.routes.login);
      return;
    }
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  // ============================================
  // HANDLE SHARE
  // ============================================
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: course.title,
        text: course.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading && !course) {
    return <FullPageLoader message="Loading course details..." />;
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course not found</h2>
          <Button onClick={() => navigate(config.routes.courses)}>
            Browse Courses
          </Button>
        </div>
      </div>
    );
  }

  const isEnrolled = user?.learnerProfile?.enrolledCourses?.includes(course._id);

  return (
    <>
      <Helmet>
        <title>{course.title} | {config.app.name}</title>
        <meta name="description" content={course.description} />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Content */}
              <div className="lg:col-span-2">
                <CardBadge variant="primary" className="mb-4">
                  {course.category}
                </CardBadge>
                
                <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
                
                <p className="text-xl text-gray-300 mb-6">{course.subtitle}</p>
                
                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-6 mb-6">
                  <div className="flex items-center gap-2">
                    <FaStar className="text-yellow-500" />
                    <span className="font-semibold">{course.rating?.average?.toFixed(1) || '0.0'}</span>
                    <span className="text-gray-400">({course.rating?.count || 0} reviews)</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <FaUsers />
                    <span>{course.enrolledCount || 0} students enrolled</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <FaClock />
                    <span>{formatDuration(course.duration)}</span>
                  </div>
                </div>
                
                {/* Instructor */}
                <div className="flex items-center gap-3">
                  <img
                    src={course.instructor?.profileImage?.url || 'https://ui-avatars.com/api/?name=' + course.instructor?.name}
                    alt={course.instructor?.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="text-sm text-gray-400">Created by</p>
                    <p className="font-semibold">{course.instructor?.name}</p>
                  </div>
                </div>
              </div>

              {/* Right Content - Course Card */}
              <div className="lg:col-span-1">
                <Card className="sticky top-20">
                  <img
                    src={course.thumbnail?.url || 'https://via.placeholder.com/400x225'}
                    alt={course.title}
                    className="w-full rounded-t-lg"
                  />
                  
                  <div className="p-6">
                    {/* Price */}
                    <div className="mb-6">
                      {course.price === 0 ? (
                        <div className="text-3xl font-bold text-green-600">Free</div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="text-3xl font-bold text-gray-900">
                            {formatCurrency(course.price)}
                          </div>
                          {course.originalPrice && (
                            <div className="text-xl text-gray-500 line-through">
                              {formatCurrency(course.originalPrice)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="space-y-3">
                      {isEnrolled ? (
                        <Button
                          variant="primary"
                          fullWidth
                          size="lg"
                          onClick={() => navigate(`/courses/${id}/learn`)}
                        >
                          Go to Course
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          fullWidth
                          size="lg"
                          onClick={() => setShowEnrollModal(true)}
                          loading={enrollLoading}
                        >
                          Enroll Now
                        </Button>
                      )}
                      
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          variant="outline"
                          fullWidth
                          icon={isWishlisted ? <FaHeart /> : <FaRegHeart />}
                          onClick={handleWishlist}
                        >
                          Wishlist
                        </Button>
                        
                        <Button
                          variant="outline"
                          fullWidth
                          icon={<FaShare />}
                          onClick={handleShare}
                        >
                          Share
                        </Button>
                      </div>
                    </div>

                    {/* What's Included */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-3">This course includes:</h4>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-sm text-gray-700">
                          <FaPlay className="text-blue-600" />
                          <span>{course.lectures?.length || 0} video lectures</span>
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-700">
                          <FaClock className="text-blue-600" />
                          <span>{formatDuration(course.duration)} on-demand video</span>
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-700">
                          <FaCertificate className="text-blue-600" />
                          <span>Certificate of completion</span>
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-700">
                          <FaInfinity className="text-blue-600" />
                          <span>Full lifetime access</span>
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-700">
                          <FaMobile className="text-blue-600" />
                          <span>Access on mobile and desktop</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Content */}
            <div className="lg:col-span-2">
              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="flex gap-8">
                  {['overview', 'curriculum', 'instructor', 'reviews'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-4 font-medium capitalize transition-colors ${
                        activeTab === tab
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Description */}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">About this course</h2>
                    <p className="text-gray-700 whitespace-pre-line">{course.description}</p>
                  </div>

                  {/* What You'll Learn */}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">What you'll learn</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {course.learningOutcomes?.map((outcome, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <FaCheck className="text-green-600 mt-1 flex-shrink-0" />
                          <span className="text-gray-700">{outcome}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Requirements */}
                  {course.requirements && course.requirements.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">Requirements</h2>
                      <ul className="space-y-2">
                        {course.requirements.map((req, index) => (
                          <li key={index} className="flex items-start gap-3 text-gray-700">
                            <span>•</span>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'curriculum' && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Content</h2>
                  <p className="text-gray-600 mb-6">
                    {course.sections?.length || 0} sections • {course.lectures?.length || 0} lectures • {formatDuration(course.duration)} total length
                  </p>
                  {course.sections?.map((section, index) => (
                    <CurriculumSection key={index} section={section} index={index} />
                  ))}
                </div>
              )}

              {activeTab === 'instructor' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Instructor</h2>
                  <Card padding="lg">
                    <div className="flex items-start gap-6">
                      <img
                        src={course.instructor?.profileImage?.url || 'https://ui-avatars.com/api/?name=' + course.instructor?.name}
                        alt={course.instructor?.name}
                        className="w-24 h-24 rounded-full"
                      />
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {course.instructor?.name}
                        </h3>
                        <p className="text-gray-600 mb-4">{course.instructor?.title}</p>
                        
                        <div className="flex flex-wrap gap-6 mb-4">
                          <div className="flex items-center gap-2">
                            <FaStar className="text-yellow-500" />
                            <span>{course.instructor?.educatorProfile?.rating?.average?.toFixed(1)} Instructor Rating</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FaUsers />
                            <span>{course.instructor?.educatorProfile?.totalStudents} Students</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FaPlay />
                            <span>{course.instructor?.educatorProfile?.totalCourses} Courses</span>
                          </div>
                        </div>
                        
                        <p className="text-gray-700">{course.instructor?.bio}</p>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Student Reviews</h2>
                  
                  {/* Rating Summary */}
                  <Card padding="lg" className="mb-6">
                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-gray-900 mb-2">
                          {course.rating?.average?.toFixed(1) || '0.0'}
                        </div>
                        <div className="flex items-center gap-1 justify-center mb-2">
                          {[...Array(5)].map((_, i) => (
                            <FaStar key={i} className="text-yellow-500" />
                          ))}
                        </div>
                        <div className="text-sm text-gray-600">
                          {course.rating?.count || 0} ratings
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        {[5, 4, 3, 2, 1].map((star) => (
                          <div key={star} className="flex items-center gap-3 mb-2">
                            <div className="flex items-center gap-1 w-20">
                              <FaStar className="text-yellow-500 text-sm" />
                              <span className="text-sm">{star}</span>
                            </div>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-yellow-500 h-2 rounded-full"
                                style={{ width: `${(course.ratingDistribution?.[star] || 0)}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600 w-12 text-right">
                              {course.ratingDistribution?.[star] || 0}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>

                  {/* Reviews List */}
                  <div className="space-y-6">
                    {course.reviews?.map((review) => (
                      <ReviewItem key={review._id} review={review} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Sidebar - Related Courses */}
            <div className="lg:col-span-1">
              <h3 className="text-xl font-bold text-gray-900 mb-4">More courses by {course.instructor?.name}</h3>
              {/* Add related courses here */}
            </div>
          </div>
        </div>
      </div>

      {/* Enroll Confirmation Modal */}
      <ConfirmModal
        isOpen={showEnrollModal}
        onClose={() => setShowEnrollModal(false)}
        onConfirm={handleEnroll}
        title="Enroll in Course"
        message={`Are you sure you want to enroll in "${course.title}"?`}
        confirmText={course.price === 0 ? 'Enroll Now' : `Pay ${formatCurrency(course.price)}`}
        confirmButtonColor="blue"
        loading={enrollLoading}
      />
    </>
  );
};

export default CourseDetail;