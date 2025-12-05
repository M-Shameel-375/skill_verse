// ============================================
// MESSAGE LIST COMPONENT
// ============================================
// Displays a scrollable list of chat messages

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { Check, CheckCheck, File, Image as ImageIcon, Play } from 'lucide-react';

// ============================================
// DATE SEPARATOR COMPONENT
// ============================================
const DateSeparator = ({ date }) => {
  const formatDateLabel = (dateStr) => {
    const d = new Date(dateStr);
    if (isToday(d)) return 'Today';
    if (isYesterday(d)) return 'Yesterday';
    return format(d, 'MMMM d, yyyy');
  };

  return (
    <div className="flex items-center justify-center my-4">
      <div className="px-3 py-1 bg-gray-200 rounded-full">
        <span className="text-xs text-gray-600 font-medium">
          {formatDateLabel(date)}
        </span>
      </div>
    </div>
  );
};

// ============================================
// MESSAGE ITEM COMPONENT
// ============================================
const MessageItem = ({ message, isOwn, showAvatar, showName, onImageClick }) => {
  const getStatusIcon = () => {
    if (message.status === 'read') {
      return <CheckCheck className="w-3 h-3 text-blue-500" />;
    }
    if (message.status === 'delivered') {
      return <CheckCheck className="w-3 h-3 text-gray-400" />;
    }
    if (message.status === 'sent') {
      return <Check className="w-3 h-3 text-gray-400" />;
    }
    return null;
  };

  const renderAttachment = (attachment, index) => {
    switch (attachment.type) {
      case 'image':
        return (
          <div 
            key={index}
            className="cursor-pointer overflow-hidden rounded-lg"
            onClick={() => onImageClick?.(attachment.url)}
          >
            <img 
              src={attachment.url} 
              alt={attachment.name || 'Image'}
              className="max-w-[200px] max-h-[200px] object-cover hover:opacity-90 transition-opacity"
            />
          </div>
        );
      case 'video':
        return (
          <div key={index} className="relative rounded-lg overflow-hidden">
            <video 
              src={attachment.url} 
              className="max-w-[200px] max-h-[200px] object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <Play className="w-10 h-10 text-white" fill="white" />
            </div>
          </div>
        );
      case 'file':
      default:
        return (
          <a
            key={index}
            href={attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 p-2 rounded-lg ${
              isOwn ? 'bg-blue-700 hover:bg-blue-800' : 'bg-gray-200 hover:bg-gray-300'
            } transition-colors`}
          >
            <File className="w-5 h-5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{attachment.name}</p>
              {attachment.size && (
                <p className={`text-xs ${isOwn ? 'text-blue-200' : 'text-gray-500'}`}>
                  {(attachment.size / 1024).toFixed(1)} KB
                </p>
              )}
            </div>
          </a>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}
    >
      <div className={`flex items-end gap-2 max-w-[75%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        {showAvatar && !isOwn && (
          <img
            src={message.sender?.profileImage?.url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.sender?.name || 'user'}`}
            alt={message.sender?.name}
            className="w-8 h-8 rounded-full flex-shrink-0"
          />
        )}
        {!showAvatar && !isOwn && <div className="w-8 flex-shrink-0" />}

        {/* Message Bubble */}
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
          {/* Sender Name (for group chats) */}
          {showName && !isOwn && (
            <span className="text-xs text-gray-500 mb-1 ml-1">
              {message.sender?.name}
            </span>
          )}

          <div
            className={`rounded-2xl px-4 py-2 ${
              isOwn
                ? 'bg-blue-600 text-white rounded-br-md'
                : 'bg-white text-gray-900 rounded-bl-md shadow-sm border border-gray-100'
            }`}
          >
            {/* Reply Reference */}
            {message.replyTo && (
              <div 
                className={`mb-2 p-2 rounded-lg border-l-2 ${
                  isOwn 
                    ? 'bg-blue-700 border-blue-400' 
                    : 'bg-gray-100 border-gray-400'
                }`}
              >
                <p className={`text-xs font-medium ${isOwn ? 'text-blue-200' : 'text-gray-500'}`}>
                  {message.replyTo.sender?.name}
                </p>
                <p className={`text-sm truncate ${isOwn ? 'text-blue-100' : 'text-gray-600'}`}>
                  {message.replyTo.content?.text || message.replyTo.content}
                </p>
              </div>
            )}

            {/* Text Content */}
            {(message.content?.text || typeof message.content === 'string') && (
              <p className="text-sm whitespace-pre-wrap break-words">
                {message.content?.text || message.content}
              </p>
            )}

            {/* Attachments */}
            {message.content?.attachments?.length > 0 && (
              <div className="mt-2 space-y-2">
                {message.content.attachments.map(renderAttachment)}
              </div>
            )}

            {/* Time & Status */}
            <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <span className={`text-xs ${isOwn ? 'text-blue-200' : 'text-gray-400'}`}>
                {format(new Date(message.createdAt || message.timestamp || Date.now()), 'h:mm a')}
              </span>
              {isOwn && getStatusIcon()}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// MAIN MESSAGE LIST COMPONENT
// ============================================
const MessageList = ({ 
  messages = [], 
  currentUserId, 
  loading = false,
  onLoadMore,
  hasMore = false,
  isGroupChat = false,
  onImageClick 
}) => {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const prevMessagesLengthRef = useRef(messages.length);

  // Auto-scroll on new messages
  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages.length]);

  // Infinite scroll for loading more
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !onLoadMore || !hasMore) return;

    const handleScroll = () => {
      if (container.scrollTop === 0 && !loading) {
        onLoadMore();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [onLoadMore, hasMore, loading]);

  // Group messages by date
  const groupMessagesByDate = (msgs) => {
    const groups = {};
    msgs.forEach(msg => {
      const date = format(new Date(msg.createdAt || msg.timestamp || Date.now()), 'yyyy-MM-dd');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(msg);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  if (loading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <ImageIcon className="w-8 h-8 text-gray-400" />
        </div>
        <p className="font-medium">No messages yet</p>
        <p className="text-sm text-gray-400">Start the conversation!</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 space-y-1 bg-gray-50"
    >
      {/* Load More Indicator */}
      {loading && hasMore && (
        <div className="flex justify-center py-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
        </div>
      )}

      {/* Messages grouped by date */}
      {Object.entries(messageGroups).map(([date, dateMessages]) => (
        <div key={date}>
          <DateSeparator date={date} />
          
          {dateMessages.map((message, index) => {
            const isOwn = message.sender?._id === currentUserId || 
                          message.sender === currentUserId ||
                          message.senderId === currentUserId;
            
            const prevMessage = dateMessages[index - 1];
            const showAvatar = !prevMessage || 
                              prevMessage.sender?._id !== message.sender?._id;
            const showName = isGroupChat && showAvatar;

            return (
              <MessageItem
                key={message._id || message.id || index}
                message={message}
                isOwn={isOwn}
                showAvatar={showAvatar}
                showName={showName}
                onImageClick={onImageClick}
              />
            );
          })}
        </div>
      ))}

      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
