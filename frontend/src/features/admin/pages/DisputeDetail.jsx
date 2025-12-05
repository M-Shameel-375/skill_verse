import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FaArrowLeft,
  FaUser,
  FaClock,
  FaSpinner,
  FaPaperPlane,
  FaStickyNote,
  FaCheckCircle,
  FaExclamationTriangle,
  FaGavel,
  FaUserShield,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import {
  getDisputeById,
  updateDisputeStatus,
  resolveDispute,
  addAdminNote,
  addDisputeMessage,
} from '../../../api/disputeApi';

const DisputeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dispute, setDispute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [newNote, setNewNote] = useState('');
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolution, setResolution] = useState({
    outcome: '',
    description: '',
    actions: [],
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchDispute();
  }, [id]);

  const fetchDispute = async () => {
    try {
      setLoading(true);
      const response = await getDisputeById(id);
      const data = response.data?.data || response.data;
      setDispute(data);
    } catch (error) {
      console.error('Error fetching dispute:', error);
      toast.error('Failed to fetch dispute details');
      navigate('/admin/disputes');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      setSending(true);
      await addDisputeMessage(id, newMessage);
      setNewMessage('');
      toast.success('Message sent');
      fetchDispute();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      setSending(true);
      await addAdminNote(id, newNote);
      setNewNote('');
      toast.success('Note added');
      fetchDispute();
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    } finally {
      setSending(false);
    }
  };

  const handleResolve = async () => {
    if (!resolution.outcome || !resolution.description) {
      toast.error('Please provide outcome and description');
      return;
    }
    
    try {
      setSending(true);
      await resolveDispute(id, resolution);
      toast.success('Dispute resolved successfully');
      setShowResolveModal(false);
      fetchDispute();
    } catch (error) {
      console.error('Error resolving dispute:', error);
      toast.error('Failed to resolve dispute');
    } finally {
      setSending(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800',
      'under-review': 'bg-blue-100 text-blue-800',
      investigating: 'bg-purple-100 text-purple-800',
      resolved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      escalated: 'bg-orange-100 text-orange-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    return statusStyles[status] || statusStyles.pending;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  if (!dispute) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500">Dispute not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/disputes')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <FaArrowLeft /> Back to Disputes
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {dispute.disputeNumber}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">{dispute.title}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(dispute.status)}`}>
                {dispute.status}
              </span>
              {dispute.status !== 'resolved' && dispute.status !== 'closed' && (
                <button
                  onClick={() => setShowResolveModal(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <FaGavel /> Resolve
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Description
              </h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {dispute.description}
              </p>

              {dispute.evidence?.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Evidence</h3>
                  <div className="flex flex-wrap gap-2">
                    {dispute.evidence.map((item, index) => (
                      <a
                        key={index}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {item.type}: {item.description || `Evidence ${index + 1}`}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Messages
              </h2>
              
              <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
                {dispute.messages?.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No messages yet
                  </p>
                ) : (
                  dispute.messages?.map((msg, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg ${
                        msg.senderRole === 'admin'
                          ? 'bg-blue-50 dark:bg-blue-900/30 ml-8'
                          : 'bg-gray-50 dark:bg-gray-700 mr-8'
                      } ${msg.isInternal ? 'border-2 border-dashed border-yellow-400' : ''}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <img
                          src={msg.sender?.avatar || `https://i.pravatar.cc/32?u=${msg.sender?._id}`}
                          alt=""
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="font-medium text-gray-900 dark:text-white text-sm">
                          {msg.sender?.name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({msg.senderRole})
                        </span>
                        {msg.isInternal && (
                          <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded">
                            Internal
                          </span>
                        )}
                        <span className="text-xs text-gray-400 ml-auto">
                          {formatDate(msg.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">{msg.message}</p>
                    </div>
                  ))
                )}
              </div>

              {/* New Message Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={sending || !newMessage.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
                >
                  {sending ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                </button>
              </div>
            </div>

            {/* Admin Notes */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FaStickyNote className="text-yellow-500" /> Admin Notes (Internal)
              </h2>
              
              <div className="space-y-3 mb-4">
                {dispute.adminNotes?.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No admin notes yet
                  </p>
                ) : (
                  dispute.adminNotes?.map((note, index) => (
                    <div key={index} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900 dark:text-white text-sm">
                          {note.admin?.name || 'Admin'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(note.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">{note.note}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Note */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add an internal note..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
                />
                <button
                  onClick={handleAddNote}
                  disabled={sending || !newNote.trim()}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
                >
                  {sending ? <FaSpinner className="animate-spin" /> : <FaStickyNote />}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Details */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Details
              </h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">
                    {dispute.type?.replace('-', ' ')}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">
                    {dispute.category?.replace('-', ' ')}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Priority</p>
                  <p className={`font-medium capitalize ${
                    dispute.priority === 'urgent' ? 'text-red-600' :
                    dispute.priority === 'high' ? 'text-orange-600' :
                    dispute.priority === 'medium' ? 'text-blue-600' :
                    'text-gray-600'
                  }`}>
                    {dispute.priority}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Submitted</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(dispute.submittedAt)}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Last Activity</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(dispute.lastActivityAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Parties */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Parties Involved
              </h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Reporter</p>
                  <div className="flex items-center gap-3">
                    <img
                      src={dispute.reporter?.avatar || `https://i.pravatar.cc/40?u=${dispute.reporter?._id}`}
                      alt=""
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {dispute.reporter?.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {dispute.reporter?.email}
                      </p>
                    </div>
                  </div>
                </div>
                
                {dispute.reportedUser && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Reported User</p>
                    <div className="flex items-center gap-3">
                      <img
                        src={dispute.reportedUser?.avatar || `https://i.pravatar.cc/40?u=${dispute.reportedUser?._id}`}
                        alt=""
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {dispute.reportedUser?.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {dispute.reportedUser?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {dispute.assignedTo && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Assigned Admin</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <FaUserShield className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {dispute.assignedTo?.name}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Resolution (if resolved) */}
            {dispute.resolution?.outcome && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl shadow-sm p-6 border border-green-200 dark:border-green-800">
                <h2 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-4 flex items-center gap-2">
                  <FaCheckCircle /> Resolution
                </h2>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-green-700 dark:text-green-400">Outcome</p>
                    <p className="font-medium text-green-900 dark:text-green-200 capitalize">
                      {dispute.resolution.outcome?.replace(/-/g, ' ')}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-green-700 dark:text-green-400">Description</p>
                    <p className="text-green-900 dark:text-green-200">
                      {dispute.resolution.description}
                    </p>
                  </div>
                  
                  {dispute.resolution.resolvedBy && (
                    <div>
                      <p className="text-sm text-green-700 dark:text-green-400">Resolved By</p>
                      <p className="font-medium text-green-900 dark:text-green-200">
                        {dispute.resolution.resolvedBy?.name}
                      </p>
                    </div>
                  )}
                  
                  {dispute.resolution.resolvedAt && (
                    <div>
                      <p className="text-sm text-green-700 dark:text-green-400">Resolved At</p>
                      <p className="font-medium text-green-900 dark:text-green-200">
                        {formatDate(dispute.resolution.resolvedAt)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resolve Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FaGavel className="text-green-600" /> Resolve Dispute
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Outcome *
                </label>
                <select
                  value={resolution.outcome}
                  onChange={(e) => setResolution({ ...resolution, outcome: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select outcome...</option>
                  <option value="in-favor-reporter">In Favor of Reporter</option>
                  <option value="in-favor-reported">In Favor of Reported User</option>
                  <option value="mutual-agreement">Mutual Agreement</option>
                  <option value="partial-resolution">Partial Resolution</option>
                  <option value="no-action">No Action Needed</option>
                  <option value="refund-issued">Refund Issued</option>
                  <option value="warning-issued">Warning Issued</option>
                  <option value="account-suspended">Account Suspended</option>
                  <option value="account-banned">Account Banned</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Resolution Description *
                </label>
                <textarea
                  value={resolution.description}
                  onChange={(e) => setResolution({ ...resolution, description: e.target.value })}
                  placeholder="Explain the resolution..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowResolveModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleResolve}
                disabled={sending || !resolution.outcome || !resolution.description}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
              >
                {sending ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                Resolve Dispute
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisputeDetail;
