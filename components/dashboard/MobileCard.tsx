'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface MobileCardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
  badge?: string;
  delay?: number;
}

/**
 * Mobile-optimized card component
 * Touch-friendly, responsive, and accessible
 */
export default function MobileCard({
  title,
  icon,
  children,
  color = 'blue',
  badge,
  delay = 0,
}: MobileCardProps) {
  const colorClasses = {
    blue: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800',
    green: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800',
    red: 'bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-800',
    yellow: 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-800',
    purple: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800',
    gray: 'bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 border-gray-200 dark:border-gray-700',
  };

  const textColorClasses = {
    blue: 'text-blue-900 dark:text-blue-100',
    green: 'text-green-900 dark:text-green-100',
    red: 'text-red-900 dark:text-red-100',
    yellow: 'text-yellow-900 dark:text-yellow-100',
    purple: 'text-purple-900 dark:text-purple-100',
    gray: 'text-gray-900 dark:text-gray-100',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className={`rounded-xl p-4 md:p-6 border ${colorClasses[color]} shadow-sm hover:shadow-md transition-shadow`}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon && <div className="text-xl md:text-2xl">{icon}</div>}
          <h3 className={`text-base md:text-lg font-semibold ${textColorClasses[color]}`}>
            {title}
          </h3>
        </div>
        {badge && (
          <span className="text-xs px-2 py-1 rounded-full bg-white/50 dark:bg-black/20 font-medium">
            {badge}
          </span>
        )}
      </div>

      {/* Card Content */}
      <div className="space-y-3">
        {children}
      </div>
    </motion.div>
  );
}

/**
 * Mobile-optimized stat display
 */
export function MobileStat({
  label,
  value,
  unit,
  icon,
}: {
  label: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-black/20 rounded-lg">
      <div className="flex items-center gap-2">
        {icon && <div className="text-lg">{icon}</div>}
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </span>
      </div>
      <div className="text-right">
        <span className="text-lg font-bold">{value}</span>
        {unit && <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">{unit}</span>}
      </div>
    </div>
  );
}

/**
 * Mobile-optimized list item
 */
export function MobileListItem({
  icon,
  title,
  subtitle,
  badge,
  onClick,
}: {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  badge?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-3 bg-white/50 dark:bg-black/20 rounded-lg ${
        onClick ? 'cursor-pointer hover:bg-white/70 dark:hover:bg-black/30 active:scale-98 transition-all' : ''
      }`}
    >
      {icon && <div className="text-xl flex-shrink-0">{icon}</div>}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">{title}</div>
        {subtitle && (
          <div className="text-xs text-gray-600 dark:text-gray-400 truncate">{subtitle}</div>
        )}
      </div>
      {badge && (
        <span className="text-xs px-2 py-1 rounded-full bg-white dark:bg-gray-800 font-medium flex-shrink-0">
          {badge}
        </span>
      )}
    </div>
  );
}

/**
 * Mobile-optimized grid layout
 */
export function MobileGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {children}
    </div>
  );
}
