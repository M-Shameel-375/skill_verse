import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCertificate, FaDownload, FaCalendarAlt, FaCheckCircle } from 'react-icons/fa';
import Card from '../common/Card';
import Button from '../common/Button';
import toast from 'react-hot-toast';

const CertificatesList = ({ certificates = [] }) => {
  const mockCertificates = [
    {
      _id: '1',
      courseName: 'Complete React Masterclass',
      issueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      certificateId: 'CERT-2024-12345',
      grade: 'A+',
      credentialUrl: '#',
    },
    {
      _id: '2',
      courseName: 'Node.js Backend Development',
      issueDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      certificateId: 'CERT-2024-12346',
      grade: 'A',
      credentialUrl: '#',
    },
  ];

  const allCertificates = certificates.length > 0 ? certificates : mockCertificates;

  const handleDownload = (cert) => {
    toast.success('Certificate downloading...');
  };

  const handleShare = (cert) => {
    toast.success('Share link copied to clipboard!');
  };

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
                      icon={<FaDownload />}
                      onClick={() => handleDownload(cert)}
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
