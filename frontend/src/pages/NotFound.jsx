// NotFound page
// ============================================
// 404 NOT FOUND PAGE
// ============================================

import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FaHome, FaArrowLeft, FaSearch } from 'react-icons/fa';
import Button from '../components/common/Button';
import config from '../config';

// ============================================
// NOT FOUND PAGE COMPONENT
// ============================================
const NotFound = () => {
  const navigate = useNavigate();

  // ============================================
  // ANIMATION VARIANTS
  // ============================================
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: 'beforeChildren',
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const floatingVariants = {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  // ============================================
  // POPULAR LINKS
  // ============================================
  const popularLinks = [
    { label: 'Browse Courses', path: config.routes.courses },
    { label: 'Live Sessions', path: config.routes.liveSessions },
    { label: 'Skill Exchange', path: config.routes.skillExchange },
    { label: 'My Learning', path: config.routes.myLearning },
  ];

  return (
    <>
      <Helmet>
        <title>404 - Page Not Found | {config.app.name}</title>
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-4xl w-full text-center"
        >
          {/* 404 Illustration */}
          <motion.div
            variants={floatingVariants}
            animate="animate"
            className="mb-8"
          >
            <div className="relative inline-block">
              {/* 404 Text */}
              <motion.h1
                variants={itemVariants}
                className="text-9xl md:text-[200px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"
              >
                404
              </motion.h1>

              {/* Decorative Elements */}
              <motion.div
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="absolute -top-10 -right-10 text-6xl opacity-20"
              >
                🔍
              </motion.div>

              <motion.div
                animate={{
                  rotate: -360,
                }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="absolute -bottom-10 -left-10 text-6xl opacity-20"
              >
                📚
              </motion.div>
            </div>
          </motion.div>

          {/* Error Message */}
          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Oops! Page Not Found
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The page you're looking for seems to have wandered off into the learning universe.
              Don't worry, we'll help you find your way back!
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Button
              variant="primary"
              size="lg"
              icon={<FaHome />}
              onClick={() => navigate(config.routes.home)}
            >
              Go to Home
            </Button>

            <Button
              variant="outline"
              size="lg"
              icon={<FaArrowLeft />}
              onClick={() => navigate(-1)}
            >
              Go Back
            </Button>

            <Button
              variant="outline"
              size="lg"
              icon={<FaSearch />}
              onClick={() => navigate(config.routes.courses)}
            >
              Browse Courses
            </Button>
          </motion.div>

          {/* Popular Links */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Popular Pages
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {popularLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors text-gray-700"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Fun Fact */}
          <motion.div
            variants={itemVariants}
            className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg max-w-2xl mx-auto"
          >
            <p className="text-sm text-gray-600 mb-2">💡 Did you know?</p>
            <p className="text-gray-700">
              The 404 error code has been used since the early days of the web. It means "Not Found" -
              which is exactly what happened here! But unlike this page, your learning journey at {config.app.name} is always found and ready.
            </p>
          </motion.div>

          {/* Help Section */}
          <motion.div variants={itemVariants} className="mt-8 text-sm text-gray-600">
            <p>
              Need help? Visit our{' '}
              <Link to="/help" className="text-blue-600 hover:text-blue-700 underline">
                Help Center
              </Link>
              {' '}or{' '}
              <Link to="/contact" className="text-blue-600 hover:text-blue-700 underline">
                Contact Support
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default NotFound;