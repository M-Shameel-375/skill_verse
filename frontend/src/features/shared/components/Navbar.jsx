// Navbar component
// ============================================
// NAVBAR COMPONENT
// ============================================

import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaBook, 
  FaVideo, 
  FaExchangeAlt,
  FaTachometerAlt,
  FaBars,
  FaTimes,
  FaChevronDown
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '../../../hooks/useAuth';
import config from '../../../config';

// ============================================
// NAVIGATION ITEMS
// ============================================
const getNavigationItems = (userRole, isAuthenticated) => {
  const baseItems = [
    {
      label: 'Home',
      path: config.routes.home,
      icon: FaHome,
    },
    {
      label: 'Courses',
      path: config.routes.courses,
      icon: FaBook,
    },
    {
      label: 'Live Sessions',
      path: config.routes.liveSessions,
      icon: FaVideo,
    },
    {
      label: 'Skill Exchange',
      path: config.routes.skillExchange,
      icon: FaExchangeAlt,
    },
  ];

  if (isAuthenticated) {
    baseItems.push({
      label: 'Dashboard',
      path: config.routes.dashboard,
      icon: FaTachometerAlt,
    });
  }

  return baseItems;
};

// ============================================
// MOBILE MENU
// ============================================
const MobileMenu = ({ isOpen, onClose, navItems }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          />

          {/* Menu */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 left-0 bottom-0 w-64 bg-white shadow-xl z-50 lg:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <Link to={config.routes.home} className="flex items-center gap-2" onClick={onClose}>
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <span className="text-xl font-bold text-gray-900">
                  {config.app.name}
                </span>
              </Link>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaTimes className="text-xl text-gray-600" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="p-4">
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-blue-50 text-blue-600 font-medium'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`
                      }
                    >
                      <item.icon />
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ============================================
// NAVBAR COMPONENT
// ============================================
const Navbar = () => {
  const { userRole, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = getNavigationItems(userRole, isAuthenticated);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <FaBars className="text-xl text-gray-600" />
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`
                }
              >
                <item.icon />
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Right Section (can add search, filters, etc.) */}
          <div className="flex items-center gap-4">
            {/* Add any additional items here */}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        navItems={navItems}
      />
    </nav>
  );
};

export default Navbar;