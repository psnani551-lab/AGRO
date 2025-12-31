'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import { FarmProfile } from '@/lib/farmTypes';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import UltimateDashboard from '@/components/dashboard/UltimateDashboard';

import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';

export default function DashboardPage() {
  const { t } = useI18n();
  const [farmProfile, setFarmProfile] = useState<FarmProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      // 1. Get User or fallback to Guest ID
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || '00000000-0000-0000-0000-000000000000';

      const { data, error } = await supabase
        .from('farm_profiles')
        .select('*')
        .eq('user_id', userId)
        .single(); // Using .eq('user_id') is safer than generic order()

      if (data) {
        setFarmProfile(data);
      }
      setIsLoading(false);
    };
    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-500 border-t-transparent" />
      </div>
    );
  }

  if (!farmProfile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('dashboard.setupProfile')}</h1>
          <p className="text-gray-600 mb-8">
            Please set up your farm profile to get personalized insights, weather forecasts, and crop recommendations.
          </p>
          <Link href="/tools/farm-profile" className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl">
            Get Started <FiArrowRight className="ml-2" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      <DashboardHeader farmProfile={farmProfile} />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* THE ULTIMATE ONE-STOP DASHBOARD */}
          <UltimateDashboard farmProfile={farmProfile} />

        </motion.div>
      </main>
    </div>
  );
}
