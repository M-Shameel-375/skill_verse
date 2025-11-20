// Loader component
// ============================================
// LOADER COMPONENT
// ============================================

import React from 'react';
import { motion } from 'framer-motion';

// ============================================
// SPINNER LOADER
// ============================================
const SpinnerLoader = ({ size = 'medium', color = 'blue' }) => {
  const sizes = {
    small: 'w-4 h-4 border-2',
    medium: 'w-8 h-8 border-3',
    large: 'w-12 h-12 border-4',
    xlarge: 'w-16 h-16 border-4',
  };

  const colors = {
    blue: 'border-blue-600 border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-600 border-t-transparent',
    green: 'border-green-600 border-t-transparent',
    red: 'border-red-600 border-t-transparent',
  };

  return (
    <div
      className={`${sizes[size]} ${colors[color]} rounded-full animate-spin`}
    />
  );
};

// ============================================
// DOTS LOADER
// ============================================
const DotsLoader = ({ color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-600',
    white: 'bg-white',
    gray: 'bg-gray-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
  };

  return (
    <div className="flex space-x-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`w-2 h-2 rounded-full ${colors[color]}`}
          animate={{
            y: ['0%', '-50%', '0%'],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  );
};

// ============================================
// PULSE LOADER
// ============================================
const PulseLoader = ({ size = 'medium', color = 'blue' }) => {
  const sizes = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
  };

  const colors = {
    blue: 'bg-blue-600',
    white: 'bg-white',
    gray: 'bg-gray-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
  };

  return (
    <div className="relative">
      <motion.div
        className={`${sizes[size]} ${colors[color]} rounded-full opacity-75`}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.7, 0.3, 0.7],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
        }}
      />
      <motion.div
        className={`absolute top-0 left-0 ${sizes[size]} ${colors[color]} rounded-full`}
        animate={{
          scale: [1, 1.8, 1],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
        }}
      />
    </div>
  );
};

// ============================================
// SKELETON LOADER
// ============================================
export const SkeletonLoader = ({ className = '', count = 1 }) => {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-gray-200 rounded ${className}`}
        />
      ))}
    </>
  );
};

// ============================================
// FULL PAGE LOADER
// ============================================
export const FullPageLoader = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center">
        <SpinnerLoader size="xlarge" color="blue" />
        <p className="mt-4 text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
};

// ============================================
// OVERLAY LOADER
// ============================================
export const OverlayLoader = ({ message = 'Loading...' }) => {
  return (
    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
      <div className="text-center">
        <SpinnerLoader size="large" color="blue" />
        {message && <p className="mt-3 text-gray-600 text-sm">{message}</p>}
      </div>
    </div>
  );
};

// ============================================
// INLINE LOADER
// ============================================
export const InlineLoader = ({ size = 'small', color = 'blue', text = '' }) => {
  return (
    <div className="flex items-center gap-2">
      <SpinnerLoader size={size} color={color} />
      {text && <span className="text-sm text-gray-600">{text}</span>}
    </div>
  );
};

// ============================================
// CARD SKELETON LOADER
// ============================================
export const CardSkeletonLoader = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
          <div className="h-40 bg-gray-200 rounded-md mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
};

// ============================================
// TABLE SKELETON LOADER
// ============================================
export const TableSkeletonLoader = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="space-y-3">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex gap-4 animate-pulse">
          {[...Array(columns)].map((_, j) => (
            <div key={j} className="h-8 bg-gray-200 rounded flex-1"></div>
          ))}
        </div>
      ))}
    </div>
  );
};

// ============================================
// PROGRESS LOADER
// ============================================
export const ProgressLoader = ({ progress = 0, showPercentage = true }) => {
  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">Loading...</span>
        {showPercentage && (
          <span className="text-sm font-medium text-blue-600">{progress}%</span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div
          className="bg-blue-600 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
};

// ============================================
// MAIN LOADER COMPONENT
// ============================================
const Loader = ({ 
  type = 'spinner', 
  size = 'medium', 
  color = 'blue',
  className = '',
  ...props 
}) => {
  const loaders = {
    spinner: <SpinnerLoader size={size} color={color} />,
    dots: <DotsLoader color={color} />,
    pulse: <PulseLoader size={size} color={color} />,
  };

  return (
    <div className={`flex items-center justify-center ${className}`} {...props}>
      {loaders[type] || loaders.spinner}
    </div>
  );
};

export default Loader;