// ============================================
// PROMOTE USER TO ADMIN SCRIPT
// ============================================
// Usage: node scripts/promote-to-admin.js <email_or_userId>
// Example: node scripts/promote-to-admin.js user@example.com

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User.model');
const config = require('../config/config');

const promoteToAdmin = async (emailOrId) => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'skillverse'
    });
    console.log('✅ Connected to MongoDB\n');

    // Find user by email or ID
    let user;
    if (mongoose.Types.ObjectId.isValid(emailOrId)) {
      user = await User.findById(emailOrId);
    } else {
      user = await User.findOne({ email: emailOrId });
    }

    if (!user) {
      console.error('❌ User not found!');
      console.log('Please provide a valid email or user ID');
      process.exit(1);
    }

    console.log('📋 User Details:');
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Current Role: ${user.role}\n`);

    if (user.role === 'admin') {
      console.log('ℹ️  User is already an admin!');
    } else {
      // Update user role to admin
      user.role = 'admin';
      await user.save();
      console.log('✅ User successfully promoted to ADMIN!\n');
    }

    console.log('🎉 Admin privileges granted:');
    console.log('   - Approve/reject courses');
    console.log('   - Manage all users');
    console.log('   - View analytics & reports');
    console.log('   - Moderate content');
    console.log('   - Manage payments');
    console.log('   - Access admin dashboard\n');

    console.log('🔐 Admin Login URL: http://localhost:5173/admin');

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

// Get email/ID from command line argument
const emailOrId = process.argv[2];

if (!emailOrId) {
  console.log('❌ Usage: node scripts/promote-to-admin.js <email_or_userId>');
  console.log('Example: node scripts/promote-to-admin.js user@example.com');
  process.exit(1);
}

promoteToAdmin(emailOrId);
