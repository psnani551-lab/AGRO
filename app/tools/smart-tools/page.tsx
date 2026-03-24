'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { FarmProfile } from '@/lib/farmTypes';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import SmartToolsPanel from '@/components/dashboard/SmartToolsPanel';

export default function SmartToolsPage() {
  const { t } = useI18n();
  const [farmProfile, setFarmProfile] = useState<FarmProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Local State for Smart Tools
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
          deviceId: farmProfile?.pump_device_id || `${farmProfile?.id}-PUMP`,
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
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-black">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-700 border-t-white" />
      </div>
    );
  }

  if (!farmProfile) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-black flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold text-white mb-4">{t('dashboard.setupProfile')}</h1>
          <p className="text-zinc-400 mb-8">
            Please set up your farm profile to use Smart Farm Tools.
          </p>
          <Link href="/tools/farm-profile" className="inline-flex items-center px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all shadow-lg">
            Get Started <FiArrowRight className="ml-2" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-black px-4 sm:px-6 lg:px-8 py-8 pb-32">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
           <Link href="/dashboard" className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-all">
             <FiArrowLeft className="w-5 h-5" />
           </Link>
           <div>
             <h1 className="text-3xl font-bold text-white tracking-tight">Smart Farm Tools</h1>
             <p className="text-zinc-500 text-sm mt-1">Dedicated workspace for IoT, Vision, and Hardware setups.</p>
           </div>
        </div>

        <SmartToolsPanel 
            farmProfile={farmProfile} 
            isPumpLoading={isPumpLoading}
            setIsPumpLoading={setIsPumpLoading}
            pumpStatus={pumpStatus}
            setPumpStatus={setPumpStatus}
            visionAnalysis={visionAnalysis}
            setVisionAnalysis={setVisionAnalysis}
            onStartPump={handleStartPump}
        />
      </div>
    </div>
  );
}
