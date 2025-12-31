'use client';

import { motion } from 'framer-motion';
import { IconType } from 'react-icons';

interface Props {
  title: string;
  risk: 'Low' | 'Medium' | 'High';
  icon: IconType;
}

export default function RiskLevel({ title, risk, icon: Icon }: Props) {
  const getRiskStyle = () => {
    switch (risk) {
      case 'Low': return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', bar: 'bg-green-500', level: 1 };
      case 'Medium': return { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', bar: 'bg-yellow-500', level: 2 };
      case 'High': return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', bar: 'bg-red-500', level: 3 };
    }
  };

  const style = getRiskStyle();

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700"
    >
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-5 w-5 text-gray-500" />
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
      </div>
      <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 ${style.bg}`}>
        <span className={`text-lg font-bold ${style.text}`}>{risk}</span>
      </div>
      <div className="mt-4 flex gap-1">
        {[1, 2, 3].map((level) => (
          <div key={level} className={`h-2 flex-1 rounded-full ${level <= style.level ? style.bar : 'bg-gray-200 dark:bg-gray-700'}`} />
        ))}
      </div>
    </motion.div>
  );
}
