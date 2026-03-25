'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { FarmProfile } from '@/lib/farmTypes';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import UltimateDashboard from '@/components/dashboard/UltimateDashboard';
import SmartToolsPanel from '@/components/dashboard/SmartToolsPanel';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';

export default function DashboardPage() {
  const { t } = useI18n();
  const [farmProfile, setFarmProfile] = useState<FarmProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Shared State for Interlinking
  const [isPumpLoading, setIsPumpLoading] = useState(false);
  const [pumpStatus, setPumpStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [visionAnalysis, setVisionAnalysis] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || '00000000-0000-0000-0000-000000000000';

      const { data } = await supabase
        .from('farm_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (data) {
        setFarmProfile(data);
        try { localStorage.setItem('farmProfile', JSON.stringify(data)); } catch (e) {}
      }
      setIsLoading(false);
    };
    fetchProfile();
  }, []);

  const handleStartPump = async (durationMin = 30) => {
    setIsPumpLoading(true);
    setPumpStatus(null);
    try {
      const response = await fetch('/api/iot/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: 'PUMP-01',
          action: 'START',
          farmId: farmProfile?.id,
          userId: farmProfile?.user_id,
          durationMin,
        }),
      });
      const result = await response.json();
      setPumpStatus({
        success: response.ok,
        message: response.ok ? '✅ Pump command sent. Waiting for confirmation...' : result.error,
      });
    } catch {
      setPumpStatus({ success: false, message: '❌ Failed to reach pump gateway' });
    } finally {
      setIsPumpLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-700 border-t-white" />
      </div>
    );
  }

  if (!farmProfile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold text-white mb-4">{t('dashboard.setupProfile')}</h1>
          <p className="text-zinc-400 mb-8">
            Please set up your farm profile to get personalized insights, weather forecasts, and crop recommendations.
          </p>
          <Link href="/tools/farm-profile" className="inline-flex items-center px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all shadow-lg">
            Get Started <FiArrowRight className="ml-2" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      <DashboardHeader farmProfile={farmProfile} />
      {/* Original Rich Dashboard — weather, yield, market prices, etc. */}
      <UltimateDashboard 
        farmProfile={farmProfile} 
        onStartPump={handleStartPump}
        isPumpLoading={isPumpLoading}
        pumpStatus={pumpStatus}
        visionAnalysis={visionAnalysis}
        setVisionAnalysis={setVisionAnalysis}
      />
    </div>
  );
}
