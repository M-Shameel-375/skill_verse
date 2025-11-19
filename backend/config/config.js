// ============================================
// CENTRALIZED CONFIGURATION
// ============================================

module.exports = {
  // ============================================
  // SERVER CONFIGURATION
  // ============================================
  server: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || 'development',
    apiVersion: process.env.API_VERSION || '/api/v1',
  },

  // ============================================
  // DATABASE CONFIGURATION
  // ============================================
  database: {
    uri:
      process.env.NODE_ENV === 'production'
        ? process.env.MONGODB_URI_PROD
        : process.env.MONGODB_URI,
  },

  // ============================================
  // JWT CONFIGURATION
  // ============================================
  jwt: {
    secret: process.env.JWT_SECRET,
    expiry: process.env.JWT_EXPIRE || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiry: process.env.JWT_REFRESH_EXPIRE || '30d',
    cookieExpire: parseInt(process.env.JWT_COOKIE_EXPIRE) || 7,
  },

  // ============================================
  // STRIPE PAYMENT CONFIGURATION
  // ============================================
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    successUrl: process.env.PAYMENT_SUCCESS_URL || 'http://localhost:3000/payment/success',
    cancelUrl: process.env.PAYMENT_CANCEL_URL || 'http://localhost:3000/payment/cancel',
    currency: 'usd',
  },

  // ============================================
  // EMAIL CONFIGURATION
  // ============================================
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true' || false,
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || 'SkillVerse <noreply@skillverse.com>',
  },

  // ============================================
  // CLOUDINARY CONFIGURATION
  // ============================================
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  // ============================================
  // FILE UPLOAD CONFIGURATION
  // ============================================
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
    maxVideoSize: parseInt(process.env.MAX_VIDEO_SIZE) || 104857600, // 100MB
    uploadPath: process.env.UPLOAD_PATH || './uploads',
    
    allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    allowedVideoTypes: ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'],
    allowedDocTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ],
    
    folders: {
      courses: 'uploads/courses',
      profiles: 'uploads/profiles',
      certificates: 'uploads/certificates',
      temp: 'uploads/temp',
    },
  },

  // ============================================
  // SECURITY CONFIGURATION
  // ============================================
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 10,
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    sessionSecret: process.env.SESSION_SECRET,
  },

  // ============================================
  // FRONTEND CONFIGURATION
  // ============================================
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  },

  // ============================================
  // AI/ML CONFIGURATION
  // ============================================
  ai: {
    serviceUrl: process.env.AI_SERVICE_URL,
    openaiApiKey: process.env.OPENAI_API_KEY,
    model: process.env.AI_MODEL || 'gpt-3.5-turbo',
    maxTokens: 500,
    temperature: 0.7,
  },

  // ============================================
  // SOCKET.IO CONFIGURATION
  // ============================================
  socket: {
    port: parseInt(process.env.SOCKET_PORT) || 5001,
    corsOrigin: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:3000',
  },

  // ============================================
  // VIDEO STREAMING (AGORA/TWILIO)
  // ============================================
  video: {
    provider: process.env.VIDEO_PROVIDER || 'agora', // 'agora' or 'twilio'
    
    agora: {
      appId: process.env.AGORA_APP_ID,
      appCertificate: process.env.AGORA_APP_CERTIFICATE,
      tokenExpiry: 3600, // 1 hour
    },
    
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      apiKey: process.env.TWILIO_API_KEY,
      apiSecret: process.env.TWILIO_API_SECRET,
    },
  },

  // ============================================
  // REDIS CONFIGURATION (Optional)
  // ============================================
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || null,
    ttl: 3600, // 1 hour
  },

  // ============================================
  // LOGGING CONFIGURATION
  // ============================================
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    filePath: process.env.LOG_FILE_PATH || './logs',
  },

  // ============================================
  // CORS CONFIGURATION
  // ============================================
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },

  // ============================================
  // CERTIFICATE CONFIGURATION
  // ============================================
  certificate: {
    templatePath: process.env.CERTIFICATE_TEMPLATE_PATH || './templates/certificate.html',
    storagePath: process.env.CERTIFICATE_STORAGE_PATH || './uploads/certificates',
  },

  // ============================================
  // GAMIFICATION CONFIGURATION
  // ============================================
  gamification: {
    pointsPerCourseCompletion: parseInt(process.env.POINTS_PER_COURSE_COMPLETION) || 100,
    pointsPerQuizPass: parseInt(process.env.POINTS_PER_QUIZ_PASS) || 50,
    pointsPerSkillExchange: parseInt(process.env.POINTS_PER_SKILL_EXCHANGE) || 75,
    
    badges: {
      beginner: { threshold: 0, name: 'Beginner' },
      intermediate: { threshold: 500, name: 'Intermediate' },
      advanced: { threshold: 1500, name: 'Advanced' },
      expert: { threshold: 5000, name: 'Expert' },
      master: { threshold: 10000, name: 'Master' },
    },
  },

  // ============================================
  // NOTIFICATION CONFIGURATION
  // ============================================
  notification: {
    enableEmail: process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true' || true,
    enablePush: process.env.ENABLE_PUSH_NOTIFICATIONS === 'true' || true,
    batchSize: parseInt(process.env.NOTIFICATION_BATCH_SIZE) || 50,
  },

  // ============================================
  // PAGINATION DEFAULTS
  // ============================================
  pagination: {
    defaultLimit: 10,
    maxLimit: 100,
  },

  // ============================================
  // COURSE SETTINGS
  // ============================================
  course: {
    maxVideoDuration: 3600, // 1 hour in seconds
    maxQuizQuestions: 50,
    passingScore: 70, // percentage
  },
};