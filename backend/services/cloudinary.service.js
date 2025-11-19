// ============================================
// CLOUDINARY SERVICE
// ============================================

const cloudinary = require('cloudinary').v2;
const config = require('../config/config');

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

// ============================================
// UPLOAD IMAGE
// ============================================
const uploadImage = async (filePath, folder = 'skillverse') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'image',
      transformation: [
        { quality: 'auto' },
        { fetch_format: 'auto' },
      ],
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

// ============================================
// UPLOAD VIDEO
// ============================================
const uploadVideo = async (filePath, folder = 'skillverse/videos') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'video',
      chunk_size: 6000000, // 6MB chunks
      eager: [
        { streaming_profile: 'hd', format: 'm3u8' },
        { format: 'mp4', transformation: [{ quality: 'auto' }] },
      ],
      eager_async: true,
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      duration: result.duration,
      format: result.format,
      playbackUrl: result.playback_url,
    };
  } catch (error) {
    console.error('Cloudinary video upload error:', error);
    throw error;
  }
};

// ============================================
// UPLOAD DOCUMENT
// ============================================
const uploadDocument = async (filePath, folder = 'skillverse/documents') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'raw',
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      size: result.bytes,
    };
  } catch (error) {
    console.error('Cloudinary document upload error:', error);
    throw error;
  }
};

// ============================================
// DELETE FILE
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
// DELETE MULTIPLE FILES
// ============================================
const deleteMultipleFiles = async (publicIds, resourceType = 'image') => {
  try {
    const result = await cloudinary.api.delete_resources(publicIds, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.error('Cloudinary bulk delete error:', error);
    throw error;
  }
};

// ============================================
// GET FILE INFO
// ============================================
const getFileInfo = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.api.resource(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.error('Cloudinary get file info error:', error);
    throw error;
  }
};

// ============================================
// GENERATE THUMBNAIL
// ============================================
const generateThumbnail = (publicId, width = 300, height = 200) => {
  return cloudinary.url(publicId, {
    transformation: [
      { width, height, crop: 'fill', gravity: 'auto' },
      { quality: 'auto' },
      { fetch_format: 'auto' },
    ],
  });
};

// ============================================
// OPTIMIZE IMAGE
// ============================================
const optimizeImage = (publicId, options = {}) => {
  const defaultOptions = {
    quality: 'auto',
    fetch_format: 'auto',
  };

  return cloudinary.url(publicId, {
    transformation: [{ ...defaultOptions, ...options }],
  });
};

// ============================================
// CREATE VIDEO THUMBNAIL
// ============================================
const createVideoThumbnail = (publicId) => {
  return cloudinary.url(publicId, {
    resource_type: 'video',
    transformation: [
      { width: 300, crop: 'scale' },
      { quality: 'auto' },
      { fetch_format: 'auto' },
    ],
    format: 'jpg',
  });
};

// ============================================
// UPLOAD FROM URL
// ============================================
const uploadFromUrl = async (url, folder = 'skillverse') => {
  try {
    const result = await cloudinary.uploader.upload(url, {
      folder: folder,
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('Upload from URL error:', error);
    throw error;
  }
};

// ============================================
// EXPORTS
// ============================================
module.exports = {
  cloudinary,
  uploadImage,
  uploadVideo,
  uploadDocument,
  deleteFile,
  deleteMultipleFiles,
  getFileInfo,
  generateThumbnail,
  optimizeImage,
  createVideoThumbnail,
  uploadFromUrl,
};