'use client';

import { useState, useEffect, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { FarmProfile } from '@/lib/farmTypes';
import { useI18n } from '@/lib/i18n';

// Lazy load heavy components
const WeatherIcon = dynamic(() => import('@/components/WeatherIcon'), {
  loading: () => <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />,
});

const LineChart = dynamic(() => import('recharts').then(mod => ({ default: mod.LineChart })), { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => ({ default: mod.Line })), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => ({ default: mod.XAxis })), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => ({ default: mod.YAxis })), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => ({ default: mod.CartesianGrid })), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => ({ default: mod.Tooltip })), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => ({ default: mod.ResponsiveContainer })), { ssr: false });

interface Props {
  farmProfile: FarmProfile | null;
}

// Mock data for charts
const weeklyWeatherData = [
  { day: 'Mon', temp: 28, humidity: 65, rainfall: 0, condition: 'Sunny' },
  { day: 'Tue', temp: 30, humidity: 60, rainfall: 0, condition: 'Clear' },
  { day: 'Wed', temp: 27, humidity: 75, rainfall: 15, condition: 'Rainy' },
  { day: 'Thu', temp: 25, humidity: 85, rainfall: 25, condition: 'Thunderstorm' },
  { day: 'Fri', temp: 26, humidity: 70, rainfall: 5, condition: 'Cloudy' },
  { day: 'Sat', temp: 29, humidity: 55, rainfall: 0, condition: 'Partly Cloudy' },
  { day: 'Sun', temp: 31, humidity: 50, rainfall: 0, condition: 'Sunny' },
];

const yieldComparisonData = [
  { month: 'Jan', thisYear: 0, lastYear: 0 },
  { month: 'Feb', thisYear: 0, lastYear: 0 },
  { month: 'Mar', thisYear: 120, lastYear: 100 },
  { month: 'Apr', thisYear: 280, lastYear: 250 },
  { month: 'May', thisYear: 450, lastYear: 400 },
  { month: 'Jun', thisYear: 520, lastYear: 480 },
];

const cropDistributionData = [
  { name: 'Rice', value: 40, color: '#22c55e' },
  { name: 'Wheat', value: 25, color: '#f59e0b' },
  { name: 'Cotton', value: 20, color: '#3b82f6' },
  { name: 'Vegetables', value: 15, color: '#8b5cf6' },
];

const irrigationData = [
  { week: 'W1', used: 1200, optimal: 1000 },
  { week: 'W2', used: 950, optimal: 1000 },
  { week: 'W3', used: 1100, optimal: 1000 },
  { week: 'W4', used: 800, optimal: 1000 },
];

const ChartsSection = memo(function ChartsSection({ farmProfile }: Props) {
  const { t } = useI18n();
  const [hasData, setHasData] = useState(false);
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const weatherData = localStorage.getItem('weatherData');
      const yieldData = localStorage.getItem('yieldHistory');
      const irrigationHistory = localStorage.getItem('irrigationHistory');
      
      const hasAnyData = weatherData || yieldData || irrigationHistory || farmProfile;
      setHasData(!!hasAnyData);
      
      if (hasAnyData) {
        setChartData({
          weather: weatherData ? JSON.parse(weatherData) : weeklyWeatherData,
          yield: yieldData ? JSON.parse(yieldData) : yieldComparisonData,
          irrigation: irrigationHistory ? JSON.parse(irrigationHistory) : irrigationData,
        });
      }
    }
  }, [farmProfile]);

  const weatherData = useMemo(() => chartData?.weather || weeklyWeatherData, [chartData]);
  const yieldData = useMemo(() => chartData?.yield || yieldComparisonData, [chartData]);
  const irrigationDataMemo = useMemo(() => chartData?.irrigation || irrigationData, [chartData]);

  if (!hasData) {
    return (
      <div className="rounded-xl bg-gray-50 border-2 border-dashed border-gray-300 p-12 text-center dark:bg-gray-800 dark:border-gray-600">
        <div className="mx-auto max-w-md">
          <div className="text-4xl mb-4">📈</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('dashboard.analyticsComingSoon')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t('dashboard.analyticsMessage')}
          </p>
          <a
            href="/tools/climate"
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            {t('dashboard.checkWeather')}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Weather Forecast - Full Width, Sleek Design */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 p-6 border border-blue-100 dark:border-gray-700"
      >
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('dashboard.weatherForecast')}</h3>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
          {weatherData.map((day: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="group relative flex flex-col items-center p-4 rounded-xl bg-white/60 dark:bg-gray-700/50 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">
                {day.day}
              </p>
              <div className="transform group-hover:scale-110 transition-transform duration-300">
                <WeatherIcon 
                  condition={day.condition || (day.temp > 30 ? 'Sunny' : day.humidity > 80 ? 'Rainy' : 'Cloudy')} 
                  size={48}
                />
              </div>
              <div className="mt-3 text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {day.temp}°
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  💧 {day.humidity}%
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Yield & Crops - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Yield Comparison - Minimalist Line Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-white dark:bg-gray-800 p-6 border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-6 bg-green-500 rounded-full"></div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('dashboard.yieldComparison')}</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={yieldData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorThisYear" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: 'none', 
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="thisYear" 
                name="This Year" 
                stroke="#22c55e" 
                strokeWidth={3} 
                dot={{ fill: '#22c55e', r: 5 }} 
                activeDot={{ r: 7 }}
              />
              <Line 
                type="monotone" 
                dataKey="lastYear" 
                name="Last Year" 
                stroke="#d1d5db" 
                strokeWidth={2} 
                strokeDasharray="5 5"
                dot={{ fill: '#d1d5db', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Crop Distribution - Modern Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-white dark:bg-gray-800 p-6 border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('dashboard.cropDistribution')}</h3>
          </div>
          <div className="space-y-3">
            {cropDistributionData.map((crop, index) => (
              <motion.div
                key={crop.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: crop.color }}
                    ></div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{crop.name}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{crop.value}%</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${crop.value}%` }}
                    transition={{ duration: 1, delay: 0.5 + index * 0.1, ease: "easeOut" }}
                    className="h-full rounded-full transition-all duration-300 group-hover:opacity-80"
                    style={{ backgroundColor: crop.color }}
                  ></motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Water Usage - Minimalist Bar Visualization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl bg-gradient-to-br from-cyan-50 via-blue-50 to-sky-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 p-6 border border-cyan-100 dark:border-gray-700"
      >
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1 h-6 bg-cyan-500 rounded-full"></div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('dashboard.waterUsage')}</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {irrigationDataMemo.map((week: any, index: number) => (
            <motion.div
              key={week.week}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="relative"
            >
              <div className="bg-white/60 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl p-4 hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 hover:shadow-lg">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">{week.week}</p>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Used</span>
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{week.used}L</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(week.used / 1500) * 100}%` }}
                        transition={{ duration: 1, delay: 0.6 + index * 0.1 }}
                        className="h-full bg-blue-500 rounded-full"
                      ></motion.div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Target</span>
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">{week.optimal}L</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(week.optimal / 1500) * 100}%` }}
                        transition={{ duration: 1, delay: 0.6 + index * 0.1 }}
                        className="h-full bg-green-500 rounded-full"
                      ></motion.div>
                    </div>
                  </div>
                </div>
                {week.used <= week.optimal && (
                  <div className="mt-3 flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                    <span>✓</span>
                    <span>Efficient</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
});

export default ChartsSection;
