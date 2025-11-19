// ============================================
// ALERT COMPONENT
// ============================================

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCheckCircle, 
  FaExclamationCircle, 
  FaInfoCircle, 
  FaExclamationTriangle,
  FaTimes 
} from 'react-icons/fa';

// ============================================
// ALERT VARIANTS
// ============================================
const ALERT_VARIANTS = {
  success: {
    icon: FaCheckCircle,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    iconColor: 'text-green-500',
    progressColor: 'bg-green-500',
  },
  error: {
    icon: FaExclamationCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    iconColor: 'text-red-500',
    progressColor: 'bg-red-500',
  },
  warning: {
    icon: FaExclamationTriangle,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-800',
    iconColor: 'text-yellow-500',
    progressColor: 'bg-yellow-500',
  },
  info: {
    icon: FaInfoCircle,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    iconColor: 'text-blue-500',
    progressColor: 'bg-blue-500',
  },
};

// ============================================
// ALERT COMPONENT
// ============================================
const Alert = ({
  type = 'info',
  title,
  message,
  onClose,
  showIcon = true,
  dismissible = true,
  autoClose = false,
  autoCloseDuration = 5000,
  className = '',
  action,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  const variant = ALERT_VARIANTS[type];
  const Icon = variant.icon;

  // ============================================
  // AUTO CLOSE LOGIC
  // ============================================
  useEffect(() => {
    if (!autoClose) return;

    const duration = autoCloseDuration;
    const interval = 50;
    const decrement = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - decrement;
        if (newProgress <= 0) {
          clearInterval(timer);
          handleClose();
          return 0;
        }
        return newProgress;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [autoClose, autoCloseDuration]);

  // ============================================
  // HANDLE CLOSE
  // ============================================
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 300);
  };

  // ============================================
  // ANIMATION VARIANTS
  // ============================================
  const alertVariants = {
    hidden: { 
      opacity: 0, 
      y: -20,
      scale: 0.95,
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        duration: 0.4,
      },
    },
    exit: { 
      opacity: 0, 
      x: 100,
      transition: {
        duration: 0.3,
      },
    },
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={alertVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={`relative rounded-lg border p-4 ${variant.bgColor} ${variant.borderColor} ${className}`}
          role="alert"
        >
          <div className="flex items-start gap-3">
            {/* Icon */}
            {showIcon && (
              <Icon className={`text-2xl ${variant.iconColor} flex-shrink-0 mt-0.5`} />
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              {title && (
                <h4 className={`font-semibold ${variant.textColor} mb-1`}>
                  {title}
                </h4>
              )}
              {message && (
                <p className={`text-sm ${variant.textColor} ${title ? 'opacity-90' : ''}`}>
                  {message}
                </p>
              )}

              {/* Action Button */}
              {action && (
                <div className="mt-3">
                  {action}
                </div>
              )}
            </div>

            {/* Close Button */}
            {dismissible && (
              <button
                onClick={handleClose}
                className={`flex-shrink-0 p-1 rounded-lg hover:bg-black hover:bg-opacity-10 transition-colors ${variant.textColor}`}
                aria-label="Close alert"
              >
                <FaTimes />
              </button>
            )}
          </div>

          {/* Auto-close Progress Bar */}
          {autoClose && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-10 rounded-b-lg overflow-hidden">
              <motion.div
                className={`h-full ${variant.progressColor}`}
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.05 }}
              />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============================================
// TOAST CONTAINER
// ============================================
export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md w-full">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Alert
            key={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => removeToast(toast.id)}
            dismissible={toast.dismissible !== false}
            autoClose={toast.autoClose !== false}
            autoCloseDuration={toast.duration || 5000}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// INLINE ALERTS (COMPACT VERSIONS)
// ============================================
export const InlineAlert = ({ type = 'info', message, className = '' }) => {
  const variant = ALERT_VARIANTS[type];
  const Icon = variant.icon;

  return (
    <div className={`flex items-center gap-2 p-3 rounded-lg ${variant.bgColor} ${variant.borderColor} border ${className}`}>
      <Icon className={`${variant.iconColor} flex-shrink-0`} />
      <p className={`text-sm ${variant.textColor}`}>{message}</p>
    </div>
  );
};

// ============================================
// SUCCESS ALERT
// ============================================
export const SuccessAlert = (props) => <Alert type="success" {...props} />;

// ============================================
// ERROR ALERT
// ============================================
export const ErrorAlert = (props) => <Alert type="error" {...props} />;

// ============================================
// WARNING ALERT
// ============================================
export const WarningAlert = (props) => <Alert type="warning" {...props} />;

// ============================================
// INFO ALERT
// ============================================
export const InfoAlert = (props) => <Alert type="info" {...props} />;

export default Alert;