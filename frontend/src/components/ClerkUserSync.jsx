// ============================================
// CLERK USER SYNC COMPONENT
// ============================================
// This component syncs Clerk user data with MongoDB
// It runs after authentication to ensure user exists in database

import { useEffect, useState } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import config from '../config';
import { setClerkTokenGetter } from '../api/axios';

const ClerkUserSync = ({ children }) => {
  const { user, isLoaded: userLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [synced, setSynced] = useState(false);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set up Clerk token getter for axios
  useEffect(() => {
    if (getToken) {
      setClerkTokenGetter(getToken);
    }
  }, [getToken]);

  useEffect(() => {
    const syncUser = async () => {
      if (!userLoaded || !isSignedIn || !user) {
        setLoading(false);
        return;
      }

      try {
        // Get Clerk token for API calls
        const token = await getToken();
        
        // Check if user exists in MongoDB by Clerk ID
        const response = await axios.post(
          `${config.api.baseURL}/users/sync`,
          {
            clerkId: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            name: user.fullName || user.firstName || user.primaryEmailAddress?.emailAddress?.split('@')[0],
            profileImage: user.imageUrl,
          },
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          }
        );

        const userData = response.data.data;
        setDbUser(userData);
        setSynced(true);

        // Store user data in localStorage for the app to use
        localStorage.setItem('skillverse_user', JSON.stringify(userData));
        localStorage.setItem('skillverse_user_role', userData.role);

        // If user has no role selected yet (first time), redirect to role selection
        if (!userData.role || userData.role === 'learner') {
          // Check if this is a new user (created just now)
          const createdAt = new Date(userData.createdAt);
          const now = new Date();
          const isNewUser = (now - createdAt) < 60000; // Within 1 minute

          if (isNewUser && location.pathname !== '/select-role') {
            // New user, redirect to role selection
            navigate('/select-role');
            return;
          }
        }

        console.log('✅ User synced with MongoDB:', userData.role);
      } catch (error) {
        console.error('❌ Failed to sync user:', error);
        // Still allow the app to work, just without MongoDB sync
        setSynced(true);
      } finally {
        setLoading(false);
      }
    };

    syncUser();
  }, [userLoaded, isSignedIn, user, navigate, location.pathname, getToken]);

  // Show loading while syncing
  if (loading && isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up your account...</p>
        </div>
      </div>
    );
  }

  return children;
};

export default ClerkUserSync;

// ============================================
// CUSTOM HOOK TO GET MONGODB USER
// ============================================
export const useDbUser = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('skillverse_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user:', e);
      }
    }
  }, []);

  const refreshUser = async () => {
    const storedUser = localStorage.getItem('skillverse_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user:', e);
      }
    }
  };

  const updateUserRole = (role) => {
    const updatedUser = { ...user, role };
    setUser(updatedUser);
    localStorage.setItem('skillverse_user', JSON.stringify(updatedUser));
    localStorage.setItem('skillverse_user_role', role);
  };

  return {
    user,
    role: user?.role || localStorage.getItem('skillverse_user_role') || 'learner',
    isAdmin: user?.role === 'admin',
    isEducator: user?.role === 'educator',
    isLearner: user?.role === 'learner',
    isSkillExchanger: user?.role === 'skillExchanger',
    refreshUser,
    updateUserRole,
  };
};
