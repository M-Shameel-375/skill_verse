// ============================================
// FRONTEND CONFIGURATION
// ============================================

const ENV = import.meta.env.MODE || 'development';

const config = {
  // ============================================
  // ENVIRONMENT
  // ============================================
  env: ENV,
  isDevelopment: ENV === 'development',
  isProduction: ENV === 'production',

  // ============================================
  // API CONFIGURATION
  // ============================================
  api: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
    timeout: 30000, // 30 seconds
    headers: {
      'Content-Type': 'application/json',
    },
  },

  // ============================================
  // SOCKET CONFIGURATION
  // ============================================
  socket: {
    url: import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001',
    options: {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],
    },
  },

  // ============================================
  // STRIPE CONFIGURATION
  // ============================================
  stripe: {
    publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
    currency: 'usd',
  },

  // ============================================
  // AGORA VIDEO CONFIGURATION
  // ============================================
  agora: {
    appId: import.meta.env.VITE_AGORA_APP_ID || '',
  },

  // ============================================
  // FILE UPLOAD CONFIGURATION
  // ============================================
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxVideoSize: 100 * 1024 * 1024, // 100MB
    
    allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    allowedVideoTypes: ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'],
    allowedDocTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],

    imageExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    videoExtensions: ['.mp4', '.mpeg', '.mov', '.avi'],
    docExtensions: ['.pdf', '.doc', '.docx'],
  },

  // ============================================
  // PAGINATION
  // ============================================
  pagination: {
    defaultLimit: 10,
    maxLimit: 100,
    pageSizeOptions: [10, 20, 30, 50, 100],
  },

  // ============================================
  // AUTHENTICATION
  // ============================================
  auth: {
    tokenKey: 'skillverse_access_token',
    refreshTokenKey: 'skillverse_refresh_token',
    userKey: 'skillverse_user',
    tokenExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    refreshTokenExpiry: 30 * 24 * 60 * 60 * 1000, // 30 days in ms
  },

  // ============================================
  // LOCAL STORAGE KEYS
  // ============================================
  storage: {
    theme: 'skillverse_theme',
    language: 'skillverse_language',
    lastVisited: 'skillverse_last_visited',
    preferences: 'skillverse_preferences',
  },

  // ============================================
  // ROUTES
  // ============================================
  routes: {
    home: '/',
    login: '/login',
    register: '/register',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password/:token',
    verifyEmail: '/verify-email/:token',
    
    dashboard: '/dashboard',
    profile: '/profile',
    settings: '/settings',
    
    courses: '/courses',
    courseDetail: '/courses/:id',
    myCourses: '/my-courses',
    myLearning: '/my-learning',
    createCourse: '/courses/create',
    editCourse: '/courses/edit/:id',
    
    liveSessions: '/live-sessions',
    sessionDetail: '/live-sessions/:id',
    sessionRoom: '/live-sessions/:id/room',
    
    skillExchange: '/skill-exchange',
    exchangeDetail: '/skill-exchange/:id',
    
    certificates: '/certificates',
    
    admin: '/admin',
    adminDashboard: '/admin/dashboard',
    adminUsers: '/admin/users',
    adminCourses: '/admin/courses',
    adminAnalytics: '/admin/analytics',
    
    notFound: '/404',
    unauthorized: '/unauthorized',
  },

  // ============================================
  // USER ROLES
  // ============================================
  roles: {
    LEARNER: 'learner',
    EDUCATOR: 'educator',
    SKILL_EXCHANGER: 'skillExchanger',
    ADMIN: 'admin',
  },

  // ============================================
  // USER STATUS
  // ============================================
  userStatus: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended',
    BANNED: 'banned',
  },

  // ============================================
  // COURSE STATUS
  // ============================================
  courseStatus: {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    ARCHIVED: 'archived',
  },

  // ============================================
  // SKILL LEVELS
  // ============================================
  skillLevels: {
    BEGINNER: 'beginner',
    INTERMEDIATE: 'intermediate',
    ADVANCED: 'advanced',
    EXPERT: 'expert',
  },

  // ============================================
  // GAMIFICATION
  // ============================================
  gamification: {
    pointsPerCourseCompletion: 100,
    pointsPerQuizPass: 50,
    pointsPerSkillExchange: 75,
    
    badges: {
      beginner: { threshold: 0, name: 'Beginner', icon: '🌱' },
      intermediate: { threshold: 500, name: 'Intermediate', icon: '🌿' },
      advanced: { threshold: 1500, name: 'Advanced', icon: '🌳' },
      expert: { threshold: 5000, name: 'Expert', icon: '🏆' },
      master: { threshold: 10000, name: 'Master', icon: '👑' },
    },
  },

  // ============================================
  // QUIZ SETTINGS
  // ============================================
  quiz: {
    passingScore: 70, // percentage
    maxQuestions: 50,
    timePerQuestion: 60, // seconds
  },

  // ============================================
  // VIDEO SETTINGS
  // ============================================
  video: {
    maxDuration: 3600, // 1 hour in seconds
    qualityOptions: ['360p', '480p', '720p', '1080p'],
    defaultQuality: '720p',
    playbackSpeeds: [0.5, 0.75, 1, 1.25, 1.5, 2],
  },

  // ============================================
  // NOTIFICATION TYPES
  // ============================================
  notificationTypes: {
    COURSE_ENROLLMENT: 'course_enrollment',
    COURSE_COMPLETION: 'course_completion',
    NEW_MESSAGE: 'new_message',
    SKILL_EXCHANGE_REQUEST: 'skill_exchange_request',
    BADGE_EARNED: 'badge_earned',
    CERTIFICATE_ISSUED: 'certificate_issued',
    PAYMENT_SUCCESS: 'payment_success',
    COURSE_UPDATE: 'course_update',
  },

  // ============================================
  // DATE FORMATS
  // ============================================
  dateFormats: {
    short: 'MMM dd, yyyy',
    long: 'MMMM dd, yyyy',
    time: 'hh:mm a',
    dateTime: 'MMM dd, yyyy hh:mm a',
    iso: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  },

  // ============================================
  // VALIDATION
  // ============================================
  validation: {
    password: {
      minLength: 8,
      maxLength: 128,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
    },
    name: {
      minLength: 2,
      maxLength: 50,
    },
    bio: {
      maxLength: 500,
    },
    title: {
      maxLength: 100,
    },
  },

  // ============================================
  // DEBOUNCE/THROTTLE TIMINGS
  // ============================================
  timings: {
    searchDebounce: 500, // ms
    autoSaveDebounce: 2000, // ms
    toastDuration: 3000, // ms
    tooltipDelay: 300, // ms
  },

  // ============================================
  // THEME
  // ============================================
  theme: {
    default: 'light',
    options: ['light', 'dark'],
  },

  // ============================================
  // SOCIAL PROVIDERS
  // ============================================
  socialProviders: {
    GOOGLE: 'google',
    FACEBOOK: 'facebook',
    GITHUB: 'github',
  },

  // ============================================
  // ERROR MESSAGES
  // ============================================
  errors: {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'Please login to continue.',
    FORBIDDEN: 'You do not have permission to access this resource.',
    NOT_FOUND: 'Resource not found.',
    SERVER_ERROR: 'Something went wrong. Please try again later.',
    VALIDATION_ERROR: 'Please check your inputs and try again.',
    SESSION_EXPIRED: 'Your session has expired. Please login again.',
  },

  // ============================================
  // SUCCESS MESSAGES
  // ============================================
  success: {
    LOGIN: 'Login successful!',
    REGISTER: 'Registration successful! Please verify your email.',
    LOGOUT: 'Logged out successfully.',
    PASSWORD_RESET: 'Password reset successful.',
    EMAIL_VERIFIED: 'Email verified successfully.',
    PROFILE_UPDATED: 'Profile updated successfully.',
    COURSE_CREATED: 'Course created successfully.',
    COURSE_UPDATED: 'Course updated successfully.',
  },

  // ============================================
  // APP INFO
  // ============================================
  app: {
    name: 'SkillVerse',
    version: '1.0.0',
    description: 'AI-Powered Learning Platform',
    supportEmail: 'support@skillverse.com',
    termsUrl: '/terms',
    privacyUrl: '/privacy',
    helpUrl: '/help',
  },
};

// ============================================
// EXPORT CONFIGURATION
// ============================================
export default config;

// Named exports for convenience
export const {
  api,
  socket,
  stripe,
  agora,
  upload,
  pagination,
  auth,
  storage,
  routes,
  roles,
  userStatus,
  courseStatus,
  skillLevels,
  gamification,
  quiz,
  video,
  notificationTypes,
  dateFormats,
  validation,
  timings,
  theme,
  socialProviders,
  errors,
  success,
  app,
} = config;