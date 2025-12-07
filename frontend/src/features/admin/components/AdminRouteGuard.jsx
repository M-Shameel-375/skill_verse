import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import axios from '../../../api/axios';
import toast from 'react-hot-toast';

// ============================================
// ADMIN ROUTE GUARD COMPONENT
// ============================================
// This component ensures only verified/registered admins 
// can access the admin panel
// ============================================

const AdminRouteGuard = ({ children }) => {
  const { user, isLoaded } = useUser();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!isLoaded) return;

      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Check admin status from backend
        const response = await axios.get('/users/me');
        const userData = response.data?.user || response.data?.data || response.data || response;
        
        console.log('Admin check response:', userData);
        
        if (userData.role === 'admin') {
          setIsAdmin(true);
          // Store admin status in localStorage
          localStorage.setItem('skillverse_user_role', 'admin');
          localStorage.setItem('skillverse_user', JSON.stringify(userData));
        } else {
          setIsAdmin(false);
          toast.error(`Access denied. Your role is: ${userData.role}. Admin privileges required.`);
        }
      } catch (error) {
        console.error('Failed to verify admin status:', error);
        
        // Fallback: check localStorage
        const storedRole = localStorage.getItem('skillverse_user_role');
        if (storedRole === 'admin') {
          console.log('✅ Using cached admin status from localStorage');
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          toast.error('Failed to verify admin access. Please try logging in again.');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [user, isLoaded]);

  // Show loading state
  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Redirect non-admins to unauthorized page
  if (!isAdmin) {
    return (
      <Navigate 
        to="/unauthorized" 
        state={{ from: location, message: 'Admin privileges required' }} 
        replace 
      />
    );
  }

  // Render children if admin
  return children;
};

export default AdminRouteGuard;
