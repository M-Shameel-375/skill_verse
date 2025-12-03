// ============================================
// MAKE USER AN EDUCATOR
// ============================================
// This upgrades a user to educator role in MongoDB
// Usage: node backend/scripts/makeEducator.js

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User.model');

const MONGODB_URI = process.env.MONGODB_URI;

const makeEducator = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Email of the user to make educator
    const email = 'mshameel375@gmail.com';

    // Find user
    let user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ User not found with email:', email);
      process.exit(1);
    }

    // Update to educator
    user.role = 'educator';
    user.educatorProfile = {
      expertise: ['Web Development', 'JavaScript', 'React'],
      teachingExperience: 3,
      totalStudents: 0,
      totalCourses: 0,
      rating: { average: 0, count: 0 },
      earnings: { total: 0, pending: 0, withdrawn: 0 },
      verified: true,
    };
    
    await user.save();
    console.log('✅ User upgraded to educator!');

    console.log('\n📋 Educator Details:');
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   ID: ${user._id}`);

    console.log('\n🎓 Educator Access:');
    console.log('   1. Go to http://localhost:5174/sign-in');
    console.log('   2. Login with your Clerk account');
    console.log('   3. Access educator dashboard at http://localhost:5174/educator');
    console.log('   4. Create courses at http://localhost:5174/educator/courses/create');

    await mongoose.disconnect();
    console.log('\n✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

makeEducator();
