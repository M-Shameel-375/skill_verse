// Register component
// ============================================
// REGISTER COMPONENT
// ============================================

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaPhone, FaGoogle, FaFacebook, FaGithub } from 'react-icons/fa';
import useAuth from '../../hooks/useAuth';
import config from '../../config';
import Loader from '../common/Loader';

// ============================================
// VALIDATION SCHEMA
// ============================================
const registerSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .matches(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/\d/, 'Password must contain at least one number')
    .matches(/[@$!%*?&#]/, 'Password must contain at least one special character')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
  phone: Yup.string()
    .matches(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  role: Yup.string()
    .oneOf(['learner', 'educator', 'skillExchanger'], 'Invalid role')
    .required('Please select a role'),
  acceptTerms: Yup.boolean()
    .oneOf([true], 'You must accept the terms and conditions')
    .required('You must accept the terms and conditions'),
});

// ============================================
// REGISTER COMPONENT
// ============================================
const Register = () => {
  const navigate = useNavigate();
  const { register, handleSocialLogin, isAuthenticated, loading, error, clearAuthError } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);

  // ============================================
  // REDIRECT IF ALREADY AUTHENTICATED
  // ============================================
  useEffect(() => {
    if (isAuthenticated) {
      navigate(config.routes.dashboard, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // ============================================
  // CLEAR ERROR ON UNMOUNT
  // ============================================
  useEffect(() => {
    return () => clearAuthError();
  }, [clearAuthError]);

  // ============================================
  // HANDLE REGISTER SUBMIT
  // ============================================
  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      await register({
        name: values.name,
        email: values.email,
        password: values.password,
        phone: values.phone || undefined,
        role: values.role,
      });
      
      // Redirect to dashboard or email verification page
      navigate(config.routes.dashboard);
    } catch (error) {
      if (error.includes('email')) {
        setFieldError('email', 'This email is already registered');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================
  // HANDLE SOCIAL LOGIN
  // ============================================
  const handleGoogleLogin = async () => {
    setSocialLoading('google');
    try {
      console.log('Google login not implemented yet');
    } catch (error) {
      console.error('Google login failed:', error);
    } finally {
      setSocialLoading(null);
    }
  };

  const handleFacebookLogin = async () => {
    setSocialLoading('facebook');
    try {
      console.log('Facebook login not implemented yet');
    } catch (error) {
      console.error('Facebook login failed:', error);
    } finally {
      setSocialLoading(null);
    }
  };

  const handleGitHubLogin = async () => {
    setSocialLoading('github');
    try {
      console.log('GitHub login not implemented yet');
    } catch (error) {
      console.error('GitHub login failed:', error);
    } finally {
      setSocialLoading(null);
    }
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Join {config.app.name}
          </h1>
          <p className="text-gray-600">
            Start your learning journey today
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" role="alert">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Social Login Buttons */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={socialLoading === 'google'}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
          >
            {socialLoading === 'google' ? <Loader size="small" /> : (
              <>
                <FaGoogle className="text-red-500" />
                <span className="font-medium">Continue with Google</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleFacebookLogin}
            disabled={socialLoading === 'facebook'}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
          >
            {socialLoading === 'facebook' ? <Loader size="small" /> : (
              <>
                <FaFacebook className="text-blue-600" />
                <span className="font-medium">Continue with Facebook</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleGitHubLogin}
            disabled={socialLoading === 'github'}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
          >
            {socialLoading === 'github' ? <Loader size="small" /> : (
              <>
                <FaGithub className="text-gray-800" />
                <span className="font-medium">Continue with GitHub</span>
              </>
            )}
          </button>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">Or register with email</span>
          </div>
        </div>

        {/* Register Form */}
        <Formik
          initialValues={{
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            phone: '',
            role: 'learner',
            acceptTerms: false,
          }}
          validationSchema={registerSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, touched, errors }) => (
            <Form className="space-y-5">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <Field
                    id="name"
                    name="name"
                    type="text"
                    className={`block w-full pl-10 pr-3 py-2.5 border ${
                      touched.name && errors.name ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="John Doe"
                  />
                </div>
                <ErrorMessage name="name" component="p" className="mt-1 text-xs text-red-600" />
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <Field
                    id="email"
                    name="email"
                    type="email"
                    className={`block w-full pl-10 pr-3 py-2.5 border ${
                      touched.email && errors.email ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="your.email@example.com"
                  />
                </div>
                <ErrorMessage name="email" component="p" className="mt-1 text-xs text-red-600" />
              </div>

              {/* Phone Field */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="text-gray-400" />
                  </div>
                  <Field
                    id="phone"
                    name="phone"
                    type="tel"
                    className={`block w-full pl-10 pr-3 py-2.5 border ${
                      touched.phone && errors.phone ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="+1234567890"
                  />
                </div>
                <ErrorMessage name="phone" component="p" className="mt-1 text-xs text-red-600" />
              </div>

              {/* Role Selection */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  I want to *
                </label>
                <Field
                  as="select"
                  id="role"
                  name="role"
                  className={`block w-full px-3 py-2.5 border ${
                    touched.role && errors.role ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="learner">Learn new skills</option>
                  <option value="educator">Teach and create courses</option>
                  <option value="skillExchanger">Exchange skills with others</option>
                </Field>
                <ErrorMessage name="role" component="p" className="mt-1 text-xs text-red-600" />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <Field
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className={`block w-full pl-10 pr-10 py-2.5 border ${
                      touched.password && errors.password ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
                  </button>
                </div>
                <ErrorMessage name="password" component="p" className="mt-1 text-xs text-red-600" />
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <Field
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`block w-full pl-10 pr-10 py-2.5 border ${
                      touched.confirmPassword && errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Re-enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
                  </button>
                </div>
                <ErrorMessage name="confirmPassword" component="p" className="mt-1 text-xs text-red-600" />
              </div>

              {/* Terms & Conditions */}
              <div className="flex items-start">
                <Field
                  id="acceptTerms"
                  name="acceptTerms"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                />
                <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-700">
                  I agree to the{' '}
                  <Link to={config.app.termsUrl} className="text-blue-600 hover:text-blue-500">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to={config.app.privacyUrl} className="text-blue-600 hover:text-blue-500">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              <ErrorMessage name="acceptTerms" component="p" className="text-xs text-red-600" />

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 font-medium"
              >
                {isSubmitting || loading ? (
                  <>
                    <Loader size="small" color="white" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </Form>
          )}
        </Formik>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to={config.routes.login} className="font-medium text-blue-600 hover:text-blue-500">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;