import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaSmile, FaPaperclip } from 'react-icons/fa';
import toast from 'react-hot-toast';

const SessionChat = () => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'John Instructor', avatar: 'https://i.pravatar.cc/150?img=1', message: 'Welcome to the session!', timestamp: '10:30 AM', isInstructor: true },
    { id: 2, sender: 'Alice Smith', avatar: 'https://i.pravatar.cc/150?img=3', message: 'Thanks for joining!', timestamp: '10:31 AM' },
    { id: 3, sender: 'You', avatar: 'https://i.pravatar.cc/150?img=2', message: 'Great session so far', timestamp: '10:32 AM', isOwn: true },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: messages.length + 1,
      sender: 'You',
      avatar: 'https://i.pravatar.cc/150?img=2',
      message: newMessage,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
    };

    setMessages([...messages, message]);
    setNewMessage('');
    toast.success('Message sent');
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
        <p className="text-sm opacity-90">React Hooks Deep Dive</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
            <img
              src={msg.avatar}
              alt={msg.sender}
              className="w-8 h-8 rounded-full flex-shrink-0"
            />
            <div className={`flex flex-col gap-1 ${msg.isOwn ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${msg.isInstructor ? 'text-yellow-600' : 'text-gray-900'}`}>
                  {msg.sender}
                  {msg.isInstructor && ' 👨‍🏫'}
                </span>
                <span className="text-xs text-gray-500">{msg.timestamp}</span>
              </div>
              <div
                className={`px-4 py-2 rounded-lg max-w-xs break-words ${
                  msg.isOwn
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-900 rounded-bl-none'
                }`}
              >
                {msg.message}
              </div>
            </div>
          </div>
        ))}
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
            disabled={!newMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2 rounded-lg transition"
            title="Send"
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionChat;
