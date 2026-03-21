'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCpu, FiCamera, FiDownload, FiZap, FiCheckCircle, FiAlertCircle, FiX } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ConnectSensor from './ConnectSensor';
import { ExportPortal } from './ExportPortal';

export default function SmartToolsPanel({ farmProfile }: { farmProfile?: any }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'sensor' | 'vision' | 'export'>('overview');
  const [isPumpLoading, setIsPumpLoading] = useState(false);
  const [pumpStatus, setPumpStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [isVisionLoading, setIsVisionLoading] = useState(false);
  const [visionAnalysis, setVisionAnalysis] = useState<any>(null);
  const farmId = farmProfile?.id || 'default-farm';

  const handleStartPump = async () => {
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
          durationMin: 30,
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
        if (response.ok) setVisionAnalysis(await response.json());
      } catch {}
      finally { setIsVisionLoading(false); }
    };
    reader.readAsDataURL(file);
  };

  const tabs = [
    { id: 'overview', label: '⚡ Overview', icon: FiZap },
    { id: 'sensor', label: '📡 Sensor', icon: FiCpu },
    { id: 'vision', label: '✨ AI Vision', icon: FiCamera },
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
                    <FiCpu className="text-blue-400 w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm">Pump Control</h3>
                    <p className="text-zinc-500 text-xs mt-0.5">IoT irrigation trigger</p>
                  </div>
                  <button
                    onClick={handleStartPump}
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
                    <p className="text-zinc-500 text-xs mt-0.5">AI soil & crop analysis</p>
                  </div>
                  <label className="mt-auto w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all text-center cursor-pointer">
                    {isVisionLoading ? 'Analyzing...' : 'Upload Photo'}
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoUpload} disabled={isVisionLoading} />
                  </label>
                </div>

                {/* Sensor Setup */}
                <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800 flex flex-col gap-3">
                  <div className="p-2.5 bg-green-500/10 rounded-xl w-fit">
                    <FiZap className="text-green-400 w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm">Connect Sensor</h3>
                    <p className="text-zinc-500 text-xs mt-0.5">ESP32 calibration wizard</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('sensor')}
                    className="mt-auto w-full py-2 rounded-xl bg-green-700 hover:bg-green-600 text-white text-xs font-bold transition-all"
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
                    className="mt-auto w-full py-2 rounded-xl bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold transition-all"
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
                    <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">✨</span>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Ceres Vision Result</h4>
                        <span className="text-[10px] font-bold text-zinc-400">{visionAnalysis?.confidence || 0}% confidence</span>
                      </div>
                      <button onClick={() => setVisionAnalysis(null)} className="p-1 hover:bg-zinc-800 rounded-full">
                        <FiX className="h-4 w-4 text-zinc-400" />
                      </button>
                    </div>
                    <div className="p-4">
                      {visionAnalysis?.matchesDigitalData ? (
                        <div className="flex items-center gap-1.5 text-green-400 text-xs font-bold mb-3">
                          <FiCheckCircle /> Sensor data confirmed by visual
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-yellow-400 text-xs font-bold mb-3">
                          <FiAlertCircle /> Visual variance detected
                        </div>
                      )}
                      <div className="prose prose-sm prose-invert max-w-none text-zinc-300 text-sm">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{visionAnalysis?.reasoning || ''}</ReactMarkdown>
                      </div>
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

          {/* Vision Tab */}
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
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6 text-left rounded-2xl border border-zinc-700 bg-zinc-900 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        {visionAnalysis?.matchesDigitalData
                          ? <span className="text-green-400 text-xs font-bold flex items-center gap-1"><FiCheckCircle /> Confirmed Match</span>
                          : <span className="text-yellow-400 text-xs font-bold flex items-center gap-1"><FiAlertCircle /> Variance Detected</span>}
                        <span className="text-zinc-500 text-xs">{visionAnalysis?.confidence}% confidence</span>
                      </div>
                      <div className="prose prose-sm prose-invert max-w-none text-zinc-300">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{visionAnalysis?.reasoning || ''}</ReactMarkdown>
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
              <ExportPortal farmId={farmId} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
