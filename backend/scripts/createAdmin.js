// ============================================
// CREATE ADMIN USER DIRECTLY
// ============================================
// This creates an admin user directly in MongoDB
// Usage: node backend/scripts/createAdmin.js

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User.model');

const MONGODB_URI = process.env.MONGODB_URI;

const createAdmin = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Admin details - Update these!
    const adminData = {
      clerkId: 'admin_' + Date.now(), // Temporary clerkId
      name: 'M Shameel',
      email: 'mshameel375@gmail.com',
      role: 'admin',
      status: 'active',
      isEmailVerified: true,
      bio: 'Platform Administrator',
      skills: [
        { name: 'Administration', level: 'expert' },
        { name: 'Management', level: 'expert' },
      ],
    };

    // Check if user exists
    let user = await User.findOne({ email: adminData.email });
    
    if (user) {
      // Update to admin
      user.role = 'admin';
      await user.save();
      console.log('✅ Existing user updated to admin!');
    } else {
      // Create new admin
      user = await User.create(adminData);
      console.log('✅ New admin user created!');
    }

    console.log('\n📋 Admin Details:');
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   ID: ${user._id}`);

    console.log('\n🔐 Login Instructions:');
    console.log('   1. Go to http://localhost:5173/sign-in');
    console.log('   2. Login with your Clerk account (mshameel375@gmail.com)');
    console.log('   3. Access admin at http://localhost:5173/admin');

    await mongoose.disconnect();
    console.log('\n✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createAdmin();
