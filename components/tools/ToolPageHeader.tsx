'use client';

import { motion } from 'framer-motion';
import { IconType } from 'react-icons';
import { useI18n } from '@/lib/i18n';
import { fadeIn } from '@/lib/anim';

interface ToolPageHeaderProps {
  icon: IconType;
  titleKey: string;
  descriptionKey: string;
}

export default function ToolPageHeader({
  icon: Icon,
  titleKey,
  descriptionKey,
}: ToolPageHeaderProps) {
  const { t } = useI18n();

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={fadeIn}
      transition={{ duration: 0.6 }}
      className="px-4 py-12"
    >
      <div className="container mx-auto max-w-4xl text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm">
          <Icon className="h-10 w-10" />
        </div>

        {/* Title */}
        <h1 className="mb-4 font-display text-4xl font-bold text-white md:text-5xl">
          {t(titleKey)}
        </h1>

        {/* Description */}
        <p className="text-lg text-gray-100 md:text-xl">
          {t(descriptionKey)}
        </p>
      </div>
    </motion.div>
  );
}
