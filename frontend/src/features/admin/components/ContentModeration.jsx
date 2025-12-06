import React, { useState, useEffect, useCallback } from 'react';
import { FaCheck, FaTimes, FaFlag, FaEye, FaTrash, FaChartBar, FaCalendarAlt, FaSpinner } from 'react-icons/fa';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { getModerationQueue, approveContent, removeContent, warnUser, banUser } from '@/api/adminApi';
import { format } from 'date-fns';

const ContentModeration = () => {
  const [flaggedContent, setFlaggedContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [selectedContent, setSelectedContent] = useState(null);
  const [stats, setStats] = useState({
    pending: 0,
    resolved: 0,
    totalFlags: 0,
  });

  // Fetch moderation queue from API
  const fetchModerationQueue = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getModerationQueue({ status: filterStatus !== 'all' ? filterStatus : undefined });
      const data = response.data || response;
      
      const content = data.content || data.queue || [];
      setFlaggedContent(content.map(item => ({
        id: item._id,
        type: item.contentType || item.type || 'Content',
        content: item.content || item.description || 'Flagged content',
        author: item.author?.name || item.authorName || 'Unknown',
        flaggedBy: item.flaggedBy?.name || item.reporterName || 'System',
        reason: item.reason || 'Violation',
        flags: item.flagCount || item.flags || 1,
        flaggedDate: item.createdAt ? format(new Date(item.createdAt), 'yyyy-MM-dd') : 'N/A',
        status: item.status || 'pending',
      })));

      // Calculate stats
      setStats({
        pending: content.filter(c => c.status === 'pending').length,
        resolved: content.filter(c => c.status === 'resolved').length,
        totalFlags: content.reduce((acc, c) => acc + (c.flagCount || c.flags || 1), 0),
      });
    } catch (error) {
      console.error('Failed to fetch moderation queue:', error);
      // Use empty state on error
      setFlaggedContent([]);
      setStats({ pending: 0, resolved: 0, totalFlags: 0 });
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchModerationQueue();
  }, [fetchModerationQueue]);

  const filteredContent = flaggedContent.filter((item) => {
    if (filterStatus === 'all') return true;
    return item.status === filterStatus;
  });

  const handleApproveContent = async (id) => {
    try {
      setActionLoading(id);
      await approveContent(id);
      setFlaggedContent(flaggedContent.map((c) => (c.id === id ? { ...c, status: 'resolved' } : c)));
      toast.success('Content approved and restored');
      fetchModerationQueue();
    } catch (error) {
      console.error('Failed to approve content:', error);
      toast.error('Failed to approve content');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveContent = async (id) => {
    try {
      setActionLoading(id);
      await removeContent(id);
      setFlaggedContent(flaggedContent.map((c) => (c.id === id ? { ...c, status: 'resolved' } : c)));
      toast.error('Content removed');
      fetchModerationQueue();
    } catch (error) {
      console.error('Failed to remove content:', error);
      toast.error('Failed to remove content');
    } finally {
      setActionLoading(null);
    }
  };

  const handleWarningUser = async (id, author) => {
    try {
      const item = flaggedContent.find(c => c.id === id);
      await warnUser(item?.authorId || id, id, 'Content violation');
      toast.success(`Warning sent to ${author}`);
    } catch (error) {
      console.error('Failed to warn user:', error);
      toast.error('Failed to send warning');
    }
  };

  const handleBanUser = async (id, author) => {
    if (window.confirm(`Ban ${author} from platform?`)) {
      try {
        const item = flaggedContent.find(c => c.id === id);
        await banUser(item?.authorId || id, 'Multiple content violations');
        setFlaggedContent(flaggedContent.filter((c) => c.id !== id));
        toast.error(`${author} has been banned`);
      } catch (error) {
        console.error('Failed to ban user:', error);
        toast.error('Failed to ban user');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Content Moderation</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <div className="p-6 text-center">
              <p className="text-gray-600 text-sm">Pending Review</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
            </div>
          </Card>
          <Card>
            <div className="p-6 text-center">
              <p className="text-gray-600 text-sm">Resolved</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.resolved}</p>
            </div>
          </Card>
          <Card>
            <div className="p-6 text-center">
              <p className="text-gray-600 text-sm">Total Flags</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.totalFlags}</p>
            </div>
          </Card>
        </div>

        {/* Filter Tabs */}
        <Card className="mb-6">
          <div className="p-6 flex gap-3">
            {['pending', 'resolved', 'all'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)} (
                {status === 'all' ? flaggedContent.length : flaggedContent.filter((c) => c.status === status).length})
              </button>
            ))}
          </div>
        </Card>

        {/* Content List */}
        <div className="space-y-4">
          {filteredContent.map((item) => (
            <Card key={item.id}>
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                            {item.type}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            item.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {item.status === 'pending' ? '⏳ Pending' : '✅ Resolved'}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">{item.content}</h3>
                      </div>
                      <div className="flex items-center gap-2 bg-red-100 px-3 py-1 rounded-lg">
                        <FaFlag className="text-red-600" />
                        <span className="font-bold text-red-700">{item.flags}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
                      <div>
                        <p className="text-gray-600">Type</p>
                        <p className="font-semibold text-gray-900">{item.reason}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Author</p>
                        <p className="font-semibold text-gray-900">{item.author}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Flagged By</p>
                        <p className="font-semibold text-gray-900">{item.flaggedBy}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Date</p>
                        <p className="font-semibold text-gray-900">{item.flaggedDate}</p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg italic">
                      "{item.content}"
                    </p>
                  </div>

                  {/* Actions */}
                  {item.status === 'pending' && (
                    <div className="flex gap-2 md:flex-col w-full md:w-auto">
                      <Button
                        onClick={() => handleApproveContent(item.id)}
                        variant="default"
                        size="sm"
                        className="flex-1 md:flex-none bg-green-600 hover:bg-green-700"
                      >
                        <FaCheck className="mr-1" /> Approve
                      </Button>
                      <Button
                        onClick={() => handleWarningUser(item.id, item.author)}
                        variant="outline"
                        size="sm"
                        className="flex-1 md:flex-none"
                      >
                        Warn
                      </Button>
                      <Button
                        onClick={() => handleRemoveContent(item.id)}
                        variant="outline"
                        size="sm"
                        className="flex-1 md:flex-none"
                      >
                        <FaTrash className="mr-1" /> Remove
                      </Button>
                      <Button
                        onClick={() => handleBanUser(item.id, item.author)}
                        variant="destructive"
                        size="sm"
                        className="flex-1 md:flex-none"
                      >
                        Ban User
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContentModeration;
