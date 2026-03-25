'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiGrid, FiShoppingBag, FiBell } from 'react-icons/fi';
import { useI18n } from '@/lib/i18n';
import { motion } from 'framer-motion';

export default function MobileNavBar() {
  const pathname = usePathname();
  const { t } = useI18n();

  const navItems = [
    { href: '/', icon: FiHome, label: t('nav.home') },
    { href: '/dashboard', icon: FiGrid, label: t('nav.dashboard') },
    { href: '/machinery-market', icon: FiShoppingBag, label: t('nav.marketplace') },
    { href: '/tools/alerts', icon: FiBell, label: t('tools.alerts') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 block border-t border-gray-200 bg-white/80 pb-safe backdrop-blur-lg dark:border-gray-800 dark:bg-gray-900/80 md:hidden">
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center gap-1 px-3 transition-colors ${
                isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <item.icon className={`h-6 w-6 ${isActive ? 'scale-110' : 'scale-100'} transition-transform`} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-3 h-1 w-6 rounded-full bg-primary-600 dark:bg-primary-400"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
