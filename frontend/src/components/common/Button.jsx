// ============================================
// BUTTON COMPONENT
// ============================================

import React from 'react';
import { motion } from 'framer-motion';
import Loader from './Loader';

// ============================================
// BUTTON VARIANTS
// ============================================
const BUTTON_VARIANTS = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white border-transparent focus:ring-blue-500',
  secondary: 'bg-gray-600 hover:bg-gray-700 text-white border-transparent focus:ring-gray-500',
  success: 'bg-green-600 hover:bg-green-700 text-white border-transparent focus:ring-green-500',
  danger: 'bg-red-600 hover:bg-red-700 text-white border-transparent focus:ring-red-500',
  warning: 'bg-yellow-600 hover:bg-yellow-700 text-white border-transparent focus:ring-yellow-500',
  info: 'bg-cyan-600 hover:bg-cyan-700 text-white border-transparent focus:ring-cyan-500',
  
  outline: 'bg-transparent hover:bg-gray-50 text-gray-700 border-gray-300 focus:ring-blue-500',
  outlinePrimary: 'bg-transparent hover:bg-blue-50 text-blue-600 border-blue-600 focus:ring-blue-500',
  outlineSuccess: 'bg-transparent hover:bg-green-50 text-green-600 border-green-600 focus:ring-green-500',
  outlineDanger: 'bg-transparent hover:bg-red-50 text-red-600 border-red-600 focus:ring-red-500',
  
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 border-transparent focus:ring-gray-500',
  ghostPrimary: 'bg-transparent hover:bg-blue-50 text-blue-600 border-transparent focus:ring-blue-500',
  
  link: 'bg-transparent hover:underline text-blue-600 border-transparent p-0 focus:ring-0',
};

// ============================================
// BUTTON SIZES
// ============================================
const BUTTON_SIZES = {
  xs: 'px-2.5 py-1.5 text-xs',
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
  xl: 'px-6 py-3.5 text-lg',
};

// ============================================
// BUTTON COMPONENT
// ============================================
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  loading = false,
  loadingText = 'Loading...',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  rounded = 'md',
  className = '',
  onClick,
  animate = true,
  ...props
}) => {
  // ============================================
  // BUILD CLASS NAMES
  // ============================================
  const baseStyles = 'inline-flex items-center justify-center font-medium border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantStyles = BUTTON_VARIANTS[variant] || BUTTON_VARIANTS.primary;
  const sizeStyles = BUTTON_SIZES[size] || BUTTON_SIZES.md;
  
  const roundedStyles = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    full: 'rounded-full',
  }[rounded] || 'rounded-lg';
  
  const widthStyles = fullWidth ? 'w-full' : '';
  
  const buttonClasses = `${baseStyles} ${variantStyles} ${sizeStyles} ${roundedStyles} ${widthStyles} ${className}`;

  // ============================================
  // HANDLE CLICK
  // ============================================
  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  // ============================================
  // RENDER CONTENT
  // ============================================
  const renderContent = () => {
    if (loading) {
      return (
        <>
          <Loader size="small" color={variant.includes('outline') || variant.includes('ghost') ? 'blue' : 'white'} />
          {loadingText && <span className="ml-2">{loadingText}</span>}
        </>
      );
    }

    return (
      <>
        {icon && iconPosition === 'left' && (
          <span className={children ? 'mr-2' : ''}>{icon}</span>
        )}
        {children}
        {icon && iconPosition === 'right' && (
          <span className={children ? 'ml-2' : ''}>{icon}</span>
        )}
      </>
    );
  };

  // ============================================
  // RENDER BUTTON
  // ============================================
  const ButtonElement = (
    <button
      type={type}
      disabled={disabled || loading}
      className={buttonClasses}
      onClick={handleClick}
      {...props}
    >
      {renderContent()}
    </button>
  );

  // ============================================
  // WITH OR WITHOUT ANIMATION
  // ============================================
  if (animate && !disabled && !loading) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={fullWidth ? 'w-full' : 'inline-block'}
      >
        {ButtonElement}
      </motion.div>
    );
  }

  return ButtonElement;
};

// ============================================
// ICON BUTTON
// ============================================
export const IconButton = ({
  icon,
  variant = 'ghost',
  size = 'md',
  rounded = 'full',
  className = '',
  ariaLabel,
  ...props
}) => {
  const sizeStyles = {
    xs: 'p-1.5',
    sm: 'p-2',
    md: 'p-2.5',
    lg: 'p-3',
    xl: 'p-4',
  }[size] || 'p-2.5';

  return (
    <Button
      variant={variant}
      size={size}
      rounded={rounded}
      className={`${sizeStyles} ${className}`}
      aria-label={ariaLabel}
      {...props}
    >
      {icon}
    </Button>
  );
};

// ============================================
// BUTTON GROUP
// ============================================
export const ButtonGroup = ({ children, className = '', spacing = 'none' }) => {
  const spacingStyles = {
    none: 'space-x-0 [&>*:not(:first-child)]:rounded-l-none [&>*:not(:last-child)]:rounded-r-none [&>*:not(:first-child)]:border-l-0',
    sm: 'space-x-2',
    md: 'space-x-3',
    lg: 'space-x-4',
  }[spacing] || 'space-x-0';

  return (
    <div className={`inline-flex ${spacingStyles} ${className}`}>
      {children}
    </div>
  );
};

// ============================================
// LOADING BUTTON
// ============================================
export const LoadingButton = ({ loading, children, ...props }) => {
  return (
    <Button loading={loading} {...props}>
      {children}
    </Button>
  );
};

// ============================================
// SOCIAL BUTTONS
// ============================================
export const GoogleButton = ({ children = 'Continue with Google', ...props }) => (
  <Button
    variant="outline"
    icon={
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    }
    {...props}
  >
    {children}
  </Button>
);

export const FacebookButton = ({ children = 'Continue with Facebook', ...props }) => (
  <Button
    variant="outline"
    icon={
      <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    }
    {...props}
  >
    {children}
  </Button>
);

export const GithubButton = ({ children = 'Continue with GitHub', ...props }) => (
  <Button
    variant="outline"
    icon={
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
      </svg>
    }
    {...props}
  >
    {children}
  </Button>
);

export default Button;