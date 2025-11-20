// Login component
// ============================================
// LOGIN COMPONENT
// ============================================

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGoogle, FaFacebook, FaGithub } from 'react-icons/fa';
import useAuth from '../../hooks/useAuth';
import config from '../../config';
import Loader from '../common/Loader';

// ============================================
// VALIDATION SCHEMA
// ============================================
const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  rememberMe: Yup.boolean(),
});

// ============================================
// LOGIN COMPONENT
// ============================================
const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, handleSocialLogin, isAuthenticated, loading, error, clearAuthError } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);

  // Redirect destination after login
  const from = location.state?.from?.pathname || config.routes.dashboard;

  // ============================================
  // REDIRECT IF ALREADY AUTHENTICATED
  // ============================================
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // ============================================
  // CLEAR ERROR ON UNMOUNT
  // ============================================
  useEffect(() => {
    return () => clearAuthError();
  }, [clearAuthError]);

  // ============================================
  // HANDLE LOGIN SUBMIT
  // ============================================
  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      await login(
        {
          email: values.email,
          password: values.password,
        },
        from
      );
    } catch (error) {
      if (error.includes('credentials')) {
        setFieldError('email', 'Invalid email or password');
        setFieldError('password', 'Invalid email or password');
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
      // Implement Google OAuth here
      // const googleToken = await getGoogleToken();
      // await handleSocialLogin('google', googleToken, from);
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
      // Implement Facebook OAuth here
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
      // Implement GitHub OAuth here
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
            Welcome Back
          </h1>
          <p className="text-gray-600">
            Login to continue your learning journey
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
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {socialLoading === 'google' ? (
              <Loader size="small" />
            ) : (
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
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {socialLoading === 'facebook' ? (
              <Loader size="small" />
            ) : (
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
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {socialLoading === 'github' ? (
              <Loader size="small" />
            ) : (
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
            <span className="px-4 bg-white text-gray-500">Or continue with email</span>
          </div>
        </div>

        {/* Login Form */}
        <Formik
          initialValues={{
            email: '',
            password: '',
            rememberMe: false,
          }}
          validationSchema={loginSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, touched, errors }) => (
            <Form className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <Field
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    className={`block w-full pl-10 pr-3 py-3 border ${
                      touched.email && errors.email
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    } rounded-lg focus:outline-none focus:ring-2`}
                    placeholder="your.email@example.com"
                  />
                </div>
                <ErrorMessage
                  name="email"
                  component="p"
                  className="mt-1 text-sm text-red-600"
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <Field
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className={`block w-full pl-10 pr-10 py-3 border ${
                      touched.password && errors.password
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    } rounded-lg focus:outline-none focus:ring-2`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="text-gray-400 hover:text-gray-600" />
                    ) : (
                      <FaEye className="text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                <ErrorMessage
                  name="password"
                  component="p"
                  className="mt-1 text-sm text-red-600"
                />
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Field
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>

                <Link
                  to={config.routes.forgotPassword}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isSubmitting || loading ? (
                  <>
                    <Loader size="small" color="white" />
                    <span>Logging in...</span>
                  </>
                ) : (
                  'Login'
                )}
              </button>
            </Form>
          )}
        </Formik>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link
              to={config.routes.register}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;