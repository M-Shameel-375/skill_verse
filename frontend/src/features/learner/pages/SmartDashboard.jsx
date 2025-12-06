import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { syncUser } from '@/api/userApi';
import { FaSpinner } from 'react-icons/fa';

// Import role-specific dashboards
import LearnerDashboard from './LearnerDashboard';
import EducatorDashboard from '@/features/educator/pages/EducatorDashboard';
import AdminDashboard from '@/features/admin/pages/AdminDashboard';
import SkillExchangerDashboard from './SkillExchangerDashboard';

// ============================================
// LOADING COMPONENT
// ============================================
const FullPageLoader = ({ message = 'Loading...' }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
);

// ============================================
// ERROR COMPONENT
// ============================================
const ErrorState = ({ message, onRetry }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-red-600 text-3xl">!</span>
      </div>
      <p className="text-red-600 mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Retry
      </button>
    </div>
  </div>
);

// ============================================
// SMART DASHBOARD COMPONENT
// ============================================
const SmartDashboard = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync and fetch user
  const syncAndFetchUser = useCallback(async () => {
    if (!isLoaded) return;

    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Sync user with MongoDB using the shared API
      const response = await syncUser({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName || user.firstName || user.primaryEmailAddress?.emailAddress?.split('@')[0],
        profileImage: user.imageUrl,
      });

      const userData = response?.data || response;
      setDbUser(userData);

      // Store in localStorage
      localStorage.setItem('skillverse_user', JSON.stringify(userData));
      localStorage.setItem('skillverse_user_role', userData.role || userData.activeRole || 'learner');
    } catch (err) {
      console.error('Failed to sync user:', err);
      setError('Failed to load user data');

      // Try localStorage fallback
      const storedUser = localStorage.getItem('skillverse_user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setDbUser(parsed);
          setError(null);
        } catch (e) {
          // Ignore parse error
        }
      }
    } finally {
      setLoading(false);
    }
  }, [isLoaded, user]);

  useEffect(() => {
    syncAndFetchUser();
  }, [syncAndFetchUser]);

  // Loading state
  if (loading) {
    return <FullPageLoader message="Loading your dashboard..." />;
  }

  // Not logged in - redirect
  if (isLoaded && !user) {
    navigate('/sign-in');
    return <FullPageLoader message="Redirecting to login..." />;
  }

  // Error with no fallback
  if (error && !dbUser) {
    return <ErrorState message={error} onRetry={syncAndFetchUser} />;
  }

  // Still waiting for user data
  if (!dbUser) {
    return <FullPageLoader message="Setting up your account..." />;
  }

  // Determine which dashboard to show
  const userRole = dbUser?.role || dbUser?.activeRole || localStorage.getItem('skillverse_user_role') || 'learner';

  // Render appropriate dashboard
  switch (userRole) {
    case 'admin':
      return <AdminDashboard user={dbUser} />;
    case 'educator':
      return <EducatorDashboard user={dbUser} />;
    case 'skillExchanger':
      return <SkillExchangerDashboard user={dbUser} />;
    case 'learner':
    default:
      return <LearnerDashboard user={dbUser} />;
  }
};

export default SmartDashboard;