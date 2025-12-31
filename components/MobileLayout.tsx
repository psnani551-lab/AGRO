'use client';

import { ReactNode } from 'react';

interface MobileLayoutProps {
  children: ReactNode;
}

/**
 * Mobile-optimized layout wrapper
 * Adds proper spacing for top nav and bottom nav on mobile
 */
export default function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <div className="min-h-screen">
      {/* Top spacing for fixed header */}
      <div className="h-16" />
      
      {/* Main content with bottom padding for mobile nav */}
      <main className="pb-20 md:pb-8">
        {children}
      </main>
    </div>
  );
}
