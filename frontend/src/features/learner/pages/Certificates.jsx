import React, { useEffect, useState, useCallback } from 'react';
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
  FaSpinner,
  FaCopy,
} from 'react-icons/fa';
import { getUserCertificates } from '@/api/userApi';
import useAuth from '@/hooks/useAuth';
import config from '@/config';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Modal from '@/components/shared/Modal';
import toast from 'react-hot-toast';

// ============================================
// HELPER FUNCTIONS
// ============================================
const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// ============================================
// CERTIFICATE CARD COMPONENT
// ============================================
const CertificateCard = ({ certificate, onView, onDownload, onShare }) => {
  const courseName = certificate.courseName || certificate.course?.title || 'Course Certificate';
  const userName = certificate.userName || certificate.user?.name || 'Student';
  const issuedBy = certificate.issuedBy || 'SkillVerse';
  const issuedAt = certificate.issuedAt || certificate.createdAt;
  const certificateId = certificate.certificateId || certificate._id;

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      {/* Certificate Preview Header */}
      <CardHeader className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white text-center">
        <div className="text-5xl mb-4">🏆</div>
        <CardTitle className="text-xl text-white line-clamp-2">{courseName}</CardTitle>
        <CardDescription className="text-blue-100">Certificate of Completion</CardDescription>
        <p className="text-sm text-blue-200 mt-4">Awarded to</p>
        <p className="text-lg font-semibold mt-1">{userName}</p>
      </CardHeader>

      <CardContent className="p-6 flex-grow">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-600">Issued by</p>
            <p className="font-medium text-gray-900">{issuedBy}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Date</p>
            <p className="font-medium text-gray-900">{formatDate(issuedAt)}</p>
          </div>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">Certificate ID</p>
          <p className="text-sm font-mono text-gray-900 break-all">{certificateId}</p>
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
            size="sm"
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

  const courseName = certificate.courseName || certificate.course?.title || 'Course Certificate';
  const userName = certificate.userName || certificate.user?.name || 'Student';
  const issuedBy = certificate.issuedBy || 'SkillVerse';
  const issuedAt = certificate.issuedAt || certificate.createdAt;
  const certificateId = certificate.certificateId || certificate._id;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Certificate Preview" size="xl">
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 md:p-12 text-white text-center rounded-lg">
        <div className="max-w-3xl mx-auto">
          <div className="text-6xl mb-6">🏆</div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Certificate of Completion</h1>
          <div className="w-32 h-1 bg-white mx-auto mb-8 opacity-50" />

          <p className="text-xl mb-4">This certifies that</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">{userName}</h2>
          <p className="text-xl mb-2">has successfully completed</p>
          <h3 className="text-2xl md:text-3xl font-semibold mb-8">{courseName}</h3>

          <div className="flex justify-center gap-8 md:gap-12 mb-8 flex-wrap">
            <div>
              <p className="text-sm opacity-75">Issued by</p>
              <p className="font-semibold">{issuedBy}</p>
            </div>
            <div>
              <p className="text-sm opacity-75">Date</p>
              <p className="font-semibold">{formatDate(issuedAt)}</p>
            </div>
          </div>

          <p className="text-sm opacity-75">Certificate ID: {certificateId}</p>
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-3 flex-wrap">
        {certificate.url && (
          <Button onClick={() => window.open(certificate.url, '_blank')}>
            <FaDownload className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        )}
        <Button variant="outline" onClick={onClose}>
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
  if (!certificate) return null;

  const certificateId = certificate.certificateId || certificate._id;
  const courseName = certificate.courseName || certificate.course?.title || 'a course';
  const shareUrl = `${window.location.origin}/certificates/verify/${certificateId}`;

  const handleShare = (platform) => {
    const text = `I just earned a certificate in "${courseName}" from ${config.app?.name || 'SkillVerse'}! 🎓`;

    const urls = {
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    };

    window.open(urls[platform], '_blank', 'width=600,height=400');
    onClose();
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Certificate" size="md">
      <div className="space-y-4">
        <p className="text-gray-600">Share your achievement with your network</p>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => handleShare('linkedin')}
          >
            <FaLinkedin className="mr-3 text-blue-600" />
            Share on LinkedIn
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => handleShare('twitter')}
          >
            <FaTwitter className="mr-3 text-blue-400" />
            Share on Twitter
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => handleShare('facebook')}
          >
            <FaFacebook className="mr-3 text-blue-700" />
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
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
            />
            <Button onClick={handleCopyLink}>
              <FaCopy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

// ============================================
// CERTIFICATES PAGE COMPONENT
// ============================================
const Certificates = () => {
  const { user } = useAuth();

  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [previewModal, setPreviewModal] = useState({ isOpen: false, certificate: null });
  const [shareModal, setShareModal] = useState({ isOpen: false, certificate: null });

  // Fetch certificates
  const fetchCertificates = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getUserCertificates(user?._id);
      const data = response?.data?.data || response?.data || [];
      setCertificates(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch certificates:', error);
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    if (user) {
      fetchCertificates();
    }
  }, [fetchCertificates, user]);

  // Handle download
  const handleDownload = (certificate) => {
    if (certificate.url) {
      window.open(certificate.url, '_blank');
    } else {
      toast.error('Certificate file not available');
    }
  };

  // Sort certificates
  const sortedCertificates = [...certificates].sort((a, b) => {
    const dateA = new Date(a.issuedAt || a.createdAt);
    const dateB = new Date(b.issuedAt || b.createdAt);

    if (sortBy === 'newest') return dateB - dateA;
    if (sortBy === 'oldest') return dateA - dateB;

    const nameA = (a.courseName || a.course?.title || '').toLowerCase();
    const nameB = (b.courseName || b.course?.title || '').toLowerCase();
    return nameA.localeCompare(nameB);
  });

  return (
    <>
      <Helmet>
        <title>My Certificates | {config.app?.name || 'SkillVerse'}</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Certificates</h1>
            <p className="text-gray-600">View and share your earned certificates</p>
          </div>

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
              <CardContent className="p-6 text-center">
                <FaCertificate className="text-4xl text-blue-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-gray-900">{certificates.length}</p>
                <p className="text-gray-600">Total Certificates</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-2">📚</div>
                <p className="text-3xl font-bold text-gray-900">{certificates.length}</p>
                <p className="text-gray-600">Courses Completed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-2">🎓</div>
                <p className="text-3xl font-bold text-gray-900">
                  {user?.createdAt
                    ? new Date().getFullYear() - new Date(user.createdAt).getFullYear() || '<1'
                    : 0}
                </p>
                <p className="text-gray-600">Years Learning</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Certificates Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <FaSpinner className="animate-spin text-3xl text-blue-600 mr-3" />
            <span className="text-gray-600">Loading certificates...</span>
          </div>
        ) : certificates.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              No certificates yet
            </h3>
            <p className="text-gray-600 mb-6">
              Complete courses to earn certificates and showcase your achievements
            </p>
            <Button onClick={() => window.location.href = '/courses'}>
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

        {/* Career Tips Card */}
        {certificates.length > 0 && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                💼 Boost Your Career
              </h3>
              <p className="text-gray-700 mb-4">
                Add your certificates to professional networks to showcase your skills!
              </p>
              <div className="flex gap-3 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://www.linkedin.com/in/', '_blank')}
                >
                  <FaLinkedin className="mr-2" />
                  Add to LinkedIn
                </Button>
              </div>
            </CardContent>
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