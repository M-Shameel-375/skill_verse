// ForgotPassword component
// ============================================
// FORGOT PASSWORD COMPONENT
// ============================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaEnvelope, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import useAuth from '../../hooks/useAuth';
import config from '../../config';
import Loader from '../common/Loader';

// ============================================
// VALIDATION SCHEMA
// ============================================
const forgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
});

// ============================================
// FORGOT PASSWORD COMPONENT
// ============================================
const ForgotPassword = () => {
  const { forgotPassword, loading, error, clearAuthError } = useAuth();
  const [emailSent, setEmailSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

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
      await forgotPassword(values.email);
      setSubmittedEmail(values.email);
      setEmailSent(true);
    } catch (error) {
      console.error('Forgot password error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================
  // RENDER SUCCESS STATE
  // ============================================
  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-2xl text-center">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 p-6">
              <FaCheckCircle className="text-green-600 text-6xl" />
            </div>
          </div>

          {/* Success Message */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Check Your Email
            </h2>
            <p className="text-gray-600 mb-4">
              We've sent a password reset link to
            </p>
            <p className="font-medium text-gray-900 mb-6">
              {submittedEmail}
            </p>
            <p className="text-sm text-gray-500">
              If you don't see the email, check your spam folder or try again.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => setEmailSent(false)}
              className="w-full py-3 px-4 border border-blue-600 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors duration-200 font-medium"
            >
              Resend Email
            </button>

            <Link
              to={config.routes.login}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium"
            >
              <FaArrowLeft />
              Back to Login
            </Link>
          </div>
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
            Forgot Password?
          </h1>
          <p className="text-gray-600">
            No worries! Enter your email and we'll send you reset instructions.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" role="alert">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Forgot Password Form */}
        <Formik
          initialValues={{ email: '' }}
          validationSchema={forgotPasswordSchema}
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
                    autoFocus
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isSubmitting || loading ? (
                  <>
                    <Loader size="small" color="white" />
                    <span>Sending...</span>
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </Form>
          )}
        </Formik>

        {/* Back to Login Link */}
        <div className="text-center">
          <Link
            to={config.routes.login}
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            <FaArrowLeft />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;