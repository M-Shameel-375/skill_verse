// ============================================
// SEED ADMIN USER
// ============================================
// Run this script to create an admin user in MongoDB
// Usage: node backend/scripts/seedAdmin.js

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User.model');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillverse';

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   ClerkId: ${existingAdmin.clerkId}`);
      
      // Option to update any user to admin
      const userEmail = process.argv[2];
      if (userEmail) {
        const userToUpdate = await User.findOne({ email: userEmail });
        if (userToUpdate) {
          userToUpdate.role = 'admin';
          await userToUpdate.save();
          console.log(`\n✅ Updated ${userEmail} to admin role!`);
        } else {
          console.log(`\n❌ User with email ${userEmail} not found`);
        }
      }
    } else {
      // Create admin user (Note: You'll need to sign up via Clerk first)
      console.log('ℹ️  No admin user found.');
      console.log('\n📋 To create an admin:');
      console.log('   1. Sign up at http://localhost:5173/sign-up');
      console.log('   2. Run: node backend/scripts/seedAdmin.js your-email@example.com');
      console.log('   3. Access admin panel at http://localhost:5173/admin');
      
      // List all users
      const users = await User.find({}, 'name email role clerkId').limit(10);
      if (users.length > 0) {
        console.log('\n📋 Existing users in database:');
        users.forEach((u, i) => {
          console.log(`   ${i + 1}. ${u.email} (${u.role})`);
        });
        console.log('\n💡 To make a user admin, run:');
        console.log('   node backend/scripts/seedAdmin.js <email>');
      }
    }

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

seedAdmin();
