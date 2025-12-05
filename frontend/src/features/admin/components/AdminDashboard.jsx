import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { FaUsers, FaBook, FaDollarSign, FaChartBar, FaCertificate, FaExchangeAlt, FaVideo, FaStar } from 'react-icons/fa';
import { Card, CardContent } from '@/components/ui/Card';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import axios from '../../../api/axios';
import toast from 'react-hot-toast';

const AdminDashboard = ({ user: dbUser }) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentCourses, setRecentCourses] = useState([]);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/admin/dashboard');
        const data = response.data || response;
        setStats(data);
        
        // Fetch recent users
        try {
          const usersRes = await axios.get('/admin/users?limit=5&sort=-createdAt');
          setRecentUsers(usersRes.data?.users || usersRes.users || []);
        } catch (e) {
          console.log('Could not fetch recent users');
        }

        // Fetch recent courses
        try {
          const coursesRes = await axios.get('/courses?limit=5&sort=-createdAt');
          setRecentCourses(coursesRes.data?.courses || coursesRes.courses || []);
        } catch (e) {
          console.log('Could not fetch recent courses');
        }
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
        toast.error('Failed to load dashboard stats');
        // Fallback to default stats if API fails
        setStats({
          users: { total: 0, active: 0, newThisMonth: 0 },
          courses: { total: 0, published: 0, draft: 0 },
          payments: { totalRevenue: 0, revenueThisMonth: 0 },
          liveSessions: { total: 0, upcoming: 0 },
          skillExchanges: { total: 0, active: 0 },
          certificates: { total: 0, issuedThisMonth: 0 },
          reviews: { total: 0, pending: 0 },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const userName = dbUser?.name || user?.firstName || 'Admin';

  const statCards = stats ? [
    { icon: FaUsers, label: 'Total Users', value: stats.users?.total || 0, subLabel: `${stats.users?.active || 0} active`, color: 'blue', link: '/admin/users' },
    { icon: FaBook, label: 'Courses', value: stats.courses?.total || 0, subLabel: `${stats.courses?.published || 0} published`, color: 'green', link: '/admin/courses' },
    { icon: FaDollarSign, label: 'Revenue', value: `$${(stats.payments?.totalRevenue || 0).toLocaleString()}`, subLabel: `$${(stats.payments?.revenueThisMonth || 0).toLocaleString()} this month`, color: 'purple', link: '/admin/analytics' },
    { icon: FaChartBar, label: 'Live Sessions', value: stats.liveSessions?.total || 0, subLabel: `${stats.liveSessions?.upcoming || 0} upcoming`, color: 'orange' },
    { icon: FaExchangeAlt, label: 'Skill Exchanges', value: stats.skillExchanges?.total || 0, subLabel: `${stats.skillExchanges?.active || 0} active`, color: 'teal' },
    { icon: FaCertificate, label: 'Certificates', value: stats.certificates?.total || 0, subLabel: `${stats.certificates?.issuedThisMonth || 0} this month`, color: 'indigo' },
    { icon: FaStar, label: 'Reviews', value: stats.reviews?.total || 0, subLabel: `${stats.reviews?.pending || 0} pending`, color: 'yellow' },
    { icon: FaUsers, label: 'New Users', value: stats.users?.newThisMonth || 0, subLabel: 'This month', color: 'pink' },
  ] : [];

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | SkillVerse</title>
      </Helmet>

      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {getGreeting()}, {userName}! 🛡️
            </h1>
            <p className="text-gray-600">Monitor platform activity and manage users.</p>
          </div>
          <div className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            👑 Admin
          </div>
        </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              const colorClasses = {
                blue: 'bg-blue-100 text-blue-600',
                green: 'bg-green-100 text-green-600',
                purple: 'bg-purple-100 text-purple-600',
                orange: 'bg-orange-100 text-orange-600',
                teal: 'bg-teal-100 text-teal-600',
                indigo: 'bg-indigo-100 text-indigo-600',
                yellow: 'bg-yellow-100 text-yellow-600',
                pink: 'bg-pink-100 text-pink-600',
              };

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => stat.link && navigate(stat.link)}
                  className={stat.link ? 'cursor-pointer' : ''}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-700 font-medium">{stat.label}</h3>
                        <div className={`p-3 rounded-lg ${colorClasses[stat.color]}`}>
                          <Icon className="text-xl" />
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                      {stat.subLabel && (
                        <p className="text-sm text-gray-500 mt-1">{stat.subLabel}</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Recent Activity Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Users */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Recent Users</h2>
                  <button 
                    onClick={() => navigate('/admin/users')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View All
                  </button>
                </div>
                {recentUsers.length > 0 ? (
                  <div className="space-y-3">
                    {recentUsers.map((u, idx) => (
                      <div key={u._id || idx} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                        <img 
                          src={u.profileImage?.url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`}
                          alt={u.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{u.name}</p>
                          <p className="text-sm text-gray-500 truncate">{u.email}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          u.role === 'admin' ? 'bg-red-100 text-red-700' :
                          u.role === 'educator' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {u.role}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent users</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Courses */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Recent Courses</h2>
                  <button 
                    onClick={() => navigate('/admin/courses')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View All
                  </button>
                </div>
                {recentCourses.length > 0 ? (
                  <div className="space-y-3">
                    {recentCourses.map((course, idx) => (
                      <div key={course._id || idx} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                        <img 
                          src={course.thumbnail?.url || 'https://via.placeholder.com/60x40'}
                          alt={course.title}
                          className="w-16 h-10 rounded object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{course.title}</p>
                          <p className="text-sm text-gray-500">{course.instructor?.name || 'Unknown'}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          course.status === 'published' ? 'bg-green-100 text-green-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {course.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent courses</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button 
                  onClick={() => navigate('/admin/users')}
                  className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-colors"
                >
                  <FaUsers className="text-2xl text-blue-600 mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-700">Manage Users</span>
                </button>
                <button 
                  onClick={() => navigate('/admin/courses')}
                  className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition-colors"
                >
                  <FaBook className="text-2xl text-green-600 mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-700">Manage Courses</span>
                </button>
                <button 
                  onClick={() => navigate('/admin/analytics')}
                  className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition-colors"
                >
                  <FaChartBar className="text-2xl text-purple-600 mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-700">View Analytics</span>
                </button>
                <button 
                  onClick={() => navigate('/admin/content')}
                  className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-center transition-colors"
                >
                  <FaStar className="text-2xl text-orange-600 mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-700">Content Moderation</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
    </>
  );
};

export default AdminDashboard;