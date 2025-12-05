import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FaCertificate, FaDownload, FaCalendarAlt, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import Card from '../common/Card';
import Button from '../common/Button';
import toast from 'react-hot-toast';
import { getUserCertificates, downloadCertificate, shareCertificate } from '../../../api/certificateApi';

const CertificatesList = ({ certificates = [], userId }) => {
  const [allCertificates, setAllCertificates] = useState(certificates);
  const [loading, setLoading] = useState(!certificates.length);
  const [downloading, setDownloading] = useState(null);

  const fetchCertificates = useCallback(async () => {
    if (certificates.length > 0 || !userId) {
      setAllCertificates(certificates);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await getUserCertificates(userId);
      const data = response.data?.data || response.data;
      setAllCertificates(Array.isArray(data) ? data : data.certificates || []);
    } catch (err) {
      console.error('Error fetching certificates:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, certificates]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  const handleDownload = async (cert) => {
    try {
      setDownloading(cert._id);
      const response = await downloadCertificate(cert._id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificate-${cert.certificateId || cert._id}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('Certificate downloaded!');
    } catch (err) {
      toast.error('Failed to download certificate');
    } finally {
      setDownloading(null);
    }
  };

  const handleShare = async (cert) => {
    try {
      const response = await shareCertificate(cert._id);
      const shareUrl = response.data?.url || `${window.location.origin}/certificates/${cert._id}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard!');
    } catch (err) {
      // Fallback to copying current URL
      await navigator.clipboard.writeText(`${window.location.origin}/certificates/${cert._id}`);
      toast.success('Share link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="p-6 flex items-center justify-center">
          <FaSpinner className="animate-spin text-2xl text-blue-600" />
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-6 space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Certificates</h2>

        {allCertificates.length > 0 ? (
          <div className="space-y-4">
            {allCertificates.map((cert, index) => (
              <motion.div
                key={cert._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <FaCertificate className="text-blue-600 text-2xl" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">{cert.courseName}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <FaCalendarAlt />
                          <span>{new Date(cert.issueDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FaCheckCircle className="text-green-600" />
                          <span className="font-medium text-gray-900">Grade: {cert.grade}</span>
                        </div>
                        <span className="text-gray-400">ID: {cert.certificateId}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      icon={downloading === cert._id ? <FaSpinner className="animate-spin" /> : <FaDownload />}
                      onClick={() => handleDownload(cert)}
                      disabled={downloading === cert._id}
                    >
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleShare(cert)}
                    >
                      Share
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FaCertificate className="text-5xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No certificates yet</p>
            <p className="text-sm text-gray-500">Complete courses to earn certificates!</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default CertificatesList;
