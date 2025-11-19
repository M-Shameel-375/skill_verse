// ============================================
// USE SOCKET HOOK
// ============================================

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { selectIsAuthenticated, selectUser } from '../redux/slices/authSlice';
import config from '../config';
import { storage } from '../utils/helpers';

/**
 * Custom hook for Socket.io connection
 * @returns {Object} - Socket instance and connection state
 */
const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // ============================================
  // INITIALIZE SOCKET CONNECTION
  // ============================================
  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Disconnect if not authenticated
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Get auth token
    const token = storage.get(config.auth.tokenKey);
    if (!token) return;

    // Create socket connection
    const newSocket = io(config.socket.url, {
      ...config.socket.options,
      auth: {
        token,
      },
      query: {
        userId: user._id,
      },
    });

    // ============================================
    // SOCKET EVENT LISTENERS
    // ============================================

    // Connection successful
    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id);
      setIsConnected(true);
      setConnectionError(null);
      reconnectAttempts.current = 0;
    });

    // Connection error
    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
      setConnectionError(error.message);
      reconnectAttempts.current += 1;

      if (reconnectAttempts.current >= maxReconnectAttempts) {
        console.error('Max reconnect attempts reached');
        newSocket.disconnect();
      }
    });

    // Disconnected
    newSocket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      setIsConnected(false);

      // Auto-reconnect if not a manual disconnect
      if (reason === 'io server disconnect') {
        newSocket.connect();
      }
    });

    // Reconnection attempt
    newSocket.on('reconnect_attempt', (attempt) => {
      console.log(`🔄 Reconnection attempt ${attempt}...`);
    });

    // Reconnected successfully
    newSocket.on('reconnect', (attemptNumber) => {
      console.log(`✅ Reconnected after ${attemptNumber} attempts`);
      setIsConnected(true);
      setConnectionError(null);
      reconnectAttempts.current = 0;
    });

    // Error event
    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
      setConnectionError(error.message);
    });

    setSocket(newSocket);

    // ============================================
    // CLEANUP
    // ============================================
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [isAuthenticated, user]);

  // ============================================
  // EMIT EVENT
  // ============================================
  const emit = useCallback(
    (event, data, callback) => {
      if (!socket || !isConnected) {
        console.warn('Socket not connected. Cannot emit:', event);
        return false;
      }

      socket.emit(event, data, callback);
      return true;
    },
    [socket, isConnected]
  );

  // ============================================
  // LISTEN TO EVENT
  // ============================================
  const on = useCallback(
    (event, handler) => {
      if (!socket) {
        console.warn('Socket not initialized');
        return;
      }

      socket.on(event, handler);
    },
    [socket]
  );

  // ============================================
  // REMOVE EVENT LISTENER
  // ============================================
  const off = useCallback(
    (event, handler) => {
      if (!socket) return;
      socket.off(event, handler);
    },
    [socket]
  );

  // ============================================
  // JOIN ROOM
  // ============================================
  const joinRoom = useCallback(
    (roomId) => {
      return emit('room:join', { roomId });
    },
    [emit]
  );

  // ============================================
  // LEAVE ROOM
  // ============================================
  const leaveRoom = useCallback(
    (roomId) => {
      return emit('room:leave', { roomId });
    },
    [emit]
  );

  // ============================================
  // SEND MESSAGE
  // ============================================
  const sendMessage = useCallback(
    (conversationId, message) => {
      return emit('message:send', {
        conversationId,
        message,
      });
    },
    [emit]
  );

  // ============================================
  // SET TYPING STATUS
  // ============================================
  const setTyping = useCallback(
    (conversationId, isTyping) => {
      return emit('typing:set', {
        conversationId,
        isTyping,
      });
    },
    [emit]
  );

  // ============================================
  // JOIN LIVE SESSION
  // ============================================
  const joinLiveSession = useCallback(
    (sessionId) => {
      return emit('session:join', { sessionId });
    },
    [emit]
  );

  // ============================================
  // LEAVE LIVE SESSION
  // ============================================
  const leaveLiveSession = useCallback(
    (sessionId) => {
      return emit('session:leave', { sessionId });
    },
    [emit]
  );

  // ============================================
  // SEND SESSION CHAT MESSAGE
  // ============================================
  const sendSessionMessage = useCallback(
    (sessionId, message) => {
      return emit('session:message', {
        sessionId,
        message,
      });
    },
    [emit]
  );

  // ============================================
  // UPDATE ONLINE STATUS
  // ============================================
  const updateOnlineStatus = useCallback(
    (status) => {
      return emit('user:status', { status });
    },
    [emit]
  );

  // ============================================
  // RECONNECT MANUALLY
  // ============================================
  const reconnect = useCallback(() => {
    if (socket) {
      socket.connect();
    }
  }, [socket]);

  // ============================================
  // DISCONNECT MANUALLY
  // ============================================
  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
    }
  }, [socket]);

  // ============================================
  // RETURN HOOK VALUES
  // ============================================
  return {
    // Socket instance
    socket,
    
    // Connection state
    isConnected,
    connectionError,
    
    // Base methods
    emit,
    on,
    off,
    
    // Room methods
    joinRoom,
    leaveRoom,
    
    // Chat methods
    sendMessage,
    setTyping,
    
    // Live session methods
    joinLiveSession,
    leaveLiveSession,
    sendSessionMessage,
    
    // User methods
    updateOnlineStatus,
    
    // Connection methods
    reconnect,
    disconnect,
  };
};

export default useSocket;