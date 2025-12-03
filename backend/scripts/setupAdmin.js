// ============================================
// SETUP ADMIN USER SCRIPT
// ============================================
// Run this script to create or upgrade a user to admin role
// Usage: node backend/scripts/setupAdmin.js <email>

const mongoose = require('mongoose');
const readline = require('readline');

// Database connection string
const MONGODB_URI = 'mongodb+srv://mshameel946_db_user:Shameel.4321@cluster0.b3bubj0.mongodb.net/skillverse';

// Define User Schema inline to avoid import issues
const userSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['learner', 'educator', 'skillExchanger', 'admin'], default: 'learner' },
  status: { type: String, default: 'active' },
  isEmailVerified: { type: Boolean, default: true },
  profileImage: { url: String, publicId: String },
  educatorProfile: { type: mongoose.Schema.Types.Mixed },
  skillExchangeProfile: { type: mongoose.Schema.Types.Mixed },
  learnerProfile: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

async function setupAdmin() {
  console.log('\n🛡️  SkillVerse Admin Setup Script\n');
  console.log('=' .repeat(50));

  try {
    // Connect to MongoDB
    console.log('\n📡 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get email from command line or prompt
    let email = process.argv[2];
    
    if (!email) {
      email = await question('Enter the email for admin user: ');
    }

    if (!email || !email.includes('@')) {
      console.log('❌ Invalid email address');
      process.exit(1);
    }

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      console.log(`\n📋 Found existing user:`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Current Role: ${user.role}`);
      console.log(`   Clerk ID: ${user.clerkId}`);

      if (user.role === 'admin') {
        console.log('\n✅ User is already an admin!');
      } else {
        const confirm = await question('\nUpgrade this user to admin? (yes/no): ');
        
        if (confirm.toLowerCase() === 'yes' || confirm.toLowerCase() === 'y') {
          user.role = 'admin';
          await user.save();
          console.log('\n✅ User upgraded to admin successfully!');
        } else {
          console.log('\n❌ Cancelled.');
        }
      }
    } else {
      console.log(`\n⚠️  No user found with email: ${email}`);
      const create = await question('Create a new admin user? (yes/no): ');

      if (create.toLowerCase() === 'yes' || create.toLowerCase() === 'y') {
        const name = await question('Enter name for admin: ');
        
        user = await User.create({
          clerkId: `admin_${Date.now()}`,
          name: name || 'Admin',
          email: email,
          role: 'admin',
          status: 'active',
          isEmailVerified: true,
        });

        console.log('\n✅ Admin user created successfully!');
        console.log(`   ID: ${user._id}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log('\n⚠️  Note: This user needs to sign up via Clerk with the same email');
        console.log('   to link their Clerk account with this MongoDB record.');
      } else {
        console.log('\n❌ Cancelled.');
      }
    }

    // List all users
    console.log('\n📊 All Users in Database:');
    console.log('-'.repeat(50));
    const allUsers = await User.find().select('name email role status');
    
    if (allUsers.length === 0) {
      console.log('   No users found.');
    } else {
      allUsers.forEach((u, i) => {
        const roleEmoji = {
          admin: '👑',
          educator: '👨‍🏫',
          learner: '🎓',
          skillExchanger: '🔄'
        };
        console.log(`   ${i + 1}. ${roleEmoji[u.role] || '👤'} ${u.name} (${u.email}) - ${u.role}`);
      });
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    rl.close();
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB\n');
    process.exit(0);
  }
}

setupAdmin();
