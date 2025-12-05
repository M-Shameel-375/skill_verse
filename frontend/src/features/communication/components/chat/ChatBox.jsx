// ============================================
// CHATBOX COMPONENT
// ============================================
// Real-time chat interface with socket integration

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useUser } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical, 
  Phone, 
  Video,
  ArrowLeft,
  Image as ImageIcon,
  File,
  X,
  Check,
  CheckCheck
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import io from 'socket.io-client';
import toast from 'react-hot-toast';
import config from '../../../../config';
import { 
  getMessages, 
  sendMessage, 
  addMessage, 
  setTypingUser, 
  clearTypingUser 
} from '../../../../redux/slices/chatSlice';

// ============================================
// SOCKET CONNECTION
// ============================================
let socket = null;

const getSocket = () => {
  if (!socket) {
    socket = io(config.socket?.url || 'http://localhost:5000', {
      ...config.socket?.options,
      autoConnect: false,
    });
  }
  return socket;
};

// ============================================
// MESSAGE BUBBLE COMPONENT
// ============================================
const MessageBubble = ({ message, isOwn, showAvatar }) => {
  const getStatusIcon = () => {
    if (message.status === 'read') return <CheckCheck className="w-3 h-3 text-blue-500" />;
    if (message.status === 'delivered') return <CheckCheck className="w-3 h-3 text-gray-400" />;
    return <Check className="w-3 h-3 text-gray-400" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      {showAvatar && !isOwn && (
        <img
          src={message.sender?.profileImage?.url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.sender?.name}`}
          alt={message.sender?.name}
          className="w-8 h-8 rounded-full"
        />
      )}
      {!showAvatar && !isOwn && <div className="w-8" />}

      {/* Message Content */}
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
          isOwn
            ? 'bg-blue-600 text-white rounded-br-md'
            : 'bg-gray-100 text-gray-900 rounded-bl-md'
        }`}
      >
        {/* Text */}
        <p className="text-sm whitespace-pre-wrap break-words">
          {message.content?.text || message.content}
        </p>

        {/* Attachments */}
        {message.content?.attachments?.length > 0 && (
          <div className="mt-2 space-y-2">
            {message.content.attachments.map((attachment, idx) => (
              <div key={idx} className="rounded overflow-hidden">
                {attachment.type === 'image' ? (
                  <img src={attachment.url} alt="" className="max-w-full rounded" />
                ) : (
                  <a 
                    href={attachment.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 p-2 rounded ${isOwn ? 'bg-blue-700' : 'bg-gray-200'}`}
                  >
                    <File className="w-4 h-4" />
                    <span className="text-xs truncate">{attachment.name}</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Time & Status */}
        <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className={`text-xs ${isOwn ? 'text-blue-200' : 'text-gray-500'}`}>
            {formatDistanceToNow(new Date(message.createdAt || message.timestamp), { addSuffix: true })}
          </span>
          {isOwn && getStatusIcon()}
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// TYPING INDICATOR COMPONENT
// ============================================
const TypingIndicator = ({ users }) => {
  if (!users || users.length === 0) return null;

  const names = users.map(u => u.name).join(', ');
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex items-center gap-2 px-4 py-2"
    >
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-sm text-gray-500">{names} typing...</span>
    </motion.div>
  );
};

// ============================================
// MAIN CHATBOX COMPONENT
// ============================================
const ChatBox = ({ 
  conversationId, 
  recipient, 
  onBack, 
  onVideoCall, 
  onVoiceCall,
  className = '' 
}) => {
  const dispatch = useDispatch();
  const { user } = useUser();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const { messages, messagesLoading, typingUsers } = useSelector(state => state.chat || {
    messages: [],
    messagesLoading: false,
    typingUsers: {}
  });
  
  const [messageText, setMessageText] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // ============================================
  // SOCKET CONNECTION & EVENTS
  // ============================================
  useEffect(() => {
    const socketInstance = getSocket();

    socketInstance.connect();

    socketInstance.on('connect', () => {
      setIsConnected(true);
      if (conversationId) {
        socketInstance.emit('chat:join', conversationId);
      }
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('chat:message', (data) => {
      if (data.chatId === conversationId) {
        dispatch(addMessage(data.message));
      }
    });

    socketInstance.on('chat:typing', (data) => {
      if (data.chatId === conversationId && data.userId !== user?.id) {
        dispatch(setTypingUser({ chatId: conversationId, user: data.user }));
      }
    });

    socketInstance.on('chat:stopTyping', (data) => {
      if (data.chatId === conversationId) {
        dispatch(clearTypingUser({ chatId: conversationId, userId: data.userId }));
      }
    });

    socketInstance.on('chat:error', (error) => {
      toast.error(error.message || 'Chat error occurred');
    });

    return () => {
      if (conversationId) {
        socketInstance.emit('chat:leave', conversationId);
      }
      socketInstance.off('connect');
      socketInstance.off('disconnect');
      socketInstance.off('chat:message');
      socketInstance.off('chat:typing');
      socketInstance.off('chat:stopTyping');
      socketInstance.off('chat:error');
    };
  }, [conversationId, user?.id, dispatch]);

  // ============================================
  // FETCH MESSAGES
  // ============================================
  useEffect(() => {
    if (conversationId) {
      dispatch(getMessages({ conversationId, page: 1, limit: 50 }));
    }
  }, [conversationId, dispatch]);

  // ============================================
  // AUTO SCROLL TO BOTTOM
  // ============================================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ============================================
  // TYPING INDICATOR LOGIC
  // ============================================
  const typingTimeoutRef = useRef(null);

  const handleTyping = useCallback(() => {
    const socketInstance = getSocket();
    
    socketInstance.emit('chat:typing', {
      chatId: conversationId,
      userId: user?.id,
      user: { name: user?.firstName || 'User' }
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socketInstance.emit('chat:stopTyping', {
        chatId: conversationId,
        userId: user?.id
      });
    }, 2000);
  }, [conversationId, user]);

  // ============================================
  // SEND MESSAGE HANDLER
  // ============================================
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    
    if (!messageText.trim() && attachments.length === 0) return;

    const socketInstance = getSocket();

    // Emit via socket for real-time
    socketInstance.emit('chat:message', {
      chatId: conversationId,
      message: messageText.trim(),
      attachments: attachments.map(a => ({
        type: a.type,
        url: a.url,
        name: a.name
      }))
    });

    // Also dispatch to Redux for API persistence
    dispatch(sendMessage({
      conversationId,
      content: messageText.trim(),
      attachments
    }));

    // Clear input
    setMessageText('');
    setAttachments([]);
    inputRef.current?.focus();
  };

  // ============================================
  // FILE ATTACHMENT HANDLER
  // ============================================
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachments(prev => [...prev, {
          type: file.type.startsWith('image/') ? 'image' : 'file',
          name: file.name,
          url: reader.result,
          file
        }]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // ============================================
  // GET TYPING USERS FOR THIS CHAT
  // ============================================
  const currentTypingUsers = typingUsers?.[conversationId] 
    ? Object.values(typingUsers[conversationId]) 
    : [];

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-full lg:hidden">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}
          <img
            src={recipient?.profileImage?.url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${recipient?.name}`}
            alt={recipient?.name}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h3 className="font-semibold text-gray-900">{recipient?.name || 'Chat'}</h3>
            <p className="text-xs text-gray-500">
              {isConnected ? (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  Online
                </span>
              ) : 'Offline'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onVoiceCall && (
            <button 
              onClick={onVoiceCall}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Phone className="w-5 h-5 text-gray-600" />
            </button>
          )}
          {onVideoCall && (
            <button 
              onClick={onVideoCall}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Video className="w-5 h-5 text-gray-600" />
            </button>
          )}
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messagesLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Send className="w-12 h-12 mb-2 text-gray-300" />
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const isOwn = message.sender?._id === user?.id || message.sender === user?.id;
              const showAvatar = index === 0 || 
                messages[index - 1]?.sender?._id !== message.sender?._id;
              
              return (
                <MessageBubble
                  key={message._id || index}
                  message={message}
                  isOwn={isOwn}
                  showAvatar={showAvatar}
                />
              );
            })}
            
            <AnimatePresence>
              {currentTypingUsers.length > 0 && (
                <TypingIndicator users={currentTypingUsers} />
              )}
            </AnimatePresence>
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="px-4 py-2 border-t bg-gray-50">
          <div className="flex gap-2 overflow-x-auto">
            {attachments.map((attachment, index) => (
              <div key={index} className="relative flex-shrink-0">
                {attachment.type === 'image' ? (
                  <img 
                    src={attachment.url} 
                    alt="" 
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <File className="w-6 h-6 text-gray-500" />
                  </div>
                )}
                <button
                  onClick={() => removeAttachment(index)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="px-4 py-3 border-t bg-white">
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Paperclip className="w-5 h-5 text-gray-500" />
          </button>

          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Smile className="w-5 h-5 text-gray-500" />
          </button>

          <input
            ref={inputRef}
            type="text"
            value={messageText}
            onChange={(e) => {
              setMessageText(e.target.value);
              handleTyping();
            }}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={!messageText.trim() && attachments.length === 0}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatBox;
