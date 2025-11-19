// ============================================
// AXIOS CONFIGURATION & INTERCEPTORS
// ============================================

import axios from 'axios';
import config from '../config';
import { storage } from '../utils/helpers';

// ============================================
// CREATE AXIOS INSTANCE
// ============================================
const axiosInstance = axios.create({
  baseURL: config.api.baseURL,
  timeout: config.api.timeout,
  headers: config.api.headers,
});

// ============================================
// REQUEST INTERCEPTOR
// ============================================
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = storage.get(config.auth.tokenKey);

    // Add token to headers if it exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add timestamp to prevent caching
    config.headers['X-Request-Time'] = new Date().getTime();

    // Log request in development
    if (import.meta.env.MODE === 'development') {
      console.log('📤 API Request:', {
        method: config.method.toUpperCase(),
        url: config.url,
        data: config.data,
        params: config.params,
      });
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR
// ============================================
axiosInstance.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.MODE === 'development') {
      console.log('📥 API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }

    // Return data directly
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log error in development
    if (import.meta.env.MODE === 'development') {
      console.error('❌ Response Error:', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.response?.data?.message || error.message,
        data: error.response?.data,
      });
    }

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = storage.get(config.auth.refreshTokenKey);

        if (refreshToken) {
          const response = await axios.post(
            `${config.api.baseURL}/auth/refresh-token`,
            { refreshToken }
          );

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;

          // Save new tokens
          storage.set(config.auth.tokenKey, accessToken);
          storage.set(config.auth.refreshTokenKey, newRefreshToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - logout user
        storage.remove(config.auth.tokenKey);
        storage.remove(config.auth.refreshTokenKey);
        storage.remove(config.auth.userKey);

        // Redirect to login
        window.location.href = config.routes.login;
        return Promise.reject(refreshError);
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      // Redirect to unauthorized page
      window.location.href = config.routes.unauthorized;
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      console.warn('⚠️ Resource not found:', error.config.url);
    }

    // Handle 429 Too Many Requests
    if (error.response?.status === 429) {
      console.warn('⚠️ Rate limit exceeded. Please try again later.');
    }

    // Handle 500 Internal Server Error
    if (error.response?.status === 500) {
      console.error('❌ Server error. Please try again later.');
    }

    // Handle network errors
    if (!error.response) {
      console.error('❌ Network error. Please check your connection.');
    }

    // Format error response
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';

    const formattedError = {
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
      originalError: error,
    };

    return Promise.reject(formattedError);
  }
);

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Set authorization token
 */
export const setAuthToken = (token) => {
  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    storage.set(config.auth.tokenKey, token);
  } else {
    delete axiosInstance.defaults.headers.common['Authorization'];
    storage.remove(config.auth.tokenKey);
  }
};

/**
 * Remove authorization token
 */
export const removeAuthToken = () => {
  delete axiosInstance.defaults.headers.common['Authorization'];
  storage.remove(config.auth.tokenKey);
  storage.remove(config.auth.refreshTokenKey);
  storage.remove(config.auth.userKey);
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  const token = storage.get(config.auth.tokenKey);
  return !!token;
};

/**
 * Get current user from storage
 */
export const getCurrentUser = () => {
  return storage.get(config.auth.userKey);
};

/**
 * Upload file with progress
 */
export const uploadFile = (url, formData, onProgress) => {
  return axiosInstance.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    },
  });
};

/**
 * Download file
 */
export const downloadFile = (url, filename) => {
  return axiosInstance.get(url, {
    responseType: 'blob',
  }).then((response) => {
    const url = window.URL.createObjectURL(new Blob([response]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  });
};

/**
 * Cancel token source
 */
export const createCancelToken = () => {
  return axios.CancelToken.source();
};

/**
 * Check if error is cancel error
 */
export const isCancel = (error) => {
  return axios.isCancel(error);
};

// ============================================
// EXPORT DEFAULT INSTANCE
// ============================================
export default axiosInstance;