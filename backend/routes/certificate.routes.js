// Certificate routes
// ============================================
// CERTIFICATE ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const {
  issueCertificate,
  getAllCertificates,
  getCertificateById,
  getByCertificateId,
  verifyCertificate,
  downloadCertificate,
  getUserCertificates,
  getMyCertificates,
  shareCertificate,
  revokeCertificate,
  reactivateCertificate,
  getExpiringCertificates,
  getCertificateStatistics,
  updateCertificateVisibility,
} = require('../controllers/certificate.controller');
const { protect, optionalAuth } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/roleCheck.middleware');
const { validateMongoId, validate } = require('../middlewares/validation.middleware');

// Public routes
router.get('/verify/:verificationCode', verifyCertificate);
router.get('/cert/:certificateId', getByCertificateId);
router.get('/user/:userId', getUserCertificates);
router.get('/:id', optionalAuth, validateMongoId('id'), validate, getCertificateById);

// Protected routes
router.use(protect);

router.get('/', getAllCertificates);
router.get('/my/certificates', getMyCertificates);
router.get('/:id/download', downloadCertificate);
router.post('/:id/share', shareCertificate);
router.put('/:id/visibility', updateCertificateVisibility);

// Protected routes - Admin/Educator
router.post('/', authorize('admin', 'educator'), issueCertificate);
router.put('/:id/revoke', authorize('admin', 'educator'), revokeCertificate);
router.put('/:id/reactivate', authorize('admin'), reactivateCertificate);
router.get('/admin/expiring', authorize('admin'), getExpiringCertificates);
router.get('/admin/statistics', authorize('admin'), getCertificateStatistics);

module.exports = router;