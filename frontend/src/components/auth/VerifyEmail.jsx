// ============================================
// VERIFY EMAIL COMPONENT
// ============================================

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import { motion } from 'framer-motion';
import useAuth from '../../hooks/useAuth';
import config from '../../config';
import Button from '../common/Button';

// ============================================
// VERIFY EMAIL COMPONENT
// ============================================
const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { verifyEmail, loading, error } = useAuth();
  
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // verifying, success, error

  // ============================================
  // VERIFY EMAIL ON MOUNT
  // ============================================
  useEffect(() => {
    const handleVerification = async () => {
      if (!token) {
        setVerificationStatus('error');
        return;
      }

      try {
        await verifyEmail(token);
        setVerificationStatus('success');
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate(config.routes.dashboard);
        }, 3000);
      } catch (err) {
        setVerificationStatus('error');
      }
    };

    handleVerification();
  }, [token, verifyEmail, navigate]);

  // ============================================
  // ANIMATION VARIANTS
  // ============================================
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.2,
      }
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // ============================================
  // RENDER VERIFYING STATE
  // ============================================
  if (verificationStatus === 'verifying') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-10 text-center"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <FaSpinner className="text-6xl text-blue-600 mx-auto animate-spin" />
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-2xl font-bold text-gray-900 mb-2">
            Verifying Your Email
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-gray-600">
            Please wait while we verify your email address...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // ============================================
  // RENDER SUCCESS STATE
  // ============================================
  if (verificationStatus === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-10 text-center"
        >
          {/* Success Icon with Animation */}
          <motion.div 
            variants={itemVariants}
            className="mb-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.2
              }}
              className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full"
            >
              <FaCheckCircle className="text-5xl text-green-600" />
            </motion.div>
          </motion.div>

          {/* Success Message */}
          <motion.h1 variants={itemVariants} className="text-3xl font-bold text-gray-900 mb-3">
            Email Verified! 🎉
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-gray-600 mb-6">
            Your email has been successfully verified. You now have full access to all features.
          </motion.p>

          {/* Redirect Message */}
          <motion.p variants={itemVariants} className="text-sm text-gray-500 mb-6">
            Redirecting to dashboard in 3 seconds...
          </motion.p>

          {/* Action Buttons */}
          <motion.div variants={itemVariants} className="space-y-3">
            <Button
              onClick={() => navigate(config.routes.dashboard)}
              variant="primary"
              fullWidth
            >
              Go to Dashboard
            </Button>
            
            <Button
              onClick={() => navigate(config.routes.courses)}
              variant="outline"
              fullWidth
            >
              Browse Courses
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // ============================================
  // RENDER ERROR STATE
  // ============================================
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-10 text-center"
      >
        {/* Error Icon */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full">
            <FaTimesCircle className="text-5xl text-red-600" />
          </div>
        </motion.div>

        {/* Error Message */}
        <motion.h1 variants={itemVariants} className="text-3xl font-bold text-gray-900 mb-3">
          Verification Failed
        </motion.h1>
        
        <motion.p variants={itemVariants} className="text-gray-600 mb-2">
          {error || 'The verification link is invalid or has expired.'}
        </motion.p>

        <motion.p variants={itemVariants} className="text-sm text-gray-500 mb-6">
          Please request a new verification email.
        </motion.p>

        {/* Action Buttons */}
        <motion.div variants={itemVariants} className="space-y-3">
          <Button
            onClick={() => navigate(config.routes.dashboard)}
            variant="primary"
            fullWidth
          >
            Request New Link
          </Button>
          
          <Button
            onClick={() => navigate(config.routes.login)}
            variant="outline"
            fullWidth
          >
            Back to Login
          </Button>
        </motion.div>

        {/* Help Link */}
        <motion.div variants={itemVariants} className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Need help?{' '}
            <Link 
              to="/contact" 
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Contact Support
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;