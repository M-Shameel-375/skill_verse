import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaTrash, FaBan, FaCheck, FaEye, FaChevronDown, FaSpinner, FaUserEdit } from 'react-icons/fa';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import axios from '../../../api/axios';
import { format } from 'date-fns';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    suspended: 0,
    educators: 0,
  });

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (filterRole !== 'all') params.append('role', filterRole);
      if (filterStatus !== 'all') params.append('status', filterStatus);

      const response = await axios.get(`/admin/users?${params.toString()}`);
      const data = response.data || response;
      
      setUsers(data.users || []);
      setPagination(prev => ({
        ...prev,
        total: data.pagination?.total || data.total || 0,
        pages: data.pagination?.pages || Math.ceil((data.total || 0) / prev.limit),
      }));

      // Calculate stats
      const allUsers = data.users || [];
      setStats({
        total: data.pagination?.total || data.total || allUsers.length,
        active: allUsers.filter(u => u.status === 'active').length,
        suspended: allUsers.filter(u => u.status === 'suspended' || u.status === 'banned').length,
        educators: allUsers.filter(u => u.role === 'educator').length,
      });
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, filterRole, filterStatus]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Suspend/Activate user
  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const action = newStatus === 'suspended' ? 'suspend' : 'activate';
    
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      setActionLoading(userId);
      await axios.put(`/admin/users/${userId}/status`, { status: newStatus });
      toast.success(`User ${action}d successfully`);
      fetchUsers();
    } catch (error) {
      console.error('Failed to update user status:', error);
      toast.error(`Failed to ${action} user`);
    } finally {
      setActionLoading(null);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user permanently? This action cannot be undone.')) return;

    try {
      setActionLoading(userId);
      await axios.delete(`/admin/users/${userId}`);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error('Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  // Change user role
  const handleChangeRole = async (userId, newRole) => {
    try {
      setActionLoading(userId);
      await axios.put(`/admin/users/${userId}/role`, { role: newRole });
      toast.success('User role updated successfully');
      fetchUsers();
    } catch (error) {
      console.error('Failed to update user role:', error);
      toast.error('Failed to update user role');
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-700';
      case 'educator': return 'bg-blue-100 text-blue-700';
      case 'skillExchanger': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'suspended': return 'bg-yellow-100 text-yellow-700';
      case 'banned': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">User Management</h1>

        {/* Search & Filter */}
        <Card className="mb-6">
          <CardContent className="p-6 space-y-4">
            <div className="flex gap-4 flex-col md:flex-row">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-4 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={filterRole}
                onChange={(e) => {
                  setFilterRole(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="learner">Learner</option>
                <option value="educator">Educator</option>
                <option value="skillExchanger">Skill Exchanger</option>
                <option value="admin">Admin</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="banned">Banned</option>
              </select>
            </div>

            <div className="text-sm text-gray-600">
              Showing {users.length} of {stats.total} users
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-600 text-sm">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-600 text-sm">Active</p>
              <p className="text-3xl font-bold text-green-600">{stats.active}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-600 text-sm">Suspended</p>
              <p className="text-3xl font-bold text-red-600">{stats.suspended}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-600 text-sm">Educators</p>
              <p className="text-3xl font-bold text-blue-600">{stats.educators}</p>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <FaSpinner className="animate-spin text-3xl text-blue-600" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No users found</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">User</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Joined</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Points</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.profileImage?.url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                            alt={user.name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={user.role}
                          onChange={(e) => handleChangeRole(user._id, e.target.value)}
                          disabled={actionLoading === user._id}
                          className={`px-3 py-1 rounded-full text-sm font-semibold border-0 cursor-pointer ${getRoleBadgeColor(user.role)}`}
                        >
                          <option value="learner">Learner</option>
                          <option value="educator">Educator</option>
                          <option value="skillExchanger">Skill Exchanger</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeColor(user.status)}`}>
                          {user.status === 'active' ? '✓ Active' : user.status === 'banned' ? '🚫 Banned' : '⚠️ Suspended'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.createdAt ? format(new Date(user.createdAt), 'MMM d, yyyy') : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-blue-600">
                          {user.gamification?.points || 0} pts
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewDetails(user)}
                            className="p-2 hover:bg-gray-100 rounded-lg text-blue-600 transition"
                            title="View details"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(user._id, user.status)}
                            disabled={actionLoading === user._id}
                            className={`p-2 hover:bg-gray-100 rounded-lg transition ${
                              user.status === 'active' ? 'text-yellow-600' : 'text-green-600'
                            }`}
                            title={user.status === 'active' ? 'Suspend' : 'Activate'}
                          >
                            {actionLoading === user._id ? <FaSpinner className="animate-spin" /> : 
                              user.status === 'active' ? <FaBan /> : <FaCheck />}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            disabled={actionLoading === user._id}
                            className="p-2 hover:bg-gray-100 rounded-lg text-red-600 transition"
                            title="Delete user"
                          >
                            {actionLoading === user._id ? <FaSpinner className="animate-spin" /> : <FaTrash />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <p className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.pages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={pagination.page === 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={pagination.page === pagination.pages}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* User Detail Modal */}
        {showModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">User Details</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                  ✕
                </button>
              </div>
              
              <div className="text-center mb-6">
                <img
                  src={selectedUser.profileImage?.url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.name}`}
                  alt={selectedUser.name}
                  className="w-20 h-20 rounded-full mx-auto mb-3"
                />
                <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
                <p className="text-gray-500">{selectedUser.email}</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Role</span>
                  <span className={`px-2 py-1 rounded-full text-sm ${getRoleBadgeColor(selectedUser.role)}`}>
                    {selectedUser.role}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Status</span>
                  <span className={`px-2 py-1 rounded-full text-sm ${getStatusBadgeColor(selectedUser.status)}`}>
                    {selectedUser.status}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Points</span>
                  <span className="font-semibold">{selectedUser.gamification?.points || 0}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Level</span>
                  <span className="font-semibold">{selectedUser.gamification?.level || 1}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Joined</span>
                  <span>{selectedUser.createdAt ? format(new Date(selectedUser.createdAt), 'MMM d, yyyy') : 'N/A'}</span>
                </div>
                {selectedUser.bio && (
                  <div className="py-2">
                    <span className="text-gray-600 block mb-1">Bio</span>
                    <p className="text-sm">{selectedUser.bio}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                <Button 
                  className="flex-1" 
                  variant="outline"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => handleToggleStatus(selectedUser._id, selectedUser.status)}
                >
                  {selectedUser.status === 'active' ? 'Suspend User' : 'Activate User'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;