// Home page
// ============================================
// HOME PAGE
// ============================================

import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  FaGraduationCap,
  FaVideo,
  FaExchangeAlt,
  FaCertificate,
  FaTrophy,
  FaChartLine,
  FaUsers,
  FaArrowRight,
  FaStar,
  FaPlay,
} from 'react-icons/fa';
import {
  getFeaturedCourses,
  getPopularCourses,
  selectFeaturedCourses,
  selectPopularCourses,
  selectCourseLoading,
} from '../../../redux/slices/courseSlice';
import config from '../../../config';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { SkeletonLoader, CardSkeletonLoader } from '../components/Loader';
import { formatCurrency } from '../../../utils/helpers';

// ============================================
// FEATURES DATA
// ============================================
const features = [
  {
    icon: FaGraduationCap,
    title: 'Expert-Led Courses',
    description: 'Learn from industry professionals with real-world experience',
    color: 'blue',
  },
  {
    icon: FaVideo,
    title: 'Live Sessions',
    description: 'Interactive live classes with Q&A and hands-on projects',
    color: 'green',
  },
  {
    icon: FaExchangeAlt,
    title: 'Skill Exchange',
    description: 'Exchange skills with peers and grow together',
    color: 'purple',
  },
  {
    icon: FaCertificate,
    title: 'Certificates',
    description: 'Earn recognized certificates upon course completion',
    color: 'yellow',
  },
  {
    icon: FaTrophy,
    title: 'Gamification',
    description: 'Earn badges, points, and climb the leaderboard',
    color: 'red',
  },
  {
    icon: FaChartLine,
    title: 'Progress Tracking',
    description: 'Monitor your learning journey with detailed analytics',
    color: 'indigo',
  },
];

// ============================================
// STATS DATA
// ============================================
const stats = [
  { value: '50K+', label: 'Active Learners' },
  { value: '500+', label: 'Expert Educators' },
  { value: '1000+', label: 'Quality Courses' },
  { value: '95%', label: 'Success Rate' },
];

// ============================================
// TESTIMONIALS DATA
// ============================================
const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Full Stack Developer',
    image: 'https://i.pravatar.cc/150?img=1',
    rating: 5,
    text: 'SkillVerse transformed my career! The courses are practical and the instructors are top-notch.',
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'UI/UX Designer',
    image: 'https://i.pravatar.cc/150?img=2',
    rating: 5,
    text: 'The skill exchange feature helped me learn design while teaching programming. Amazing platform!',
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    role: 'Data Scientist',
    image: 'https://i.pravatar.cc/150?img=3',
    rating: 5,
    text: 'Best investment in my career. Got certified and landed my dream job within 3 months!',
  },
];

// ============================================
// COURSE CARD COMPONENT
// ============================================
const CourseCard = ({ course }) => {
  return (
    <Card className="h-full flex flex-col">
      <Link to={`/courses/${course._id}`} className="flex flex-col h-full">
        <img
          src={course.thumbnail?.url || 'https://via.placeholder.com/400x225'}
          alt={course.title}
          className="w-full h-auto aspect-[16/9] object-cover rounded-t-lg"
        />
        
        <CardContent className="p-4 flex flex-col flex-1">
          {/* Category Badge */}
          <span className="mb-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium self-start">
            {course.category}
          </span>
          
          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 flex-grow">
            {course.title}
          </h3>
          
          {/* Instructor */}
          <p className="text-sm text-gray-600 mb-3">
            By {course.instructor?.name}
          </p>
          
          {/* Rating & Students */}
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1">
              <FaStar className="text-yellow-500" />
              <span className="text-sm font-medium">
                {course.rating?.average?.toFixed(1) || '0.0'}
              </span>
              <span className="text-sm text-gray-500">
                ({course.rating?.count || 0})
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <FaUsers />
              <span>{course.enrolledCount || 0} students</span>
            </div>
          </div>
          
          {/* Price */}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-200">
            <div>
              {course.price === 0 ? (
                <span className="text-xl font-bold text-green-600">Free</span>
              ) : (
                <>
                  <span className="text-xl font-bold text-gray-900">
                    {formatCurrency(course.price)}
                  </span>
                  {course.originalPrice && (
                    <span className="ml-2 text-sm text-gray-500 line-through">
                      {formatCurrency(course.originalPrice)}
                    </span>
                  )}
                </>
              )}
            </div>
            
            {/* Level Badge */}
            <span className="text-xs px-2 py-1 bg-gray-100 rounded-full capitalize">
              {course.level}
            </span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

// ============================================
// HOME PAGE COMPONENT
// ============================================
const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const featuredCourses = useSelector(selectFeaturedCourses);
  const popularCourses = useSelector(selectPopularCourses);
  const loading = useSelector(selectCourseLoading);

  // ============================================
  // FETCH DATA ON MOUNT
  // ============================================
  useEffect(() => {
    dispatch(getFeaturedCourses());
    dispatch(getPopularCourses());
  }, [dispatch]);

  // ============================================
  // ANIMATION VARIANTS
  // ============================================
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <>
      <Helmet>
        <title>Home | {config.app.name}</title>
        <meta name="description" content={config.app.description} />
      </Helmet>

      <div className="min-h-screen">
        {/* ============================================ */}
        {/* HERO SECTION */}
        {/* ============================================ */}
        <section className="relative bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white py-20 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '50px 50px',
            }} />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                  Learn Skills,
                  <br />
                  <span className="text-yellow-400">Grow Your Career</span>
                </h1>
                <p className="text-xl mb-8 text-blue-100">
                  Join thousands of learners mastering in-demand skills with expert-led courses,
                  live sessions, and skill exchange programs.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    variant="default"
                    onClick={() => navigate(config.routes.courses)}
                    className="bg-white text-blue-600 hover:bg-blue-50"
                  >
                    Explore Courses <FaArrowRight className="ml-2" />
                  </Button>
                  
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate('/sign-up')}
                    className="border-white text-white hover:bg-white hover:text-blue-600"
                  >
                    Get Started Free
                  </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <div className="text-3xl font-bold">{stat.value}</div>
                      <div className="text-sm text-blue-200">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Right Content - Hero Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="hidden lg:block"
              >
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="Learning Together"
                  className="rounded-2xl shadow-2xl"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* FEATURES SECTION */}
        {/* ============================================ */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="text-center mb-16"
            >
              <motion.h2 variants={itemVariants} className="text-4xl font-bold text-gray-900 mb-4">
                Why Choose {config.app.name}?
              </motion.h2>
              <motion.p variants={itemVariants} className="text-xl text-gray-600 max-w-2xl mx-auto">
                Everything you need to master new skills and advance your career
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {features.map((feature, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <Card className="h-full text-center">
                    <CardContent className="p-6">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-${feature.color}-100 mb-4`}>
                        <feature.icon className={`text-3xl text-${feature.color}-600`} />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ============================================ */}
        {/* FEATURED COURSES */}
        {/* ============================================ */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Featured Courses
                </h2>
                <p className="text-gray-600">
                  Hand-picked courses by our expert team
                </p>
              </div>
              <Link
                to={config.routes.courses}
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
              >
                View All <FaArrowRight />
              </Link>
            </div>

            {loading ? (
              <CardSkeletonLoader count={3} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredCourses.slice(0, 3).map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ============================================ */}
        {/* POPULAR COURSES */}
        {/* ============================================ */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Popular Courses
                </h2>
                <p className="text-gray-600">
                  Most enrolled courses this month
                </p>
              </div>
              <Link
                to={config.routes.courses}
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
              >
                View All <FaArrowRight />
              </Link>
            </div>

            {loading ? (
              <CardSkeletonLoader count={3} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {popularCourses.slice(0, 3).map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ============================================ */}
        {/* TESTIMONIALS */}
        {/* ============================================ */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                What Our Students Say
              </h2>
              <p className="text-xl text-gray-600">
                Join thousands of satisfied learners
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.id} padding="lg" className="h-full">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <FaStar key={i} className="text-yellow-500" />
                    ))}
                  </div>
                  
                  <p className="text-gray-700 mb-6 italic">
                    "{testimonial.text}"
                  </p>
                  
                  <div className="flex items-center gap-3">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* CTA SECTION */}
        {/* ============================================ */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Start Learning?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join our community and unlock your potential today
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate(config.routes.register)}
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                Sign Up for Free
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate(config.routes.courses)}
                className="border-white text-white hover:bg-white hover:text-blue-600"
              >
                Browse Courses
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;