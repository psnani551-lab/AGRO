'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiRefreshCw, FiAlertCircle, FiCheckCircle, FiDroplet, FiTrendingUp, FiActivity } from 'react-icons/fi';
import { useI18n } from '@/lib/i18n';
import { storage } from '@/lib/storage';

export default function ProfessionalDashboard() {
  const { t, locale } = useI18n();
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [marketData, setMarketData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchProfessionalData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const farmProfile = storage.getFarmProfile();
      
      if (!farmProfile || !farmProfile.location) {
        setError('Please complete your farm profile first');
        setLoading(false);
        return;
      }

      // Fetch weather data
      const locationString = typeof farmProfile.location === 'string' 
        ? farmProfile.location 
        : farmProfile.location?.address || 'Mumbai, India';
      
      const weatherResponse = await fetch('/api/weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: locationString }),
      });

      if (!weatherResponse.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const weather = await weatherResponse.json();
      setWeatherData(weather);
      storage.save('weatherData', weather.forecast);

      // Generate PROFESSIONAL analysis
      const analysisResponse = await fetch('/api/analysis-pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          farmProfile, 
          weatherData: weather,
          plantingDate: farmProfile.plantingDate || new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          locale: locale
        }),
      });

      if (!analysisResponse.ok) {
        throw new Error('Failed to generate professional analysis');
      }

      const analysisData = await analysisResponse.json();
      setAnalysis(analysisData);

      // Fetch market prices
      const cropId = farmProfile.currentCrops?.[0]?.toLowerCase() || 'rice';
      const marketResponse = await fetch('/api/market-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'single',
          cropId: cropId,
          yieldKg: analysisData.yieldForecast?.estimatedYield || 0,
          landHectares: farmProfile.landSize || 1
        }),
      });

      if (marketResponse.ok) {
        const market = await marketResponse.json();
        setMarketData(market);
        storage.save('marketData', market);
      }

      // Store professional data
      storage.save('irrigationPlanPro', analysisData.irrigationPlan);
      storage.save('yieldForecastPro', analysisData.yieldForecast);
      storage.save('diseaseRiskPro', analysisData.diseaseRisk);
      storage.save('sustainabilityMetrics', { ecoScore: analysisData.ecoScore });

    } catch (err: any) {
      console.error('Professional Dashboard Error:', err);
      setError(err.message || 'Failed to load professional analysis');
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    fetchProfessionalData();
  }, [fetchProfessionalData]);

  if (loading) {
    return (
      <div className="rounded-xl bg-white p-8 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center justify-center gap-3">
          <FiRefreshCw className="h-6 w-6 animate-spin text-primary-600" />
          <p className="text-gray-600 dark:text-gray-400">
            {t('dashboard.loading')}
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
              {t('dashboard.unableToLoad')}
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mb-4">{error}</p>
            <button
              onClick={fetchProfessionalData}
              className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              {t('dashboard.tryAgain')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Professional Success Message */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-4 border border-green-200 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-800"
      >
        <div className="flex items-center gap-3">
          <FiCheckCircle className="h-5 w-5 text-green-600" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-green-900 dark:text-green-200">
              ⭐ {t('dashboard.irrigationPlan')}
            </p>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
              {weatherData?.location} • {analysis?.irrigationPlan?.cropName} • {analysis?.irrigationPlan?.calculation} • {analysis?.irrigationPlan?.reliability}% {t('dashboard.reliability')}
            </p>
          </div>
          <button
            onClick={fetchProfessionalData}
            className="text-green-600 hover:text-green-700 dark:text-green-400"
            title="Refresh analysis"
          >
            <FiRefreshCw className="h-4 w-4" />
          </button>
        </div>
      </motion.div>

      {/* Simplified Irrigation Plan */}
      {analysis?.irrigationPlan && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl bg-blue-50 p-6 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
              <FiDroplet className="h-5 w-5" />
              💧 Watering Plan
            </h3>
            <span className="text-xs bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100 px-2 py-1 rounded-full">
              {analysis.irrigationPlan.reliability}% Accurate
            </span>
          </div>

          {/* Simple Action Items */}
          <div className="space-y-4">
            {/* When to Water */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-blue-500">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">WHEN</p>
              <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                {analysis.irrigationPlan.wateringSchedule}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Best time: Early morning (6-8 AM)
              </p>
            </div>

            {/* How Much Water */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-blue-500">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">HOW MUCH</p>
              <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                {analysis.irrigationPlan.amountPerIrrigation} per session
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Weekly total: {analysis.irrigationPlan.weeklyTotal}
              </p>
            </div>

            {/* Water Need (Daily) */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-cyan-500">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">DAILY WATER NEED</p>
              <p className="text-xl font-bold text-cyan-900 dark:text-cyan-100">
                {analysis.irrigationPlan.irrigationNeed}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Based on crop type and weather
              </p>
            </div>

            {/* Crop Water Requirement */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-teal-500">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">CROP WATER USE</p>
              <p className="text-xl font-bold text-teal-900 dark:text-teal-100">
                {analysis.irrigationPlan.etc}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Evapotranspiration rate for your crop
              </p>
            </div>

            {/* Growth Stage */}
            <div className="bg-blue-100 dark:bg-blue-900/40 rounded-lg p-3">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                🌱 Your crop is in <strong>{analysis.irrigationPlan.growthStage}</strong> stage ({analysis.irrigationPlan.daysAfterPlanting} days old)
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Simplified Disease Risk */}
      {analysis?.diseaseRisk && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`rounded-xl p-6 border ${
            analysis.diseaseRisk.level === 'High' 
              ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
              : analysis.diseaseRisk.level === 'Medium'
              ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
              : 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold flex items-center gap-2 ${
              analysis.diseaseRisk.level === 'High' ? 'text-red-900 dark:text-red-100' :
              analysis.diseaseRisk.level === 'Medium' ? 'text-yellow-900 dark:text-yellow-100' :
              'text-green-900 dark:text-green-100'
            }`}>
              <FiActivity className="h-5 w-5" />
              {analysis.diseaseRisk.level === 'High' ? '⚠️ High Risk' : 
               analysis.diseaseRisk.level === 'Medium' ? '⚡ Medium Risk' : 
               '✅ Low Risk'}
            </h3>
            <span className={`text-xs px-2 py-1 rounded-full ${
              analysis.diseaseRisk.level === 'High' ? 'bg-red-200 dark:bg-red-800 text-red-900 dark:text-red-100' :
              analysis.diseaseRisk.level === 'Medium' ? 'bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100' :
              'bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100'
            }`}>
              {analysis.diseaseRisk.reliability}% Accurate
            </span>
          </div>

          {/* Main Message */}
          <div className={`mb-4 p-4 rounded-lg border-l-4 ${
            analysis.diseaseRisk.level === 'High' ? 'bg-white dark:bg-gray-800 border-red-500' :
            analysis.diseaseRisk.level === 'Medium' ? 'bg-white dark:bg-gray-800 border-yellow-500' :
            'bg-white dark:bg-gray-800 border-green-500'
          }`}>
            <p className={`text-base font-semibold mb-2 ${
              analysis.diseaseRisk.level === 'High' ? 'text-red-900 dark:text-red-100' :
              analysis.diseaseRisk.level === 'Medium' ? 'text-yellow-900 dark:text-yellow-100' :
              'text-green-900 dark:text-green-100'
            }`}>
              {analysis.diseaseRisk.level === 'High' ? 'Take Action Now!' : 
               analysis.diseaseRisk.level === 'Medium' ? 'Monitor Closely' : 
               'Your Crop is Healthy'}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {analysis.diseaseRisk.level === 'High' ? 'Weather conditions favor disease spread. Immediate prevention needed.' : 
               analysis.diseaseRisk.level === 'Medium' ? 'Some risk present. Keep watching for symptoms.' : 
               'Current conditions are good. Continue regular care.'}
            </p>
          </div>

          {/* Top Threat (if any) */}
          {analysis.diseaseRisk.diseases?.[0] && analysis.diseaseRisk.level !== 'Low' && (
            <div className={`p-4 rounded-lg ${
              analysis.diseaseRisk.level === 'High' ? 'bg-red-100 dark:bg-red-900/40' :
              'bg-yellow-100 dark:bg-yellow-900/40'
            }`}>
              <h4 className={`font-semibold mb-2 ${
                analysis.diseaseRisk.level === 'High' ? 'text-red-900 dark:text-red-100' :
                'text-yellow-900 dark:text-yellow-100'
              }`}>
                Watch Out: {analysis.diseaseRisk.diseases[0].name}
              </h4>
              <div className="space-y-2 text-sm">
                <p className={`${
                  analysis.diseaseRisk.level === 'High' ? 'text-red-800 dark:text-red-200' :
                  'text-yellow-800 dark:text-yellow-200'
                }`}>
                  <strong>What to do:</strong> {analysis.diseaseRisk.diseases[0].prevention?.[0] || 'Monitor regularly'}
                </p>
                <p className={`${
                  analysis.diseaseRisk.level === 'High' ? 'text-red-700 dark:text-red-300' :
                  'text-yellow-700 dark:text-yellow-300'
                }`}>
                  <strong>Natural solution:</strong> {analysis.diseaseRisk.diseases[0].organicControl?.[0] || 'Use organic methods'}
                </p>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Yield Forecast */}
      {analysis?.yieldForecast?.crops && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl bg-purple-50 p-6 border border-purple-200 dark:bg-purple-900/20 dark:border-purple-800"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 flex items-center gap-2">
              <FiTrendingUp className="h-5 w-5" />
              {t('yield.yieldForecast')}
            </h3>
            <span className="text-xs bg-purple-200 dark:bg-purple-800 text-purple-900 dark:text-purple-100 px-2 py-1 rounded-full">
              {analysis.yieldForecast.crops[0]?.confidence}% {t('dashboard.confidence')}
            </span>
          </div>

          {analysis.yieldForecast.crops.map((crop: any, index: number) => (
            <div key={index} className="bg-purple-100 dark:bg-purple-900/40 rounded-lg p-4 mb-3">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-purple-900 dark:text-purple-100">{crop.crop}</h4>
                <span className="text-sm text-purple-700 dark:text-purple-300">
                  {t('dashboard.yieldGap')}: {crop.yieldGap}
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                <div>
                  <p className="text-xs text-purple-700 dark:text-purple-300">{t('dashboard.estimatedYield')}</p>
                  <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
                    {crop.estimatedYield.toLocaleString()} kg
                  </p>
                </div>
                <div>
                  <p className="text-xs text-purple-700 dark:text-purple-300">{t('yield.yieldPerAcre')}</p>
                  <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
                    {crop.yieldPerAcre} kg
                  </p>
                </div>
                <div>
                  <p className="text-xs text-purple-700 dark:text-purple-300">{t('dashboard.potentialYield')}</p>
                  <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
                    {crop.potentialYield.toLocaleString()} kg
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(crop.factors).map(([key, value]: [string, any]) => (
                  <div key={key} className="text-center">
                    <p className="text-xs text-purple-700 dark:text-purple-300 capitalize">{key}</p>
                    <p className={`text-sm font-semibold ${
                      value.startsWith('+') ? 'text-green-600' : 
                      value.startsWith('-') ? 'text-red-600' : 
                      'text-gray-600'
                    }`}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Simplified Recommendations - Show Top 3 Only */}
      {analysis?.recommendations && analysis.recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl bg-gradient-to-br from-gray-50 to-blue-50 p-6 border border-gray-200 dark:from-gray-800 dark:to-gray-800 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            💡 Quick Actions
          </h3>
          <div className="space-y-3">
            {analysis.recommendations.slice(0, 3).map((rec: any, index: number) => (
              <div key={index} className={`p-4 rounded-lg border-l-4 bg-white dark:bg-gray-800 ${
                rec.priority === 'critical' ? 'border-red-500' :
                rec.priority === 'high' ? 'border-orange-500' :
                'border-blue-500'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-lg ${
                    rec.priority === 'critical' ? '🚨' :
                    rec.priority === 'high' ? '⚡' :
                    '✓'
                  }`}></span>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex-1">
                    {rec.title}
                  </h4>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 ml-7">
                  → {rec.action}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Market Prices */}
      {marketData?.data && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 p-6 border border-green-200 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-800"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 flex items-center gap-2">
              <FiTrendingUp className="h-5 w-5" />
              {t('dashboard.marketPrices')}
            </h3>
            <span className="text-xs px-2 py-1 rounded-full bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100">
              {marketData.reliability}% {t('dashboard.reliability')}
            </span>
          </div>

          {/* Current Price */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-green-100 dark:bg-green-900/40 rounded-lg p-4">
              <p className="text-xs text-green-700 dark:text-green-300 mb-1">{t('dashboard.currentPrice')}</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                ₹{marketData.data.currentPrice.modal}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">{t('market.pricePerKg')}</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/40 rounded-lg p-4">
              <p className="text-xs text-green-700 dark:text-green-300 mb-1">{t('dashboard.priceRange')}</p>
              <p className="text-lg font-semibold text-green-900 dark:text-green-100">
                ₹{marketData.data.currentPrice.min} - ₹{marketData.data.currentPrice.max}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">market variation</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/40 rounded-lg p-4">
              <p className="text-xs text-green-700 dark:text-green-300 mb-1">{t('dashboard.profitMargin')}</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {marketData.data.economics.profitMargin}%
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">expected</p>
            </div>
          </div>

          {/* Profitability Analysis */}
          {marketData.profitability && (
            <div className="bg-green-100 dark:bg-green-900/40 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3">
                💰 {t('dashboard.profitabilityAnalysis')}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <p className="text-xs text-green-700 dark:text-green-300">{t('dashboard.revenue')}</p>
                  <p className="font-bold text-green-900 dark:text-green-100">
                    ₹{marketData.profitability.revenue.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-green-700 dark:text-green-300">{t('dashboard.cost')}</p>
                  <p className="font-bold text-green-900 dark:text-green-100">
                    ₹{marketData.profitability.cost.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-green-700 dark:text-green-300">{t('dashboard.profit')}</p>
                  <p className="font-bold text-green-900 dark:text-green-100">
                    ₹{marketData.profitability.profit.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-green-700 dark:text-green-300">{t('dashboard.roi')}</p>
                  <p className="font-bold text-green-900 dark:text-green-100">
                    {marketData.profitability.roi.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Price Forecast */}
          <div className="bg-green-100 dark:bg-green-900/40 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3">
              🔮 {t('dashboard.priceForecast')}
            </h4>
            <div className="space-y-2">
              {marketData.data.forecast.map((forecast: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">
                      {forecast.month}
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300">
                      {forecast.factors.slice(0, 2).join(', ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-900 dark:text-green-100">
                      ₹{forecast.predictedPrice}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      {forecast.confidence}% confidence
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Major Markets */}
          <div className="bg-green-100 dark:bg-green-900/40 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
              🏪 {t('dashboard.majorMarkets')}
            </h4>
            <div className="flex flex-wrap gap-2">
              {marketData.data.marketInfo.majorMarkets.map((market: string, index: number) => (
                <span key={index} className="text-xs px-2 py-1 bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100 rounded">
                  {market}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Data Source Footer */}
      <div className="text-center text-xs text-gray-500 dark:text-gray-400">
        {t('dashboard.dataSource')}: {analysis?.metadata?.dataSource} • {t('dashboard.lastUpdated')}: {new Date(analysis?.metadata?.analysisDate).toLocaleString()}
      </div>
    </div>
  );
}
