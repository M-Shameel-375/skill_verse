import React, { useState } from 'react';
import { FaCheck, FaTimes, FaFlag, FaEye, FaTrash, FaChartBar, FaCalendarAlt } from 'react-icons/fa';
import Card from '../common/Card';
import Button from '../common/Button';
import toast from 'react-hot-toast';

const ContentModeration = () => {
  const [flaggedContent, setFlaggedContent] = useState([
    {
      id: 1,
      type: 'Comment',
      content: 'Inappropriate language in course review',
      author: 'John Smith',
      flaggedBy: 'Alice Johnson',
      reason: 'Inappropriate Language',
      flags: 3,
      flaggedDate: '2024-02-10',
      status: 'pending',
    },
    {
      id: 2,
      type: 'User Profile',
      content: 'Offensive profile bio and avatar',
      author: 'Mike Chen',
      flaggedBy: 'Sarah Lee',
      reason: 'Offensive Content',
      flags: 5,
      flaggedDate: '2024-02-08',
      status: 'pending',
    },
    {
      id: 3,
      type: 'Course Review',
      content: 'Spam review promoting external site',
      author: 'Bot User 123',
      flaggedBy: 'System',
      reason: 'Spam',
      flags: 8,
      flaggedDate: '2024-02-07',
      status: 'pending',
    },
    {
      id: 4,
      type: 'Live Session Chat',
      content: 'Harassment and bullying towards other user',
      author: 'Anonymous User',
      flaggedBy: 'Moderator',
      reason: 'Harassment',
      flags: 2,
      flaggedDate: '2024-02-05',
      status: 'resolved',
    },
    {
      id: 5,
      type: 'Course Content',
      content: 'Copyrighted material without proper licensing',
      author: 'Instructor 456',
      flaggedBy: 'Copyright Team',
      reason: 'Copyright Violation',
      flags: 1,
      flaggedDate: '2024-02-03',
      status: 'resolved',
    },
  ]);

  const [filterStatus, setFilterStatus] = useState('pending');
  const [selectedContent, setSelectedContent] = useState(null);

  const filteredContent = flaggedContent.filter((item) => {
    if (filterStatus === 'all') return true;
    return item.status === filterStatus;
  });

  const stats = {
    pending: flaggedContent.filter((c) => c.status === 'pending').length,
    resolved: flaggedContent.filter((c) => c.status === 'resolved').length,
    totalFlags: flaggedContent.reduce((acc, c) => acc + c.flags, 0),
  };

  const handleApproveContent = (id) => {
    setFlaggedContent(flaggedContent.map((c) => (c.id === id ? { ...c, status: 'resolved' } : c)));
    toast.success('Content approved and restored');
  };

  const handleRemoveContent = (id) => {
    setFlaggedContent(flaggedContent.map((c) => (c.id === id ? { ...c, status: 'resolved' } : c)));
    toast.error('Content removed');
  };

  const handleWarningUser = (id, author) => {
    toast.success(`Warning sent to ${author}`);
  };

  const handleBanUser = (id, author) => {
    if (window.confirm(`Ban ${author} from platform?`)) {
      setFlaggedContent(flaggedContent.filter((c) => c.id !== id));
      toast.error(`${author} has been banned`);
    }
  };

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
                        variant="primary"
                        size="sm"
                        icon={<FaCheck />}
                        className="flex-1 md:flex-none"
                      >
                        Approve
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
                        icon={<FaTrash />}
                        className="flex-1 md:flex-none"
                      >
                        Remove
                      </Button>
                      <Button
                        onClick={() => handleBanUser(item.id, item.author)}
                        variant="outline"
                        size="sm"
                        className="flex-1 md:flex-none text-red-600 border-red-600 hover:bg-red-50"
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
