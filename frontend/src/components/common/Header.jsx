// Header component
// ============================================
// HEADER COMPONENT
// ============================================

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaBell, 
  FaUserCircle, 
  FaChevronDown, 
  FaCog, 
  FaSignOutAlt,
  FaUser,
  FaCertificate,
  FaTrophy,
  FaBook
} from 'react-icons/fa';
import useAuth from '../../hooks/useAuth';
import config from '../../config';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================
// NOTIFICATION DROPDOWN
// ============================================
const NotificationDropdown = ({ isOpen, onClose, notifications = [] }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-30" 
            onClick={onClose}
          />
          
          {/* Dropdown */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-40 max-h-96 overflow-y-auto"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            </div>

            {/* Notifications List */}
            {notifications.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${notification.read ? 'bg-gray-300' : 'bg-blue-500'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-8 text-center">
                <FaBell className="text-4xl text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No notifications yet</p>
              </div>
            )}

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                <Link
                  to="/notifications"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  onClick={onClose}
                >
                  View all notifications
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ============================================
// USER DROPDOWN
// ============================================
const UserDropdown = ({ isOpen, onClose, user, onLogout }) => {
  const navigate = useNavigate();

  const menuItems = [
    {
      icon: FaUser,
      label: 'My Profile',
      path: config.routes.profile,
    },
    {
      icon: FaBook,
      label: 'My Courses',
      path: config.routes.myCourses,
    },
    {
      icon: FaCertificate,
      label: 'Certificates',
      path: config.routes.certificates,
    },
    {
      icon: FaTrophy,
      label: 'Achievements',
      path: '/achievements',
    },
    {
      icon: FaCog,
      label: 'Settings',
      path: config.routes.settings,
    },
  ];

  const handleMenuClick = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-30" 
            onClick={onClose}
          />
          
          {/* Dropdown */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-40"
          >
            {/* User Info */}
            <div className="px-4 py-3 border-b border-gray-200">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                  {user?.role}
                </span>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleMenuClick(item.path)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                >
                  <item.icon className="text-gray-400" />
                  {item.label}
                </button>
              ))}
            </div>

            {/* Logout */}
            <div className="border-t border-gray-200 py-2">
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
              >
                <FaSignOutAlt />
                Logout
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ============================================
// HEADER COMPONENT
// ============================================
const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Mock notifications (replace with real data from Redux/API)
  const notifications = [
    {
      id: 1,
      title: 'New Course Available',
      message: 'Check out the new React Advanced course',
      time: '2 hours ago',
      read: false,
    },
    {
      id: 2,
      title: 'Certificate Earned',
      message: 'Congratulations! You earned a certificate',
      time: '1 day ago',
      read: false,
    },
    {
      id: 3,
      title: 'Course Update',
      message: 'Your enrolled course has new content',
      time: '2 days ago',
      read: true,
    },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to={config.routes.home} className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                {config.app.name}
              </span>
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setNotificationOpen(!notificationOpen);
                      setUserMenuOpen(false);
                    }}
                    className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FaBell className="text-xl" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  <NotificationDropdown
                    isOpen={notificationOpen}
                    onClose={() => setNotificationOpen(false)}
                    notifications={notifications}
                  />
                </div>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setUserMenuOpen(!userMenuOpen);
                      setNotificationOpen(false);
                    }}
                    className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {user?.profileImage?.url ? (
                      <img
                        src={user.profileImage.url}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <FaUserCircle className="text-3xl text-gray-600" />
                    )}
                    <span className="hidden md:block text-sm font-medium text-gray-700">
                      {user?.name}
                    </span>
                    <FaChevronDown className="text-xs text-gray-500" />
                  </button>

                  <UserDropdown
                    isOpen={userMenuOpen}
                    onClose={() => setUserMenuOpen(false)}
                    user={user}
                    onLogout={handleLogout}
                  />
                </div>
              </>
            ) : (
              <>
                {/* Login/Register Buttons */}
                <Link
                  to={config.routes.login}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to={config.routes.register}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;