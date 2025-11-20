// Sidebar component
// ============================================
// SIDEBAR COMPONENT
// ============================================

import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaTachometerAlt,
  FaBook,
  FaVideo,
  FaExchangeAlt,
  FaCertificate,
  FaTrophy,
  FaCog,
  FaUsers,
  FaChartBar,
  FaFileAlt,
  FaDollarSign,
  FaStar,
  FaBell,
  FaChevronLeft,
  FaChevronRight,
  FaGraduationCap,
  FaUserGraduate,
  FaChalkboardTeacher
} from 'react-icons/fa';
import useAuth from '../../../hooks/useAuth';
import config from '../../../config';

// ============================================
// SIDEBAR MENU ITEMS
// ============================================
const getSidebarItems = (userRole) => {
  const commonItems = [
    {
      label: 'Dashboard',
      path: config.routes.dashboard,
      icon: FaTachometerAlt,
    },
  ];

  // Learner specific items
  const learnerItems = [
    {
      label: 'My Learning',
      path: config.routes.myLearning,
      icon: FaGraduationCap,
    },
    {
      label: 'My Courses',
      path: config.routes.myCourses,
      icon: FaBook,
    },
    {
      label: 'Certificates',
      path: config.routes.certificates,
      icon: FaCertificate,
    },
    {
      label: 'Achievements',
      path: '/achievements',
      icon: FaTrophy,
    },
  ];

  // Educator specific items
  const educatorItems = [
    {
      label: 'My Courses',
      path: config.routes.myCourses,
      icon: FaBook,
    },
    {
      label: 'Create Course',
      path: config.routes.createCourse,
      icon: FaChalkboardTeacher,
    },
    {
      label: 'Live Sessions',
      path: config.routes.liveSessions,
      icon: FaVideo,
    },
    {
      label: 'Students',
      path: '/students',
      icon: FaUserGraduate,
    },
    {
      label: 'Earnings',
      path: '/earnings',
      icon: FaDollarSign,
    },
    {
      label: 'Reviews',
      path: '/reviews',
      icon: FaStar,
    },
    {
      label: 'Analytics',
      path: '/analytics',
      icon: FaChartBar,
    },
  ];

  // Admin specific items
  const adminItems = [
    {
      label: 'Users',
      path: config.routes.adminUsers,
      icon: FaUsers,
    },
    {
      label: 'Courses',
      path: config.routes.adminCourses,
      icon: FaBook,
    },
    {
      label: 'Analytics',
      path: config.routes.adminAnalytics,
      icon: FaChartBar,
    },
    {
      label: 'Reports',
      path: '/admin/reports',
      icon: FaFileAlt,
    },
    {
      label: 'Payments',
      path: '/admin/payments',
      icon: FaDollarSign,
    },
  ];

  // Skill Exchanger items
  const skillExchangerItems = [
    {
      label: 'Exchanges',
      path: config.routes.skillExchange,
      icon: FaExchangeAlt,
    },
    {
      label: 'My Skills',
      path: '/my-skills',
      icon: FaTrophy,
    },
  ];

  // Build menu based on role
  let roleItems = [];
  
  switch (userRole) {
    case config.roles.ADMIN:
      roleItems = adminItems;
      break;
    case config.roles.EDUCATOR:
      roleItems = educatorItems;
      break;
    case config.roles.SKILL_EXCHANGER:
      roleItems = [...learnerItems, ...skillExchangerItems];
      break;
    case config.roles.LEARNER:
    default:
      roleItems = learnerItems;
      break;
  }

  // Settings and Notifications (common to all)
  const bottomItems = [
    {
      label: 'Notifications',
      path: '/notifications',
      icon: FaBell,
    },
    {
      label: 'Settings',
      path: config.routes.settings,
      icon: FaCog,
    },
  ];

  return {
    main: [...commonItems, ...roleItems],
    bottom: bottomItems,
  };
};

// ============================================
// SIDEBAR COMPONENT
// ============================================
const Sidebar = ({ collapsed = false, onToggle }) => {
  const { userRole } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  const { main: mainItems, bottom: bottomItems } = getSidebarItems(userRole);

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
    onToggle?.(!isCollapsed);
  };

  return (
    <motion.aside
      initial={false}
      animate={{
        width: isCollapsed ? '80px' : '256px',
      }}
      transition={{ duration: 0.3 }}
      className="fixed left-0 top-16 bottom-0 bg-white border-r border-gray-200 z-30 flex flex-col"
    >
      {/* Toggle Button */}
      <button
        onClick={handleToggle}
        className="absolute -right-3 top-6 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-md"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <FaChevronRight className="text-xs text-gray-600" />
        ) : (
          <FaChevronLeft className="text-xs text-gray-600" />
        )}
      </button>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3">
        <ul className="space-y-1">
          {mainItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <item.icon className="text-lg flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="text-sm font-medium truncate">
                      {item.label}
                    </span>
                  )}
                  {isActive && !isCollapsed && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full"
                    />
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Navigation */}
      <nav className="border-t border-gray-200 py-4 px-3">
        <ul className="space-y-1">
          {bottomItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <item.icon className="text-lg flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="text-sm font-medium truncate">
                      {item.label}
                    </span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </motion.aside>
  );
};

// ============================================
// SIDEBAR LAYOUT WRAPPER
// ============================================
export const SidebarLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={setSidebarCollapsed}
      />
      <main
        className="flex-1 transition-all duration-300"
        style={{
          marginLeft: sidebarCollapsed ? '80px' : '256px',
          marginTop: '64px', // Header height
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Sidebar;