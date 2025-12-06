// ============================================
// MIGRATE DATA FROM ATLAS TO LOCAL
// ============================================
// Run this script to copy data from MongoDB Atlas to local MongoDB
// Usage: node migrate-data.js

const mongoose = require('mongoose');
const User = require('./models/User.model');
const Course = require('./models/Course.model');
const Payment = require('./models/Payment.model');

const ATLAS_URI = 'mongodb+srv://mshameel946_db_user:Shameel.4321@cluster0.b3bubj0.mongodb.net/?appName=Cluster0';
const LOCAL_URI = 'mongodb://localhost:27017/skillverse_dev';

async function migrateData() {
  try {
    console.log('🔄 Starting data migration...');

    // Connect to Atlas (source)
    console.log('📡 Connecting to MongoDB Atlas...');
    const atlasConn = await mongoose.createConnection(ATLAS_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Connect to local (destination)
    console.log('🏠 Connecting to local MongoDB...');
    const localConn = await mongoose.createConnection(LOCAL_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Get all data from Atlas
    console.log('📥 Fetching data from Atlas...');
    const users = await atlasConn.models.User?.find({}) || [];
    const courses = await atlasConn.models.Course?.find({}) || [];
    const payments = await atlasConn.models.Payment?.find({}) || [];

    console.log(`📊 Found: ${users.length} users, ${courses.length} courses, ${payments.length} payments`);

    // Clear local database
    console.log('🧹 Clearing local database...');
    await localConn.models.User?.deleteMany({});
    await localConn.models.Course?.deleteMany({});
    await localConn.models.Payment?.deleteMany({});

    // Insert data into local database
    console.log('💾 Inserting data into local database...');
    if (users.length > 0) await localConn.models.User?.insertMany(users);
    if (courses.length > 0) await localConn.models.Course?.insertMany(courses);
    if (payments.length > 0) await localConn.models.Payment?.insertMany(payments);

    console.log('✅ Migration completed successfully!');
    console.log('🎉 Your data is now available in the local development environment.');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run migration
migrateData();