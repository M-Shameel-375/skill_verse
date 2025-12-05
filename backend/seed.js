// ============================================
// DATABASE SEED SCRIPT
// Run: node seed.js
// ============================================

require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const User = require('./models/User.model');
const Course = require('./models/Course.model');
const Badge = require('./models/Badge.model');
const Quiz = require('./models/Quiz.model');
const Review = require('./models/Review.model');
const Certificate = require('./models/Certificate.model');
const SkillExchange = require('./models/SkillExchange.model');
const LiveSession = require('./models/LiveSession.model');
const Payment = require('./models/Payment.model');
const Notification = require('./models/Notification.model');
const Chat = require('./models/Chat.model');

// Sample Users
const sampleUsers = [
  {
    clerkId: 'seed_user_001',
    name: 'John Educator',
    email: 'john.educator@skillverse.com',
    role: 'educator',
    status: 'active',
    bio: 'Experienced software developer with 10+ years in web development. Passionate about teaching programming.',
    skills: [
      { name: 'JavaScript', level: 'expert', yearsOfExperience: 10 },
      { name: 'React', level: 'expert', yearsOfExperience: 6 },
      { name: 'Node.js', level: 'advanced', yearsOfExperience: 7 },
      { name: 'Python', level: 'intermediate', yearsOfExperience: 3 },
    ],
    educatorProfile: {
      expertise: ['Web Development', 'JavaScript', 'React'],
      totalStudents: 150,
      totalCourses: 5,
      averageRating: 4.8,
      isVerified: true,
    },
  },
  {
    clerkId: 'seed_user_002',
    name: 'Sarah Learner',
    email: 'sarah.learner@skillverse.com',
    role: 'learner',
    status: 'active',
    bio: 'Aspiring web developer looking to master modern technologies.',
    skills: [
      { name: 'HTML', level: 'intermediate', yearsOfExperience: 1 },
      { name: 'CSS', level: 'intermediate', yearsOfExperience: 1 },
      { name: 'JavaScript', level: 'beginner', yearsOfExperience: 0 },
    ],
    learnerProfile: {
      currentStreak: 7,
      totalPoints: 500,
    },
  },
  {
    clerkId: 'seed_user_003',
    name: 'Mike Designer',
    email: 'mike.designer@skillverse.com',
    role: 'skillExchanger',
    status: 'active',
    bio: 'UI/UX designer who loves to exchange design skills for coding knowledge.',
    skills: [
      { name: 'Figma', level: 'expert', yearsOfExperience: 5 },
      { name: 'Adobe XD', level: 'advanced', yearsOfExperience: 4 },
      { name: 'UI Design', level: 'expert', yearsOfExperience: 6 },
      { name: 'UX Research', level: 'intermediate', yearsOfExperience: 3 },
    ],
  },
  {
    clerkId: 'seed_user_004',
    name: 'Emily Teacher',
    email: 'emily.teacher@skillverse.com',
    role: 'educator',
    status: 'active',
    bio: 'Data scientist and AI enthusiast. Teaching machine learning to beginners.',
    skills: [
      { name: 'Python', level: 'expert', yearsOfExperience: 8 },
      { name: 'Machine Learning', level: 'expert', yearsOfExperience: 5 },
      { name: 'Data Science', level: 'expert', yearsOfExperience: 6 },
      { name: 'TensorFlow', level: 'advanced', yearsOfExperience: 4 },
    ],
    educatorProfile: {
      expertise: ['Data Science', 'Machine Learning', 'Python'],
      totalStudents: 200,
      totalCourses: 3,
      averageRating: 4.9,
      isVerified: true,
    },
  },
  {
    clerkId: 'seed_user_005',
    name: 'Admin User',
    email: 'admin@skillverse.com',
    role: 'admin',
    status: 'active',
    bio: 'Platform administrator',
    skills: [],
  },
];

// Sample Badges
const sampleBadges = [
  {
    name: 'First Steps',
    slug: 'first-steps',
    description: 'Complete your first course on SkillVerse',
    category: 'achievement',
    badgeType: 'bronze',
    icon: { url: 'https://api.dicebear.com/7.x/shapes/svg?seed=badge1' },
    color: '#CD7F32',
    criteria: { type: 'course-completion', coursesRequired: 1 },
    pointsAwarded: 50,
    rarity: 'common',
    difficulty: 'easy',
  },
  {
    name: 'Knowledge Seeker',
    slug: 'knowledge-seeker',
    description: 'Complete 5 courses',
    category: 'milestone',
    badgeType: 'silver',
    icon: { url: 'https://api.dicebear.com/7.x/shapes/svg?seed=badge2' },
    color: '#C0C0C0',
    criteria: { type: 'course-completion', coursesRequired: 5 },
    pointsAwarded: 200,
    rarity: 'uncommon',
    difficulty: 'medium',
  },
  {
    name: 'Quiz Master',
    slug: 'quiz-master',
    description: 'Pass 10 quizzes with 80% or higher',
    category: 'skill',
    badgeType: 'gold',
    icon: { url: 'https://api.dicebear.com/7.x/shapes/svg?seed=badge3' },
    color: '#FFD700',
    criteria: { type: 'quiz-pass', quizzesRequired: 10 },
    pointsAwarded: 300,
    rarity: 'rare',
    difficulty: 'hard',
  },
  {
    name: 'Skill Trader',
    slug: 'skill-trader',
    description: 'Complete your first skill exchange',
    category: 'community',
    badgeType: 'bronze',
    icon: { url: 'https://api.dicebear.com/7.x/shapes/svg?seed=badge4' },
    color: '#CD7F32',
    criteria: { type: 'skill-exchange', exchangesRequired: 1 },
    pointsAwarded: 100,
    rarity: 'common',
    difficulty: 'easy',
  },
  {
    name: 'Week Warrior',
    slug: 'week-warrior',
    description: 'Maintain a 7-day learning streak',
    category: 'time-based',
    badgeType: 'silver',
    icon: { url: 'https://api.dicebear.com/7.x/shapes/svg?seed=badge5' },
    color: '#C0C0C0',
    criteria: { type: 'streak', streakDays: 7 },
    pointsAwarded: 150,
    rarity: 'uncommon',
    difficulty: 'medium',
  },
  {
    name: 'Helpful Reviewer',
    slug: 'helpful-reviewer',
    description: 'Write 5 helpful reviews',
    category: 'participation',
    badgeType: 'bronze',
    icon: { url: 'https://api.dicebear.com/7.x/shapes/svg?seed=badge6' },
    color: '#CD7F32',
    criteria: { type: 'review-count', reviewsRequired: 5 },
    pointsAwarded: 75,
    rarity: 'common',
    difficulty: 'easy',
  },
  {
    name: 'Point Collector',
    slug: 'point-collector',
    description: 'Earn 1000 points',
    category: 'achievement',
    badgeType: 'gold',
    icon: { url: 'https://api.dicebear.com/7.x/shapes/svg?seed=badge7' },
    color: '#FFD700',
    criteria: { type: 'points-threshold', pointsRequired: 1000 },
    pointsAwarded: 250,
    rarity: 'rare',
    difficulty: 'hard',
  },
  {
    name: 'Diamond Scholar',
    slug: 'diamond-scholar',
    description: 'Complete 20 courses with perfect scores',
    category: 'special',
    badgeType: 'diamond',
    icon: { url: 'https://api.dicebear.com/7.x/shapes/svg?seed=badge8' },
    color: '#B9F2FF',
    animation: 'glow',
    criteria: { type: 'course-completion', coursesRequired: 20 },
    pointsAwarded: 1000,
    rarity: 'legendary',
    difficulty: 'expert',
    isFeatured: true,
  },
];

// Seed function
async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing seed data
    console.log('\n🗑️  Clearing existing seed data...');
    await User.deleteMany({ clerkId: { $regex: /^seed_/ } });
    await Badge.deleteMany({});
    await Course.deleteMany({});
    await Quiz.deleteMany({});
    await Review.deleteMany({});
    await Certificate.deleteMany({});
    await SkillExchange.deleteMany({});
    await LiveSession.deleteMany({});
    await Payment.deleteMany({});
    await Notification.deleteMany({});
    await Chat.deleteMany({});

    // 1. Seed Users
    console.log('\n👥 Seeding Users...');
    const users = await User.insertMany(sampleUsers);
    console.log(`   ✅ Created ${users.length} users`);

    const educator = users.find(u => u.email === 'john.educator@skillverse.com');
    const educator2 = users.find(u => u.email === 'emily.teacher@skillverse.com');
    const learner = users.find(u => u.email === 'sarah.learner@skillverse.com');
    const exchanger = users.find(u => u.email === 'mike.designer@skillverse.com');

    // 2. Seed Badges
    console.log('\n🏆 Seeding Badges...');
    const badges = await Badge.insertMany(sampleBadges.map(b => ({ ...b, createdBy: educator._id })));
    console.log(`   ✅ Created ${badges.length} badges`);

    // 3. Seed Courses
    console.log('\n📚 Seeding Courses...');
    const sampleCourses = [
      {
        title: 'Complete JavaScript Course 2024',
        slug: 'complete-javascript-course-2024',
        description: 'Master JavaScript from basics to advanced concepts. Learn ES6+, async/await, and build real projects.',
        instructor: educator._id,
        category: 'Programming',
        level: 'beginner',
        price: 49.99,
        thumbnail: { url: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800' },
        status: 'published',
        isPublished: true,
        language: 'English',
        tags: ['JavaScript', 'Web Development', 'Programming'],
        whatYouWillLearn: ['JavaScript fundamentals', 'ES6+ features', 'Async programming', 'DOM manipulation'],
        requirements: ['Basic computer knowledge', 'No prior programming experience needed'],
        curriculum: [
          {
            title: 'Introduction to JavaScript',
            description: 'Getting started with JavaScript',
            order: 1,
            lectures: [
              { title: 'What is JavaScript?', type: 'video', duration: 600, isPreview: true },
              { title: 'Setting up your environment', type: 'video', duration: 480 },
              { title: 'Your first JavaScript code', type: 'video', duration: 720 },
            ],
          },
          {
            title: 'Variables and Data Types',
            description: 'Understanding JavaScript data',
            order: 2,
            lectures: [
              { title: 'Variables: let, const, var', type: 'video', duration: 900 },
              { title: 'Data types in JavaScript', type: 'video', duration: 840 },
              { title: 'Practice exercises', type: 'document', duration: 1200 },
            ],
          },
        ],
      },
      {
        title: 'React.js Masterclass',
        slug: 'react-js-masterclass',
        description: 'Build modern web applications with React. Learn hooks, context, Redux, and best practices.',
        instructor: educator._id,
        category: 'Programming',
        level: 'intermediate',
        price: 79.99,
        thumbnail: { url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800' },
        status: 'published',
        isPublished: true,
        language: 'English',
        tags: ['React', 'JavaScript', 'Frontend', 'Web Development'],
        whatYouWillLearn: ['React components', 'Hooks', 'State management', 'Building real projects'],
        requirements: ['JavaScript fundamentals', 'HTML & CSS knowledge'],
      },
      {
        title: 'Machine Learning with Python',
        slug: 'machine-learning-with-python',
        description: 'Learn machine learning from scratch using Python, NumPy, Pandas, and Scikit-learn.',
        instructor: educator2._id,
        category: 'Science',
        level: 'intermediate',
        price: 89.99,
        thumbnail: { url: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800' },
        status: 'published',
        isPublished: true,
        language: 'English',
        tags: ['Python', 'Machine Learning', 'Data Science', 'AI'],
        whatYouWillLearn: ['Python for ML', 'Data preprocessing', 'ML algorithms', 'Model evaluation'],
        requirements: ['Basic Python knowledge', 'Basic mathematics'],
      },
      {
        title: 'UI/UX Design Fundamentals',
        slug: 'ui-ux-design-fundamentals',
        description: 'Master the principles of user interface and user experience design.',
        instructor: educator._id,
        category: 'Design',
        level: 'beginner',
        price: 59.99,
        thumbnail: { url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800' },
        status: 'published',
        isPublished: true,
        language: 'English',
        tags: ['UI', 'UX', 'Design', 'Figma'],
        whatYouWillLearn: ['Design principles', 'User research', 'Wireframing', 'Prototyping'],
        requirements: ['No prior experience needed'],
      },
      {
        title: 'Node.js Backend Development',
        slug: 'nodejs-backend-development',
        description: 'Build scalable backend applications with Node.js, Express, and MongoDB.',
        instructor: educator._id,
        category: 'Programming',
        level: 'intermediate',
        price: 69.99,
        thumbnail: { url: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800' },
        status: 'draft',
        isPublished: false,
        language: 'English',
        tags: ['Node.js', 'Express', 'MongoDB', 'Backend'],
      },
    ];
    const courses = await Course.insertMany(sampleCourses);
    console.log(`   ✅ Created ${courses.length} courses`);

    // 4. Seed Quizzes
    console.log('\n📝 Seeding Quizzes...');
    const sampleQuizzes = [
      {
        title: 'JavaScript Basics Quiz',
        slug: 'javascript-basics-quiz',
        description: 'Test your understanding of JavaScript fundamentals',
        course: courses[0]._id,
        instructor: educator._id,
        quizType: 'graded',
        difficulty: 'easy',
        passingScore: 70,
        timeLimit: 30,
        questions: [
          {
            questionText: 'What keyword is used to declare a constant in JavaScript?',
            questionType: 'multiple-choice',
            options: [
              { text: 'var', isCorrect: false },
              { text: 'let', isCorrect: false },
              { text: 'const', isCorrect: true },
              { text: 'constant', isCorrect: false },
            ],
            points: 10,
            order: 1,
          },
          {
            questionText: 'JavaScript is a statically typed language.',
            questionType: 'true-false',
            options: [
              { text: 'True', isCorrect: false },
              { text: 'False', isCorrect: true },
            ],
            points: 10,
            order: 2,
          },
          {
            questionText: 'Which method is used to add an element to the end of an array?',
            questionType: 'multiple-choice',
            options: [
              { text: 'push()', isCorrect: true },
              { text: 'pop()', isCorrect: false },
              { text: 'shift()', isCorrect: false },
              { text: 'unshift()', isCorrect: false },
            ],
            points: 10,
            order: 3,
          },
        ],
        isPublished: true,
        status: 'published',
      },
      {
        title: 'React Hooks Assessment',
        slug: 'react-hooks-assessment',
        description: 'Test your knowledge of React Hooks',
        course: courses[1]._id,
        instructor: educator._id,
        quizType: 'graded',
        difficulty: 'medium',
        passingScore: 75,
        timeLimit: 45,
        questions: [
          {
            questionText: 'What hook is used for side effects in React?',
            questionType: 'multiple-choice',
            options: [
              { text: 'useState', isCorrect: false },
              { text: 'useEffect', isCorrect: true },
              { text: 'useContext', isCorrect: false },
              { text: 'useReducer', isCorrect: false },
            ],
            points: 15,
            order: 1,
          },
          {
            questionText: 'useState returns an array with two elements.',
            questionType: 'true-false',
            options: [
              { text: 'True', isCorrect: true },
              { text: 'False', isCorrect: false },
            ],
            points: 10,
            order: 2,
          },
        ],
        isPublished: true,
        status: 'published',
      },
    ];
    const quizzes = await Quiz.insertMany(sampleQuizzes);
    console.log(`   ✅ Created ${quizzes.length} quizzes`);

    // 5. Seed Reviews
    console.log('\n⭐ Seeding Reviews...');
    const sampleReviews = [
      {
        user: learner._id,
        reviewType: 'course',
        course: courses[0]._id,
        instructor: educator._id,
        rating: 5,
        title: 'Excellent course for beginners!',
        content: 'This course is amazing! John explains everything so clearly. I went from zero to building real projects.',
        isVerified: true,
        status: 'approved',
      },
      {
        user: exchanger._id,
        reviewType: 'course',
        course: courses[0]._id,
        instructor: educator._id,
        rating: 4,
        title: 'Very comprehensive',
        content: 'Great content coverage. Would have liked more practice exercises.',
        isVerified: true,
        status: 'approved',
      },
      {
        user: learner._id,
        reviewType: 'course',
        course: courses[1]._id,
        instructor: educator._id,
        rating: 5,
        title: 'Best React course!',
        content: 'Finally understood React hooks after taking this course. Highly recommended!',
        isVerified: true,
        status: 'approved',
      },
      {
        user: learner._id,
        reviewType: 'instructor',
        instructor: educator._id,
        rating: 5,
        title: 'Great instructor',
        content: 'John is an amazing teacher. Patient and explains complex concepts simply.',
        isVerified: true,
        status: 'approved',
      },
    ];
    const reviews = await Review.insertMany(sampleReviews);
    console.log(`   ✅ Created ${reviews.length} reviews`);

    // 6. Seed Skill Exchanges
    console.log('\n🔄 Seeding Skill Exchanges...');
    const sampleExchanges = [
      {
        requester: exchanger._id,
        provider: educator._id,
        offeredSkill: { name: 'UI/UX Design', level: 'advanced', description: 'Figma, Adobe XD, User Research' },
        requestedSkill: { name: 'JavaScript', level: 'intermediate', description: 'Learn modern JavaScript' },
        title: 'Design skills for JavaScript knowledge',
        description: 'I can teach UI/UX design in exchange for JavaScript mentoring',
        status: 'accepted',
        exchangeType: 'one-time',
        availability: {
          timezone: 'UTC',
          preferredDays: ['Monday', 'Wednesday', 'Friday'],
          preferredTimes: ['Evening'],
        },
      },
      {
        requester: learner._id,
        provider: exchanger._id,
        offeredSkill: { name: 'Content Writing', level: 'intermediate', description: 'Blog posts, documentation' },
        requestedSkill: { name: 'Figma', level: 'beginner', description: 'Learn Figma basics' },
        title: 'Writing skills for Figma training',
        description: 'Want to learn Figma, can offer content writing skills',
        status: 'pending',
        exchangeType: 'one-time',
      },
      {
        requester: educator._id,
        provider: educator2._id,
        offeredSkill: { name: 'React Development', level: 'expert', description: 'React, Redux, Next.js' },
        requestedSkill: { name: 'Machine Learning', level: 'beginner', description: 'ML basics with Python' },
        title: 'React expertise for ML introduction',
        description: 'Looking to get into ML, can offer React expertise in return',
        status: 'in-progress',
        exchangeType: 'ongoing',
      },
    ];
    const exchanges = await SkillExchange.insertMany(sampleExchanges);
    console.log(`   ✅ Created ${exchanges.length} skill exchanges`);

    // 7. Seed Live Sessions
    console.log('\n🎥 Seeding Live Sessions...');
    const futureDate1 = new Date();
    futureDate1.setDate(futureDate1.getDate() + 7);
    const futureDate2 = new Date();
    futureDate2.setDate(futureDate2.getDate() + 14);
    const futureDate3 = new Date();
    futureDate3.setDate(futureDate3.getDate() + 3);

    const sampleSessions = [
      {
        title: 'JavaScript Q&A Session',
        slug: 'javascript-qa-session',
        description: 'Live Q&A session for JavaScript course students. Bring your questions!',
        host: educator._id,
        sessionType: 'webinar',
        category: 'Programming',
        scheduledAt: futureDate1,
        duration: 60,
        status: 'scheduled',
        level: 'all-levels',
        maxParticipants: 100,
        price: 0,
        currency: 'USD',
        isFree: true,
        isPublic: true,
        tags: ['JavaScript', 'Q&A', 'Web Development'],
      },
      {
        title: 'Building a React App from Scratch',
        slug: 'building-react-app-from-scratch',
        description: 'Watch me build a complete React application live with explanations.',
        host: educator._id,
        sessionType: 'workshop',
        category: 'Programming',
        scheduledAt: futureDate2,
        duration: 120,
        status: 'scheduled',
        level: 'intermediate',
        maxParticipants: 50,
        price: 19.99,
        currency: 'USD',
        isFree: false,
        isPublic: true,
        tags: ['React', 'Live Coding', 'Workshop'],
      },
      {
        title: 'Introduction to Machine Learning',
        slug: 'introduction-to-machine-learning',
        description: 'Free introductory session on machine learning concepts.',
        host: educator2._id,
        sessionType: 'webinar',
        category: 'Science',
        scheduledAt: futureDate3,
        duration: 90,
        status: 'scheduled',
        level: 'beginner',
        maxParticipants: 200,
        price: 0,
        currency: 'USD',
        isFree: true,
        isPublic: true,
        tags: ['Machine Learning', 'Python', 'AI'],
      },
    ];
    const sessions = await LiveSession.insertMany(sampleSessions);
    console.log(`   ✅ Created ${sessions.length} live sessions`);

    // 8. Seed Payments
    console.log('\n💳 Seeding Payments...');
    const samplePayments = [
      {
        transactionId: 'txn_seed_001',
        paymentIntentId: 'pi_seed_001',
        payer: learner._id,
        receiver: educator._id,
        paymentType: 'course-purchase',
        amount: { subtotal: 49.99, discount: 0, tax: 0, platformFee: 5.00, total: 49.99 },
        currency: 'USD',
        status: 'succeeded',
        course: courses[0]._id,
        paymentMethod: 'stripe',
      },
      {
        transactionId: 'txn_seed_002',
        paymentIntentId: 'pi_seed_002',
        payer: learner._id,
        receiver: educator._id,
        paymentType: 'course-purchase',
        amount: { subtotal: 79.99, discount: 10, tax: 0, platformFee: 7.00, total: 69.99 },
        currency: 'USD',
        status: 'succeeded',
        course: courses[1]._id,
        paymentMethod: 'stripe',
      },
      {
        transactionId: 'txn_seed_003',
        paymentIntentId: 'pi_seed_003',
        payer: exchanger._id,
        receiver: educator2._id,
        paymentType: 'course-purchase',
        amount: { subtotal: 89.99, discount: 0, tax: 0, platformFee: 9.00, total: 89.99 },
        currency: 'USD',
        status: 'succeeded',
        course: courses[2]._id,
        paymentMethod: 'stripe',
      },
    ];
    const payments = await Payment.insertMany(samplePayments);
    console.log(`   ✅ Created ${payments.length} payments`);

    // 9. Seed Certificates
    console.log('\n📜 Seeding Certificates...');
    const sampleCertificates = [
      {
        certificateId: 'cert_seed_001',
        certificateNumber: 'CERT-JS-2024-001',
        user: learner._id,
        recipientName: 'Sarah Learner',
        recipientEmail: 'sarah.learner@skillverse.com',
        certificateType: 'course-completion',
        courseName: 'Complete JavaScript Course 2024',
        course: courses[0]._id,
        instructor: educator._id,
        instructorName: 'John Educator',
        status: 'issued',
        skills: [
          { name: 'JavaScript', level: 'intermediate' },
          { name: 'ES6+', level: 'beginner' },
          { name: 'DOM Manipulation', level: 'intermediate' },
        ],
        completionDate: new Date(),
        certificateFile: {
          url: 'https://example.com/certificates/cert_seed_001.pdf',
          format: 'pdf',
        },
        verification: {
          verificationCode: 'VERIFY-JS-2024-001',
          verificationUrl: 'https://skillverse.com/verify/VERIFY-JS-2024-001',
          isVerified: true,
        },
        performance: {
          score: 92,
          grade: 'A',
        },
      },
    ];
    const certificates = await Certificate.insertMany(sampleCertificates);
    console.log(`   ✅ Created ${certificates.length} certificates`);

    // 10. Seed Notifications
    console.log('\n🔔 Seeding Notifications...');
    const sampleNotifications = [
      {
        recipient: learner._id,
        sender: educator._id,
        type: 'course-enrollment',
        category: 'course',
        title: 'Successfully Enrolled!',
        message: 'You have been enrolled in "Complete JavaScript Course 2024"',
        priority: 'medium',
        isRead: false,
        relatedEntity: { entityType: 'course', entityId: courses[0]._id },
      },
      {
        recipient: learner._id,
        type: 'badge-earned',
        category: 'gamification',
        title: 'Badge Earned! 🏆',
        message: 'Congratulations! You earned the "First Steps" badge!',
        priority: 'high',
        isRead: false,
        relatedEntity: { entityType: 'badge', entityId: badges[0]._id },
      },
      {
        recipient: educator._id,
        sender: learner._id,
        type: 'new-review',
        category: 'social',
        title: 'New Review',
        message: 'Sarah Learner left a 5-star review on your course',
        priority: 'medium',
        isRead: true,
        relatedEntity: { entityType: 'review', entityId: reviews[0]._id },
      },
      {
        recipient: exchanger._id,
        sender: educator._id,
        type: 'exchange-request',
        category: 'skill-exchange',
        title: 'Exchange Request',
        message: 'John Educator is interested in your skill exchange offer',
        priority: 'high',
        isRead: false,
        relatedEntity: { entityType: 'skill-exchange', entityId: exchanges[0]._id },
      },
      {
        recipient: learner._id,
        sender: educator._id,
        type: 'session-reminder',
        category: 'live-session',
        title: 'New Live Session',
        message: 'JavaScript Q&A Session is scheduled for next week!',
        priority: 'medium',
        isRead: false,
        relatedEntity: { entityType: 'live-session', entityId: sessions[0]._id },
      },
    ];
    const notifications = await Notification.insertMany(sampleNotifications);
    console.log(`   ✅ Created ${notifications.length} notifications`);

    // 11. Seed Chats
    console.log('\n💬 Seeding Chats...');
    const sampleChats = [
      {
        conversationType: 'direct',
        participants: [
          { user: learner._id, role: 'member', joinedAt: new Date(), isActive: true },
          { user: educator._id, role: 'member', joinedAt: new Date(), isActive: true },
        ],
        messages: [
          {
            sender: learner._id,
            content: { text: 'Hi John! I have a question about the JavaScript course.' },
            messageType: 'text',
            status: 'read',
            createdAt: new Date(Date.now() - 3600000),
          },
          {
            sender: educator._id,
            content: { text: "Hi Sarah! Sure, happy to help. What's your question?" },
            messageType: 'text',
            status: 'read',
            createdAt: new Date(Date.now() - 3000000),
          },
          {
            sender: learner._id,
            content: { text: "I'm confused about closures. Can you explain?" },
            messageType: 'text',
            status: 'delivered',
            createdAt: new Date(Date.now() - 2400000),
          },
        ],
        lastMessage: {
          content: "I'm confused about closures. Can you explain?",
          sender: learner._id,
          createdAt: new Date(Date.now() - 2400000),
        },
      },
      {
        conversationType: 'course',
        participants: [
          { user: educator._id, role: 'admin', joinedAt: new Date(), isActive: true },
          { user: learner._id, role: 'member', joinedAt: new Date(), isActive: true },
          { user: exchanger._id, role: 'member', joinedAt: new Date(), isActive: true },
        ],
        relatedEntity: { entityType: 'course', entityId: courses[0]._id },
        groupDetails: {
          name: 'JavaScript Course Discussion',
          description: 'Discussion group for JavaScript course students',
          createdBy: educator._id,
        },
        messages: [
          {
            sender: educator._id,
            content: { text: 'Welcome everyone to the JavaScript course discussion group!' },
            messageType: 'text',
            status: 'sent',
            createdAt: new Date(Date.now() - 86400000),
          },
        ],
      },
    ];
    const chats = await Chat.insertMany(sampleChats);
    console.log(`   ✅ Created ${chats.length} chats`);

    // Update user with enrolled courses and badges
    console.log('\n🔄 Updating user relationships...');
    await User.findByIdAndUpdate(learner._id, {
      $addToSet: {
        'learnerProfile.enrolledCourses': { $each: [courses[0]._id, courses[1]._id] },
        'learnerProfile.completedCourses': courses[0]._id,
        'gamification.badges': badges[0]._id,
      },
      'gamification.points': 550,
    });
    console.log('   ✅ Updated learner profile');

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('🎉 DATABASE SEEDING COMPLETE!');
    console.log('='.repeat(50));
    console.log('\nCreated:');
    console.log(`   👥 ${users.length} Users`);
    console.log(`   🏆 ${badges.length} Badges`);
    console.log(`   📚 ${courses.length} Courses`);
    console.log(`   📝 ${quizzes.length} Quizzes`);
    console.log(`   ⭐ ${reviews.length} Reviews`);
    console.log(`   🔄 ${exchanges.length} Skill Exchanges`);
    console.log(`   🎥 ${sessions.length} Live Sessions`);
    console.log(`   💳 ${payments.length} Payments`);
    console.log(`   📜 ${certificates.length} Certificates`);
    console.log(`   🔔 ${notifications.length} Notifications`);
    console.log(`   💬 ${chats.length} Chats`);
    console.log('\n');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📴 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the seeder
seedDatabase();
