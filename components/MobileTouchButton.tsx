'use client';

import { ReactNode, ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';

interface MobileTouchButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
}

/**
 * Mobile-optimized touch button
 * Large touch targets (min 44x44px), haptic feedback, loading states
 */
export default function MobileTouchButton({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  fullWidth = false,
  loading = false,
  disabled,
  className = '',
  ...props
}: MobileTouchButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400 dark:bg-gray-700 dark:text-gray-100',
    success: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 shadow-sm',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800',
  };
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm min-h-[40px]',
    md: 'px-6 py-3 text-base min-h-[44px]',
    lg: 'px-8 py-4 text-lg min-h-[52px]',
  };
  
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && <span className="text-xl">{icon}</span>}
          {children}
        </>
      )}
    </motion.button>
  );
}

/**
 * Mobile-optimized icon button
 */
export function MobileIconButton({
  icon,
  label,
  variant = 'ghost',
  ...props
}: {
  icon: ReactNode;
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost';
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'>) {
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      className={`p-3 rounded-xl transition-all active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center ${variantClasses[variant]}`}
      aria-label={label}
      {...props}
    >
      <span className="text-xl">{icon}</span>
    </motion.button>
  );
}

/**
 * Mobile-optimized floating action button (FAB)
 */
export function MobileFAB({
  icon,
  label,
  onClick,
  position = 'bottom-right',
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
}) {
  const positionClasses = {
    'bottom-right': 'bottom-20 right-4 md:bottom-8 md:right-8',
    'bottom-left': 'bottom-20 left-4 md:bottom-8 md:left-8',
    'bottom-center': 'bottom-20 left-1/2 -translate-x-1/2 md:bottom-8',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`fixed ${positionClasses[position]} z-20 bg-primary-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-shadow min-w-[56px] min-h-[56px] flex items-center justify-center`}
      aria-label={label}
    >
      <span className="text-2xl">{icon}</span>
    </motion.button>
  );
}
