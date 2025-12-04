// ============================================
// PROTECTED ROUTE COMPONENT
// ============================================
// Prevents authenticated users from accessing auth pages

import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

export const GuestOnlyRoute = ({ children }) => {
  const { isSignedIn, isLoaded } = useUser();
  const location = useLocation();

  // Wait for Clerk to load
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user is signed in, redirect to dashboard
  if (isSignedIn) {
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  // Not signed in, show the auth page
  return children;
};

export const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isSignedIn, isLoaded, user } = useUser();
  const location = useLocation();

  // Wait for Clerk to load
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If not signed in, redirect to sign-in
  if (!isSignedIn) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (requiredRole) {
    const storedRole = localStorage.getItem('skillverse_user_role');
    if (storedRole !== requiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

export const RoleSelectionRoute = ({ children }) => {
  const { isSignedIn, isLoaded } = useUser();

  // Wait for Clerk to load
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Must be signed in to select role
  if (!isSignedIn) {
    return <Navigate to="/sign-up" replace />;
  }

  // Check if user already has a role from backend data
  try {
    const storedUser = localStorage.getItem('skillverse_user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      // If user has role set (and it's not the default learner), redirect
      if (userData.role && userData.role !== 'learner') {
        return <Navigate to="/dashboard" replace />;
      }
    }
  } catch (error) {
    console.error('Error checking user role:', error);
  }

  return children;
};
