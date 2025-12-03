// ============================================
// SMART DASHBOARD - ROLE-BASED ROUTING
// ============================================

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';
import config from '../../../config';
import { FullPageLoader } from '../../shared/components/Loader';

// Import role-specific dashboards
import LearnerDashboard from './LearnerDashboard';
import EducatorDashboard from '../../educator/components/EducatorDashboard';
import AdminDashboard from '../../admin/components/AdminDashboard';
import SkillExchangerDashboard from './SkillExchangerDashboard';

const SmartDashboard = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const syncAndFetchUser = async () => {
      if (!isLoaded || !user) {
        setLoading(false);
        return;
      }

      try {
        // Sync user with MongoDB
        const response = await axios.post(
          `${config.api.baseURL}/users/sync`,
          {
            clerkId: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            name: user.fullName || user.firstName || user.primaryEmailAddress?.emailAddress?.split('@')[0],
            profileImage: user.imageUrl,
          }
        );

        const userData = response.data.data;
        setDbUser(userData);

        // Store in localStorage
        localStorage.setItem('skillverse_user', JSON.stringify(userData));
        localStorage.setItem('skillverse_user_role', userData.role);

        console.log('✅ Dashboard - User role:', userData.role);
      } catch (err) {
        console.error('❌ Failed to sync user:', err);
        setError('Failed to load user data');
        
        // Try to use localStorage as fallback
        const storedUser = localStorage.getItem('skillverse_user');
        if (storedUser) {
          try {
            setDbUser(JSON.parse(storedUser));
          } catch (e) {
            // Ignore parse error
          }
        }
      } finally {
        setLoading(false);
      }
    };

    syncAndFetchUser();
  }, [isLoaded, user]);

  if (loading) {
    return <FullPageLoader />;
  }

  if (error && !dbUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Determine which dashboard to show based on user role
  const userRole = dbUser?.role || localStorage.getItem('skillverse_user_role') || 'learner';

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
