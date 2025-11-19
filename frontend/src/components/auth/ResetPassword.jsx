// ============================================
// RESET PASSWORD COMPONENT
// ============================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaLock, FaEye, FaEyeSlash, FaCheckCircle } from 'react-icons/fa';
import useAuth from '../../hooks/useAuth';
import config from '../../config';
import Loader from '../common/Loader';

// ============================================
// VALIDATION SCHEMA
// ============================================
const resetPasswordSchema = Yup.object().shape({
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
});

// ============================================
// PASSWORD STRENGTH INDICATOR
// ============================================
const PasswordStrength = ({ password }) => {
  const getStrength = () => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&#]/.test(password)) strength++;
    return strength;
  };

  const strength = getStrength();
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];
  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded ${
              i < strength ? colors[strength - 1] : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-600">
        Password strength: <span className="font-medium">{labels[strength - 1] || 'Very Weak'}</span>
      </p>
    </div>
  );
};

// ============================================
// RESET PASSWORD COMPONENT
// ============================================
const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword, loading, error, clearAuthError } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [invalidToken, setInvalidToken] = useState(false);

  // ============================================
  // VALIDATE TOKEN ON MOUNT
  // ============================================
  useEffect(() => {
    if (!token) {
      setInvalidToken(true);
    }
  }, [token]);

  // ============================================
  // CLEAR ERROR ON UNMOUNT
  // ============================================
  useEffect(() => {
    return () => clearAuthError();
  }, [clearAuthError]);

  // ============================================
  // HANDLE SUBMIT
  // ============================================
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await resetPassword(token, values.password);
      setResetSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate(config.routes.login);
      }, 3000);
    } catch (error) {
      if (error.includes('token') || error.includes('expired')) {
        setInvalidToken(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================
  // RENDER INVALID TOKEN STATE
  // ============================================
  if (invalidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-2xl text-center">
          <div>
            <div className="rounded-full bg-red-100 p-6 inline-block mb-4">
              <span className="text-red-600 text-6xl">⚠️</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Invalid or Expired Link
            </h2>
            <p className="text-gray-600 mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              to={config.routes.forgotPassword}
              className="w-full block py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              Request New Link
            </Link>

            <Link
              to={config.routes.login}
              className="w-full block py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER SUCCESS STATE
  // ============================================
  if (resetSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-2xl text-center">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 p-6">
              <FaCheckCircle className="text-green-600 text-6xl" />
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Password Reset Successful!
            </h2>
            <p className="text-gray-600 mb-6">
              Your password has been successfully reset. You can now login with your new password.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to login page in 3 seconds...
            </p>
          </div>

          <Link
            to={config.routes.login}
            className="w-full block py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER FORM
  // ============================================
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Reset Your Password
          </h1>
          <p className="text-gray-600">
            Enter your new password below
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" role="alert">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Reset Password Form */}
        <Formik
          initialValues={{
            password: '',
            confirmPassword: '',
          }}
          validationSchema={resetPasswordSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, touched, errors, values }) => (
            <Form className="space-y-6">
              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <Field
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoFocus
                    className={`block w-full pl-10 pr-10 py-3 border ${
                      touched.password && errors.password
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    } rounded-lg focus:outline-none focus:ring-2`}
                    placeholder="Enter new password"
                    onChange={(e) => {
                      setPasswordValue(e.target.value);
                      // Formik's handleChange
                      const event = e;
                      event.persist();
                    }}
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
                <PasswordStrength password={values.password} />
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <Field
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`block w-full pl-10 pr-10 py-3 border ${
                      touched.confirmPassword && errors.confirmPassword
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    } rounded-lg focus:outline-none focus:ring-2`}
                    placeholder="Re-enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash className="text-gray-400 hover:text-gray-600" />
                    ) : (
                      <FaEye className="text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                <ErrorMessage
                  name="confirmPassword"
                  component="p"
                  className="mt-1 text-sm text-red-600"
                />
              </div>

              {/* Password Requirements */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-2">Password must contain:</p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>✓ At least 8 characters</li>
                  <li>✓ One uppercase letter</li>
                  <li>✓ One lowercase letter</li>
                  <li>✓ One number</li>
                  <li>✓ One special character (@$!%*?&#)</li>
                </ul>
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
                    <span>Resetting...</span>
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </Form>
          )}
        </Formik>

        {/* Back to Login Link */}
        <div className="text-center">
          <Link
            to={config.routes.login}
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;