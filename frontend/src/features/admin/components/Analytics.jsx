import React, { useState } from 'react';
import { FaChartLine, FaUsers, FaBook, FaDollarSign, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import Card from '../common/Card';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('month');

  const stats = {
    revenue: { value: '$45,230', change: '+12.5%', positive: true },
    activeUsers: { value: '8,432', change: '+5.2%', positive: true },
    totalCourses: { value: '156', change: '+3.1%', positive: true },
    transactions: { value: '1,245', change: '-2.3%', positive: false },
  };

  const chartData = [
    { label: 'Mon', users: 420, courses: 250, revenue: 3200 },
    { label: 'Tue', users: 510, courses: 300, revenue: 3800 },
    { label: 'Wed', users: 450, courses: 280, revenue: 3500 },
    { label: 'Thu', users: 600, courses: 350, revenue: 4200 },
    { label: 'Fri', users: 710, courses: 420, revenue: 5100 },
    { label: 'Sat', users: 520, courses: 300, revenue: 3900 },
    { label: 'Sun', users: 430, courses: 260, revenue: 3600 },
  ];

  const topCourses = [
    { title: 'React Fundamentals', students: 1250, revenue: '$18,750' },
    { title: 'Python for Beginners', students: 980, revenue: '$14,700' },
    { title: 'Web Design Masterclass', students: 750, revenue: '$11,250' },
    { title: 'Node.js Advanced', students: 620, revenue: '$9,300' },
  ];

  const maxValue = Math.max(...chartData.map((d) => d.revenue / 1000));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.revenue.value}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FaDollarSign className="text-green-600" size={24} />
                </div>
              </div>
              <p className={`text-sm mt-3 flex items-center gap-1 ${stats.revenue.positive ? 'text-green-600' : 'text-red-600'}`}>
                {stats.revenue.positive ? <FaArrowUp /> : <FaArrowDown />}
                {stats.revenue.change}
              </p>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Active Users</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeUsers.value}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FaUsers className="text-blue-600" size={24} />
                </div>
              </div>
              <p className={`text-sm mt-3 flex items-center gap-1 ${stats.activeUsers.positive ? 'text-green-600' : 'text-red-600'}`}>
                {stats.activeUsers.positive ? <FaArrowUp /> : <FaArrowDown />}
                {stats.activeUsers.change}
              </p>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Courses</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalCourses.value}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FaBook className="text-purple-600" size={24} />
                </div>
              </div>
              <p className={`text-sm mt-3 flex items-center gap-1 ${stats.totalCourses.positive ? 'text-green-600' : 'text-red-600'}`}>
                {stats.totalCourses.positive ? <FaArrowUp /> : <FaArrowDown />}
                {stats.totalCourses.change}
              </p>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Transactions</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.transactions.value}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <FaChartLine className="text-orange-600" size={24} />
                </div>
              </div>
              <p className={`text-sm mt-3 flex items-center gap-1 ${stats.transactions.positive ? 'text-green-600' : 'text-red-600'}`}>
                {stats.transactions.positive ? <FaArrowUp /> : <FaArrowDown />}
                {stats.transactions.change}
              </p>
            </div>
          </Card>
        </div>

        {/* Chart */}
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Revenue Trend</h2>
            <div className="flex items-end gap-2 h-64">
              {chartData.map((data, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                  <div className="relative w-full h-full flex items-end justify-center">
                    <div
                      className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg opacity-70 hover:opacity-100 transition"
                      style={{ height: `${(data.revenue / 1000 / maxValue) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 font-medium">{data.label}</span>
                  <div className="hidden group-hover:block absolute bottom-full mb-2 bg-gray-800 text-white px-3 py-2 rounded text-xs z-10">
                    ${data.revenue}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Top Courses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Top Courses</h2>
              <div className="space-y-4">
                {topCourses.map((course, i) => (
                  <div key={i} className="flex items-center justify-between pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-gray-900">{course.title}</p>
                      <p className="text-sm text-gray-600">{course.students} students</p>
                    </div>
                    <p className="font-bold text-green-600">{course.revenue}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Stats</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">Avg. Course Rating</p>
                  <p className="font-bold text-yellow-600">⭐ 4.7/5</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">Student Satisfaction</p>
                  <p className="font-bold text-green-600">92%</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">Completion Rate</p>
                  <p className="font-bold text-blue-600">78%</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">Active Instructors</p>
                  <p className="font-bold text-purple-600">34</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">Platform Growth</p>
                  <p className="font-bold text-orange-600">+8.3% MoM</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
