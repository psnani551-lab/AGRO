
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FiUser, FiBell, FiRefreshCw, FiDollarSign, FiChevronDown, FiMenu, FiX, FiGrid, FiShoppingBag, FiZap, FiHome, FiInfo } from 'react-icons/fi';
import { GiPlantRoots } from 'react-icons/gi';
import { IconType } from 'react-icons';
import { useI18n } from '@/lib/i18n';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import MobileNavBar from '@/components/MobileNavBar';




export default function Navigation() {
  const { t } = useI18n();
  const pathname = usePathname();
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isToolsActive = pathname?.startsWith('/tools');

  // Close dropdown when clicking outside
  const handleClickOutside = () => {
    setIsToolsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-30 border-b border-gray-200/50 bg-white/80 backdrop-blur-md dark:border-gray-700/50 dark:bg-gray-900/80">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
            <div className="relative w-12 h-12 overflow-hidden rounded-full border border-gray-200 shadow-sm dark:border-gray-700">
              <Image
                src="/logo.png"
                alt="AGRO"
                fill
                className="object-cover"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden gap-6 md:flex">
            <Link
              href="/"
              className={`relative flex items-center gap-1 text-sm font-medium transition-colors ${pathname === '/'
                ? 'text-black dark:text-white'
                : 'text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white'
                }`}
            >
              <FiHome className="h-4 w-4" />
              {t('nav.home')}
              {pathname === '/' && (
                <span className="absolute -bottom-1 left-0 h-0.5 w-full bg-black dark:bg-white" />
              )}
            </Link>

            <Link
              href="/tools/farm-profile"
              className={`relative flex items-center gap-1 text-sm font-medium transition-colors ${pathname === '/tools/farm-profile'
                ? 'text-black dark:text-white'
                : 'text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white'
                }`}
            >
              <FiUser className="h-4 w-4" />
              {t('tools.farmProfile')}
              {pathname === '/tools/farm-profile' && (
                <span className="absolute -bottom-1 left-0 h-0.5 w-full bg-black dark:bg-white" />
              )}
            </Link>

            <Link
              href="/tools/alerts"
              className={`relative flex items-center gap-1 text-sm font-medium transition-colors ${pathname === '/tools/alerts'
                ? 'text-black dark:text-white'
                : 'text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white'
                }`}
            >
              <FiBell className="h-4 w-4" />
              {t('tools.alerts')}
              {pathname === '/tools/alerts' && (
                <span className="absolute -bottom-1 left-0 h-0.5 w-full bg-black dark:bg-white" />
              )}
            </Link>

            <Link
              href="/tools/smart-tools"
              className={`relative flex items-center gap-1 text-sm font-medium transition-colors ${pathname === '/tools/smart-tools'
                ? 'text-black dark:text-white'
                : 'text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white'
                }`}
            >
              <FiZap className="h-4 w-4" />
              Smart Tools
              {pathname === '/tools/smart-tools' && (
                <span className="absolute -bottom-1 left-0 h-0.5 w-full bg-black dark:bg-white" />
              )}
            </Link>

            <Link
              href="/dashboard"
              className={`relative flex items-center gap-1 text-sm font-medium transition-colors ${pathname === '/dashboard'
                ? 'text-black dark:text-white'
                : 'text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white'
                }`}
            >
              <FiGrid className="h-4 w-4" />
              {t('nav.dashboard')}
              {pathname === '/dashboard' && (
                <span className="absolute -bottom-1 left-0 h-0.5 w-full bg-black dark:bg-white" />
              )}
            </Link>

            <Link
              href="/machinery-market"
              className={`relative flex items-center gap-1 text-sm font-medium transition-colors ${pathname?.startsWith('/machinery-market')
                ? 'text-black dark:text-white'
                : 'text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white'
                }`}
            >
              <FiShoppingBag className="h-4 w-4" />
              {t('nav.marketplace')}
              {pathname?.startsWith('/machinery-market') && (
                <span className="absolute -bottom-1 left-0 h-0.5 w-full bg-black dark:bg-white" />
              )}
            </Link>

            <Link
              href="/about"
              className={`relative flex items-center gap-1 text-sm font-medium transition-colors ${pathname === '/about'
                ? 'text-black dark:text-white'
                : 'text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white'
                }`}
            >
              <FiInfo className="h-4 w-4" />
              {t('nav.about')}
              {pathname === '/about' && (
                <span className="absolute -bottom-1 left-0 h-0.5 w-full bg-black dark:bg-white" />
              )}
            </Link>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />


          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden rounded-xl p-2.5 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all active:scale-95"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 md:hidden">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col gap-2">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${pathname === '/'
                  ? 'bg-zinc-100 text-black dark:bg-zinc-800 dark:text-white'
                  : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900'
                  }`}
              >
                <FiHome className="h-4 w-4" />
                {t('nav.home')}
              </Link>

              <Link
                href="/tools/farm-profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${pathname === '/tools/farm-profile'
                  ? 'bg-zinc-100 text-black dark:bg-zinc-800 dark:text-white'
                  : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900'
                  }`}
              >
                <FiUser className="h-4 w-4" />
                {t('tools.farmProfile')}
              </Link>

              <Link
                href="/tools/alerts"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${pathname === '/tools/alerts'
                  ? 'bg-zinc-100 text-black dark:bg-zinc-800 dark:text-white'
                  : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900'
                  }`}
              >
                <FiBell className="h-4 w-4" />
                {t('tools.alerts')}
              </Link>

              <Link
                href="/tools/smart-tools"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${pathname === '/tools/smart-tools'
                  ? 'bg-zinc-100 text-black dark:bg-zinc-800 dark:text-white'
                  : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900'
                  }`}
              >
                <FiZap className="h-4 w-4" />
                Smart Tools
              </Link>

              <Link
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${pathname === '/dashboard'
                  ? 'bg-zinc-100 text-black dark:bg-zinc-800 dark:text-white'
                  : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900'
                  }`}
              >
                <FiGrid className="h-4 w-4" />
                {t('nav.dashboard')}
              </Link>

              <Link
                href="/machinery-market"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${pathname?.startsWith('/machinery-market')
                  ? 'bg-zinc-100 text-black dark:bg-zinc-800 dark:text-white'
                  : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900'
                  }`}
              >
                <FiShoppingBag className="h-4 w-4" />
                {t('nav.marketplace')}
              </Link>

              <Link
                href="/about"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${pathname === '/about'
                  ? 'bg-zinc-100 text-black dark:bg-zinc-800 dark:text-white'
                  : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900'
                  }`}
              >
                <FiInfo className="h-4 w-4" />
                {t('nav.about')}
              </Link>


            </div>
          </div>
        </div>
      )}
      <MobileNavBar />
    </nav>
  );
}
