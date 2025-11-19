// ============================================
// UNAUTHORIZED PAGE (403)
// ============================================

import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaExclamationTriangle, FaHome, FaArrowLeft } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Button from '../components/common/Button';
import config from '../config';

// ============================================
// UNAUTHORIZED COMPONENT
// ============================================
const Unauthorized = () => {
  const navigate = useNavigate();

  // ============================================
  // ANIMATION VARIANTS
  // ============================================
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2,
      }
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { 
      scale: 1, 
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
      }
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 px-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-2xl w-full text-center"
      >
        {/* Warning Icon */}
        <motion.div variants={iconVariants} className="mb-8">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-red-100 rounded-full">
            <FaExclamationTriangle className="text-7xl text-red-600" />
          </div>
        </motion.div>

        {/* Error Code */}
        <motion.div variants={itemVariants}>
          <h1 className="text-9xl font-bold text-red-600 mb-4">403</h1>
        </motion.div>

        {/* Error Title */}
        <motion.h2 variants={itemVariants} className="text-4xl font-bold text-gray-900 mb-4">
          Access Denied
        </motion.h2>

        {/* Error Description */}
        <motion.p variants={itemVariants} className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
          Oops! You don't have permission to access this page. This area is restricted to authorized users only.
        </motion.p>

        {/* Possible Reasons */}
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-lg shadow-md p-6 mb-8 text-left max-w-md mx-auto"
        >
          <h3 className="font-semibold text-gray-900 mb-3">Possible reasons:</h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>You don't have the required role or permissions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>Your account hasn't been verified yet</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>This feature is only available to premium users</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>Your session may have expired</span>
            </li>
          </ul>
        </motion.div>

        {/* Action Buttons */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            icon={<FaArrowLeft />}
            size="lg"
          >
            Go Back
          </Button>

          <Button
            onClick={() => navigate(config.routes.home)}
            variant="primary"
            icon={<FaHome />}
            size="lg"
          >
            Back to Home
          </Button>
        </motion.div>

        {/* Help Section */}
        <motion.div variants={itemVariants} className="mt-12 pt-8 border-t border-gray-200 max-w-md mx-auto">
          <p className="text-gray-600 mb-4">
            If you believe this is a mistake, please contact our support team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
            <Link 
              to="/contact" 
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Contact Support
            </Link>
            <span className="hidden sm:inline text-gray-400">|</span>
            <Link 
              to="/help" 
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Visit Help Center
            </Link>
            <span className="hidden sm:inline text-gray-400">|</span>
            <Link 
              to="/faqs" 
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View FAQs
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Unauthorized;