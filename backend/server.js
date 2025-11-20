// ============================================
// SKILLVERSE - MAIN SERVER FILE
// ============================================

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Import configurations
const connectDB = require('./config/database');
const config = require('./config/config');

// Import middlewares
const errorHandler = require('./middlewares/errorHandler.middleware');
const rateLimiter = require('./middlewares/rateLimiter.middleware');

// Import routes
const routes = require('./routes');
const webhookRoutes = require('./routes/webhook.routes');

// Import socket handler
const socketHandler = require('./sockets/socketHandler');

// ============================================
// INITIALIZE EXPRESS APP
// ============================================
const app = express();
const server = http.createServer(app);

// ============================================
// SOCKET.IO SETUP
// ============================================
const io = socketIO(server, {
  cors: {
    origin: config.frontend.url,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Make io accessible to routes
app.set('io', io);

// Initialize socket handlers
socketHandler(io);

// ============================================
// CONNECT TO DATABASE
// ============================================
connectDB();

// ============================================
// MIDDLEWARE SETUP
// ============================================

// Security Headers
app.use(helmet());

// CORS Configuration
app.use(
  cors({
    origin: config.frontend.url,
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Data Sanitization against NoSQL Injection
app.use(mongoSanitize());

// Data Sanitization against XSS
app.use(xss());

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Compression
app.use(compression());

// Logging (only in development)
if (config.server.env === 'development') {
  app.use(morgan('dev'));
}

// Rate Limiting
app.use('/api', rateLimiter);

// Static Files
app.use('/uploads', express.static('uploads'));

// ============================================
// API ROUTES
// ============================================

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SkillVerse API is running',
    environment: config.server.env,
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use(config.server.apiVersion, routes);
app.use('/webhooks', webhookRoutes);

// ============================================
// ROOT ROUTE
// ============================================
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to SkillVerse API',
    version: '1.0.0',
    documentation: `${config.frontend.url}/api-docs`,
  });
});

// ============================================
// 404 HANDLER
// ============================================
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ============================================
// ERROR HANDLER MIDDLEWARE
// ============================================
app.use(errorHandler);

// ============================================
// HANDLE UNHANDLED PROMISE REJECTIONS
// ============================================
process.on('unhandledRejection', (err) => {
  console.error('❌ UNHANDLED REJECTION! Shutting down...');
  console.error('Error:', err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// ============================================
// HANDLE UNCAUGHT EXCEPTIONS
// ============================================
process.on('uncaughtException', (err) => {
  console.error('❌ UNCAUGHT EXCEPTION! Shutting down...');
  console.error('Error:', err.name, err.message);
  process.exit(1);
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully...');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});

// ============================================
// START SERVER
// ============================================
const PORT = config.server.port || 5000;

server.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 SkillVerse Server is running`);
  console.log(`📡 Environment: ${config.server.env}`);
  console.log(`🌐 Port: ${PORT}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`📊 API Version: ${config.server.apiVersion}`);
  console.log('='.repeat(50));
});

module.exports = { app, io };