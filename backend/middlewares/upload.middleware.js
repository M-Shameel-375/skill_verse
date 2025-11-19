// Upload middleware
// ============================================
// FILE UPLOAD MIDDLEWARE (MULTER)
// ============================================

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ApiError = require('../utils/ApiError');
const config = require('../config/config');

// ============================================
// ENSURE UPLOAD DIRECTORIES EXIST
// ============================================
const ensureUploadDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Create upload directories
Object.values(config.upload.folders).forEach((folder) => {
  ensureUploadDir(folder);
});

// ============================================
// LOCAL STORAGE CONFIGURATION
// ============================================
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = config.upload.folders.temp;

    // Determine upload path based on fieldname
    if (file.fieldname === 'profileImage') {
      uploadPath = config.upload.folders.profiles;
    } else if (file.fieldname === 'courseThumbnail') {
      uploadPath = config.upload.folders.courses;
    } else if (file.fieldname === 'courseVideo') {
      uploadPath = config.upload.folders.courses;
    } else if (file.fieldname === 'courseDocument') {
      uploadPath = config.upload.folders.courses;
    } else if (file.fieldname === 'certificate') {
      uploadPath = config.upload.folders.certificates;
    }

    ensureUploadDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

// ============================================
// FILE FILTER
// ============================================
const fileFilter = (allowedTypes) => {
  return (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        ApiError.badRequest(
          `Invalid file type. Only ${allowedTypes.join(', ')} are allowed`
        ),
        false
      );
    }
  };
};

// ============================================
// IMAGE UPLOAD
// ============================================
const uploadImage = multer({
  storage: localStorage,
  limits: {
    fileSize: config.upload.maxFileSize, // 10MB
  },
  fileFilter: fileFilter(config.upload.allowedImageTypes),
});

// ============================================
// VIDEO UPLOAD
// ============================================
const uploadVideo = multer({
  storage: localStorage,
  limits: {
    fileSize: config.upload.maxVideoSize, // 100MB
  },
  fileFilter: fileFilter(config.upload.allowedVideoTypes),
});

// ============================================
// DOCUMENT UPLOAD
// ============================================
const uploadDocument = multer({
  storage: localStorage,
  limits: {
    fileSize: config.upload.maxFileSize, // 10MB
  },
  fileFilter: fileFilter(config.upload.allowedDocTypes),
});

// ============================================
// MIXED UPLOAD (IMAGES + DOCUMENTS)
// ============================================
const uploadMixed = multer({
  storage: localStorage,
  limits: {
    fileSize: config.upload.maxFileSize,
  },
  fileFilter: fileFilter([
    ...config.upload.allowedImageTypes,
    ...config.upload.allowedDocTypes,
  ]),
});

// ============================================
// COURSE CONTENT UPLOAD (VIDEOS + DOCS + IMAGES)
// ============================================
const uploadCourseContent = multer({
  storage: localStorage,
  limits: {
    fileSize: config.upload.maxVideoSize, // 100MB for videos
  },
  fileFilter: fileFilter([
    ...config.upload.allowedImageTypes,
    ...config.upload.allowedVideoTypes,
    ...config.upload.allowedDocTypes,
  ]),
});

// ============================================
// SINGLE FILE UPLOAD HANDLERS
// ============================================
exports.uploadSingleImage = (fieldName) => {
  return uploadImage.single(fieldName);
};

exports.uploadSingleVideo = (fieldName) => {
  return uploadVideo.single(fieldName);
};

exports.uploadSingleDocument = (fieldName) => {
  return uploadDocument.single(fieldName);
};

// ============================================
// MULTIPLE FILES UPLOAD HANDLERS
// ============================================
exports.uploadMultipleImages = (fieldName, maxCount = 5) => {
  return uploadImage.array(fieldName, maxCount);
};

exports.uploadMultipleVideos = (fieldName, maxCount = 10) => {
  return uploadVideo.array(fieldName, maxCount);
};

exports.uploadMultipleDocuments = (fieldName, maxCount = 10) => {
  return uploadDocument.array(fieldName, maxCount);
};

// ============================================
// MIXED FIELDS UPLOAD
// ============================================
exports.uploadCourseFiles = uploadCourseContent.fields([
  { name: 'courseThumbnail', maxCount: 1 },
  { name: 'courseVideos', maxCount: 50 },
  { name: 'courseDocuments', maxCount: 20 },
]);

exports.uploadProfileFiles = uploadMixed.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 },
  { name: 'resume', maxCount: 1 },
]);

// ============================================
// DELETE FILE HELPER
// ============================================
exports.deleteFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// ============================================
// DELETE MULTIPLE FILES HELPER
// ============================================
exports.deleteFiles = (filePaths) => {
  filePaths.forEach((filePath) => {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });
};

// ============================================
// VALIDATE UPLOADED FILE
// ============================================
exports.validateUploadedFile = (req, res, next) => {
  if (!req.file && !req.files) {
    throw ApiError.badRequest('Please upload a file');
  }
  next();
};

// ============================================
// CLEAN TEMP FILES (CRON JOB HELPER)
// ============================================
exports.cleanTempFiles = () => {
  const tempDir = config.upload.folders.temp;
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours

  fs.readdir(tempDir, (err, files) => {
    if (err) {
      console.error('Error reading temp directory:', err);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(tempDir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error('Error getting file stats:', err);
          return;
        }

        if (now - stats.mtimeMs > maxAge) {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error('Error deleting temp file:', err);
            } else {
              console.log(`Deleted temp file: ${file}`);
            }
          });
        }
      });
    });
  });
};