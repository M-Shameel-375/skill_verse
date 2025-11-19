// ============================================
// CUSTOM AUTH HOOK
// ============================================

import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  register as registerAction,
  login as loginAction,
  logout as logoutAction,
  getCurrentUser,
  verifyEmail as verifyEmailAction,
  resendVerificationEmail as resendVerificationAction,
  forgotPassword as forgotPasswordAction,
  resetPassword as resetPasswordAction,
  changePassword as changePasswordAction,
  updateUserDetails as updateUserDetailsAction,
  deleteAccount as deleteAccountAction,
  socialLogin as socialLoginAction,
  clearError,
  clearRegistrationSuccess,
  clearEmailVerificationSuccess,
  clearPasswordResetStates,
  updateUserLocally,
  initializeAuth,
  selectAuth,
  selectUser,
  selectIsAuthenticated,
  selectIsEmailVerified,
  selectAuthLoading,
  selectAuthError,
  selectUserRole,
} from '../redux/slices/authSlice';
import config from '../config';

// ============================================
// USE AUTH HOOK
// ============================================
const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Selectors
  const auth = useSelector(selectAuth);
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isEmailVerified = useSelector(selectIsEmailVerified);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const userRole = useSelector(selectUserRole);

  // ============================================
  // INITIALIZE AUTH ON MOUNT
  // ============================================
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  // ============================================
  // AUTO CLEAR ERROR AFTER 5 SECONDS
  // ============================================
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // ============================================
  // REGISTER
  // ============================================
  const register = useCallback(
    async (userData) => {
      try {
        const result = await dispatch(registerAction(userData)).unwrap();
        toast.success(config.success.REGISTER);
        return result;
      } catch (error) {
        toast.error(error || 'Registration failed');
        throw error;
      }
    },
    [dispatch]
  );

  // ============================================
  // LOGIN
  // ============================================
  const login = useCallback(
    async (credentials, redirectTo = config.routes.dashboard) => {
      try {
        const result = await dispatch(loginAction(credentials)).unwrap();
        toast.success(config.success.LOGIN);
        
        if (redirectTo) {
          navigate(redirectTo);
        }
        
        return result;
      } catch (error) {
        toast.error(error || 'Login failed');
        throw error;
      }
    },
    [dispatch, navigate]
  );

  // ============================================
  // LOGOUT
  // ============================================
  const logout = useCallback(
    async (redirectTo = config.routes.login) => {
      try {
        await dispatch(logoutAction()).unwrap();
        toast.success(config.success.LOGOUT);
        
        if (redirectTo) {
          navigate(redirectTo);
        }
      } catch (error) {
        // Still logout locally even if API fails
        toast.error('Logout failed, but you have been logged out locally');
      }
    },
    [dispatch, navigate]
  );

  // ============================================
  // FETCH CURRENT USER
  // ============================================
  const fetchCurrentUser = useCallback(async () => {
    try {
      const result = await dispatch(getCurrentUser()).unwrap();
      return result;
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      throw error;
    }
  }, [dispatch]);

  // ============================================
  // VERIFY EMAIL
  // ============================================
  const verifyEmail = useCallback(
    async (token) => {
      try {
        await dispatch(verifyEmailAction(token)).unwrap();
        toast.success(config.success.EMAIL_VERIFIED);
        navigate(config.routes.dashboard);
      } catch (error) {
        toast.error(error || 'Email verification failed');
        throw error;
      }
    },
    [dispatch, navigate]
  );

  // ============================================
  // RESEND VERIFICATION EMAIL
  // ============================================
  const resendVerificationEmail = useCallback(async () => {
    try {
      await dispatch(resendVerificationAction()).unwrap();
      toast.success('Verification email sent successfully');
    } catch (error) {
      toast.error(error || 'Failed to resend verification email');
      throw error;
    }
  }, [dispatch]);

  // ============================================
  // FORGOT PASSWORD
  // ============================================
  const forgotPassword = useCallback(
    async (email) => {
      try {
        await dispatch(forgotPasswordAction(email)).unwrap();
        toast.success('Password reset link sent to your email');
      } catch (error) {
        toast.error(error || 'Failed to send reset email');
        throw error;
      }
    },
    [dispatch]
  );

  // ============================================
  // RESET PASSWORD
  // ============================================
  const resetPassword = useCallback(
    async (token, password) => {
      try {
        await dispatch(resetPasswordAction({ token, password })).unwrap();
        toast.success(config.success.PASSWORD_RESET);
        navigate(config.routes.login);
      } catch (error) {
        toast.error(error || 'Password reset failed');
        throw error;
      }
    },
    [dispatch, navigate]
  );

  // ============================================
  // CHANGE PASSWORD
  // ============================================
  const changePassword = useCallback(
    async (currentPassword, newPassword) => {
      try {
        await dispatch(
          changePasswordAction({ currentPassword, newPassword })
        ).unwrap();
        toast.success('Password changed successfully');
      } catch (error) {
        toast.error(error || 'Failed to change password');
        throw error;
      }
    },
    [dispatch]
  );

  // ============================================
  // UPDATE PROFILE
  // ============================================
  const updateProfile = useCallback(
    async (updates) => {
      try {
        const result = await dispatch(updateUserDetailsAction(updates)).unwrap();
        toast.success(config.success.PROFILE_UPDATED);
        return result;
      } catch (error) {
        toast.error(error || 'Failed to update profile');
        throw error;
      }
    },
    [dispatch]
  );

  // ============================================
  // DELETE ACCOUNT
  // ============================================
  const deleteAccount = useCallback(
    async (password) => {
      try {
        await dispatch(deleteAccountAction(password)).unwrap();
        toast.success('Account deleted successfully');
        navigate(config.routes.home);
      } catch (error) {
        toast.error(error || 'Failed to delete account');
        throw error;
      }
    },
    [dispatch, navigate]
  );

  // ============================================
  // SOCIAL LOGIN
  // ============================================
  const handleSocialLogin = useCallback(
    async (provider, token, redirectTo = config.routes.dashboard) => {
      try {
        const result = await dispatch(
          socialLoginAction({ provider, token })
        ).unwrap();
        toast.success(config.success.LOGIN);
        
        if (redirectTo) {
          navigate(redirectTo);
        }
        
        return result;
      } catch (error) {
        toast.error(error || 'Social login failed');
        throw error;
      }
    },
    [dispatch, navigate]
  );

  // ============================================
  // UPDATE USER LOCALLY (NO API CALL)
  // ============================================
  const updateUserLocal = useCallback(
    (updates) => {
      dispatch(updateUserLocally(updates));
    },
    [dispatch]
  );

  // ============================================
  // CLEAR STATES
  // ============================================
  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const clearRegSuccess = useCallback(() => {
    dispatch(clearRegistrationSuccess());
  }, [dispatch]);

  const clearEmailVerSuccess = useCallback(() => {
    dispatch(clearEmailVerificationSuccess());
  }, [dispatch]);

  const clearPwdResetStates = useCallback(() => {
    dispatch(clearPasswordResetStates());
  }, [dispatch]);

  // ============================================
  // ROLE CHECKS
  // ============================================
  const isLearner = userRole === config.roles.LEARNER;
  const isEducator = userRole === config.roles.EDUCATOR;
  const isSkillExchanger = userRole === config.roles.SKILL_EXCHANGER;
  const isAdmin = userRole === config.roles.ADMIN;

  const hasRole = useCallback(
    (role) => {
      return userRole === role;
    },
    [userRole]
  );

  const hasAnyRole = useCallback(
    (roles) => {
      return roles.includes(userRole);
    },
    [userRole]
  );

  // ============================================
  // REQUIRE AUTH (REDIRECT IF NOT AUTHENTICATED)
  // ============================================
  const requireAuth = useCallback(
    (redirectTo = config.routes.login) => {
      if (!isAuthenticated) {
        navigate(redirectTo);
        return false;
      }
      return true;
    },
    [isAuthenticated, navigate]
  );

  // ============================================
  // REQUIRE EMAIL VERIFICATION
  // ============================================
  const requireEmailVerification = useCallback(() => {
    if (!isEmailVerified) {
      toast.error('Please verify your email to continue');
      return false;
    }
    return true;
  }, [isEmailVerified]);

  // ============================================
  // RETURN HOOK VALUES
  // ============================================
  return {
    // State
    user,
    isAuthenticated,
    isEmailVerified,
    loading,
    error,
    userRole,
    auth,
    
    // Actions
    register,
    login,
    logout,
    fetchCurrentUser,
    verifyEmail,
    resendVerificationEmail,
    forgotPassword,
    resetPassword,
    changePassword,
    updateProfile,
    deleteAccount,
    handleSocialLogin,
    updateUserLocal,
    
    // Clear functions
    clearAuthError,
    clearRegSuccess,
    clearEmailVerSuccess,
    clearPwdResetStates,
    
    // Role checks
    isLearner,
    isEducator,
    isSkillExchanger,
    isAdmin,
    hasRole,
    hasAnyRole,
    
    // Guards
    requireAuth,
    requireEmailVerification,
  };
};

export default useAuth;