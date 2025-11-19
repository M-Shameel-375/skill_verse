// ============================================
// CARD COMPONENT
// ============================================

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// ============================================
// CARD COMPONENT
// ============================================
const Card = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'md',
  rounded = 'lg',
  border = true,
  hoverable = false,
  clickable = false,
  onClick,
  as = 'div',
  to,
  ...props
}) => {
  // ============================================
  // STYLES
  // ============================================
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  }[padding] || 'p-4';

  const shadowStyles = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  }[shadow] || 'shadow-md';

  const roundedStyles = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
  }[rounded] || 'rounded-lg';

  const borderStyles = border ? 'border border-gray-200' : '';
  const hoverStyles = hoverable ? 'hover:shadow-xl transition-shadow duration-300' : '';
  const cursorStyles = clickable || onClick ? 'cursor-pointer' : '';

  const baseStyles = `bg-white ${paddingStyles} ${shadowStyles} ${roundedStyles} ${borderStyles} ${hoverStyles} ${cursorStyles} ${className}`;

  // ============================================
  // HANDLE CLICK
  // ============================================
  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }
  };

  // ============================================
  // RENDER AS LINK
  // ============================================
  if (to) {
    return (
      <Link to={to} className="block">
        {hoverable ? (
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className={baseStyles}
            {...props}
          >
            {children}
          </motion.div>
        ) : (
          <div className={baseStyles} {...props}>
            {children}
          </div>
        )}
      </Link>
    );
  }

  // ============================================
  // RENDER AS BUTTON
  // ============================================
  if (clickable || onClick) {
    const Component = as === 'button' ? 'button' : 'div';
    
    return hoverable ? (
      <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
        <Component
          className={baseStyles}
          onClick={handleClick}
          type={as === 'button' ? 'button' : undefined}
          {...props}
        >
          {children}
        </Component>
      </motion.div>
    ) : (
      <Component
        className={baseStyles}
        onClick={handleClick}
        type={as === 'button' ? 'button' : undefined}
        {...props}
      >
        {children}
      </Component>
    );
  }

  // ============================================
  // RENDER AS DIV
  // ============================================
  return hoverable ? (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={baseStyles}
      {...props}
    >
      {children}
    </motion.div>
  ) : (
    <div className={baseStyles} {...props}>
      {children}
    </div>
  );
};

// ============================================
// CARD HEADER
// ============================================
export const CardHeader = ({ 
  children, 
  className = '',
  border = true,
  padding = 'md',
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4',
  }[padding] || 'px-4 py-3';

  const borderStyles = border ? 'border-b border-gray-200' : '';

  return (
    <div className={`${paddingStyles} ${borderStyles} ${className}`}>
      {children}
    </div>
  );
};

// ============================================
// CARD BODY
// ============================================
export const CardBody = ({ 
  children, 
  className = '',
  padding = 'md',
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }[padding] || 'p-4';

  return (
    <div className={`${paddingStyles} ${className}`}>
      {children}
    </div>
  );
};

// ============================================
// CARD FOOTER
// ============================================
export const CardFooter = ({ 
  children, 
  className = '',
  border = true,
  padding = 'md',
  bgGray = false,
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4',
  }[padding] || 'px-4 py-3';

  const borderStyles = border ? 'border-t border-gray-200' : '';
  const bgStyles = bgGray ? 'bg-gray-50' : '';

  return (
    <div className={`${paddingStyles} ${borderStyles} ${bgStyles} ${className}`}>
      {children}
    </div>
  );
};

// ============================================
// CARD TITLE
// ============================================
export const CardTitle = ({ 
  children, 
  className = '',
  as = 'h3',
}) => {
  const Component = as;
  
  return (
    <Component className={`text-lg font-semibold text-gray-900 ${className}`}>
      {children}
    </Component>
  );
};

// ============================================
// CARD DESCRIPTION
// ============================================
export const CardDescription = ({ 
  children, 
  className = '',
}) => {
  return (
    <p className={`text-sm text-gray-600 ${className}`}>
      {children}
    </p>
  );
};

// ============================================
// CARD IMAGE
// ============================================
export const CardImage = ({ 
  src, 
  alt, 
  className = '',
  aspectRatio = '16/9',
  objectFit = 'cover',
}) => {
  const ratioStyles = {
    '16/9': 'aspect-video',
    '4/3': 'aspect-4/3',
    '1/1': 'aspect-square',
    '3/4': 'aspect-3/4',
  }[aspectRatio] || 'aspect-video';

  const fitStyles = {
    cover: 'object-cover',
    contain: 'object-contain',
    fill: 'object-fill',
  }[objectFit] || 'object-cover';

  return (
    <div className={`${ratioStyles} overflow-hidden ${className}`}>
      <img 
        src={src} 
        alt={alt} 
        className={`w-full h-full ${fitStyles}`}
        loading="lazy"
      />
    </div>
  );
};

// ============================================
// CARD BADGE
// ============================================
export const CardBadge = ({ 
  children, 
  variant = 'primary',
  className = '',
}) => {
  const variants = {
    primary: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    gray: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

// ============================================
// STATS CARD
// ============================================
export const StatsCard = ({ 
  title, 
  value, 
  icon, 
  change,
  changeType = 'increase',
  className = '',
}) => {
  const changeColor = changeType === 'increase' ? 'text-green-600' : 'text-red-600';
  const changeIcon = changeType === 'increase' ? '↑' : '↓';

  return (
    <Card className={className} padding="lg">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <p className={`text-sm font-medium mt-2 ${changeColor}`}>
              {changeIcon} {change}
            </p>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-blue-100 rounded-lg">
            <div className="text-blue-600 text-2xl">{icon}</div>
          </div>
        )}
      </div>
    </Card>
  );
};

// ============================================
// EMPTY CARD
// ============================================
export const EmptyCard = ({ 
  icon, 
  title, 
  description, 
  action,
  className = '',
}) => {
  return (
    <Card className={`text-center ${className}`} padding="xl">
      {icon && (
        <div className="flex justify-center mb-4">
          <div className="text-gray-400 text-5xl">{icon}</div>
        </div>
      )}
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      )}
      {description && (
        <p className="text-gray-600 mb-4">{description}</p>
      )}
      {action && (
        <div className="mt-6">{action}</div>
      )}
    </Card>
  );
};

export default Card;