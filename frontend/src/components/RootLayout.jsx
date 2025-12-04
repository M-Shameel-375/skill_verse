// ============================================
// ROOT LAYOUT WITH USER SYNC
// ============================================
// This component wraps all routes and handles user sync

import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import config from '../config';
import { setClerkTokenGetter } from '../api/axios';

const RootLayout = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [syncComplete, setSyncComplete] = useState(false);

  // Set up Clerk token getter for axios
  useEffect(() => {
    if (getToken) {
      setClerkTokenGetter(getToken);
    }
  }, [getToken]);

  // Sync user with MongoDB
  useEffect(() => {
    const syncUser = async () => {
      if (!isLoaded || !isSignedIn || !user) {
        setSyncComplete(true);
        return;
      }

      try {
        const token = await getToken();
        
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
        
        // Store user data in localStorage
        localStorage.setItem('skillverse_user', JSON.stringify(userData));
        localStorage.setItem('skillverse_user_role', userData.role || '');

        console.log('✅ User synced with MongoDB:', userData.role);

        // Handle role-based redirects AFTER sync
        const hasRole = userData.role && userData.role !== 'learner';
        
        // If on landing/home page and authenticated, redirect to dashboard
        if (location.pathname === '/' && isSignedIn) {
          navigate('/dashboard', { replace: true });
        }
        // If no role selected yet, redirect to role selection
        else if (!userData.role && location.pathname !== '/select-role') {
          navigate('/select-role', { replace: true });
        }
        // If has role and trying to access role selection, redirect to dashboard
        else if (hasRole && location.pathname === '/select-role') {
          navigate('/dashboard', { replace: true });
        }

        setSyncComplete(true);
      } catch (error) {
        console.error('❌ Failed to sync user:', error);
        
        // If backend is not available, still allow user to proceed
        // Check localStorage for cached user data
        const cachedUser = localStorage.getItem('skillverse_user');
        if (cachedUser) {
          try {
            const userData = JSON.parse(cachedUser);
            const hasRole = userData.role && userData.role !== 'learner';
            
            // Apply cached redirects
            if (location.pathname === '/' && isSignedIn) {
              navigate('/dashboard', { replace: true });
            } else if (!userData.role && location.pathname !== '/select-role') {
              navigate('/select-role', { replace: true });
            } else if (hasRole && location.pathname === '/select-role') {
              navigate('/dashboard', { replace: true });
            }
          } catch (e) {
            console.error('Failed to parse cached user:', e);
          }
        }
        
        setSyncComplete(true);
      }
    };

    syncUser();
  }, [isLoaded, isSignedIn, user, getToken, navigate, location.pathname]);

  // Show loading while syncing authenticated users
  if (isSignedIn && !syncComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default RootLayout;
