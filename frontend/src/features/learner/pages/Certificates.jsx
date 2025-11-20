// ============================================
// CERTIFICATES PAGE
// ============================================

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import {
  FaCertificate,
  FaDownload,
  FaShare,
  FaLinkedin,
  FaTwitter,
  FaFacebook,
  FaEye,
  FaFilter,
} from 'react-icons/fa';
import {
  getUserCertificates,
  selectUserCertificates,
  selectUserLoading,
} from '../../../redux/slices/userSlice';
import useAuth from '../../../hooks/useAuth';
import config from '../../../config';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import Modal from '../../shared/components/Modal';
import { CardSkeletonLoader } from '../../shared/components/Loader';
import { formatDate } from '../../../utils/helpers';
import toast from 'react-hot-toast';

// ============================================
// CERTIFICATE CARD
// ============================================
const CertificateCard = ({ certificate, onView, onDownload, onShare }) => {
  return (
    <Card className="overflow-hidden flex flex-col">
      <CardHeader className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white text-center">
        <div className="text-5xl mb-4">🏆</div>
        <CardTitle className="text-xl text-white">{certificate.courseName}</CardTitle>
        <CardDescription className="text-blue-100">Certificate of Completion</CardDescription>
        <p className="text-sm text-blue-200 mt-4">Awarded to</p>
        <p className="text-lg font-semibold mt-1">{certificate.userName}</p>
      </CardHeader>

      <CardContent className="p-6 flex-grow">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-600">Issued by</p>
            <p className="font-medium text-gray-900">{certificate.issuedBy}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Date</p>
            <p className="font-medium text-gray-900">
              {formatDate(certificate.issuedAt, 'MMM dd, yyyy')}
            </p>
          </div>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">Certificate ID</p>
          <p className="text-sm font-mono text-gray-900 break-all">{certificate.certificateId}</p>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <div className="flex gap-2 w-full">
          <Button
            variant="default"
            size="sm"
            className="flex-1"
            onClick={() => onView(certificate)}
          >
            <FaEye className="mr-2 h-4 w-4" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onDownload(certificate)}
          >
            <FaDownload className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onShare(certificate)}
          >
            <FaShare className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

// ============================================
// CERTIFICATE PREVIEW MODAL
// ============================================
const CertificatePreviewModal = ({ isOpen, onClose, certificate }) => {
  if (!certificate) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Certificate Preview"
      size="4xl"
    >
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-12 text-white text-center rounded-lg">
        <div className="max-w-3xl mx-auto">
          {/* Logo */}
          <div className="text-6xl mb-6">🏆</div>

          {/* Certificate Title */}
          <h1 className="text-4xl font-bold mb-4">Certificate of Completion</h1>

          {/* Divider */}
          <div className="w-32 h-1 bg-white mx-auto mb-8 opacity-50" />

          {/* Content */}
          <p className="text-xl mb-4">This certifies that</p>
          <h2 className="text-5xl font-bold mb-6">{certificate.userName}</h2>
          <p className="text-xl mb-2">has successfully completed</p>
          <h3 className="text-3xl font-semibold mb-8">{certificate.courseName}</h3>

          {/* Details */}
          <div className="flex justify-center gap-12 mb-8">
            <div>
              <p className="text-sm opacity-75">Issued by</p>
              <p className="font-semibold">{certificate.issuedBy}</p>
            </div>
            <div>
              <p className="text-sm opacity-75">Date</p>
              <p className="font-semibold">{formatDate(certificate.issuedAt, 'MMM dd, yyyy')}</p>
            </div>
          </div>

          {/* Certificate ID */}
          <p className="text-sm opacity-75">Certificate ID: {certificate.certificateId}</p>

          {/* QR Code Placeholder */}
          <div className="mt-8 inline-block p-4 bg-white rounded-lg">
            <div className="w-32 h-32 bg-gray-800 flex items-center justify-center">
              <span className="text-4xl">QR</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <Button
          onClick={() => window.open(certificate.url, '_blank')}
        >
          <FaDownload className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
        <Button
          variant="outline"
          onClick={onClose}
        >
          Close
        </Button>
      </div>
    </Modal>
  );
};

// ============================================
// SHARE MODAL
// ============================================
const ShareModal = ({ isOpen, onClose, certificate }) => {
  const shareUrl = certificate ? `${window.location.origin}/certificates/${certificate.certificateId}` : '';

  const handleShare = (platform) => {
    const text = `I just earned a certificate in ${certificate.courseName} from ${config.app.name}!`;
    
    const urls = {
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    };

    window.open(urls[platform], '_blank', 'width=600,height=400');
    onClose();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard!');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share Certificate"
      size="md"
    >
      <div className="space-y-4">
        <p className="text-gray-600">Share your achievement with your network</p>

        <div className="space-y-3">
          <Button
            variant="outline"
            fullWidth
            icon={<FaLinkedin className="text-blue-600" />}
            onClick={() => handleShare('linkedin')}
          >
            Share on LinkedIn
          </Button>

          <Button
            variant="outline"
            fullWidth
            icon={<FaTwitter className="text-blue-400" />}
            onClick={() => handleShare('twitter')}
          >
            Share on Twitter
          </Button>

          <Button
            variant="outline"
            fullWidth
            icon={<FaFacebook className="text-blue-700" />}
            onClick={() => handleShare('facebook')}
          >
            Share on Facebook
          </Button>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Or copy link</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <Button
              variant="primary"
              onClick={handleCopyLink}
            >
              Copy
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

// ============================================
// CERTIFICATES PAGE
// ============================================
const Certificates = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  
  const certificates = useSelector(selectUserCertificates);
  const loading = useSelector(selectUserLoading);
  
  const [previewModal, setPreviewModal] = useState({ isOpen: false, certificate: null });
  const [shareModal, setShareModal] = useState({ isOpen: false, certificate: null });
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, course

  useEffect(() => {
    if (user) {
      dispatch(getUserCertificates(user._id));
    }
  }, [dispatch, user]);

  const handleDownload = (certificate) => {
    if (certificate.url) {
      window.open(certificate.url, '_blank');
    } else {
      toast.error('Certificate file not available');
    }
  };

  // Sort certificates
  const sortedCertificates = [...certificates].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.issuedAt) - new Date(a.issuedAt);
    } else if (sortBy === 'oldest') {
      return new Date(a.issuedAt) - new Date(b.issuedAt);
    } else {
      return a.courseName.localeCompare(b.courseName);
    }
  });

  return (
    <>
      <Helmet>
        <title>My Certificates | {config.app.name}</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Certificates</h1>
            <p className="text-gray-600">View and download your earned certificates</p>
          </div>

          {/* Sort */}
          {certificates.length > 0 && (
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="course">Course Name</option>
              </select>
            </div>
          )}
        </div>

        {/* Stats */}
        {certificates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <div className="p-6 text-center">
                <FaCertificate className="text-4xl text-blue-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-gray-900">{certificates.length}</p>
                <p className="text-gray-600">Total Certificates</p>
              </div>
            </Card>

            <Card>
              <div className="p-6 text-center">
                <div className="text-4xl mb-2">📚</div>
                <p className="text-3xl font-bold text-gray-900">{certificates.length}</p>
                <p className="text-gray-600">Courses Completed</p>
              </div>
            </Card>

            <Card>
              <div className="p-6 text-center">
                <div className="text-4xl mb-2">🎓</div>
                <p className="text-3xl font-bold text-gray-900">
                  {new Date().getFullYear() - new Date(user?.createdAt).getFullYear() || 0}
                </p>
                <p className="text-gray-600">Years Learning</p>
              </div>
            </Card>
          </div>
        )}

        {/* Certificates Grid */}
        {loading ? (
          <CardSkeletonLoader count={6} />
        ) : certificates.length === 0 ? (
          <Card padding="xl" className="text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              No certificates yet
            </h3>
            <p className="text-gray-600 mb-6">
              Complete courses to earn certificates and showcase your achievements
            </p>
            <Button
              variant="primary"
              onClick={() => window.location.href = config.routes.courses}
            >
              Browse Courses
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCertificates.map((certificate) => (
              <CertificateCard
                key={certificate._id}
                certificate={certificate}
                onView={(cert) => setPreviewModal({ isOpen: true, certificate: cert })}
                onDownload={handleDownload}
                onShare={(cert) => setShareModal({ isOpen: true, certificate: cert })}
              />
            ))}
          </div>
        )}

        {/* Info Card */}
        {certificates.length > 0 && (
          <Card className="bg-blue-50 border-blue-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                💼 Boost Your Career
              </h3>
              <p className="text-gray-700 mb-4">
                Share your certificates on professional networks to showcase your skills and achievements!
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<FaLinkedin />}
                  onClick={() => window.open('https://www.linkedin.com', '_blank')}
                >
                  Add to LinkedIn
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Modals */}
      <CertificatePreviewModal
        isOpen={previewModal.isOpen}
        onClose={() => setPreviewModal({ isOpen: false, certificate: null })}
        certificate={previewModal.certificate}
      />

      <ShareModal
        isOpen={shareModal.isOpen}
        onClose={() => setShareModal({ isOpen: false, certificate: null })}
        certificate={shareModal.certificate}
      />
    </>
  );
};

export default Certificates;