// Routes configuration
// ============================================
// ROUTES CONFIGURATION
// ============================================

import React, { lazy, Suspense } from 'react';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { createBrowserRouter, Outlet, Navigate } from 'react-router-dom';
import config from './config';
import { FullPageLoader } from './features/shared/components/Loader';

// Layout Components
import Header from './features/shared/components/Header';
import Footer from './features/shared/components/Footer';
import Navbar from './features/shared/components/Navbar';
import { SidebarLayout } from './features/shared/components/Sidebar';

// ============================================
// LAZY LOAD PAGES WITH SUSPENSE WRAPPER
// ============================================
const lazyLoad = (importFn) => {
  const Component = lazy(importFn);
  return (
    <Suspense fallback={<FullPageLoader />}>
      <Component />
    </Suspense>
  );
};

// Public Pages
const Home = lazy(() => import('./features/shared/pages/Home'));
const Courses = lazy(() => import('./features/courses/pages/Courses'));
const CourseDetail = lazy(() => import('./features/courses/pages/CourseDetail'));
const LiveSessions = lazy(() => import('./features/communication/pages/LiveSessions'));
const SkillExchange = lazy(() => import('./features/skill-exchange/pages/SkillExchange'));
const SkillExchangeDetail = lazy(() => import('./features/skill-exchange/pages/SkillExchangeDetail'));
const NotFound = lazy(() => import('./features/shared/pages/NotFound'));
const Unauthorized = lazy(() => import('./features/shared/pages/Unauthorized'));

// Auth Pages
const SignInPage = lazy(() => import('./features/auth/pages/SignInPage'));
const SignUpPage = lazy(() => import('./features/auth/pages/SignUpPage'));
const RoleSelection = lazy(() => import('./features/auth/pages/RoleSelection'));
const ForgotPassword = lazy(() => import('./features/auth/components/ForgotPassword'));
const ResetPassword = lazy(() => import('./features/auth/components/ResetPassword'));
const VerifyEmail = lazy(() => import('./features/auth/components/VerifyEmail'));

// Protected Pages
const Dashboard = lazy(() => import('./features/learner/pages/SmartDashboard'));
const Profile = lazy(() => import('./features/learner/pages/Profile'));
const Settings = lazy(() => import('./features/learner/pages/Settings'));
const MyCourses = lazy(() => import('./features/educator/pages/MyCourses'));
const MyLearning = lazy(() => import('./features/learner/pages/MyLearning'));
const Certificates = lazy(() => import('./features/learner/pages/Certificates'));
const Achievements = lazy(() => import('./features/learner/pages/Achievements'));

// Admin Pages
const AdminDashboard = lazy(() => import('./features/admin/components/AdminDashboard'));
const UserManagement = lazy(() => import('./features/admin/components/UserManagement'));
const CourseModeration = lazy(() => import('./features/admin/components/CourseModeration'));
const Analytics = lazy(() => import('./features/admin/components/Analytics'));

// Educator Pages
const EducatorDashboard = lazy(() => import('./features/educator/components/EducatorDashboard'));
const CourseUpload = lazy(() => import('./features/educator/components/CourseUpload'));
const QuizCreator = lazy(() => import('./features/educator/components/QuizCreator'));
const BecomeEducator = lazy(() => import('./features/educator/pages/BecomeEducator'));

// ============================================
// SUSPENSE WRAPPER COMPONENT
// ============================================
const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<FullPageLoader />}>
    {children}
  </Suspense>
);

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
        element: <SuspenseWrapper><Home /></SuspenseWrapper>,
      },
      {
        path: 'courses',
        element: <SuspenseWrapper><Courses /></SuspenseWrapper>,
      },
      {
        path: 'courses/:id',
        element: <SuspenseWrapper><CourseDetail /></SuspenseWrapper>,
      },
      {
        path: 'live-sessions',
        element: <SuspenseWrapper><LiveSessions /></SuspenseWrapper>,
      },
      {
        path: 'skill-exchange',
        element: <SuspenseWrapper><SkillExchange /></SuspenseWrapper>,
      },
      {
        path: 'skill-exchange/:id',
        element: <SuspenseWrapper><SkillExchangeDetail /></SuspenseWrapper>,
      },
      {
        path: 'become-educator',
        element: <SuspenseWrapper><BecomeEducator /></SuspenseWrapper>,
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
        path: 'sign-in/*',
        element: <SuspenseWrapper><SignInPage /></SuspenseWrapper>,
      },
      {
        path: 'login',
        element: <Navigate to="/sign-in" replace />,
      },
      {
        path: 'sign-up/*',
        element: <SuspenseWrapper><SignUpPage /></SuspenseWrapper>,
      },
      {
        path: 'register',
        element: <Navigate to="/sign-up" replace />,
      },
      {
        path: 'select-role',
        element: <SuspenseWrapper><RoleSelection /></SuspenseWrapper>,
      },
      {
        path: 'forgot-password',
        element: <SuspenseWrapper><ForgotPassword /></SuspenseWrapper>,
      },
      {
        path: 'reset-password/:token',
        element: <SuspenseWrapper><ResetPassword /></SuspenseWrapper>,
      },
      {
        path: 'verify-email/:token',
        element: <SuspenseWrapper><VerifyEmail /></SuspenseWrapper>,
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
        element: <SuspenseWrapper><Dashboard /></SuspenseWrapper>,
      },
      {
        path: 'profile',
        element: <SuspenseWrapper><Profile /></SuspenseWrapper>,
      },
      {
        path: 'settings',
        element: <SuspenseWrapper><Settings /></SuspenseWrapper>,
      },
      {
        path: 'my-courses',
        element: <SuspenseWrapper><MyCourses /></SuspenseWrapper>,
      },
      {
        path: 'my-learning',
        element: <SuspenseWrapper><MyLearning /></SuspenseWrapper>,
      },
      {
        path: 'certificates',
        element: <SuspenseWrapper><Certificates /></SuspenseWrapper>,
      },
      {
        path: 'achievements',
        element: <SuspenseWrapper><Achievements /></SuspenseWrapper>,
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
        element: <SuspenseWrapper><AdminDashboard /></SuspenseWrapper>,
      },
      {
        path: 'users',
        element: <SuspenseWrapper><UserManagement /></SuspenseWrapper>,
      },
      {
        path: 'courses',
        element: <SuspenseWrapper><CourseModeration /></SuspenseWrapper>,
      },
      {
        path: 'analytics',
        element: <SuspenseWrapper><Analytics /></SuspenseWrapper>,
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
        element: <SuspenseWrapper><EducatorDashboard /></SuspenseWrapper>,
      },
      {
        path: 'courses/create',
        element: <SuspenseWrapper><CourseUpload /></SuspenseWrapper>,
      },
      {
        path: 'quiz/create',
        element: <SuspenseWrapper><QuizCreator /></SuspenseWrapper>,
      },
    ],
  },

  // ============================================
  // ERROR PAGES
  // ============================================
  {
    path: 'unauthorized',
    element: <SuspenseWrapper><Unauthorized /></SuspenseWrapper>,
  },
  {
    path: '*',
    element: <SuspenseWrapper><NotFound /></SuspenseWrapper>,
  },
]);

export default router;