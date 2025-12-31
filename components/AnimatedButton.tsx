'use client';

import { useRef, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { pulseAnimation, useReducedMotion } from '@/lib/anim';

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  ariaLabel?: string;
  className?: string;
  disabled?: boolean;
}

export default function AnimatedButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  ariaLabel,
  className = '',
  disabled = false,
}: AnimatedButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const handleClick = () => {
    if (!prefersReducedMotion && buttonRef.current) {
      pulseAnimation(buttonRef.current);
    }
    onClick?.();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const variantClasses = {
    primary: 'bg-zinc-900 text-white hover:bg-black focus:ring-zinc-500 dark:bg-white dark:text-black dark:hover:bg-zinc-200',
    secondary: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 focus:ring-zinc-500 dark:bg-zinc-800 dark:text-white',
    outline: 'border-2 border-zinc-900 text-zinc-900 hover:bg-zinc-50 dark:border-white dark:text-white dark:hover:bg-white/10 focus:ring-zinc-500',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      ref={buttonRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileHover={prefersReducedMotion ? {} : { y: -2 }}
      transition={{ duration: 0.2 }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel}
      disabled={disabled}
      className={`
        rounded-lg font-semibold transition-colors
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {children}
    </motion.button>
  );
}
