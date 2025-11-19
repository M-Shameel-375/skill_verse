import React, { useState } from 'react';
import { FaSearch, FaTrash, FaBan, FaCheck, FaEye, FaChevronDown } from 'react-icons/fa';
import Card from '../common/Card';
import Button from '../common/Button';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Student', joinDate: '2024-01-15', status: 'active', courses: 5, rating: 4.8 },
    { id: 2, name: 'Sarah Smith', email: 'sarah@example.com', role: 'Instructor', joinDate: '2023-12-10', status: 'active', courses: 12, rating: 4.9 },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'Student', joinDate: '2024-01-20', status: 'suspended', courses: 3, rating: 3.5 },
    { id: 4, name: 'Emma Wilson', email: 'emma@example.com', role: 'Admin', joinDate: '2023-11-01', status: 'active', courses: 0, rating: 5.0 },
    { id: 5, name: 'Alex Brown', email: 'alex@example.com', role: 'Instructor', joinDate: '2024-01-05', status: 'active', courses: 8, rating: 4.6 },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleSuspendUser = (id) => {
    if (window.confirm('Are you sure you want to suspend this user?')) {
      setUsers(users.map((u) => (u.id === id ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u)));
      toast.success('User status updated');
    }
  };

  const handleDeleteUser = (id) => {
    if (window.confirm('Are you sure you want to delete this user permanently?')) {
      setUsers(users.filter((u) => u.id !== id));
      toast.success('User deleted');
    }
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">User Management</h1>

        {/* Search & Filter */}
        <Card className="mb-6">
          <div className="p-6 space-y-4">
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
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="Student">Student</option>
                <option value="Instructor">Instructor</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div className="text-sm text-gray-600">
              Showing {filteredUsers.length} of {users.length} users
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <div className="p-6 text-center">
              <p className="text-gray-600 text-sm">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{users.length}</p>
            </div>
          </Card>
          <Card>
            <div className="p-6 text-center">
              <p className="text-gray-600 text-sm">Active</p>
              <p className="text-3xl font-bold text-green-600">{users.filter((u) => u.status === 'active').length}</p>
            </div>
          </Card>
          <Card>
            <div className="p-6 text-center">
              <p className="text-gray-600 text-sm">Suspended</p>
              <p className="text-3xl font-bold text-red-600">{users.filter((u) => u.status === 'suspended').length}</p>
            </div>
          </Card>
          <Card>
            <div className="p-6 text-center">
              <p className="text-gray-600 text-sm">Instructors</p>
              <p className="text-3xl font-bold text-blue-600">{users.filter((u) => u.role === 'Instructor').length}</p>
            </div>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Joined</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Rating</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          user.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {user.status === 'active' ? '✓ Active' : '⚠️ Suspended'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.joinDate}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-yellow-600">⭐ {user.rating}</span>
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
                          onClick={() => handleSuspendUser(user.id)}
                          className={`p-2 hover:bg-gray-100 rounded-lg transition ${
                            user.status === 'active' ? 'text-yellow-600' : 'text-green-600'
                          }`}
                          title={user.status === 'active' ? 'Suspend' : 'Activate'}\n                        >\n                          {user.status === 'active' ? <FaBan /> : <FaCheck />}\n                        </button>\n                        <button\n                          onClick={() => handleDeleteUser(user.id)}\n                          className=\"p-2 hover:bg-gray-100 rounded-lg text-red-600 transition\"\n                          title=\"Delete user\"\n                        >\n                          <FaTrash />\n                        </button>\n                      </div>\n                    </td>\n                  </tr>\n                ))}\n              </tbody>\n            </table>\n          </div>\n        </Card>\n      </div>\n    </div>\n  );\n};\n\nexport default UserManagement;
