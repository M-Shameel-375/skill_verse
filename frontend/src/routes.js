// Routes configuration
// ============================================
// ROUTES CONFIGURATION
// ============================================

import React, { lazy, Suspense } from 'react';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import config from './config';
import { FullPageLoader } from './features/shared/components/Loader';

// Layout Components
import Header from './features/shared/components/Header';
import Footer from './features/shared/components/Footer';
import Navbar from './features/shared/components/Navbar';
import { SidebarLayout } from './features/shared/components/Sidebar';

// ============================================
// LAZY LOAD PAGES
// ============================================

// Public Pages
const Home = lazy(() => import('./features/shared/pages/Home'));
const Courses = lazy(() => import('./features/courses/pages/Courses'));
const CourseDetail = lazy(() => import('./features/courses/pages/CourseDetail'));
const LiveSessions = lazy(() => import('./features/communication/pages/LiveSessions'));
const SkillExchange = lazy(() => import('./features/skill-exchange/pages/SkillExchange'));
const NotFound = lazy(() => import('./features/shared/pages/NotFound'));
const Unauthorized = lazy(() => import('./features/shared/pages/Unauthorized'));

// Auth Pages
const SignInPage = lazy(() => import('./features/auth/pages/SignInPage'));
const SignUpPage = lazy(() => import('./features/auth/pages/SignUpPage'));
const ForgotPassword = lazy(() => import('./features/auth/components/ForgotPassword'));
const ResetPassword = lazy(() => import('./features/auth/components/ResetPassword'));
const VerifyEmail = lazy(() => import('./features/auth/components/VerifyEmail'));

// Protected Pages
const Dashboard = lazy(() => import('./features/educator/pages/Dashboard'));
const Profile = lazy(() => import('./features/learner/pages/Profile'));
const Settings = lazy(() => import('./features/learner/pages/Settings'));
const MyCourses = lazy(() => import('./features/educator/pages/MyCourses'));
const MyLearning = lazy(() => import('./features/learner/pages/MyLearning'));
const Certificates = lazy(() => import('./features/learner/pages/Certificates'));

// Admin Pages
const AdminDashboard = lazy(() => import('./features/admin/components/AdminDashboard'));
const UserManagement = lazy(() => import('./features/admin/components/UserManagement'));
const CourseModeration = lazy(() => import('./features/admin/components/CourseModeration'));
const Analytics = lazy(() => import('./features/admin/components/Analytics'));

// Educator Pages
const EducatorDashboard = lazy(() => import('./features/educator/components/EducatorDashboard'));
const CourseUpload = lazy(() => import('./features/educator/components/CourseUpload'));
const QuizCreator = lazy(() => import('./features/educator/components/QuizCreator'));

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
        path: 'sign-in',
        element: <SignInPage />,
      },
      {
        path: 'sign-up',
        element: <SignUpPage />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPassword />,
      },
      {
        path: 'reset-password/:token',
        element: <ResetPassword />,
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
      <>
        <SignedIn>
          <DashboardLayout />
        </SignedIn>
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
      </>
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
        element: <Certificates />,
      },
    ],
  },

  // ============================================
  // ADMIN ROUTES
  // ============================================
  {
    path: 'admin',
    element: (
      <>
        <SignedIn>
          <DashboardLayout />
        </SignedIn>
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
      </>
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
      <>
        <SignedIn>
          <DashboardLayout />
        </SignedIn>
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
      </>
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