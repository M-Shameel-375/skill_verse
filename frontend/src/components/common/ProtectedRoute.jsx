// ============================================
// PROTECTED ROUTE COMPONENT
// ============================================

import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import config from '../../config';
import { FullPageLoader } from './Loader';
import Alert from './Alert';

// ============================================
// PROTECTED ROUTE
// ============================================
const ProtectedRoute = ({ 
  children, 
  requireAuth = true,
  requireEmailVerification = false,
  allowedRoles = [],
  redirectTo,
}) => {
  const location = useLocation();
  const { 
    isAuthenticated, 
    isEmailVerified, 
    user, 
    userRole,
    loading,
    fetchCurrentUser,
  } = useAuth();

  // ============================================
  // FETCH USER ON MOUNT IF AUTHENTICATED
  // ============================================
  useEffect(() => {
    if (isAuthenticated && !user) {
      fetchCurrentUser();
    }
  }, [isAuthenticated, user, fetchCurrentUser]);

  // ============================================
  // SHOW LOADER WHILE CHECKING AUTH
  // ============================================
  if (loading) {
    return <FullPageLoader message="Verifying authentication..." />;
  }

  // ============================================
  // CHECK AUTHENTICATION
  // ============================================
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate 
        to={redirectTo || config.routes.login} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // ============================================
  // CHECK EMAIL VERIFICATION
  // ============================================
  if (requireEmailVerification && !isEmailVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full">
          <Alert
            type="warning"
            title="Email Verification Required"
            message="Please verify your email address to access this page. Check your inbox for the verification link."
            dismissible={false}
            action={
              <button
                onClick={() => window.location.href = config.routes.dashboard}
                className="text-sm font-medium text-yellow-800 hover:text-yellow-900 underline"
              >
                Go to Dashboard
              </button>
            }
          />
        </div>
      </div>
    );
  }

  // ============================================
  // CHECK ROLE AUTHORIZATION
  // ============================================
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return (
      <Navigate 
        to={redirectTo || config.routes.unauthorized} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // ============================================
  // RENDER PROTECTED CONTENT
  // ============================================
  return <>{children}</>;
};

// ============================================
// REQUIRE AUTH (SHORTHAND)
// ============================================
export const RequireAuth = ({ children, ...props }) => {
  return (
    <ProtectedRoute requireAuth={true} {...props}>
      {children}
    </ProtectedRoute>
  );
};

// ============================================
// REQUIRE ADMIN
// ============================================
export const RequireAdmin = ({ children, ...props }) => {
  return (
    <ProtectedRoute 
      requireAuth={true} 
      allowedRoles={[config.roles.ADMIN]}
      {...props}
    >
      {children}
    </ProtectedRoute>
  );
};

// ============================================
// REQUIRE EDUCATOR
// ============================================
export const RequireEducator = ({ children, ...props }) => {
  return (
    <ProtectedRoute 
      requireAuth={true} 
      allowedRoles={[config.roles.EDUCATOR, config.roles.ADMIN]}
      {...props}
    >
      {children}
    </ProtectedRoute>
  );
};

// ============================================
// REQUIRE LEARNER
// ============================================
export const RequireLearner = ({ children, ...props }) => {
  return (
    <ProtectedRoute 
      requireAuth={true} 
      allowedRoles={[config.roles.LEARNER, config.roles.ADMIN]}
      {...props}
    >
      {children}
    </ProtectedRoute>
  );
};

// ============================================
// REQUIRE SKILL EXCHANGER
// ============================================
export const RequireSkillExchanger = ({ children, ...props }) => {
  return (
    <ProtectedRoute 
      requireAuth={true} 
      allowedRoles={[config.roles.SKILL_EXCHANGER, config.roles.ADMIN]}
      {...props}
    >
      {children}
    </ProtectedRoute>
  );
};

// ============================================
// REQUIRE EMAIL VERIFICATION
// ============================================
export const RequireEmailVerification = ({ children, ...props }) => {
  return (
    <ProtectedRoute 
      requireAuth={true}
      requireEmailVerification={true}
      {...props}
    >
      {children}
    </ProtectedRoute>
  );
};

// ============================================
// GUEST ROUTE (REDIRECT IF AUTHENTICATED)
// ============================================
export const GuestRoute = ({ children, redirectTo = config.routes.dashboard }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <FullPageLoader />;
  }

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

// ============================================
// CONDITIONAL ROUTE
// ============================================
export const ConditionalRoute = ({ 
  children, 
  condition, 
  fallback, 
  redirectTo,
}) => {
  if (redirectTo && !condition) {
    return <Navigate to={redirectTo} replace />;
  }

  return condition ? <>{children}</> : <>{fallback}</>;
};

export default ProtectedRoute;