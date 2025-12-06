// ============================================
// TEMPORARY SCRIPT TO PROMOTE USER TO ADMIN
// ============================================
// Run this script to give yourself admin role
// Usage: node promote-to-admin.js <email>
// Example: node promote-to-admin.js admin@example.com

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User.model');

const promoteToAdmin = async (email) => {
  try {
    // Connect to MongoDB Atlas - skillverse database
    const mongoURI = process.env.MONGODB_URI;
    
    console.log('Connecting to database...');
    await mongoose.connect(mongoURI, {
      dbName: 'skillverse',
    });

    console.log('Connected to MongoDB - skillverse database');

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`User with email ${email} not found`);
      console.log('\nAvailable users in database:');
      const users = await User.find({}).select('email name role');
      users.forEach(u => console.log(`  - ${u.email} (${u.name}) - Role: ${u.role}`));
      process.exit(1);
    }

    // Update user role to admin
    user.role = 'admin';
    await user.save();

    console.log(`✅ Successfully promoted ${user.name} (${email}) to admin role`);
    console.log('You can now access the admin panel at /admin');

  } catch (error) {
    console.error('Error promoting user to admin:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.log('❌ Please provide an email address');
  console.log('Usage: node promote-to-admin.js <email>');
  console.log('Example: node promote-to-admin.js admin@example.com');
  process.exit(1);
}

promoteToAdmin(email);