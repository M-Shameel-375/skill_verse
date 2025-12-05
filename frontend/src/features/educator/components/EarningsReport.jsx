// ============================================
// EARNINGS REPORT COMPONENT
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import { FaDollarSign, FaChartLine, FaDownload, FaSpinner, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getEarnings, getPaymentHistory } from '@/api/paymentApi';
import { getMyCourses } from '@/api/courseApi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const EarningsReport = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const [earnings, setEarnings] = useState({
    total: 0,
    thisMonth: 0,
    lastMonth: 0,
    pending: 0,
    growth: 0,
  });
  const [transactions, setTransactions] = useState([]);
  const [courseEarnings, setCourseEarnings] = useState([]);

  // Fetch earnings data
  const fetchEarnings = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch earnings and courses in parallel
      const [earningsRes, historyRes, coursesRes] = await Promise.all([
        getEarnings({ period: timeRange }).catch(() => ({ data: {} })),
        getPaymentHistory({ limit: 10 }).catch(() => ({ data: { payments: [] } })),
        getMyCourses().catch(() => ({ data: [] })),
      ]);

      const data = earningsRes.data || {};
      const history = historyRes.data?.payments || [];
      const courses = coursesRes.data || [];

      // Calculate earnings
      const total = data.summary?.total || data.totalEarnings || 0;
      const thisMonth = data.summary?.thisMonth || data.monthlyEarnings || 0;
      const lastMonth = data.summary?.lastMonth || 0;
      const growth = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth * 100) : 0;

      setEarnings({
        total,
        thisMonth,
        lastMonth,
        pending: data.pending || 0,
        growth: growth.toFixed(1),
      });

      // Format transactions
      setTransactions(history.map(tx => ({
        id: tx._id,
        date: tx.createdAt ? format(new Date(tx.createdAt), 'MMM dd, yyyy') : 'N/A',
        course: tx.course?.title || 'Course',
        student: tx.user?.name || 'Student',
        amount: tx.amount || 0,
        status: tx.status || 'completed',
      })));

      // Calculate course-wise earnings
      setCourseEarnings(courses.map(course => ({
        id: course._id,
        title: course.title,
        students: course.enrolledCount || 0,
        price: course.price || 0,
        earnings: (course.enrolledCount || 0) * (course.price || 0),
        rating: course.rating?.average?.toFixed(1) || 'N/A',
      })).sort((a, b) => b.earnings - a.earnings).slice(0, 5));

    } catch (error) {
      console.error('Failed to fetch earnings:', error);
      toast.error('Failed to load earnings data');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  const formatCurrency = (amount) => `$${(amount || 0).toLocaleString()}`;

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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Earnings Report</h1>
          <div className="flex gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
              <option value="all">All Time</option>
            </select>
            <Button variant="outline">
              <FaDownload className="mr-2" /> Export
            </Button>
          </div>
        </div>

        {/* Earnings Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Earnings</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(earnings.total)}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FaDollarSign className="text-green-600 text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">This Month</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(earnings.thisMonth)}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FaChartLine className="text-blue-600 text-xl" />
                </div>
              </div>
              <div className={`flex items-center gap-1 mt-2 text-sm ${parseFloat(earnings.growth) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {parseFloat(earnings.growth) >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                <span>{earnings.growth}% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Last Month</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(earnings.lastMonth)}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FaDollarSign className="text-purple-600 text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Pending Payout</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(earnings.pending)}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <FaDollarSign className="text-yellow-600 text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course Earnings & Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Courses */}
          <Card>
            <CardHeader>
              <CardTitle>Top Earning Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {courseEarnings.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No course earnings yet</p>
                ) : (
                  courseEarnings.map((course) => (
                    <div key={course.id} className="flex items-center justify-between pb-4 border-b border-gray-200 last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{course.title}</p>
                        <p className="text-sm text-gray-600">{course.students} students • ⭐ {course.rating}</p>
                      </div>
                      <p className="font-bold text-green-600">{formatCurrency(course.earnings)}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No transactions yet</p>
                ) : (
                  transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between pb-4 border-b border-gray-200 last:border-0">
                      <div>
                        <p className="font-medium text-gray-900">{tx.course}</p>
                        <p className="text-sm text-gray-600">{tx.student} • {tx.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">+{formatCurrency(tx.amount)}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          tx.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EarningsReport;
