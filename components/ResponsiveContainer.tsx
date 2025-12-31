'use client';

import { ReactNode } from 'react';

interface ResponsiveContainerProps {
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Responsive container with mobile-first design
 * Automatically adjusts padding and max-width for different screen sizes
 */
export default function ResponsiveContainer({
  children,
  maxWidth = 'xl',
  padding = 'md',
  className = '',
}: ResponsiveContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full',
  };

  const paddingClasses = {
    none: '',
    sm: 'px-3 py-2 md:px-4 md:py-3',
    md: 'px-4 py-4 md:px-6 md:py-6',
    lg: 'px-4 py-6 md:px-8 md:py-8',
  };

  return (
    <div className={`mx-auto w-full ${maxWidthClasses[maxWidth]} ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
}

/**
 * Mobile-optimized section with spacing
 */
export function ResponsiveSection({
  children,
  title,
  subtitle,
  className = '',
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <section className={`mb-6 md:mb-8 ${className}`}>
      {(title || subtitle) && (
        <div className="mb-4 md:mb-6">
          {title && (
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

/**
 * Mobile-optimized grid with responsive columns
 */
export function ResponsiveGrid({
  children,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
  className = '',
}: {
  children: ReactNode;
  cols?: { mobile?: number; tablet?: number; desktop?: number };
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-4 md:gap-6',
    lg: 'gap-6 md:gap-8',
  };

  const colClasses = `grid-cols-${cols.mobile || 1} md:grid-cols-${cols.tablet || 2} lg:grid-cols-${cols.desktop || 3}`;

  return (
    <div className={`grid ${colClasses} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
}

/**
 * Mobile-optimized stack (vertical layout)
 */
export function ResponsiveStack({
  children,
  spacing = 'md',
  className = '',
}: {
  children: ReactNode;
  spacing?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const spacingClasses = {
    sm: 'space-y-2 md:space-y-3',
    md: 'space-y-4 md:space-y-6',
    lg: 'space-y-6 md:space-y-8',
  };

  return (
    <div className={`flex flex-col ${spacingClasses[spacing]} ${className}`}>
      {children}
    </div>
  );
}
