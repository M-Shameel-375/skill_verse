// ============================================
// CERTIFICATE API ENDPOINTS
// ============================================

import axios from './axios';

const CERTIFICATE_ENDPOINTS = {
  GET_CERTIFICATES: '/certificates',
  GET_CERTIFICATE: '/certificates',
  ISSUE_CERTIFICATE: '/certificates/issue',
  VERIFY_CERTIFICATE: '/certificates/verify',
  DOWNLOAD_CERTIFICATE: '/certificates/download',
  GET_USER_CERTIFICATES: '/certificates/user',
  GET_COURSE_CERTIFICATE: '/certificates/course',
  SHARE_CERTIFICATE: '/certificates/share',
  GET_PUBLIC_CERTIFICATE: '/certificates/public',
  REVOKE_CERTIFICATE: '/certificates/revoke',
};

// ============================================
// GET ALL CERTIFICATES
// ============================================
/**
 * Get all certificates (admin)
 * @param {Object} params - { page, limit, userId, courseId }
 * @returns {Promise}
 */
export const getCertificates = (params = {}) => {
  return axios.get(CERTIFICATE_ENDPOINTS.GET_CERTIFICATES, { params });
};

// ============================================
// GET CERTIFICATE BY ID
// ============================================
/**
 * Get certificate details
 * @param {string} certificateId - Certificate ID
 * @returns {Promise}
 */
export const getCertificateById = (certificateId) => {
  return axios.get(`${CERTIFICATE_ENDPOINTS.GET_CERTIFICATE}/${certificateId}`);
};

// ============================================
// ISSUE CERTIFICATE
// ============================================
/**
 * Issue certificate to user (automatic after course completion)
 * @param {Object} certificateData - { userId, courseId, grade }
 * @returns {Promise}
 */
export const issueCertificate = (certificateData) => {
  return axios.post(CERTIFICATE_ENDPOINTS.ISSUE_CERTIFICATE, certificateData);
};

// ============================================
// VERIFY CERTIFICATE
// ============================================
/**
 * Verify certificate authenticity
 * @param {string} certificateId - Certificate ID or verification code
 * @returns {Promise}
 */
export const verifyCertificate = (certificateId) => {
  return axios.get(`${CERTIFICATE_ENDPOINTS.VERIFY_CERTIFICATE}/${certificateId}`);
};

// ============================================
// DOWNLOAD CERTIFICATE
// ============================================
/**
 * Download certificate PDF
 * @param {string} certificateId - Certificate ID
 * @returns {Promise}
 */
export const downloadCertificate = (certificateId) => {
  return axios.get(`${CERTIFICATE_ENDPOINTS.DOWNLOAD_CERTIFICATE}/${certificateId}`, {
    responseType: 'blob',
  });
};

// ============================================
// GET USER CERTIFICATES
// ============================================
/**
 * Get all certificates for a user
 * @param {string} userId - User ID
 * @returns {Promise}
 */
export const getUserCertificates = (userId) => {
  return axios.get(`${CERTIFICATE_ENDPOINTS.GET_USER_CERTIFICATES}/${userId}`);
};

// ============================================
// GET COURSE CERTIFICATE
// ============================================
/**
 * Get certificate for a specific course
 * @param {string} courseId - Course ID
 * @returns {Promise}
 */
export const getCourseCertificate = (courseId) => {
  return axios.get(`${CERTIFICATE_ENDPOINTS.GET_COURSE_CERTIFICATE}/${courseId}`);
};

// ============================================
// SHARE CERTIFICATE
// ============================================
/**
 * Share certificate (generate public link)
 * @param {string} certificateId - Certificate ID
 * @param {Object} shareData - { platform: 'linkedin' | 'twitter' | 'facebook' }
 * @returns {Promise}
 */
export const shareCertificate = (certificateId, shareData) => {
  return axios.post(`${CERTIFICATE_ENDPOINTS.SHARE_CERTIFICATE}/${certificateId}`, shareData);
};

// ============================================
// GET PUBLIC CERTIFICATE
// ============================================
/**
 * Get public certificate view (no auth required)
 * @param {string} certificateId - Certificate ID
 * @returns {Promise}
 */
export const getPublicCertificate = (certificateId) => {
  return axios.get(`${CERTIFICATE_ENDPOINTS.GET_PUBLIC_CERTIFICATE}/${certificateId}`);
};

// ============================================
// REVOKE CERTIFICATE
// ============================================
/**
 * Revoke a certificate (admin/educator)
 * @param {string} certificateId - Certificate ID
 * @param {string} reason - Revocation reason
 * @returns {Promise}
 */
export const revokeCertificate = (certificateId, reason) => {
  return axios.post(`${CERTIFICATE_ENDPOINTS.REVOKE_CERTIFICATE}/${certificateId}`, { reason });
};

// ============================================
// REGENERATE CERTIFICATE
// ============================================
/**
 * Regenerate certificate with updated template
 * @param {string} certificateId - Certificate ID
 * @returns {Promise}
 */
export const regenerateCertificate = (certificateId) => {
  return axios.post(`/certificates/${certificateId}/regenerate`);
};

// ============================================
// GET CERTIFICATE TEMPLATE
// ============================================
/**
 * Get certificate template preview
 * @param {string} templateId - Template ID
 * @returns {Promise}
 */
export const getCertificateTemplate = (templateId) => {
  return axios.get(`/certificates/templates/${templateId}`);
};

// ============================================
// SEND CERTIFICATE EMAIL
// ============================================
/**
 * Send certificate via email
 * @param {string} certificateId - Certificate ID
 * @param {string} email - Recipient email
 * @returns {Promise}
 */
export const sendCertificateEmail = (certificateId, email) => {
  return axios.post(`/certificates/${certificateId}/send-email`, { email });
};

// ============================================
// ADD TO LINKEDIN
// ============================================
/**
 * Add certificate to LinkedIn profile
 * @param {string} certificateId - Certificate ID
 * @returns {Promise}
 */
export const addCertificateToLinkedIn = (certificateId) => {
  return axios.post(`/certificates/${certificateId}/linkedin`);
};

// ============================================
// GET CERTIFICATE QR CODE
// ============================================
/**
 * Get QR code for certificate verification
 * @param {string} certificateId - Certificate ID
 * @returns {Promise}
 */
export const getCertificateQRCode = (certificateId) => {
  return axios.get(`/certificates/${certificateId}/qr-code`, {
    responseType: 'blob',
  });
};

// ============================================
// GET CERTIFICATE STATISTICS
// ============================================
/**
 * Get certificate issuance statistics (admin)
 * @param {Object} params - { startDate, endDate, courseId }
 * @returns {Promise}
 */
export const getCertificateStatistics = (params = {}) => {
  return axios.get('/certificates/statistics', { params });
};

// ============================================
// EXPORT ALL CERTIFICATE API METHODS
// ============================================
const certificateApi = {
  getCertificates,
  getCertificateById,
  issueCertificate,
  verifyCertificate,
  downloadCertificate,
  getUserCertificates,
  getCourseCertificate,
  shareCertificate,
  getPublicCertificate,
  revokeCertificate,
  regenerateCertificate,
  getCertificateTemplate,
  sendCertificateEmail,
  addCertificateToLinkedIn,
  getCertificateQRCode,
  getCertificateStatistics,
};

export default certificateApi;