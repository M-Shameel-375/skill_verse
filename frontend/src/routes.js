// Routes configuration
// ============================================
// ROUTES CONFIGURATION
// ============================================

import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import config from './config';
import { FullPageLoader } from './components/common/Loader';
import ProtectedRoute, {
  GuestRoute,
  RequireAuth,
  RequireAdmin,
  RequireEducator,
  RequireEmailVerification,
} from './components/common/ProtectedRoute';

// Layout Components
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Navbar from './components/common/Navbar';
import { SidebarLayout } from './components/common/Sidebar';

// ============================================
// LAZY LOAD PAGES
// ============================================

// Public Pages
const Home = lazy(() => import('./pages/Home'));
const Courses = lazy(() => import('./pages/Courses'));
const CourseDetail = lazy(() => import('./pages/CourseDetail'));
const LiveSessions = lazy(() => import('./pages/LiveSessions'));
const SkillExchange = lazy(() => import('./pages/SkillExchange'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));

// Auth Pages
const Login = lazy(() => import('./components/auth/Login'));
const Register = lazy(() => import('./components/auth/Register'));
const ForgotPassword = lazy(() => import('./components/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./components/auth/ResetPassword'));
const VerifyEmail = lazy(() => import('./components/auth/VerifyEmail'));

// Protected Pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const MyCourses = lazy(() => import('./pages/MyCourses'));
const MyLearning = lazy(() => import('./pages/MyLearning'));
const Certificates = lazy(() => import('./pages/Certificates'));

// Admin Pages
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));
const UserManagement = lazy(() => import('./components/admin/UserManagement'));
const CourseModeration = lazy(() => import('./components/admin/CourseModeration'));
const Analytics = lazy(() => import('./components/admin/Analytics'));

// Educator Pages
const EducatorDashboard = lazy(() => import('./components/educator/EducatorDashboard'));
const CourseUpload = lazy(() => import('./components/educator/CourseUpload'));
const QuizCreator = lazy(() => import('./components/educator/QuizCreator'));

// ============================================
// LAYOUT WRAPPERS
// ============================================

// Main Layout (with Header, Navbar, Footer)
const MainLayout = () => (
  <>
    <Header />
    <Navbar />
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<FullPageLoader />}>
        <Outlet />
      </Suspense>
    </div>
    <Footer />
  </>
);

// Dashboard Layout (with Sidebar)
const DashboardLayout = () => (
  <>
    <Header />
    <SidebarLayout>
      <Suspense fallback={<FullPageLoader />}>
        <Outlet />
      </Suspense>
    </SidebarLayout>
  </>
);

// Auth Layout (No Header/Footer)
const AuthLayout = () => (
  <Suspense fallback={<FullPageLoader />}>
    <Outlet />
  </Suspense>
);

// ============================================
// ROUTER CONFIGURATION
// ============================================
const router = createBrowserRouter([
  // ============================================
  // PUBLIC ROUTES (Main Layout)
  // ============================================
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'courses',
        element: <Courses />,
      },
      {
        path: 'courses/:id',
        element: <CourseDetail />,
      },
      {
        path: 'live-sessions',
        element: <LiveSessions />,
      },
      {
        path: 'skill-exchange',
        element: <SkillExchange />,
      },
    ],
  },

  // ============================================
  // AUTH ROUTES (Guest Only)
  // ============================================
  {
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: (
          <GuestRoute>
            <Login />
          </GuestRoute>
        ),
      },
      {
        path: 'register',
        element: (
          <GuestRoute>
            <Register />
          </GuestRoute>
        ),
      },
      {
        path: 'forgot-password',
        element: (
          <GuestRoute>
            <ForgotPassword />
          </GuestRoute>
        ),
      },
      {
        path: 'reset-password/:token',
        element: (
          <GuestRoute>
            <ResetPassword />
          </GuestRoute>
        ),
      },
      {
        path: 'verify-email/:token',
        element: <VerifyEmail />,
      },
    ],
  },

  // ============================================
  // PROTECTED ROUTES (Dashboard Layout)
  // ============================================
  {
    element: (
      <RequireAuth>
        <DashboardLayout />
      </RequireAuth>
    ),
    children: [
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'profile',
        element: <Profile />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
      {
        path: 'my-courses',
        element: <MyCourses />,
      },
      {
        path: 'my-learning',
        element: <MyLearning />,
      },
      {
        path: 'certificates',
        element: (
          <RequireEmailVerification>
            <Certificates />
          </RequireEmailVerification>
        ),
      },
    ],
  },

  // ============================================
  // ADMIN ROUTES
  // ============================================
  {
    path: 'admin',
    element: (
      <RequireAdmin>
        <DashboardLayout />
      </RequireAdmin>
    ),
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      {
        path: 'users',
        element: <UserManagement />,
      },
      {
        path: 'courses',
        element: <CourseModeration />,
      },
      {
        path: 'analytics',
        element: <Analytics />,
      },
    ],
  },

  // ============================================
  // EDUCATOR ROUTES
  // ============================================
  {
    path: 'educator',
    element: (
      <RequireEducator>
        <DashboardLayout />
      </RequireEducator>
    ),
    children: [
      {
        index: true,
        element: <EducatorDashboard />,
      },
      {
        path: 'courses/create',
        element: <CourseUpload />,
      },
      {
        path: 'quiz/create',
        element: <QuizCreator />,
      },
    ],
  },

  // ============================================
  // ERROR PAGES
  // ============================================
  {
    path: 'unauthorized',
    element: <Unauthorized />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

export default router;