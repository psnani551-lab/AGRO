'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiRefreshCw, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { useI18n } from '@/lib/i18n';
import { storage } from '@/lib/storage';

export default function IntelligentDashboard() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchIntelligentData();
  }, []);

  const fetchIntelligentData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get farm profile from localStorage
      const farmProfile = storage.getFarmProfile();
      
      if (!farmProfile || !farmProfile.location) {
        setError('Please complete your farm profile first');
        setLoading(false);
        return;
      }

      // Fetch weather data based on location
      const weatherResponse = await fetch('/api/weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: farmProfile.location }),
      });

      if (!weatherResponse.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const weather = await weatherResponse.json();
      setWeatherData(weather);

      // Store weather data for charts
      storage.save('weatherData', weather.forecast);

      // Generate PROFESSIONAL intelligent analysis
      const analysisResponse = await fetch('/api/analysis-pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          farmProfile, 
          weatherData: weather,
          plantingDate: farmProfile.plantingDate || new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Default to 45 days ago
        }),
      });

      if (!analysisResponse.ok) {
        throw new Error('Failed to generate analysis');
      }

      const analysisData = await analysisResponse.json();
      setAnalysis(analysisData);

      // Store analysis data for dashboard components
      storage.save('irrigationPlan', analysisData.irrigationPlan);
      storage.save('yieldForecast', analysisData.yieldForecast);
      storage.save('diseaseRiskData', analysisData.diseaseRisk);
      storage.save('sustainabilityMetrics', { ecoScore: analysisData.ecoScore });

    } catch (err: any) {
      console.error('Intelligent Dashboard Error:', err);
      setError(err.message || 'Failed to load intelligent analysis');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl bg-white p-8 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center justify-center gap-3">
          <FiRefreshCw className="h-6 w-6 animate-spin text-primary-600" />
          <p className="text-gray-600 dark:text-gray-400">
            Analyzing your farm data and weather conditions...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-6 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
        <div className="flex items-start gap-3">
          <FiAlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900 dark:text-red-200 mb-2">
              Unable to Load Analysis
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mb-4">{error}</p>
            <button
              onClick={fetchIntelligentData}
              className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-green-50 p-4 border border-green-200 dark:bg-green-900/20 dark:border-green-800"
      >
        <div className="flex items-center gap-3">
          <FiCheckCircle className="h-5 w-5 text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-900 dark:text-green-200">
              Professional Analysis Complete ⭐
            </p>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
              {weatherData?.location} • {analysis?.irrigationPlan?.cropName} • {analysis?.irrigationPlan?.calculation} • Reliability: {analysis?.irrigationPlan?.reliability}%
            </p>
          </div>
          <button
            onClick={fetchIntelligentData}
            className="ml-auto text-green-600 hover:text-green-700 dark:text-green-400"
            title="Refresh analysis"
          >
            <FiRefreshCw className="h-4 w-4" />
          </button>
        </div>
      </motion.div>

      {/* Irrigation Plan */}
      {analysis?.irrigationPlan && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl bg-blue-50 p-6 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
        >
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
            💧 Intelligent Irrigation Plan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">Soil Type</p>
              <p className="font-semibold text-blue-900 dark:text-blue-100">
                {analysis.irrigationPlan.soilType} ({analysis.irrigationPlan.retention} retention)
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">Watering Schedule</p>
              <p className="font-semibold text-blue-900 dark:text-blue-100">
                {analysis.irrigationPlan.wateringSchedule}
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">Water Amount</p>
              <p className="font-semibold text-blue-900 dark:text-blue-100">
                {analysis.irrigationPlan.dailyWaterAmount} per session
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">Recommended Method</p>
              <p className="font-semibold text-blue-900 dark:text-blue-100">
                {analysis.irrigationPlan.method}
              </p>
            </div>
          </div>
          <div className="bg-blue-100 dark:bg-blue-900/40 rounded-lg p-3">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              💡 Tips for {analysis.irrigationPlan.soilType} Soil:
            </p>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              {analysis.irrigationPlan.tips?.map((tip: string, index: number) => (
                <li key={index}>• {tip}</li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}

      {/* Yield Forecast */}
      {analysis?.yieldForecast && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl bg-purple-50 p-6 border border-purple-200 dark:bg-purple-900/20 dark:border-purple-800"
        >
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-4">
            📈 Yield Forecast
          </h3>
          <div className="space-y-3 mb-4">
            {analysis.yieldForecast.crops?.map((crop: any, index: number) => (
              <div key={index} className="bg-purple-100 dark:bg-purple-900/40 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-purple-900 dark:text-purple-100">
                    {crop.crop}
                  </span>
                  <span className={`text-sm font-medium ${
                    crop.trend === 'up' ? 'text-green-600' : 
                    crop.trend === 'down' ? 'text-red-600' : 
                    'text-gray-600'
                  }`}>
                    {crop.trend === 'up' ? '↑' : crop.trend === 'down' ? '↓' : '→'} {crop.changePercent > 0 ? '+' : ''}{crop.changePercent}%
                  </span>
                </div>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Estimated: <span className="font-semibold">{crop.estimatedYield.toLocaleString()} {crop.unit}</span>
                </p>
              </div>
            ))}
          </div>
          <div className="bg-purple-100 dark:bg-purple-900/40 rounded-lg p-3">
            <p className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-2">
              Key Factors:
            </p>
            <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
              {Object.values(analysis.yieldForecast.factors).map((factor: any, index: number) => (
                <li key={index}>• {factor}</li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </div>
  );
}
