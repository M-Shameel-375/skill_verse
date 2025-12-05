import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FaPaperPlane, FaPhone, FaVideo, FaEllipsisV, FaSmile, FaPaperclip, FaSpinner } from 'react-icons/fa';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/Card';
import { getExchangeChat, getMessages, sendMessage } from '@/api/chatApi';
import { useUser } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

const ExchangeChat = ({ matchId = '1', partnerInfo = null }) => {
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [partner, setPartner] = useState(partnerInfo || {
    name: 'Partner',
    avatar: 'https://i.pravatar.cc/150?img=5',
    skill: 'Skill Exchange',
  });
  const messagesEndRef = useRef(null);

  // Fetch chat data
  const fetchChat = useCallback(async () => {
    setLoading(true);
    try {
      // Get or create chat for this exchange
      const chatRes = await getExchangeChat(matchId);
      const chatData = chatRes?.data;
      
      if (chatData) {
        setConversationId(chatData._id || chatData.conversationId);
        
        // Set partner info from chat data if available
        if (chatData.partner) {
          setPartner({
            name: chatData.partner.name || 'Partner',
            avatar: chatData.partner.avatar?.url || `https://i.pravatar.cc/150?img=${matchId}`,
            skill: chatData.partner.offeredSkill || 'Skill Exchange',
          });
        }

        // Get messages
        const messagesRes = await getMessages(chatData._id || matchId);
        const messagesData = messagesRes?.data?.messages || messagesRes?.data || [];
        
        // Transform to component format
        const transformedMessages = messagesData.map((msg, index) => ({
          id: msg._id || index,
          sender: msg.sender?.name || (msg.isOwn ? 'You' : partner.name),
          avatar: msg.sender?.avatar?.url || (msg.isOwn ? user?.imageUrl : partner.avatar),
          message: msg.content || msg.message || msg.text,
          timestamp: new Date(msg.createdAt || msg.timestamp).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          isOwn: msg.isOwn || msg.sender?._id === user?.id,
        }));
        
        setMessages(transformedMessages);
      }
    } catch (error) {
      console.error('Failed to fetch chat:', error);
      // If API fails, we'll work with empty state
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [matchId, user?.id, user?.imageUrl, partner]);

  useEffect(() => {
    fetchChat();
  }, [fetchChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSending(true);

    // Optimistic update
    const tempMessage = {
      id: `temp-${Date.now()}`,
      sender: 'You',
      avatar: user?.imageUrl || 'https://i.pravatar.cc/150?img=2',
      message: messageContent,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
    };
    setMessages(prev => [...prev, tempMessage]);

    try {
      if (conversationId) {
        await sendMessage(conversationId, { content: messageContent });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      setNewMessage(messageContent); // Restore the message
    } finally {
      setSending(false);
    }
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
              src={partner.avatar}
              alt={partner.name}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h2 className="font-bold text-gray-900">{partner.name}</h2>
              <p className="text-sm text-gray-500">{partner.skill}</p>
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
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <FaSpinner className="animate-spin text-blue-600 text-3xl" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p>No messages yet.</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
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
