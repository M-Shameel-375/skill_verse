// Footer component
// ============================================
// FOOTER COMPONENT
// ============================================

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaFacebook, 
  FaTwitter, 
  FaLinkedin, 
  FaInstagram,
  FaYoutube,
  FaGithub,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt
} from 'react-icons/fa';
import config from '../../config';

// ============================================
// FOOTER COMPONENT
// ============================================
const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Footer Links
  const footerLinks = {
    platform: [
      { label: 'Browse Courses', path: config.routes.courses },
      { label: 'Live Sessions', path: config.routes.liveSessions },
      { label: 'Skill Exchange', path: config.routes.skillExchange },
      { label: 'Become an Educator', path: '/become-educator' },
    ],
    company: [
      { label: 'About Us', path: '/about' },
      { label: 'Careers', path: '/careers' },
      { label: 'Blog', path: '/blog' },
      { label: 'Press', path: '/press' },
    ],
    support: [
      { label: 'Help Center', path: config.app.helpUrl },
      { label: 'Contact Us', path: '/contact' },
      { label: 'FAQs', path: '/faqs' },
      { label: 'Community', path: '/community' },
    ],
    legal: [
      { label: 'Terms of Service', path: config.app.termsUrl },
      { label: 'Privacy Policy', path: config.app.privacyUrl },
      { label: 'Cookie Policy', path: '/cookie-policy' },
      { label: 'Accessibility', path: '/accessibility' },
    ],
  };

  // Social Media Links
  const socialLinks = [
    { icon: FaFacebook, href: 'https://facebook.com', label: 'Facebook', color: 'hover:text-blue-600' },
    { icon: FaTwitter, href: 'https://twitter.com', label: 'Twitter', color: 'hover:text-blue-400' },
    { icon: FaLinkedin, href: 'https://linkedin.com', label: 'LinkedIn', color: 'hover:text-blue-700' },
    { icon: FaInstagram, href: 'https://instagram.com', label: 'Instagram', color: 'hover:text-pink-600' },
    { icon: FaYoutube, href: 'https://youtube.com', label: 'YouTube', color: 'hover:text-red-600' },
    { icon: FaGithub, href: 'https://github.com', label: 'GitHub', color: 'hover:text-gray-900' },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to={config.routes.home} className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-2xl font-bold text-white">
                {config.app.name}
              </span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-sm">
              {config.app.description}. Empowering learners worldwide with quality education and skill development.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <FaEnvelope className="text-blue-500" />
                <a 
                  href={`mailto:${config.app.supportEmail}`}
                  className="hover:text-white transition-colors"
                >
                  {config.app.supportEmail}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <FaPhone className="text-blue-500" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3">
                <FaMapMarkerAlt className="text-blue-500" />
                <span>San Francisco, CA 94102</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-gray-400 ${social.color} transition-colors`}
                  aria-label={social.label}
                >
                  <social.icon className="text-xl" />
                </a>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Platform</h3>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="max-w-md">
            <h3 className="text-white font-semibold mb-2">Subscribe to our newsletter</h3>
            <p className="text-gray-400 text-sm mb-4">
              Get the latest courses, updates and tips delivered right to your inbox.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © {currentYear} {config.app.name}. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;