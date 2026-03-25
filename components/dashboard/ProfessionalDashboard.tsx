'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiRefreshCw, FiAlertCircle, FiCheckCircle, FiDroplet, FiTrendingUp, FiActivity, FiCpu, FiNavigation, FiAward, FiShield, FiZap, FiWifi, FiCamera, FiX } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useI18n } from '@/lib/i18n';
import { storage } from '@/lib/storage';
import ConnectSensor from './ConnectSensor';
import { ExportPortal } from './ExportPortal';

export default function ProfessionalDashboard({ farmProfile: farmProfileProp }: { farmProfile?: any }) {
  const { t, locale } = useI18n();
  const currentProfile = farmProfileProp || storage.getFarmProfile();
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [marketData, setMarketData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSensorSetup, setShowSensorSetup] = useState(false);
  const [farmId, setFarmId] = useState<string>('');
  const [satelliteData, setSatelliteData] = useState<any>(null);
  const [certificateData, setCertificateData] = useState<any>(null);
  
  // Vision Analytics State
  const [isVisionLoading, setIsVisionLoading] = useState(false);
  const [visionAnalysis, setVisionAnalysis] = useState<any>(null);
  const [isPumpLoading, setIsPumpLoading] = useState(false);
  const [pumpStatus, setPumpStatus] = useState<{success?: boolean, message?: string} | null>(null);
  const [currentCommandId, setCurrentCommandId] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  // Load cached data immediately on mount
  useEffect(() => {
    const profile = farmProfileProp || storage.getFarmProfile();
    if (profile?.id) setFarmId(profile.id);
    const cachedWeather = storage.get('weatherData');
    const cachedAnalysis = {
      irrigationPlan: storage.get('irrigationPlanPro'),
      yieldForecast: storage.get('yieldForecastPro'),
      diseaseRisk: storage.get('diseaseRiskPro'),
      ecoScore: storage.get('sustainabilityMetrics')?.ecoScore
    };
    const cachedMarket = storage.get('marketData');

    if (cachedWeather) setWeatherData({ forecast: cachedWeather });
    if (cachedAnalysis.irrigationPlan) setAnalysis(cachedAnalysis);
    if (cachedMarket) setMarketData(cachedMarket);
    
    // If we have some data, we can stop the initial full-page loader
    if (cachedAnalysis.irrigationPlan) {
      setLoading(false);
    }
  }, [farmProfileProp]);

  const fetchProfessionalData = useCallback(async () => {
    setError(null);
    setIsOffline(false);

    try {
      // ✅ USE PROP FIRST (from Supabase), fall back to localStorage
      const farmProfile = farmProfileProp || storage.getFarmProfile();
      
      if (!farmProfile) {
        setError('Please complete your farm profile first');
        setLoading(false);
        return;
      }

      // Extract location string from any format
      const locationString = typeof farmProfile.location === 'string'
        ? farmProfile.location
        : farmProfile.location?.address
        || farmProfile.city
        || farmProfile.district
        || 'Hyderabad, India';

      if (!locationString) {
        setError('Please add a location to your farm profile');
        setLoading(false);
        return;
      }

      let weather;
      try {
        const weatherResponse = await fetch('/api/weather', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ location: locationString }),
        });

        if (!weatherResponse.ok) throw new Error('Weather API error');
        weather = await weatherResponse.json();
        setWeatherData(weather);
        storage.save('weatherData', weather.forecast);
      } catch (e) {
        console.warn('Weather fetch failed, using cache');
        setIsOffline(true);
        weather = { forecast: storage.get('weatherData') };
        if (!weather.forecast) throw new Error('No weather data available');
      }

      // Generate PROFESSIONAL analysis
      try {
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

        if (!analysisResponse.ok) throw new Error('Analysis API error');
        const analysisData = await analysisResponse.json();
        setAnalysis(analysisData);
        
        // Store professional data
        storage.save('irrigationPlanPro', analysisData.irrigationPlan);
        storage.save('yieldForecastPro', analysisData.yieldForecast);
        storage.save('diseaseRiskPro', analysisData.diseaseRisk);
        storage.save('sustainabilityMetrics', { ecoScore: analysisData.ecoScore });
      } catch (e) {
        console.warn('Analysis fetch failed, using cache');
        setIsOffline(true);
        const cachedAnalysis = {
          irrigationPlan: storage.get('irrigationPlanPro'),
          yieldForecast: storage.get('yieldForecastPro'),
          diseaseRisk: storage.get('diseaseRiskPro'),
          ecoScore: storage.get('sustainabilityMetrics')?.ecoScore
        };
        if (cachedAnalysis.irrigationPlan) setAnalysis(cachedAnalysis);
      }

      // Fetch market prices
      try {
        const cropId = farmProfile.currentCrops?.[0]?.toLowerCase() || 'rice';
        const marketResponse = await fetch('/api/market-prices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'single',
            cropId: cropId,
            yieldKg: analysis?.yieldForecast?.estimatedYield || 0,
            landHectares: farmProfile?.landSize || 1
          }),
        });

        if (marketResponse.ok) {
          const market = await marketResponse.json();
          setMarketData(market);
          storage.save('marketData', market);
        }
      } catch (e) {
        console.warn('Market fetch failed');
      }

      // --- NEW: SATELLITE DATA FETCH ---
      try {
        const satResponse = await fetch('/api/satellite/ndvi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            farmId: farmProfile.id,
            polygonId: farmProfile.agro_monitoring_id,
            coords: farmProfile.polygon_coords, // [[lon, lat], ...]
            name: farmProfile.farmName || 'Farm Field'
          }),
        });

        if (satResponse.ok) {
          const sat = await satResponse.json();
          setSatelliteData(sat);
        }
      } catch (e) {
        console.warn('Satellite fetch failed');
      }

      // --- NEW: CERTIFICATE & TRUST FETCH ---
      try {
        const certResponse = await fetch('/api/export/certificate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ farmId: farmProfile.id }),
        });

        if (certResponse.ok) {
          const cert = await certResponse.json();
          setCertificateData(cert);
        }
      } catch (e) {
        console.warn('Certificate fetch failed');
      }

    } catch (err: any) {
      console.error('Professional Dashboard Error:', err);
      // Only show full error if we have NO data at all
      if (!analysis) {
        setError(err.message || 'Failed to load professional analysis');
      }
    } finally {
      setLoading(false);
    }
  }, [locale, analysis]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsVisionLoading(true);
    setVisionAnalysis(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result as string;
      try {
        const response = await fetch('/api/analysis/vision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64Image,
            sensorMoisture: analysis?.irrigationPlan?.liveSensor?.moisture || 0,
            satelliteNdvi: satelliteData?.health?.mean || 0,
            cropName: analysis?.irrigationPlan?.cropName || 'Crop'
          }),
        });

        if (response.ok) {
          const result = await response.json();
          setVisionAnalysis(result);
        } else {
          setError('Vision analysis failed. Please try again.');
        }
      } catch (err) {
        console.error('Vision API Error:', err);
      } finally {
        setIsVisionLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleStartPump = async () => {
    if (!analysis?.irrigationPlan?.actionable) return;
    
    setIsPumpLoading(true);
    setPumpStatus(null);
    
    try {
      const farmProfileStr = localStorage.getItem('farmProfile');
      const farmProfile = farmProfileStr ? JSON.parse(farmProfileStr) : null;
      
      const response = await fetch('/api/iot/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: 'PUMP-01',
          action: 'START',
          farmId: farmProfile?.id,
          userId: farmProfile?.user_id, // Pass userId for security check
          durationMin: analysis.irrigationPlan.actionable.pumpRunTime
        }),
      });

      const result = await response.json();
      setPumpStatus({ 
        success: response.ok, 
        message: response.ok ? 'Connection established. Waiting for pump ACK...' : result.error 
      });
      
      if (response.ok && result.commandId) {
        setCurrentCommandId(result.commandId);
      }
    } catch (err) {
      console.error('Pump Control Error:', err);
      setPumpStatus({ success: false, message: 'Failed to reach pump gateway' });
    } finally {
      setIsPumpLoading(false);
    }
  };

  // HANDSHAKE: Polling for Command Status
  useEffect(() => {
    if (!currentCommandId) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/iot/status?commandId=${currentCommandId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'EXECUTED') {
            setPumpStatus({ success: true, message: '✅ PUMP ACTIVE IN FIELD' });
            setCurrentCommandId(null);
            clearInterval(pollInterval);
            
            // Success animation or clear after delay
            setTimeout(() => setPumpStatus(null), 10000);
          } else if (data.status === 'FAILED') {
            setPumpStatus({ success: false, message: `❌ PUMP FAILED: ${data.error_log || 'Unknown error'}` });
            setCurrentCommandId(null);
            clearInterval(pollInterval);
          }
        }
      } catch (e) {
        console.error('Polling error:', e);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [currentCommandId]);

  useEffect(() => {
    fetchProfessionalData();
  }, [fetchProfessionalData]);

  if (loading) {
    // ... same loading UI ...
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

  // --- NEW: Sensor Setup View ---
  if (showSensorSetup) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setShowSensorSetup(false)}
          className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-2"
        >
          ← Back to Dashboard
        </button>
        <ConnectSensor farmId={farmId} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Sensor Toggle */}
      <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl text-primary-600 dark:text-primary-400">
                <FiActivity className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                  {analysis?.irrigationPlan?.cropName || 'Farm'} Field
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                   {weatherData?.location || storage.getFarmProfile()?.location?.address || storage.getFarmProfile()?.location || 'Your Farm'} • {analysis?.irrigationPlan?.growthStage || 'Initial'} Stage
                </p>
              </div>
            </div>

            {/* NEW: TRUST BADGE & CERTIFICATE TRIGGER */}
            {certificateData && (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col items-end mr-2">
                  <span className="text-[10px] font-bold text-primary-600 uppercase tracking-tighter">Farm Maturity</span>
                  <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">{certificateData.badge}</span>
                </div>
                <div className="relative group">
                  <div className="p-3 bg-gradient-to-tr from-yellow-400 to-yellow-600 rounded-full text-white shadow-lg shadow-yellow-100 dark:shadow-none cursor-pointer hover:scale-110 transition-transform">
                    <FiAward className="h-5 w-5" />
                    <div className="absolute -top-1 -right-1 h-4 w-4 bg-white rounded-full flex items-center justify-center border border-yellow-500">
                      <span className="text-[8px] font-bold text-yellow-600">{certificateData.trustScore}%</span>
                    </div>
                  </div>
                  {/* Tooltip */}
                  <div className="absolute top-full right-0 mt-2 w-48 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                    <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Impact Certificate</p>
                    <p className="text-xs text-gray-700 dark:text-gray-300 mb-2">Your data quality is rated at {certificateData.trustScore}%. Click to export.</p>
                    <button className="w-full py-1.5 bg-yellow-500 text-white text-[10px] font-bold rounded uppercase hover:bg-yellow-600">
                      Export Certificate
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
        <button
          onClick={() => setShowSensorSetup(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300 rounded-lg text-sm font-medium transition-colors border border-purple-200 dark:border-purple-800"
        >
          <FiCpu className="h-4 w-4" />
          Connect Sensor
        </button>
      </div>
      </div>

      {/* Professional Success Message */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-4 border border-green-200 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-800"
      >
        <div className="flex items-center gap-3">
          <FiCheckCircle className="h-5 w-5 text-green-600" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-green-900 dark:text-green-200">
                ⭐ {t('dashboard.irrigationPlan')}
              </p>
              {isOffline && (
                <span className="bg-orange-100 text-orange-800 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider dark:bg-orange-900/40 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                  Offline Mode
                </span>
              )}
            </div>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
              {weatherData?.location || 'Cached Location'} • {analysis?.irrigationPlan?.cropName} • {analysis?.irrigationPlan?.calculation} • {analysis?.irrigationPlan?.reliability}% {t('dashboard.reliability')}
            </p>
            {analysis?.irrigationPlan?.liveSensor && (
              <div className="mt-2 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px] font-bold dark:bg-blue-900/40 dark:text-blue-300 uppercase">
                  <FiDroplet className="h-3 w-3" />
                  Live Moisture: {analysis?.irrigationPlan?.liveSensor?.moisture}%
                </div>
                
                {analysis?.irrigationPlan?.liveSensor?.battery !== undefined && (
                  <div className={`flex items-center gap-1 text-[10px] font-bold ${analysis.irrigationPlan.liveSensor.battery < 3.4 ? 'text-red-500 animate-pulse' : 'text-gray-500'}`}>
                    <FiZap className="h-3 w-3" />
                    {analysis.irrigationPlan.liveSensor.battery.toFixed(1)}V
                  </div>
                )}

                {analysis?.irrigationPlan?.liveSensor?.signal !== undefined && (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500">
                    <FiWifi className="h-3 w-3" />
                    {analysis.irrigationPlan.liveSensor.signal} dBm
                  </div>
                )}

                <div className="text-[10px] text-gray-400 font-medium">
                  {analysis?.irrigationPlan?.liveSensor?.type?.toUpperCase()}
                </div>

                <div className="text-[10px] text-gray-500 italic">
                  Last seen: {analysis?.irrigationPlan?.liveSensor?.lastSeen ? new Date(analysis.irrigationPlan.liveSensor.lastSeen).toLocaleTimeString() : 'N/A'}
                </div>

                {/* Maintenance Alert */}
                {analysis?.irrigationPlan?.liveSensor && (analysis.irrigationPlan.liveSensor.battery < 3.4 || analysis.irrigationPlan.liveSensor.moisture > 98) && (
                  <div className="w-full mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded flex items-center gap-2">
                    <FiAlertCircle className="h-3 w-3 text-red-500" />
                    <span className="text-[10px] font-bold text-red-700 dark:text-red-400 uppercase tracking-tight">
                      Maintenance Required: Check sensor probe & battery
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          <button
            onClick={fetchProfessionalData}
            className={`text-green-600 hover:text-green-700 dark:text-green-400 ${loading ? 'animate-spin' : ''}`}
            title="Refresh analysis"
            disabled={loading}
          >
            <FiRefreshCw className="h-4 w-4" />
          </button>
        </div>
      </motion.div>

      {/* Weather Forecast Widget */}
      {weatherData?.forecast && weatherData.forecast.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 p-6 border border-sky-200 dark:from-sky-900/20 dark:to-blue-900/20 dark:border-sky-800"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-sky-900 dark:text-sky-100 flex items-center gap-2">
              🌤️ Weather Forecast
            </h3>
            <span className="text-xs text-sky-600 dark:text-sky-400 font-bold">
              {weatherData.location || 'Your Location'}
            </span>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {weatherData.forecast.slice(0, 5).map((day: any, index: number) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center border border-sky-100 dark:border-sky-900">
                <p className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase mb-1">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </p>
                <p className="text-2xl mb-1">
                  {day.condition?.includes('rain') || day.condition?.includes('Rain') ? '🌧️' :
                   day.condition?.includes('cloud') || day.condition?.includes('Cloud') ? '☁️' :
                   day.condition?.includes('thunder') ? '⛈️' : '☀️'}
                </p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {day.maxTemp ?? day.temperature ?? '--'}°C
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  {day.minTemp ? `${day.minTemp}° low` : day.condition ?? ''}
                </p>
                {day.rainfall > 0 && (
                  <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold mt-1">
                    💧 {day.rainfall}mm
                  </p>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

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
              {analysis?.irrigationPlan?.reliability || 0}% Accurate
            </span>
          </div>

          {/* NEW: ACTIONABLE PUMP METRIC */}
          {analysis?.irrigationPlan?.actionable && (
            <div className="mb-6 p-5 bg-gradient-to-br from-blue-600 to-primary-700 rounded-xl text-white shadow-lg shadow-blue-200 dark:shadow-none">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  <FiCpu className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Smart Pump Action</h4>
                  <p className="text-blue-100 text-xs">Based on your {analysis?.irrigationPlan?.actionable?.flowRateUsed || 0} LPM Pump</p>
                </div>
              </div>
              
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-blue-100 text-[10px] uppercase font-bold tracking-wider mb-1">Recommended Duration</p>
                  <p className="text-4xl font-extrabold flex items-baseline gap-1">
                    {analysis?.irrigationPlan?.actionable?.pumpRunTime || 0}
                    <span className="text-lg font-medium opacity-80 decoration-none">min.</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-blue-100 text-[10px] uppercase font-bold tracking-wider mb-1">Total Water</p>
                  <p className="text-xl font-bold">{(analysis?.irrigationPlan?.actionable?.totalLiters || 0).toLocaleString()} L</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1 opacity-80">
                  <FiCheckCircle className="h-3 w-3" /> System Efficiency: {Math.round((analysis?.irrigationPlan?.actionable?.efficiencyUsed || 0) * 100)}%
                </span>
                <button 
                  onClick={handleStartPump}
                  disabled={isPumpLoading}
                  className={`px-3 py-1 bg-white text-blue-700 font-bold rounded-lg hover:bg-blue-50 transition-colors ${isPumpLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isPumpLoading ? 'CONNECTING...' : 'START PUMP'}
                </button>
              </div>
              
              {pumpStatus && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-3 p-2 rounded text-[10px] font-bold text-center ${pumpStatus.success ? 'bg-green-400/20 text-green-50' : 'bg-red-400/20 text-red-50'}`}
                >
                  {pumpStatus.message}
                </motion.div>
              )}
            </div>
          )}
          
          {/* NEW: PHOTO VERIFICATION TRIGGER */}
            <div className="mt-6 border-t border-blue-100 dark:border-blue-900/30 pt-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-bold text-blue-900 dark:text-blue-100">Ground Reality Check</h4>
                  <p className="text-[10px] text-blue-700 dark:text-blue-400">Take a soil photo to verify sensor data with AI eyes</p>
                </div>
                <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-bold shadow-sm hover:shadow-md transition-all border border-blue-200 dark:border-blue-700">
                  <FiCamera className="h-4 w-4" />
                  {isVisionLoading ? 'Analyzing...' : 'Verify with Photo'}
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoUpload} disabled={isVisionLoading} />
                </label>
              </div>

              <AnimatePresence>
                {visionAnalysis && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800"
                  >
                    {/* Ceres Header */}
                    <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">✨</span>
                        <div>
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Ceres Vision Analysis</h4>
                          <p className="text-[9px] text-gray-500 font-medium">Real-time Visual Reasoning</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setVisionAnalysis(null)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                      >
                        <FiX className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>

                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        {visionAnalysis?.matchesDigitalData ? (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold dark:bg-green-900/40 dark:text-green-300">
                            <FiCheckCircle className="h-3 w-3" />
                            Confirmed Match
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-[10px] font-bold dark:bg-yellow-900/40 dark:text-yellow-300">
                            <FiAlertCircle className="h-3 w-3" />
                            Visual Variance Detected
                          </div>
                        )}
                        <span className="text-[10px] font-bold text-gray-400 uppercase">
                          {visionAnalysis?.confidence || 0}% Confidence
                        </span>
                      </div>

                      <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 mb-4 text-sm leading-relaxed">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {visionAnalysis?.reasoning || 'No reasoning available'}
                        </ReactMarkdown>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                        {visionAnalysis?.observations?.map((obs: string, idx: number) => (
                          <span key={idx} className="text-[9px] px-2 py-1 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 rounded-md border border-gray-100 dark:border-gray-800 font-medium lowercase">
                            # {obs}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Footer Action */}
                    <div className="bg-primary-50 dark:bg-primary-900/10 p-2 text-center border-t border-primary-100 dark:border-primary-900/20">
                      <button 
                        onClick={() => setVisionAnalysis(null)}
                        className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest hover:underline"
                      >
                        Dismiss Analysis
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          {/* Simple Action Items */}
          <div className="space-y-4">
            {/* When to Water */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-blue-500">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">WHEN</p>
              <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                {analysis?.irrigationPlan?.wateringSchedule || 'N/A'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Best time: Early morning (6-8 AM)
              </p>
            </div>

            {/* How Much Water */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-blue-500">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">HOW MUCH</p>
              <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                {analysis?.irrigationPlan?.amountPerIrrigation || 'N/A'} per session
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Weekly total: {analysis?.irrigationPlan?.weeklyTotal || 'N/A'}
              </p>
            </div>

            {/* Water Need (Daily) */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-cyan-500">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">DAILY WATER NEED</p>
              <p className="text-xl font-bold text-cyan-900 dark:text-cyan-100">
                {analysis?.irrigationPlan?.irrigationNeed || 'N/A'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Based on crop type and weather
              </p>
            </div>

            {/* Crop Water Requirement */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-teal-500">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">CROP WATER USE</p>
              <p className="text-xl font-bold text-teal-900 dark:text-teal-100">
                {analysis?.irrigationPlan?.etc || 'N/A'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Evapotranspiration rate for your crop
              </p>
            </div>

            {/* Growth Stage */}
            <div className="bg-blue-100 dark:bg-blue-900/40 rounded-lg p-3">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                🌱 Your crop is in <strong>{analysis?.irrigationPlan?.growthStage || 'N/A'}</strong> stage ({analysis?.irrigationPlan?.daysAfterPlanting || 0} days old)
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
              {analysis?.diseaseRisk?.reliability || 0}% Accurate
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
          {analysis?.diseaseRisk?.diseases?.[0] && analysis.diseaseRisk.level !== 'Low' && (
            <div className={`p-4 rounded-lg ${
              analysis.diseaseRisk.level === 'High' ? 'bg-red-100 dark:bg-red-900/40' :
              'bg-yellow-100 dark:bg-yellow-900/40'
            }`}>
              <h4 className={`font-semibold mb-2 ${
                analysis.diseaseRisk.level === 'High' ? 'text-red-900 dark:text-red-100' :
                'text-yellow-900 dark:text-yellow-100'
              }`}>
                Watch Out: {analysis.diseaseRisk.diseases[0]?.name}
              </h4>
              <div className="space-y-2 text-sm">
                <p className={`${
                  analysis.diseaseRisk.level === 'High' ? 'text-red-800 dark:text-red-200' :
                  'text-yellow-800 dark:text-yellow-200'
                }`}>
                  <strong>What to do:</strong> {analysis.diseaseRisk.diseases[0]?.prevention?.[0] || 'Monitor regularly'}
                </p>
                <p className={`${
                  analysis.diseaseRisk.level === 'High' ? 'text-red-700 dark:text-red-300' :
                  'text-yellow-700 dark:text-yellow-300'
                }`}>
                  <strong>Natural solution:</strong> {analysis.diseaseRisk.diseases[0]?.organicControl?.[0] || 'Use organic methods'}
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
              {analysis?.yieldForecast?.crops?.[0]?.confidence || 0}% {t('dashboard.confidence')}
            </span>
          </div>

          {analysis.yieldForecast.crops.map((crop: any, index: number) => (
            <div key={index} className="bg-purple-100 dark:bg-purple-900/40 rounded-lg p-4 mb-3">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-purple-900 dark:text-purple-100">{crop?.crop || 'Crop'}</h4>
                <span className="text-sm text-purple-700 dark:text-purple-300">
                  {t('dashboard.yieldGap')}: {crop?.yieldGap || 'N/A'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                <div>
                  <p className="text-xs text-purple-700 dark:text-purple-300">{t('dashboard.estimatedYield')}</p>
                  <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
                    {(crop?.estimatedYield || 0).toLocaleString()} kg
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

      {/* Satellite Field Health */}
      {satelliteData?.health && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35 }}
          className="rounded-xl border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 overflow-hidden mb-6"
        >
          <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200 dark:bg-gray-900/50 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm md:text-base">
              <FiNavigation className="h-4 w-4 text-primary-600" />
              Satellite Field Health
            </h3>
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest hidden sm:inline">
              Live Imagery (NDVI)
            </span>
          </div>

          <div className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              {/* NDVI Gauge */}
              <div className="relative h-28 w-28 md:h-32 md:w-32 flex items-center justify-center">
                <svg className="h-full w-full transform -rotate-90">
                  <circle
                    cx="64" cy="64" r="58"
                    stroke="currentColor" strokeWidth="8"
                    fill="transparent"
                    className="text-gray-100 dark:text-gray-700"
                  />
                  <circle
                    cx="64" cy="64" r="58"
                    stroke="currentColor" strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={364.4}
                    strokeDashoffset={364.4 * (1 - satelliteData.ndvi.mean)}
                    strokeLinecap="round"
                    className={
                      satelliteData.health.color === 'green' ? 'text-green-500' :
                      satelliteData.health.color === 'yellow' ? 'text-yellow-500' :
                      satelliteData.health.color === 'orange' ? 'text-orange-500' :
                      'text-red-500'
                    }
                  />
                </svg>
                <div className="absolute text-center">
                  <p className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">
                    {Math.round(satelliteData.ndvi.mean * 100)}%
                  </p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase">Index</p>
                </div>
              </div>

              {/* Status Details */}
              <div className="flex-1 space-y-2 text-center md:text-left">
                <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  satelliteData.health.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' :
                  satelliteData.health.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' :
                  'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                }`}>
                  Status: {satelliteData.health.status}
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                  "{satelliteData.health.description}"
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-2 bg-gray-50 dark:bg-gray-900/40 rounded border border-gray-100 dark:border-gray-700 text-center">
                    <p className="text-[9px] font-bold text-gray-500 uppercase">Confidence</p>
                    <p className="text-xs font-bold text-gray-900 dark:text-white">High (85%)</p>
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-900/40 rounded border border-gray-100 dark:border-gray-700 text-center">
                    <p className="text-[9px] font-bold text-gray-500 uppercase">Cloud Cover</p>
                    <p className="text-xs font-bold text-gray-900 dark:text-white">{satelliteData.metadata.cloudCover}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
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

      {/* Professional Tools: Export Center */}
      <div className="mt-8 mb-4">
        <ExportPortal 
          farmId={analysis?.irrigationPlan?.farmId || 'default-farm'} 
          farmProfile={currentProfile}
          analysis={analysis}
        />
      </div>

      {/* Data Source Footer */}
      <div className="text-center text-xs text-gray-500 dark:text-gray-400">
        {t('dashboard.dataSource')}: {analysis?.metadata?.dataSource} • {t('dashboard.lastUpdated')}: {new Date(analysis?.metadata?.analysisDate).toLocaleString()}
      </div>
    </div>
  );
}
