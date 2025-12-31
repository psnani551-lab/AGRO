'use client';

import { useI18n } from '@/lib/i18n';
import { FiMapPin, FiCalendar, FiLayers, FiFeather } from 'react-icons/fi';

interface Props {
  farmProfile: any; // Type as any for flexibility with Supabase shape
}

export default function DashboardHeader({ farmProfile }: Props) {
  const { t } = useI18n();
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  // Handle Supabase snake_case vs legacy camelCase
  const name = farmProfile?.farm_name || farmProfile?.farmName || t('dashboard.title');
  const location = farmProfile?.location_address || farmProfile?.location || 'Unknown Location';
  const size = farmProfile?.farm_size_acres || farmProfile?.farmSize || null;

  // Handle Crops Array safely
  let cropsDisplay = t('dashboard.noData');
  const crops = farmProfile?.current_crops || farmProfile?.currentCrops;

  if (Array.isArray(crops) && crops.length > 0) {
    cropsDisplay = crops.join(', ');
  } else if (typeof crops === 'string' && crops.length > 0) {
    cropsDisplay = crops;
  }

  return (
    <div className="relative overflow-hidden bg-zinc-900 border-b border-zinc-800">
      {/* Premium Dark Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/20 via-zinc-900 to-zinc-900 pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none transform translate-x-1/2 -translate-y-1/2" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="space-y-4">
            {/* Title with Gradient Text */}
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-white">
              {name}
            </h1>

            {/* Metadata Badges */}
            <div className="flex flex-wrap gap-3">
              {location && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/50 border border-zinc-700/50 text-zinc-300 text-sm backdrop-blur-sm">
                  <FiMapPin className="h-4 w-4 text-emerald-500" />
                  {location}
                </div>
              )}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/50 border border-zinc-700/50 text-zinc-300 text-sm backdrop-blur-sm">
                <FiCalendar className="h-4 w-4 text-emerald-500" />
                {today}
              </div>
              {size && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/50 border border-zinc-700/50 text-zinc-300 text-sm backdrop-blur-sm">
                  <FiLayers className="h-4 w-4 text-emerald-500" />
                  {size} {t('form.farmSize').split('(')[0].trim()}
                </div>
              )}
            </div>
          </div>

          {/* Current Crops Card */}
          <div className="md:min-w-[200px]">
            <div className="rounded-2xl bg-zinc-800/40 backdrop-blur-md p-4 border border-zinc-700/50 hover:border-emerald-500/30 transition-colors group">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                <FiFeather className="group-hover:text-emerald-400 transition-colors" />
                {t('form.currentCrops')}
              </p>
              <p className="font-bold text-white text-lg">
                {cropsDisplay}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
