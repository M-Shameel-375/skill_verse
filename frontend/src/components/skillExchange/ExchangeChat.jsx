import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaPhone, FaVideo, FaEllipsisV, FaSmile, FaPaperclip } from 'react-icons/fa';
import Card from '../common/Card';
import toast from 'react-hot-toast';

const ExchangeChat = ({ matchId = '1' }) => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Sarah Lee', avatar: 'https://i.pravatar.cc/150?img=5', message: 'Hi! I want to exchange web design for Python tutoring', timestamp: '2:30 PM', isOwn: false },
    { id: 2, sender: 'You', avatar: 'https://i.pravatar.cc/150?img=2', message: 'That sounds great! I have 5 years Python experience', timestamp: '2:31 PM', isOwn: true },
    { id: 3, sender: 'Sarah Lee', avatar: 'https://i.pravatar.cc/150?img=5', message: 'Perfect! When can we start?', timestamp: '2:32 PM', isOwn: false },
  ]);
  const [newMessage, setNewMessage] = useState('');
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
  };

  const handleStartCall = () => {
    toast.success('Starting voice call...');
  };

  const handleStartVideo = () => {
    toast.success('Starting video call...');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <img
              src="https://i.pravatar.cc/150?img=5"
              alt="Sarah Lee"
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h2 className="font-bold text-gray-900">Sarah Lee</h2>
              <p className="text-sm text-gray-500">Learning Python • Teaching Web Design</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleStartCall}
              className="p-2 hover:bg-gray-100 rounded-lg transition text-blue-600"
              title="Voice call"
            >
              <FaPhone size={20} />
            </button>
            <button
              onClick={handleStartVideo}
              className="p-2 hover:bg-gray-100 rounded-lg transition text-blue-600"
              title="Video call"
            >
              <FaVideo size={20} />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600">
              <FaEllipsisV size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-2xl mx-auto w-full">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
            <img
              src={msg.avatar}
              alt={msg.sender}
              className="w-8 h-8 rounded-full flex-shrink-0"
            />
            <div className={`flex flex-col gap-1 ${msg.isOwn ? 'items-end' : 'items-start'}`}>
              <span className="text-xs text-gray-500">{msg.timestamp}</span>
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

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-2">
            <button className="text-gray-600 hover:text-blue-600 transition p-2 rounded-lg hover:bg-gray-100">
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

            <button className="text-gray-600 hover:text-blue-600 transition p-2 rounded-lg hover:bg-gray-100">
              <FaSmile size={18} />
            </button>

            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2 rounded-lg transition"
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExchangeChat;
