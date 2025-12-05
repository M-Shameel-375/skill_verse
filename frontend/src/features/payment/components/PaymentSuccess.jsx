import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaDownload, FaArrowRight, FaSpinner } from 'react-icons/fa';
import Button from '../common/Button';
import Card from '../common/Card';
import { verifyPayment, getPaymentById } from '../../../api/paymentApi';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const paymentId = searchParams.get('payment_id');
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        setLoading(true);
        let data;
        
        if (sessionId) {
          // Verify Stripe session
          const response = await verifyPayment(sessionId);
          data = response.data?.data || response.data;
        } else if (paymentId) {
          // Get payment by ID
          const response = await getPaymentById(paymentId);
          data = response.data?.data || response.data;
        }
        
        if (data) {
          setPaymentDetails({
            id: data._id || data.id || sessionId || paymentId,
            courseName: data.course?.title || data.courseName || 'Course',
            amount: data.amount || 0,
            date: data.createdAt || data.date || new Date().toISOString(),
            invoiceUrl: data.invoiceUrl,
          });
        }
      } catch (err) {
        console.error('Error fetching payment details:', err);
        // Still show success page with basic info
        setPaymentDetails({
          id: sessionId || paymentId,
          courseName: 'Your Course',
          amount: 0,
          date: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPaymentDetails();
  }, [sessionId, paymentId]);

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-2xl w-full">
        <Card>
          <div className="p-8 text-center space-y-8">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <FaCheckCircle className="text-6xl text-green-500 mx-auto" />
            </motion.div>

            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
              <p className="text-gray-600">Thank you for your purchase. You now have access to the course.</p>
            </div>

            {paymentDetails && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-50 rounded-lg p-6 text-left space-y-4"
              >
                <div className="flex justify-between items-center border-b pb-4">
                  <span className="text-gray-600">Course</span>
                  <span className="font-semibold text-gray-900">{paymentDetails.courseName}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-4">
                  <span className="text-gray-600">Amount Paid</span>
                  <span className="font-semibold text-green-600 text-lg">${paymentDetails.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-4">
                  <span className="text-gray-600">Date</span>
                  <span className="font-semibold text-gray-900">{new Date(paymentDetails.date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Transaction ID</span>
                  <span className="font-mono text-sm text-gray-900">{paymentDetails.id?.substring(0, 12)}...</span>
                </div>
              </motion.div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                A receipt has been sent to your email. You can also download it below.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = paymentDetails?.invoiceUrl || '#';
                  link.download = 'invoice.pdf';
                  link.click();
                }}
                icon={<FaDownload />}
              >
                Download Receipt
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={() => navigate('/my-courses')}
                icon={<FaArrowRight />}
              >
                Go to Course
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;