// ============================================
// USE NOTIFICATION HOOK
// ============================================

import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  addNotification,
  selectNotifications,
  selectUnreadCount,
  selectNotificationLoading,
} from '../redux/slices/notificationSlice';
import useSocket from './useSocket';
import config from '../config';

/**
 * Custom hook for managing notifications
 * @returns {Object} - Notification methods and state
 */
const useNotification = () => {
  const dispatch = useDispatch();
  const { socket, isConnected } = useSocket();
  
  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadCount);
  const loading = useSelector(selectNotificationLoading);

  // ============================================
  // FETCH NOTIFICATIONS
  // ============================================
  const fetchNotifications = useCallback(
    (page = 1, limit = 20) => {
      dispatch(getNotifications({ page, limit }));
    },
    [dispatch]
  );

  // ============================================
  // FETCH UNREAD COUNT
  // ============================================
  const fetchUnreadCount = useCallback(() => {
    dispatch(getUnreadCount());
  }, [dispatch]);

  // ============================================
  // MARK NOTIFICATION AS READ
  // ============================================
  const markNotificationAsRead = useCallback(
    async (notificationId) => {
      try {
        await dispatch(markAsRead(notificationId)).unwrap();
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    },
    [dispatch]
  );

  // ============================================
  // MARK ALL AS READ
  // ============================================
  const markAllNotificationsAsRead = useCallback(async () => {
    try {
      await dispatch(markAllAsRead()).unwrap();
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  }, [dispatch]);

  // ============================================
  // DELETE NOTIFICATION
  // ============================================
  const removeNotification = useCallback(
    async (notificationId) => {
      try {
        await dispatch(deleteNotification(notificationId)).unwrap();
        toast.success('Notification deleted');
      } catch (error) {
        toast.error('Failed to delete notification');
      }
    },
    [dispatch]
  );

  // ============================================
  // SHOW TOAST NOTIFICATION
  // ============================================
  const showToast = useCallback((type, message, options = {}) => {
    const toastOptions = {
      duration: config.timings.toastDuration,
      ...options,
    };

    switch (type) {
      case 'success':
        toast.success(message, toastOptions);
        break;
      case 'error':
        toast.error(message, toastOptions);
        break;
      case 'loading':
        toast.loading(message, toastOptions);
        break;
      case 'info':
      default:
        toast(message, toastOptions);
        break;
    }
  }, []);

  // ============================================
  // HANDLE REAL-TIME NOTIFICATIONS
  // ============================================
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Listen for new notifications
    const handleNewNotification = (notification) => {
      dispatch(addNotification(notification));
      
      // Show toast notification
      const notificationMessages = {
        course_enrollment: '🎓 Successfully enrolled in course',
        course_completion: '🎉 Congratulations! Course completed',
        new_message: '💬 New message received',
        skill_exchange_request: '🤝 New skill exchange request',
        skill_exchange_accepted: '✅ Skill exchange request accepted',
        badge_earned: '🏆 New badge earned',
        certificate_issued: '📜 Certificate issued',
        payment_success: '💰 Payment successful',
        course_update: '📚 Course updated',
        live_session_reminder: '🔔 Live session starting soon',
        review_received: '⭐ New review received',
      };

      const message = notificationMessages[notification.type] || 'New notification';
      
      toast(message, {
        duration: 4000,
        icon: '🔔',
      });
    };

    socket.on('notification:new', handleNewNotification);

    // Cleanup
    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, [socket, isConnected, dispatch]);

  // ============================================
  // FETCH INITIAL DATA
  // ============================================
  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // ============================================
  // RETURN HOOK VALUES
  // ============================================
  return {
    // State
    notifications,
    unreadCount,
    loading,
    
    // Methods
    fetchNotifications,
    fetchUnreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    removeNotification,
    showToast,
    
    // Toast shortcuts
    toast: {
      success: (message, options) => showToast('success', message, options),
      error: (message, options) => showToast('error', message, options),
      info: (message, options) => showToast('info', message, options),
      loading: (message, options) => showToast('loading', message, options),
    },
  };
};

export default useNotification;