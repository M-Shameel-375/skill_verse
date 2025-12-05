import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FaPaperPlane, FaSmile, FaPaperclip, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getSessionMessages, sendSessionMessage } from '../../../api/liveSessionApi';

const SessionChat = ({ sessionId, sessionTitle = 'Live Session' }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    if (!sessionId) return;
    try {
      setLoading(true);
      const response = await getSessionMessages(sessionId);
      const data = response.data?.data || response.data;
      setMessages(Array.isArray(data) ? data : data.messages || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
      // Keep empty messages array on error
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchMessages();
    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !sessionId) return;

    try {
      setSending(true);
      await sendSessionMessage(sessionId, { message: newMessage });
      setNewMessage('');
      fetchMessages(); // Refresh messages
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleFileShare = () => {
    toast.success('File upload feature coming soon');
  };

  const emojis = ['😀', '😂', '❤️', '👍', '🎉', '🔥', '💯', '✨'];

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
        <h3 className="font-bold text-lg">Session Chat</h3>
        <p className="text-sm opacity-90">{sessionTitle}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <FaSpinner className="animate-spin text-2xl text-blue-600" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg._id || msg.id} className={`flex gap-3 ${msg.isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
              <img
                src={msg.avatar || msg.sender?.avatar || msg.sender?.profileImage || `https://i.pravatar.cc/150?img=${msg.sender?._id || 1}`}
                alt={msg.sender?.name || msg.sender || 'User'}
                className="w-8 h-8 rounded-full flex-shrink-0"
              />
              <div className={`flex flex-col gap-1 ${msg.isOwn ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${msg.isInstructor ? 'text-yellow-600' : 'text-gray-900'}`}>
                    {msg.sender?.name || msg.sender || 'User'}
                    {msg.isInstructor && ' 👨‍🏫'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {msg.timestamp || (msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '')}
                  </span>
                </div>
                <div
                  className={`px-4 py-2 rounded-lg max-w-xs break-words ${
                    msg.isOwn
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-900 rounded-bl-none'
                  }`}
                >
                  {msg.message || msg.content}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 grid grid-cols-8 gap-2">
          {emojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                setNewMessage(newMessage + emoji);
                setShowEmojiPicker(false);
              }}
              className="text-2xl hover:scale-125 transition cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex gap-2">
          <button
            onClick={handleFileShare}
            className="text-gray-600 hover:text-blue-600 transition p-2 rounded-lg hover:bg-gray-200"
            title="Share file"
          >
            <FaPaperclip size={18} />
          </button>

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="text-gray-600 hover:text-blue-600 transition p-2 rounded-lg hover:bg-gray-200"
            title="Add emoji"
          >
            <FaSmile size={18} />
          </button>

          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2 rounded-lg transition"
            title="Send"
          >
            {sending ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionChat;
