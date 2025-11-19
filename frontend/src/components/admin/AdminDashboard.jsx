import React, { useEffect, useState } from 'react';
import { FaUsers, FaBook, FaDollarSign, FaChartBar } from 'react-icons/fa';
import Card from '../common/Card';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalRevenue: 0,
    activeInstructors: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch admin stats
    setStats({
      totalUsers: 1250,
      totalCourses: 85,
      totalRevenue: 45680,
      activeInstructors: 32,
    });
    setLoading(false);
  }, []);

  const statCards = [
    { icon: FaUsers, label: 'Total Users', value: stats.totalUsers, color: 'blue' },
    { icon: FaBook, label: 'Courses', value: stats.totalCourses, color: 'green' },
    { icon: FaDollarSign, label: 'Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, color: 'purple' },
    { icon: FaChartBar, label: 'Instructors', value: stats.activeInstructors, color: 'orange' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Monitor platform activity and statistics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'bg-blue-100 text-blue-600',
            green: 'bg-green-100 text-green-600',
            purple: 'bg-purple-100 text-purple-600',
            orange: 'bg-orange-100 text-orange-600',
          };

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-700 font-medium">{stat.label}</h3>
                    <div className={`p-3 rounded-lg ${colorClasses[stat.color]}`}>
                      <Icon className="text-2xl" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Enrollments</h2>
            <div className="space-y-3 text-center text-gray-600">
              <p>Chart placeholder</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Top Courses</h2>
            <div className="space-y-3 text-center text-gray-600">
              <p>Chart placeholder</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;