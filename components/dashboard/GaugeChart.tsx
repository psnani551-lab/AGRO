'use client';

import { motion } from 'framer-motion';
import { IconType } from 'react-icons';

interface Props {
  title: string;
  value: number;
  icon: IconType;
  maxValue?: number;
}

export default function GaugeChart({ title, value, icon: Icon, maxValue = 100 }: Props) {
  const percentage = (value / maxValue) * 100;
  const getColor = () => {
    if (percentage >= 70) return 'text-green-500';
    if (percentage >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700"
    >
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-5 w-5 text-gray-500" />
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
      </div>
      <div className="relative flex items-center justify-center">
        <svg className="w-32 h-32 transform -rotate-90">
          <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="none" className="text-gray-200 dark:text-gray-700" />
          <circle
            cx="64" cy="64" r="56"
            stroke="currentColor" strokeWidth="12" fill="none"
            strokeDasharray={`${percentage * 3.52} 352`}
            strokeLinecap="round"
            className={getColor()}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className={`text-3xl font-bold ${getColor()}`}>{value}</span>
          <span className="text-xs text-gray-500">/ {maxValue}</span>
        </div>
      </div>
    </motion.div>
  );
}
