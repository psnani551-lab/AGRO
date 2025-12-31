'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { IconType } from 'react-icons';
import { useI18n } from '@/lib/i18n';
import { slideUp } from '@/lib/anim';

interface ToolCardProps {
  icon: IconType;
  toolKey: string;
  href: string;
  index: number;
}

export default function ToolCard({ icon: Icon, toolKey, href, index }: ToolCardProps) {
  const { t } = useI18n();

  return (
    <motion.div
      variants={slideUp}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link
        href={href}
        className="group block h-full rounded-lg border border-white/20 bg-white/10 p-6 backdrop-blur-md transition-all duration-300 hover:border-white/40 hover:bg-white/20"
      >
        <Icon className="mb-4 h-8 w-8 text-primary-300 transition-colors group-hover:text-primary-200" />
        <h3 className="mb-2 text-xl font-bold text-white">
          {t(`tools.${toolKey}`)}
        </h3>
        <p className="text-sm text-gray-200">
          {t(`tools.${toolKey}Desc`)}
        </p>
      </Link>
    </motion.div>
  );
}