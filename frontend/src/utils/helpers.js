// Helpers
// ============================================
// HELPER FUNCTIONS
// ============================================

import { format, formatDistance, formatDistanceToNow } from 'date-fns';

// ============================================
// STRING HELPERS
// ============================================

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Capitalize all words
export const capitalizeWords = (str) => {
  if (!str) return '';
  return str
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
};

// Truncate text
export const truncate = (str, length = 100, suffix = '...') => {
  if (!str || str.length <= length) return str;
  return str.substring(0, length).trim() + suffix;
};

// Slugify string
export const slugify = (str) => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Generate random string
export const generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Extract initials from name
export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// ============================================
// NUMBER HELPERS
// ============================================

// Format number with commas
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Format currency
export const formatCurrency = (amount, currency = 'USD') => {
  const symbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹' };
  const symbol = symbols[currency] || '$';
  return `${symbol}${formatNumber(parseFloat(amount).toFixed(2))}`;
};

// Format percentage
export const formatPercentage = (value, decimals = 0) => {
  return `${parseFloat(value).toFixed(decimals)}%`;
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Generate random number
export const randomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// ============================================
// DATE HELPERS
// ============================================

// Format date
export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  if (!date) return '';
  return format(new Date(date), formatStr);
};

// Format time
export const formatTime = (date) => {
  if (!date) return '';
  return format(new Date(date), 'hh:mm a');
};

// Format date and time
export const formatDateTime = (date) => {
  if (!date) return '';
  return format(new Date(date), 'MMM dd, yyyy hh:mm a');
};

// Relative time (e.g., "2 hours ago")
export const timeAgo = (date) => {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

// Format duration in seconds to readable format
export const formatDuration = (seconds) => {
  if (!seconds || seconds < 0) return '0:00';
  
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Check if date is today
export const isToday = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  return (
    checkDate.getDate() === today.getDate() &&
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  );
};

// ============================================
// ARRAY HELPERS
// ============================================

// Remove duplicates from array
export const unique = (arr) => {
  return [...new Set(arr)];
};

// Chunk array
export const chunk = (arr, size) => {
  return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  );
};

// Shuffle array
export const shuffle = (arr) => {
  const newArr = [...arr];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

// Sort array by key
export const sortBy = (arr, key, order = 'asc') => {
  return [...arr].sort((a, b) => {
    if (order === 'asc') {
      return a[key] > b[key] ? 1 : -1;
    }
    return a[key] < b[key] ? 1 : -1;
  });
};

// Group array by key
export const groupBy = (arr, key) => {
  return arr.reduce((result, item) => {
    const group = item[key];
    result[group] = result[group] || [];
    result[group].push(item);
    return result;
  }, {});
};

// ============================================
// OBJECT HELPERS
// ============================================

// Deep clone object
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Check if object is empty
export const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};

// Pick specific keys from object
export const pick = (obj, keys) => {
  return keys.reduce((result, key) => {
    if (obj.hasOwnProperty(key)) {
      result[key] = obj[key];
    }
    return result;
  }, {});
};

// Omit specific keys from object
export const omit = (obj, keys) => {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result;
};

// ============================================
// URL HELPERS
// ============================================

// Build query string
export const buildQueryString = (params) => {
  const query = Object.keys(params)
    .filter((key) => params[key] !== null && params[key] !== undefined && params[key] !== '')
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
  return query ? `?${query}` : '';
};

// Parse query string
export const parseQueryString = (queryString) => {
  const params = new URLSearchParams(queryString);
  const result = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
};

// Get file extension
export const getFileExtension = (filename) => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};

// ============================================
// VALIDATION HELPERS
// ============================================

// Check if email is valid
export const isValidEmail = (email) => {
  const regex = /^\S+@\S+\.\S+$/;
  return regex.test(email);
};

// Check if URL is valid
export const isValidUrl = (url) => {
  const regex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
  return regex.test(url);
};

// Check if phone is valid
export const isValidPhone = (phone) => {
  const regex = /^\+?[1-9]\d{1,14}$/;
  return regex.test(phone);
};

// ============================================
// COLOR HELPERS
// ============================================

// Generate random color
export const randomColor = () => {
  return '#' + Math.floor(Math.random() * 16777215).toString(16);
};

// Get color for rating
export const getRatingColor = (rating) => {
  if (rating >= 4.5) return '#10B981'; // green
  if (rating >= 3.5) return '#3B82F6'; // blue
  if (rating >= 2.5) return '#F59E0B'; // amber
  return '#EF4444'; // red
};

// ============================================
// STORAGE HELPERS
// ============================================

// Local storage wrapper
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },
};

// ============================================
// MISC HELPERS
// ============================================

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
};

// Download file
export const downloadFile = (url, filename) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Calculate reading time
export const calculateReadingTime = (text, wordsPerMinute = 200) => {
  const wordCount = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return minutes;
};

// Get average rating
export const calculateAverageRating = (ratings) => {
  if (!ratings || ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  return (sum / ratings.length).toFixed(1);
};

// Generate avatar color from name
export const getAvatarColor = (name) => {
  const colors = [
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', 
    '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

// Sleep/delay function
export const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Check if user is online
export const isOnline = () => {
  return navigator.onLine;
};

// Get device type
export const getDeviceType = () => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
};