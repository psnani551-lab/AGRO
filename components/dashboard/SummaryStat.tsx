'use client';

import { motion } from 'framer-motion';
import { IconType } from 'react-icons';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';

interface Props {
  icon: IconType;
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
}

export default function SummaryStat({ icon: Icon, title, value, change, changeType }: Props) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700"
    >
      <div className="flex items-center justify-between">
        <div className="rounded-lg bg-primary-100 p-3 dark:bg-primary-900/30">
          <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${
          changeType === 'increase' ? 'text-green-600' : changeType === 'decrease' ? 'text-red-600' : 'text-gray-500'
        }`}>
          {changeType === 'increase' ? <FiArrowUp /> : changeType === 'decrease' ? <FiArrowDown /> : null}
          {change}
        </div>
      </div>
      <h3 className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
      <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </motion.div>
  );
}
