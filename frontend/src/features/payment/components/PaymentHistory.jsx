import React, { useEffect, useState, useCallback } from 'react';
import { FaDownload, FaEye, FaSpinner } from 'react-icons/fa';
import Card from '../common/Card';
import Button from '../common/Button';
import toast from 'react-hot-toast';
import { getPaymentHistory, downloadInvoice } from '../../../api/paymentApi';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPaymentHistory();
      const data = response.data?.data || response.data;
      const paymentList = Array.isArray(data) ? data : data.payments || [];
      setPayments(paymentList.map(p => ({
        id: p._id || p.id,
        courseName: p.course?.title || p.courseName || 'Course',
        amount: p.amount || 0,
        date: p.createdAt || p.date,
        status: p.status || 'completed',
        invoiceUrl: p.invoiceUrl,
      })));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch payment history');
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleDownloadInvoice = async (payment) => {
    try {
      if (payment.invoiceUrl && payment.invoiceUrl !== '#') {
        window.open(payment.invoiceUrl, '_blank');
      } else {
        const response = await downloadInvoice(payment.id);
        const url = response.data?.url || response.data;
        if (url) window.open(url, '_blank');
      }
      toast.success('Invoice downloaded');
    } catch (err) {
      toast.error('Failed to download invoice');
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
        <p className="text-gray-600">View all your course purchases and payments</p>
      </div>

      <Card>
        {loading ? (
          <div className="p-6 text-center text-gray-600">Loading...</div>
        ) : payments.length === 0 ? (
          <div className="p-6 text-center">
            <div className="text-5xl mb-4">💳</div>
            <p className="text-gray-600">No payments yet. Start learning today!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Course</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{payment.courseName}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">${payment.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(payment.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(payment.status)}`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          icon={<FaDownload />}
                          onClick={() => handleDownloadInvoice(payment)}
                        >
                          Invoice
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PaymentHistory;