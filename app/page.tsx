'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FiRefreshCw, FiDollarSign, FiBell, FiUser, FiGrid } from 'react-icons/fi';
import { GiPlantRoots } from 'react-icons/gi';
import VideoBackground from '@/components/VideoBackground';
import AnimatedButton from '@/components/AnimatedButton';
import ToolCard from '@/components/tools/ToolCard';
import { staggerContainer } from '@/lib/anim';
import { useI18n } from '@/lib/i18n';

const sectors = [
  { icon: FiUser, key: 'farmProfile', href: '/tools/farm-profile' },
  { icon: FiGrid, key: 'dashboard', href: '/dashboard' },
  { icon: FiBell, key: 'alerts', href: '/tools/alerts' },
  { icon: FiDollarSign, key: 'market', href: '/machinery-market' },
];

export default function HomePage() {
  const { t } = useI18n();
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/tools/farm-profile');
  };

  const handleOpenChat = () => {
    const chatButton = document.querySelector('[aria-label="Open chat"]') as HTMLButtonElement;
    if (chatButton) {
      chatButton.click();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.3, ease: [0.43, 0.13, 0.23, 0.96] }}
      className="min-h-screen"
    >
      <VideoBackground src="/videos/farming-bg.mp4" />

      {/* Hero Section */}
      <section className="relative flex min-h-[80vh] items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 1,
            delay: 0.6,
            ease: [0.43, 0.13, 0.23, 0.96]
          }}
          className="text-center"
        >
          <h1 className="mb-6 font-display text-5xl font-bold text-white md:text-6xl lg:text-7xl">
            {t('hero.title')}
          </h1>
          <p className="mb-8 text-xl text-gray-200 md:text-2xl">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <AnimatedButton
              variant="primary"
              size="lg"
              onClick={handleGetStarted}
              ariaLabel="Get started with farm profile setup"
              className="bg-white text-black hover:bg-zinc-200 border-none"
            >
              {t('hero.cta')}
            </AnimatedButton>
            <AnimatedButton
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white/10"
              onClick={handleOpenChat}
              ariaLabel="Open AI assistant chat"
            >
              {t('hero.chatCta')}
            </AnimatedButton>
          </div>
        </motion.div>
      </section>

      {/* Sectors Grid */}
      <section className="relative px-4 py-20">
        <div className="container mx-auto">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid gap-6 sm:grid-cols-2 max-w-5xl mx-auto"
          >
            {sectors.map((sector, index) => (
              <ToolCard
                key={sector.key}
                icon={sector.icon}
                toolKey={sector.key}
                href={sector.href}
                index={index}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-zinc-950 px-4 py-16 text-white border-t border-zinc-900">
        <div className="container mx-auto text-center">
          <h2 className="mb-4 text-3xl font-bold">{t('hero.ctaTitle')}</h2>
          <p className="mb-8 text-lg text-zinc-400">
            {t('hero.ctaSubtitle')}
          </p>
          <AnimatedButton
            variant="secondary"
            size="lg"
            onClick={handleOpenChat}
            ariaLabel="Start chatting with AI assistant"
            className="bg-white text-black hover:bg-zinc-200"
          >
            {t('hero.ctaButton')}
          </AnimatedButton>
        </div>
      </section>
    </motion.div>
  );
}
