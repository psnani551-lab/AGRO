'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
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
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link
        href={href}
        className="group block rounded-lg border border-white/20 bg-white/10 p-6 shadow-lg backdrop-blur-md transition-all hover:bg-white/20 hover:shadow-xl hover:scale-105"
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 text-white transition-colors group-hover:bg-white group-hover:text-black">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="mb-2 text-xl font-semibold text-white">
          {t(`sectors.${toolKey}`)}
        </h3>
        <p className="text-sm text-gray-100">
          {t(`sectors.${toolKey}Desc`)}
        </p>
      </Link>
    </motion.div>
  );
}
