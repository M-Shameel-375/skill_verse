import React, { useState, useEffect, useCallback } from 'react';
import { FaDollarSign, FaCreditCard, FaCalendarAlt, FaFilter, FaSpinner, FaEye, FaCheck, FaTimes } from 'react-icons/fa';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { getAllPayments, processRefund, updatePaymentStatus } from '@/api/adminApi';
import { format } from 'date-fns';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingPayments: 0,
    completedPayments: 0,
    failedPayments: 0,
  });

  // Fetch payments from API
  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllPayments({
        status: filterStatus !== 'all' ? filterStatus : undefined,
        type: filterType !== 'all' ? filterType : undefined,
      });
      const data = response.data || response;

      const paymentList = data.payments || data || [];
      setPayments(paymentList.map(payment => ({
        id: payment._id,
        amount: payment.amount || 0,
        currency: payment.currency || 'USD',
        status: payment.status || 'pending',
        type: payment.type || 'course_purchase',
        user: payment.user?.name || payment.userName || 'Unknown',
        course: payment.course?.title || payment.courseTitle || 'N/A',
        transactionId: payment.transactionId || payment.stripePaymentIntentId || 'N/A',
        createdAt: payment.createdAt ? format(new Date(payment.createdAt), 'yyyy-MM-dd HH:mm') : 'N/A',
        completedAt: payment.completedAt ? format(new Date(payment.completedAt), 'yyyy-MM-dd HH:mm') : null,
      })));

      // Calculate stats
      const totalRevenue = paymentList
        .filter(p => p.status === 'completed')
        .reduce((acc, p) => acc + (p.amount || 0), 0);

      setStats({
        totalRevenue,
        pendingPayments: paymentList.filter(p => p.status === 'pending').length,
        completedPayments: paymentList.filter(p => p.status === 'completed').length,
        failedPayments: paymentList.filter(p => p.status === 'failed').length,
      });
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      setPayments([]);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterType]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleProcessRefund = async (paymentId) => {
    try {
      setProcessing(paymentId);
      await processRefund(paymentId);
      toast.success('Refund processed successfully');
      fetchPayments(); // Refresh the list
    } catch (error) {
      console.error('Failed to process refund:', error);
      toast.error('Failed to process refund');
    } finally {
      setProcessing(null);
    }
  };

  const handleUpdateStatus = async (paymentId, newStatus) => {
    try {
      setProcessing(paymentId);
      await updatePaymentStatus(paymentId, newStatus);
      toast.success(`Payment status updated to ${newStatus}`);
      fetchPayments(); // Refresh the list
    } catch (error) {
      console.error('Failed to update payment status:', error);
      toast.error('Failed to update payment status');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'refunded': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <FaSpinner className="animate-spin text-2xl text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-gray-600">Monitor and manage all payment transactions</p>
        </div>
        <Button
          onClick={fetchPayments}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <FaDollarSign className="mr-2" />
          Refresh Payments
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <FaDollarSign className="text-green-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <FaCreditCard className="text-yellow-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingPayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <FaCheck className="text-blue-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedPayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-full">
                <FaTimes className="text-red-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.failedPayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <FaFilter className="text-gray-500" />
              <span className="text-sm font-medium">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <FaCreditCard className="text-gray-500" />
              <span className="text-sm font-medium">Type:</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="all">All Types</option>
                <option value="course_purchase">Course Purchase</option>
                <option value="subscription">Subscription</option>
                <option value="refund">Refund</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      <Card>
        <CardContent className="p-4">
        {payments.length === 0 ? (
          <div className="text-center py-8">
            <FaCreditCard className="mx-auto text-4xl text-gray-400 mb-4" />
            <p className="text-gray-500">No payments found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <FaCreditCard className="text-blue-500" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">${payment.amount} {payment.currency}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{payment.user} - {payment.course}</p>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <span>Type: {payment.type}</span>
                        <span>Created: {payment.createdAt}</span>
                        {payment.completedAt && <span>Completed: {payment.completedAt}</span>}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">TXN: {payment.transactionId}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {payment.status === 'completed' && (
                    <Button
                      onClick={() => handleProcessRefund(payment.id)}
                      disabled={processing === payment.id}
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      {processing === payment.id ? (
                        <FaSpinner className="animate-spin mr-1" />
                      ) : (
                        <FaTimes className="mr-1" />
                      )}
                      Refund
                    </Button>
                  )}
                  {payment.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => handleUpdateStatus(payment.id, 'completed')}
                        disabled={processing === payment.id}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {processing === payment.id ? (
                          <FaSpinner className="animate-spin mr-1" />
                        ) : (
                          <FaCheck className="mr-1" />
                        )}
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleUpdateStatus(payment.id, 'failed')}
                        disabled={processing === payment.id}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <FaTimes className="mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Payments;