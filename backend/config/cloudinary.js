// ============================================
// CLOUDINARY CONFIGURATION
// ============================================

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const config = require('./config');

// ============================================
// CONFIGURE CLOUDINARY
// ============================================
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

// ============================================
// STORAGE FOR PROFILE IMAGES
// ============================================
const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'skillverse/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 500, height: 500, crop: 'limit' },
      { quality: 'auto' },
    ],
  },
});

// ============================================
// STORAGE FOR COURSE THUMBNAILS
// ============================================
const courseThumbnailStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'skillverse/course-thumbnails',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1280, height: 720, crop: 'limit' },
      { quality: 'auto' },
    ],
  },
});

// ============================================
// STORAGE FOR COURSE VIDEOS
// ============================================
const courseVideoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'skillverse/course-videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'avi'],
    transformation: [{ quality: 'auto' }],
  },
});

// ============================================
// STORAGE FOR COURSE DOCUMENTS
// ============================================
const courseDocumentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'skillverse/course-documents',
    resource_type: 'raw',
    allowed_formats: ['pdf', 'doc', 'docx', 'ppt', 'pptx'],
  },
});

// ============================================
// STORAGE FOR CERTIFICATES
// ============================================
const certificateStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'skillverse/certificates',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    transformation: [{ quality: 'auto' }],
  },
});

// ============================================
// DELETE FILE FROM CLOUDINARY
// ============================================
const deleteFile = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

// ============================================
// GET FILE URL
// ============================================
const getFileUrl = (publicId, options = {}) => {
  return cloudinary.url(publicId, options);
};

// ============================================
// EXPORTS
// ============================================
module.exports = {
  cloudinary,
  profileStorage,
  courseThumbnailStorage,
  courseVideoStorage,
  courseDocumentStorage,
  certificateStorage,
  deleteFile,
  getFileUrl,
};