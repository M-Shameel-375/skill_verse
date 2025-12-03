# 🎓 SkillVerse Authentication & Role Flow Guide

## Overview

SkillVerse uses **Clerk** for authentication and **MongoDB** for storing user data and roles. This guide explains how the authentication flow works and how to test different user roles.

---

## 🔑 Authentication Flow

### 1. Sign Up (New User)
```
User clicks "Sign Up" 
    → Clerk handles registration 
    → User redirected to /select-role 
    → User picks role (Learner/Educator/Skill Exchanger)
    → User data saved to MongoDB
    → User redirected to Dashboard
```

### 2. Sign In (Existing User)
```
User clicks "Sign In"
    → Clerk handles authentication
    → User redirected to /dashboard
    → SmartDashboard syncs user with MongoDB
    → Dashboard shows role-specific content
```

---

## 👥 User Roles

| Role | Description | Dashboard Features |
|------|-------------|-------------------|
| **Learner** 🎓 | Takes courses, earns certificates | My Learning, Certificates, Achievements |
| **Educator** 👨‍🏫 | Creates courses, earns money | Create Course, Students, Earnings |
| **Skill Exchanger** 🔄 | Exchanges skills with peers | My Skills, Find Partners, Exchange Requests |
| **Admin** 👑 | Platform administrator | User Management, Analytics, Reports |

---

## 🛠️ How to Test Different Roles

### Option 1: Sign Up as New User
1. Go to http://localhost:5174/sign-up
2. Create account with Clerk
3. Select your desired role on the role selection page
4. You'll be redirected to the dashboard with role-specific features

### Option 2: Change Existing User Role (via Script)
```bash
# Navigate to backend folder
cd backend

# Run the setup admin script to manage users
node scripts/setupAdmin.js your-email@example.com
```

### Option 3: Change Role Programmatically
```bash
# Using the API endpoint
curl -X PUT http://localhost:5000/api/v1/users/role \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "role": "educator"
  }'
```

---

## 📍 Important Routes

### Public Routes (No Auth Required)
- `/` - Home page
- `/courses` - Browse courses
- `/sign-up` - Registration
- `/sign-in` - Login

### Auth Routes
- `/select-role` - Choose role after signup

### Protected Routes (Auth Required)
- `/dashboard` - Smart dashboard (shows role-specific content)
- `/profile` - User profile
- `/settings` - Account settings
- `/my-learning` - Enrolled courses (Learner)
- `/certificates` - Earned certificates (Learner)
- `/achievements` - Badges & achievements (Learner)

### Educator Routes
- `/educator` - Educator dashboard
- `/educator/courses/create` - Create new course
- `/educator/quiz/create` - Create quiz

### Admin Routes
- `/admin` - Admin dashboard
- `/admin/users` - User management
- `/admin/courses` - Course moderation
- `/admin/analytics` - Platform analytics

---

## 🔧 Technical Details

### User Sync Process
When a user signs in via Clerk:
1. `SmartDashboard` component calls `/api/v1/users/sync`
2. Backend creates/updates user in MongoDB
3. User role is stored in `localStorage`
4. Sidebar updates navigation based on role
5. Dashboard shows role-specific content

### Key Files

**Frontend:**
- `src/features/learner/pages/SmartDashboard.jsx` - Role-based dashboard router
- `src/features/learner/pages/LearnerDashboard.jsx` - Learner view
- `src/features/educator/components/EducatorDashboard.jsx` - Educator view
- `src/features/admin/components/AdminDashboard.jsx` - Admin view
- `src/features/learner/pages/SkillExchangerDashboard.jsx` - Skill exchanger view
- `src/features/shared/components/Sidebar.jsx` - Role-based navigation

**Backend:**
- `controllers/user.controller.js` - User sync and role APIs
- `routes/user.routes.js` - User routes
- `models/User.model.js` - User schema with roles

### LocalStorage Keys
- `skillverse_user` - Full user object from MongoDB
- `skillverse_user_role` - Just the role string

---

## 🚀 Quick Start Testing

### 1. Start Backend
```bash
cd backend
node server.js
# Server runs on http://localhost:5000
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5174
```

### 3. Test Flow
1. Open http://localhost:5174
2. Click "Sign Up" or go to /sign-up
3. Create account with your email
4. Select a role (Learner, Educator, or Skill Exchanger)
5. Explore the dashboard!

### 4. Test Admin Role
```bash
# Make yourself an admin
cd backend
node scripts/setupAdmin.js your-email@example.com
```
Then sign in again and go to /admin

---

## 🐛 Troubleshooting

### "Light screen" or blank page
- Check browser console for errors
- Make sure backend is running on port 5000
- Check if Clerk publishable key is set in `.env`

### Role not changing in sidebar
- Clear localStorage: `localStorage.clear()`
- Sign out and sign in again
- Role updates on page refresh

### User not in database
- Make sure backend is running
- Check MongoDB connection
- User is created on first /dashboard visit after Clerk signup

### API errors
- Check backend terminal for error logs
- Verify MongoDB connection string
- Check CORS settings in backend

---

## 📝 Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
```

### Backend (.env or config)
```env
MONGODB_URI=mongodb+srv://...
PORT=5000
```

---

## 🎯 Summary

1. **Sign up** via Clerk → Select role → MongoDB user created
2. **Sign in** → User synced with MongoDB → Role-specific dashboard shown
3. **Change roles** via settings, API, or admin script
4. **Different dashboards** for Learner, Educator, Skill Exchanger, Admin
5. **Sidebar navigation** updates based on user role
