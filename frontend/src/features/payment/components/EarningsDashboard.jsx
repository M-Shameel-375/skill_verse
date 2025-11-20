import React, { useEffect, useState } from 'react';
import { FaDollarSign, FaChartLine, FaUsers, FaBook } from 'react-icons/fa';
import Card from '../common/Card';
import { motion } from 'framer-motion';

const EarningsDashboard = () => {
  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    monthlyEarnings: 0,
    totalStudents: 0,
    activeCourses: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setEarnings({
      totalEarnings: 4580.5,
      monthlyEarnings: 850.25,
      totalStudents: 245,
      activeCourses: 5,
    });
    setLoading(false);
  }, []);

  const statCards = [
    { icon: FaDollarSign, label: 'Total Earnings', value: `$${earnings.totalEarnings.toFixed(2)}`, color: 'green' },
    { icon: FaChartLine, label: 'This Month', value: `$${earnings.monthlyEarnings.toFixed(2)}`, color: 'blue' },
    { icon: FaUsers, label: 'Total Students', value: earnings.totalStudents, color: 'purple' },
    { icon: FaBook, label: 'Active Courses', value: earnings.activeCourses, color: 'orange' },
  ];

  const colorClasses = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Earnings Dashboard</h1>
        <p className="text-gray-600">Track your course revenue and performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
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
                    <h3 className="text-gray-700 font-medium text-sm">{stat.label}</h3>
                    <div className={`p-3 rounded-lg ${colorClasses[stat.color]}`}>
                      <Icon className="text-xl" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Monthly Earnings</h2>
            <div className="h-64 flex items-center justify-center text-gray-400">
              <p>Chart will display here</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Top Performing Courses</h2>
            <div className="space-y-3">
              {['React Masterclass', 'Node.js Backend', 'Full Stack Development'].map((course, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-gray-700">{course}</span>
                  <span className="font-semibold text-green-600">${(1200 + i * 200).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EarningsDashboard;
