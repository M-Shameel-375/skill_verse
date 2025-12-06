// ============================================
// DATABASE CONNECTION CONFIGURATION
// ============================================

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Get MongoDB URI - always use the main MONGODB_URI which points to skillverse database
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // Connection options
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      // dbName explicitly set to skillverse to ensure correct database
      dbName: 'skillverse',
    };
    
    const conn = await mongoose.connect(mongoURI, options);

    console.log('='.repeat(50));
    console.log(`✅ MongoDB Connected Successfully`);
    console.log(`📦 Database: ${conn.connection.name}`);
    console.log(`🖥️  Host: ${conn.connection.host}`);
    console.log(`⚡ Port: ${conn.connection.port}`);
    console.log('='.repeat(50));

    // ============================================
    // CONNECTION EVENT HANDLERS
    // ============================================

    // When connected
    mongoose.connection.on('connected', () => {
      console.log('✅ Mongoose connected to MongoDB');
    });

    // When error occurs
    mongoose.connection.on('error', (err) => {
      console.error(`❌ Mongoose connection error: ${err.message}`);
    });

    // When disconnected
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  Mongoose disconnected from MongoDB');
    });

    // When reconnected
    mongoose.connection.on('reconnected', () => {
      console.log('🔄 Mongoose reconnected to MongoDB');
    });

    // ============================================
    // GRACEFUL SHUTDOWN
    // ============================================

    // If Node process ends, close mongoose connection
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('📴 Mongoose connection closed due to application termination');
        process.exit(0);
      } catch (err) {
        console.error('Error closing mongoose connection:', err);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('='.repeat(50));
    console.error('❌ DATABASE CONNECTION FAILED');
    console.error('Error:', error.message);
    console.error('='.repeat(50));
    process.exit(1);
  }
};

module.exports = connectDB;