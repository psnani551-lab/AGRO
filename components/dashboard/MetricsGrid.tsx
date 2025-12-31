'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FarmProfile } from '@/lib/farmTypes';
import { useI18n } from '@/lib/i18n';
import { FiActivity, FiDroplet, FiTrendingUp } from 'react-icons/fi';
import { GiPlantRoots } from 'react-icons/gi';

interface Props {
  farmProfile: FarmProfile | null;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  gauge?: number;
  trend?: 'up' | 'down' | 'stable';
}

function MetricCard({ title, value, subtitle, icon, color, gauge, trend }: MetricCardProps) {
  const getTrendIcon = () => {
    if (trend === 'up') return '📈';
    if (trend === 'down') return '📉';
    return '➡️';
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700"
    >
      <div className="flex items-start justify-between">
        <div className={`rounded-lg p-3 ${color}`}>{icon}</div>
        {trend && <span className="text-2xl">{getTrendIcon()}</span>}
      </div>
      <h3 className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
      <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
      {gauge !== undefined && (
        <div className="mt-3">
          <div className="flex gap-0.5">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-sm ${i < gauge ? 'bg-current opacity-80' : 'bg-gray-200 dark:bg-gray-600'}`}
                style={{ color: i < gauge ? (gauge > 7 ? '#ef4444' : gauge > 4 ? '#f59e0b' : '#22c55e') : undefined }}
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function MetricsGrid({ farmProfile }: Props) {
  const { t } = useI18n();
  const [storedData, setStoredData] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load stored metrics from various tools
      const diseaseData = localStorage.getItem('diseaseRiskData');
      const irrigationData = localStorage.getItem('irrigationData');
      const yieldData = localStorage.getItem('yieldData');
      const sustainabilityData = localStorage.getItem('sustainabilityMetrics');
      
      setStoredData({
        disease: diseaseData ? JSON.parse(diseaseData) : null,
        irrigation: irrigationData ? JSON.parse(irrigationData) : null,
        yield: yieldData ? JSON.parse(yieldData) : null,
        sustainability: sustainabilityData ? JSON.parse(sustainabilityData) : null,
      });
    }
  }, []);

  // Calculate metrics from real data or show placeholder
  const hasData = farmProfile || storedData?.disease || storedData?.irrigation || storedData?.yield;
  
  if (!hasData) {
    return (
      <div className="rounded-xl bg-gray-50 border-2 border-dashed border-gray-300 p-12 text-center dark:bg-gray-800 dark:border-gray-600">
        <div className="mx-auto max-w-md">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('dashboard.noData')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t('dashboard.noDataMessage')}
          </p>
          <a
            href="/tools/farm-profile"
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            {t('dashboard.setupProfile')}
          </a>
        </div>
      </div>
    );
  }

  const diseaseRisk = storedData?.disease?.riskLevel === 'High' ? 8 : storedData?.disease?.riskLevel === 'Medium' ? 5 : 2;
  const soilMoisture = storedData?.irrigation?.soilMoisture || 50;
  const yieldTrend = storedData?.yield?.trend || 'stable';
  const ecoScore = storedData?.sustainability?.overallScore || 70;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">📊 {t('dashboard.metricsTitle')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title={t('dashboard.diseaseRisk')}
          value={diseaseRisk > 6 ? t('dashboard.high') : diseaseRisk > 3 ? t('dashboard.medium') : t('dashboard.low')}
          subtitle={`${t('dashboard.riskScore')}: ${diseaseRisk * 10}/100`}
          icon={<FiActivity className="h-6 w-6 text-white" />}
          color={diseaseRisk > 6 ? 'bg-red-500' : diseaseRisk > 3 ? 'bg-yellow-500' : 'bg-green-500'}
          gauge={diseaseRisk}
        />
        <MetricCard
          title={t('dashboard.soilMoisture')}
          value={`${soilMoisture}%`}
          subtitle={soilMoisture > 75 ? t('dashboard.wet') : soilMoisture > 40 ? t('dashboard.optimal') : t('dashboard.dry')}
          icon={<FiDroplet className="h-6 w-6 text-white" />}
          color="bg-blue-500"
          gauge={Math.round(soilMoisture / 10)}
        />
        <MetricCard
          title={t('dashboard.yieldForecast')}
          value={yieldTrend === 'up' ? '+12%' : yieldTrend === 'down' ? '-5%' : '0%'}
          subtitle={t('dashboard.vsLastSeason')}
          icon={<FiTrendingUp className="h-6 w-6 text-white" />}
          color="bg-purple-500"
          trend={yieldTrend}
        />
        <MetricCard
          title={t('dashboard.ecoScore')}
          value={`${ecoScore}/100`}
          subtitle={ecoScore > 80 ? t('dashboard.excellent') : ecoScore > 60 ? t('dashboard.good') : t('dashboard.needsImprovement')}
          icon={<GiPlantRoots className="h-6 w-6 text-white" />}
          color="bg-green-500"
          gauge={Math.round(ecoScore / 10)}
        />
      </div>
    </div>
  );
}
