'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCpu, FiCamera, FiDownload, FiZap, FiCheckCircle, FiAlertCircle, FiX, FiTrendingUp, FiLayers, FiImage } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { storage } from '@/lib/storage';
import ConnectSensor from './ConnectSensor';
import ConnectPump from './ConnectPump';
import { ExportPortal } from './ExportPortal';
import { useI18n } from '@/lib/i18n';

export default function SmartToolsPanel({ 
  farmProfile,
  isPumpLoading,
  setIsPumpLoading,
  pumpStatus,
  setPumpStatus,
  visionAnalysis,
  setVisionAnalysis,
  onStartPump,
  satelliteData
}: { 
  farmProfile?: any;
  isPumpLoading: boolean;
  setIsPumpLoading: (loading: boolean) => void;
  pumpStatus: any;
  setPumpStatus: (status: any) => void;
  visionAnalysis: any;
  setVisionAnalysis: (analysis: any) => void;
  onStartPump: (durationMin?: number) => void;
  satelliteData?: any;
}) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'overview' | 'sensor' | 'pump' | 'vision' | 'imagery' | 'export'>('overview');
  const [isVisionLoading, setIsVisionLoading] = useState(false);
  const [satLayer, setSatLayer] = useState<'true' | 'ndvi' | 'false'>('true');
  const farmId = farmProfile?.id || 'default-farm';
  const polyId = farmProfile?.agro_monitoring_id;
  const AGRO_KEY = process.env.NEXT_PUBLIC_AGRO_MONITORING_API_KEY || ''; // concept

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsVisionLoading(true);
    setVisionAnalysis(null);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const response = await fetch('/api/analysis/vision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: reader.result }),
        });
        if (response.ok) {
            const data = await response.json();
            setVisionAnalysis(data);
        }
      } catch {}
      finally { setIsVisionLoading(false); }
    };
    reader.readAsDataURL(file);
  };

  const tabs = [
    { id: 'overview', label: '⚡ Overview', icon: FiZap },
    { id: 'sensor', label: '📡 Soil Node', icon: FiCpu },
    { id: 'pump', label: '💧 Pump Node', icon: FiLayers },
    { id: 'vision', label: '✨ AI Vision', icon: FiCamera },
    { id: 'imagery', label: '🛰️ Satellite', icon: FiImage },
    { id: 'export', label: '📦 Export', icon: FiDownload },
  ] as const;


  return (
    <div className="mt-6 rounded-3xl bg-zinc-950 border border-zinc-800 overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-zinc-800">
        <h2 className="text-white text-lg font-bold tracking-tight flex items-center gap-2">
          <span className="p-1.5 bg-zinc-800 rounded-lg"><FiZap className="text-white w-4 h-4" /></span>
          Smart Farm Tools
        </h2>
        <p className="text-zinc-500 text-xs mt-1">IoT Control · AI Vision · Data Export · Sensor Setup</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 pt-3 border-b border-zinc-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all ${
              activeTab === tab.id
                ? 'bg-zinc-800 text-white border-b-2 border-white'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* IoT Pump Control */}
                <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800 flex flex-col gap-3">
                  <div className="p-2.5 bg-blue-500/10 rounded-xl w-fit">
                    <FiLayers className="text-blue-400 w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm">Pump Control</h3>
                    <p className="text-zinc-500 text-xs mt-0.5">IoT irrigation trigger</p>
                  </div>
                  <button
                    onClick={() => onStartPump()}
                    disabled={isPumpLoading}
                    className="mt-auto w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {isPumpLoading ? 'Connecting...' : 'Start Pump'}
                  </button>
                  {pumpStatus && (
                    <p className={`text-[10px] font-bold text-center ${pumpStatus.success ? 'text-green-400' : 'text-red-400'}`}>
                      {pumpStatus.message}
                    </p>
                  )}
                </div>

                {/* AI Vision */}
                <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800 flex flex-col gap-3">
                  <div className="p-2.5 bg-purple-500/10 rounded-xl w-fit">
                    <FiCamera className="text-purple-400 w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm">Ceres Vision</h3>
                    <p className="text-zinc-500 text-xs mt-0.5">AI crop & soil check</p>
                  </div>
                  <label className="mt-auto w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all text-center cursor-pointer block">
                    {isVisionLoading ? 'Analyzing...' : 'Upload Photo'}
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoUpload} disabled={isVisionLoading} />
                  </label>
                </div>

                {/* Sensor Setup */}
                <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800 flex flex-col gap-3">
                  <div className="p-2.5 bg-green-500/10 rounded-xl w-fit">
                    <FiCpu className="text-green-400 w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm">Connect Sensor</h3>
                    <p className="text-zinc-500 text-xs mt-0.5">ESP32 calibration tool</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('sensor')}
                    className="mt-auto w-full py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs font-bold transition-all"
                  >
                    Open Wizard
                  </button>
                </div>

                {/* Data Export */}
                <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800 flex flex-col gap-3">
                  <div className="p-2.5 bg-amber-500/10 rounded-xl w-fit">
                    <FiDownload className="text-amber-400 w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm">B2B Export</h3>
                    <p className="text-zinc-500 text-xs mt-0.5">CSV / JSON data portal</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('export')}
                    className="mt-auto w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all"
                  >
                    Open Portal
                  </button>
                </div>
              </div>

              {/* Vision Result inline */}
              <AnimatePresence>
                {visionAnalysis && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="mt-4 rounded-2xl border border-zinc-700 bg-zinc-900 overflow-hidden"
                  >
                    <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">✨</span>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Ceres AI Ground Reality</h4>
                        <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          visionAnalysis.visualStatus === 'Excellent' || visionAnalysis.visualStatus === 'Good' ? 'bg-green-500/20 text-green-400' :
                          visionAnalysis.visualStatus === 'Stable' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {visionAnalysis.visualStatus}
                        </div>
                      </div>
                      <button onClick={() => setVisionAnalysis(null)} className="p-1 hover:bg-zinc-800 rounded-full">
                        <FiX className="h-4 w-4 text-zinc-400" />
                      </button>
                    </div>
                    
                    <div className="p-5 space-y-5">
                      {/* Farmer Friendly Insights */}
                      <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700/50">
                        <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                          <FiCheckCircle className="text-zinc-400" /> Visual Reality Check
                        </h5>
                        <p className="text-sm text-zinc-200 leading-relaxed font-medium capitalize-first">
                          {visionAnalysis.farmerFriendlyInsights || visionAnalysis.reasoning}
                        </p>
                      </div>

                      {/* Soil & Crop Health Pills */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-zinc-800/30 p-3 rounded-lg border border-zinc-700/30">
                          <p className="text-[9px] font-bold text-zinc-500 uppercase mb-1">Soil Health</p>
                          <p className="text-xs font-bold text-zinc-300">{visionAnalysis.soilHealth || 'Stable'}</p>
                        </div>
                        <div className="bg-zinc-800/30 p-3 rounded-lg border border-zinc-700/30">
                          <p className="text-[9px] font-bold text-zinc-500 uppercase mb-1">Crop Health</p>
                          <p className="text-xs font-bold text-zinc-300">{visionAnalysis.cropHealth || 'Good'}</p>
                        </div>
                      </div>

                      {/* Yield Suggestions */}
                      {visionAnalysis.yieldSuggestions && (
                        <div className="space-y-3">
                          <h5 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                            <FiTrendingUp className="text-emerald-500" /> Suggestions to Improve Yield
                          </h5>
                          <div className="grid gap-2">
                            {visionAnalysis.yieldSuggestions.map((sug: any, i: number) => (
                              <div key={i} className="flex items-start gap-3 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl group hover:border-emerald-500/30 transition-all">
                                <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${
                                  sug.impact === 'High' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                                  sug.impact === 'Medium' ? 'bg-amber-500' : 'bg-zinc-500'
                                }`} />
                                <div>
                                  <p className="text-xs font-bold text-zinc-100 mb-0.5">{sug.title}</p>
                                  <p className="text-[11px] text-zinc-400 leading-snug">{sug.action}</p>
                                </div>
                                <span className="ml-auto text-[8px] font-bold text-zinc-500 uppercase tracking-tighter opacity-70">
                                  {sug.impact} Impact
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Sensor Tab */}
          {activeTab === 'sensor' && (
            <motion.div key="sensor" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <ConnectSensor farmId={farmId} />
            </motion.div>
          )}

          {/* Pump Setup Tab */}
          {activeTab === 'pump' && (
            <motion.div key="pump" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <ConnectPump farmId={farmId} />
            </motion.div>
          )}

          {/* SATELLITE IMAGERY TAB */}
        {activeTab === 'imagery' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Layer Selection */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <FiLayers className="text-blue-500" />
                  Satellite Layer Selection
                </h3>
                <div className="space-y-3">
                  {[
                    { id: 'true', label: 'True Color (Visual)', desc: 'View the field as it appears from space' },
                    { id: 'ndvi', label: 'NDVI (Plant Health)', desc: 'Monitor vegetation density and stress' },
                    { id: 'false', label: 'False Color (Spectral)', desc: 'Detect moisture and land-use variations' }
                  ].map((layer) => (
                    <button
                      key={layer.id}
                      onClick={() => setSatLayer(layer.id as any)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${satLayer === layer.id ? 'bg-white border-white' : 'bg-black/40 border-zinc-800 hover:border-zinc-700'}`}
                    >
                      <p className={`text-sm font-bold ${satLayer === layer.id ? 'text-black' : 'text-white'}`}>{layer.label}</p>
                      <p className={`text-[10px] ${satLayer === layer.id ? 'text-black/60' : 'text-zinc-500'}`}>{layer.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Imagery Preview */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute top-4 right-4 z-10">
                   <span className="px-2 py-1 bg-black/60 backdrop-blur-md rounded-md text-[9px] font-bold text-white border border-white/20 uppercase tracking-widest leading-none">
                     LIVE FEED
                   </span>
                </div>
                
                {/* Mock Imagery Display */}
                <div className="w-full h-48 bg-black rounded-xl border border-zinc-800 overflow-hidden relative">
                   <div className={`absolute inset-0 flex items-center justify-center ${satLayer === 'ndvi' ? 'bg-emerald-900/20' : satLayer === 'false' ? 'bg-purple-900/20' : 'bg-zinc-900'}`}>
                      <FiImage className="w-12 h-12 text-zinc-800" />
                   </div>
                   {/* Simulated Overlay */}
                   <div className="absolute bottom-2 left-2 p-2 bg-black/40 rounded-lg backdrop-blur-sm border border-white/10">
                      <p className="text-[10px] text-white font-bold">SENTINEL-2 L2A</p>
                      <p className="text-[8px] text-zinc-400">Resolution: 10m/px</p>
                   </div>
                </div>

                <div className="mt-6 w-full space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-zinc-500 uppercase font-bold">Field Statistics</p>
                    {satelliteData?.ndvi && (
                      <span className="text-[10px] text-white font-bold bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        NDVI: {satelliteData.ndvi.mean.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-black/40 rounded-xl border border-zinc-800">
                      <p className="text-[9px] text-zinc-500 uppercase font-bold mb-1">Coverage</p>
                      <p className="text-white font-bold">{farmProfile?.total_area || 5} Acres</p>
                    </div>
                    <div className="p-3 bg-black/40 rounded-xl border border-zinc-800">
                      <p className="text-[9px] text-zinc-500 uppercase font-bold mb-1">Confidence</p>
                      <p className="text-white font-bold">{((satelliteData?.metadata?.dataConfidence || 0.85) * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Satellite Analysis Insights */}
            <div className="p-6 bg-gradient-to-br from-blue-500/10 to-emerald-500/10 border border-blue-500/20 rounded-2xl">
               <h4 className="text-white text-sm font-bold flex items-center gap-2 mb-2">
                 <FiTrendingUp className="text-blue-400" />
                 Ceres Remote Insights
               </h4>
               <p className="text-sm text-zinc-400 leading-relaxed italic">
                 "Our orbital analysis shows a healthy vegetation trend. The {satLayer === 'ndvi' ? 'Vegetation Index' : satLayer === 'false' ? 'Spectral contrast' : 'Visual profile'} confirms consistent growth. 
                 Recent soil moisture levels are optimal for {farmProfile?.current_crops?.[0] || 'your crop'}, with low water-stress indicators detected in the center of the field."
               </p>
            </div>
          </div>
        )}
          {activeTab === 'vision' && (
            <motion.div key="vision" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="max-w-lg mx-auto text-center py-8">
                <div className="text-5xl mb-4">✨</div>
                <h3 className="text-white font-bold text-xl mb-2">Ceres Vision Analysis</h3>
                <p className="text-zinc-400 text-sm mb-6">Take a photo of your soil or crop — Gemini AI will verify its condition against your sensor data.</p>
                <label className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold cursor-pointer transition-all">
                  <FiCamera className="w-5 h-5" />
                  {isVisionLoading ? 'Analyzing with AI...' : 'Upload Field Photo'}
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoUpload} disabled={isVisionLoading} />
                </label>
                <AnimatePresence>
                  {visionAnalysis && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="mt-6 text-left rounded-2xl border border-zinc-700 bg-zinc-900 overflow-hidden"
                    >
                      <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">✨</span>
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Ground Reality Analysis</h4>
                          <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            visionAnalysis.visualStatus === 'Excellent' || visionAnalysis.visualStatus === 'Good' ? 'bg-green-500/20 text-green-400' :
                            visionAnalysis.visualStatus === 'Stable' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {visionAnalysis.visualStatus}
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-5 space-y-5">
                        {/* Farmer Friendly Insights */}
                        <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700/50">
                          <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <FiCheckCircle className="text-zinc-400" /> Visual Reality Check
                          </h5>
                          <p className="text-sm text-zinc-200 leading-relaxed font-medium capitalize-first">
                            {visionAnalysis.farmerFriendlyInsights || visionAnalysis.reasoning}
                          </p>
                        </div>

                        {/* Soil & Crop Health Pills */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-zinc-800/30 p-3 rounded-lg border border-zinc-700/30">
                            <p className="text-[9px] font-bold text-zinc-500 uppercase mb-1">Soil Condition</p>
                            <p className="text-xs font-bold text-zinc-300">{visionAnalysis.soilHealth || 'Stable'}</p>
                          </div>
                          <div className="bg-zinc-800/30 p-3 rounded-lg border border-zinc-700/30">
                            <p className="text-[9px] font-bold text-zinc-500 uppercase mb-1">Crop State</p>
                            <p className="text-xs font-bold text-zinc-300">{visionAnalysis.cropHealth || 'Good'}</p>
                          </div>
                        </div>

                        {/* Yield Suggestions */}
                        {visionAnalysis.yieldSuggestions && (
                          <div className="space-y-3 pt-2">
                            <h5 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                              <FiTrendingUp className="text-emerald-500" /> Yield Improvement Roadmap
                            </h5>
                            <div className="grid gap-3">
                              {visionAnalysis.yieldSuggestions.map((sug: any, i: number) => (
                                <div key={i} className="flex items-start gap-4 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl group hover:border-emerald-500/30 transition-all">
                                  <div className={`mt-1 h-3 w-3 rounded-full flex-shrink-0 ${
                                    sug.impact === 'High' ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' :
                                    sug.impact === 'Medium' ? 'bg-amber-500' : 'bg-zinc-500'
                                  }`} />
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                      <p className="text-xs font-bold text-white">{sug.title}</p>
                                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">
                                        {sug.impact} Impact
                                      </span>
                                    </div>
                                    <p className="text-xs text-zinc-400 leading-relaxed">{sug.action}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* Export Tab */}
          {activeTab === 'export' && (
            <motion.div key="export" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <ExportPortal 
                farmId={farmId} 
                farmProfile={farmProfile}
                analysis={storage.get('irrigationPlanPro') ? { 
                  irrigationPlan: storage.get('irrigationPlanPro'),
                  yieldForecast: storage.get('yieldForecastPro'),
                  diseaseRisk: storage.get('diseaseRiskPro')
                } : null}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
