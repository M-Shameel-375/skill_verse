// ============================================
// USE DEBOUNCE HOOK
// ============================================

import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce a value
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds (default: 500ms)
 * @returns {any} - Debounced value
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set up the timeout
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timeout if value changes before delay completes
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Custom hook to debounce a callback function
 * @param {Function} callback - The function to debounce
 * @param {number} delay - Delay in milliseconds (default: 500ms)
 * @returns {Function} - Debounced function
 */
export const useDebouncedCallback = (callback, delay = 500) => {
  const [timeoutId, setTimeoutId] = useState(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  const debouncedCallback = (...args) => {
    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Set new timeout
    const newTimeoutId = setTimeout(() => {
      callback(...args);
    }, delay);

    setTimeoutId(newTimeoutId);
  };

  return debouncedCallback;
};

/**
 * Custom hook to debounce search input
 * @param {string} initialValue - Initial search value
 * @param {number} delay - Delay in milliseconds (default: 500ms)
 * @returns {Object} - { searchTerm, debouncedSearchTerm, setSearchTerm }
 */
export const useDebouncedSearch = (initialValue = '', delay = 500) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const debouncedSearchTerm = useDebounce(searchTerm, delay);

  return {
    searchTerm,
    debouncedSearchTerm,
    setSearchTerm,
  };
};

export default useDebounce;