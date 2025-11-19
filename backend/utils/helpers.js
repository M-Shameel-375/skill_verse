// Helpers utility
// ============================================
// HELPER UTILITIES
// ============================================

const crypto = require('crypto');

// ============================================
// GENERATE RANDOM STRING
// ============================================
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// ============================================
// GENERATE RANDOM NUMBER
// ============================================
const generateRandomNumber = (min = 100000, max = 999999) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// ============================================
// SLUGIFY TEXT
// ============================================
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start
    .replace(/-+$/, ''); // Trim - from end
};

// ============================================
// CAPITALIZE FIRST LETTER
// ============================================
const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// ============================================
// CAPITALIZE WORDS
// ============================================
const capitalizeWords = (str) => {
  if (!str) return '';
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

// ============================================
// TRUNCATE TEXT
// ============================================
const truncate = (text, length = 100, suffix = '...') => {
  if (!text || text.length <= length) return text;
  return text.substring(0, length).trim() + suffix;
};

// ============================================
// FORMAT CURRENCY
// ============================================
const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// ============================================
// FORMAT DATE
// ============================================
const formatDate = (date, locale = 'en-US') => {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

// ============================================
// FORMAT TIME AGO
// ============================================
const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' years ago';

  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' months ago';

  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' days ago';

  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hours ago';

  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutes ago';

  return Math.floor(seconds) + ' seconds ago';
};

// ============================================
// CALCULATE PERCENTAGE
// ============================================
const calculatePercentage = (obtained, total) => {
  if (total === 0) return 0;
  return ((obtained / total) * 100).toFixed(2);
};

// ============================================
// GENERATE PAGINATION
// ============================================
const getPagination = (page = 1, limit = 10, total) => {
  const currentPage = parseInt(page);
  const pageLimit = parseInt(limit);
  const totalPages = Math.ceil(total / pageLimit);
  
  return {
    page: currentPage,
    limit: pageLimit,
    totalPages,
    totalItems: total,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
};

// ============================================
// REMOVE DUPLICATES FROM ARRAY
// ============================================
const removeDuplicates = (array, key = null) => {
  if (!key) {
    return [...new Set(array)];
  }
  
  const seen = new Set();
  return array.filter((item) => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

// ============================================
// GENERATE UNIQUE CODE
// ============================================
const generateUniqueCode = (prefix = '') => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}${timestamp}${random}`.toUpperCase();
};

// ============================================
// SHUFFLE ARRAY
// ============================================
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// ============================================
// DELAY/SLEEP FUNCTION
// ============================================
const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// ============================================
// EXPORTS
// ============================================
module.exports = {
  generateRandomString,
  generateRandomNumber,
  slugify,
  capitalizeFirst,
  capitalizeWords,
  truncate,
  formatCurrency,
  formatDate,
  timeAgo,
  calculatePercentage,
  getPagination,
  removeDuplicates,
  generateUniqueCode,
  shuffleArray,
  sleep,
};