'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCpu, FiCamera, FiDownload, FiZap, FiCheckCircle, FiAlertCircle, FiX, FiTrendingUp, FiSettings, FiSmartphone, FiClock, FiMessageSquare, FiMic, FiCloud, FiCloudRain, FiDroplet, FiSun, FiMoon, FiBattery, FiWifi } from 'react-icons/fi';
import ConnectSensor from './ConnectSensor';
import { ExportPortal } from './ExportPortal';

export default function SmartToolsPanel({ 
  farmProfile,
  isPumpLoading,
  setIsPumpLoading,
  pumpStatus,
  setPumpStatus,
  visionAnalysis,
  setVisionAnalysis,
  onStartPump
}: { 
  farmProfile?: any;
  isPumpLoading: boolean;
  setIsPumpLoading: (loading: boolean) => void;
  pumpStatus: any;
  setPumpStatus: (status: any) => void;
  visionAnalysis: any;
  setVisionAnalysis: (analysis: any) => void;
  onStartPump: (durationMin?: number) => void;
}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'sensor' | 'automation' | 'vision' | 'remote' | 'export'>('overview');
  const [isVisionLoading, setIsVisionLoading] = useState(false);
  const [isAutoOn, setIsAutoOn] = useState(farmProfile?.is_auto_irrigation || false);
  const farmId = farmProfile?.id || 'default-farm';

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
    { id: 'overview', label: '🏠 Home', icon: FiZap },
    { id: 'automation', label: '🤖 Auto-Pilot', icon: FiSettings },
    { id: 'remote', label: '📱 Phone Link', icon: FiSmartphone },
    { id: 'sensor', label: '📡 Sensor', icon: FiCpu },
    { id: 'vision', label: '✨ AI Camera', icon: FiCamera },
    { id: 'export', label: '📦 Get Data', icon: FiDownload },
  ] as const;

  return (
    <div className="mt-6 rounded-3xl bg-zinc-950 border border-zinc-800 overflow-hidden shadow-2xl">
      {/* Friendly Header */}
      <div className="px-6 pt-6 pb-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/30">
        <div>
          <h2 className="text-white text-xl font-black tracking-tight flex items-center gap-3">
            <span className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400"><FiZap className="w-5 h-5 shadow-[0_0_15px_rgba(52,211,153,0.3)]" /></span>
            Farmer Assistant
          </h2>
          <p className="text-zinc-500 text-[10px] mt-1 uppercase tracking-widest font-black opacity-70">Smart Control · Easy Mode</p>
        </div>
        
        <button 
            onClick={() => setIsAutoOn(!isAutoOn)}
            className={`flex items-center gap-3 px-4 py-2 rounded-2xl border-2 transition-all active:scale-95 ${
                isAutoOn 
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
                : 'border-zinc-800 bg-zinc-900 text-zinc-500'
            }`}
        >
          <div className={`h-3 w-3 rounded-full ${isAutoOn ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-700'}`} />
          <span className="text-xs font-black uppercase tracking-tighter">
            {isAutoOn ? 'Auto-Pilot ON' : 'Turn Auto ON'}
          </span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 pt-3 border-b border-zinc-800 overflow-x-auto scrollbar-hide bg-zinc-950">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 text-xs font-black rounded-t-xl transition-all flex-shrink-0 flex items-center gap-2 tracking-tight ${
              activeTab === tab.id
                ? 'bg-zinc-800 text-white border-b-4 border-emerald-500'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-emerald-400' : ''}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              
              {/* Assistant Bubble */}
              <div className="relative bg-zinc-900 p-5 rounded-3xl border border-zinc-800 flex items-start gap-4">
                 <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-lg">👨‍🌾</div>
                 <div>
                    <h4 className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-1">Your Assistant Says:</h4>
                    <p className="text-white font-bold text-sm leading-relaxed">
                        {isAutoOn 
                            ? "I am watching your field. I will start the pump automatically if the soil gets too dry. Relax!" 
                            : "I'm waiting. You can start the pump using the blue button below, or turn on 'Auto-Pilot' to let me handle it."}
                    </p>
                 </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* IoT Pump Control */}
                <div className="bg-zinc-900 rounded-3xl p-6 border-b-4 border-zinc-800 border-zinc-800 flex flex-col items-center text-center gap-4 relative overflow-hidden group hover:border-blue-500 transition-all">
                  <div className="p-4 bg-blue-500/10 rounded-2xl">
                    <FiZap className="text-blue-400 w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-white font-black text-sm uppercase tracking-tighter">Start Pump</h3>
                    <p className="text-zinc-500 text-[10px] mt-1 font-bold">Manual Water</p>
                  </div>
                  <button
                    onClick={() => onStartPump()}
                    disabled={isPumpLoading || isAutoOn}
                    className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black transition-all disabled:opacity-30 shadow-lg shadow-blue-900/20"
                  >
                    {isPumpLoading ? 'Starting...' : 'PRESS TO START'}
                  </button>
                </div>

                {/* AI Vision */}
                <div className="bg-zinc-900 rounded-3xl p-6 border-b-4 border-zinc-800 border-zinc-800 flex flex-col items-center text-center gap-4 hover:border-purple-500 transition-all">
                  <div className="p-4 bg-purple-500/10 rounded-2xl">
                    <FiCamera className="text-purple-400 w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-white font-black text-sm uppercase tracking-tighter">Check Field</h3>
                    <p className="text-zinc-500 text-[10px] mt-1 font-bold">Show me a Photo</p>
                  </div>
                  <label className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black transition-all text-center cursor-pointer shadow-lg shadow-purple-900/20">
                    {isVisionLoading ? 'Checking...' : 'SCAN NOW'}
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoUpload} disabled={isVisionLoading} />
                  </label>
                </div>

                {/* Automation Status */}
                <div className={`rounded-3xl p-6 border-b-4 flex flex-col items-center text-center gap-4 cursor-pointer transition-all ${isAutoOn ? 'bg-emerald-500/10 border-emerald-500' : 'bg-zinc-900 border-zinc-800'}`} onClick={() => setActiveTab('automation')}>
                  <div className={`p-4 rounded-2xl ${isAutoOn ? 'bg-emerald-500/20' : 'bg-zinc-800'}`}>
                    <FiSettings className={`${isAutoOn ? 'text-emerald-400' : 'text-zinc-500'} w-8 h-8`} />
                  </div>
                  <div>
                    <h3 className="text-white font-black text-sm uppercase tracking-tighter">Auto-Pilot</h3>
                    <p className="text-zinc-500 text-[10px] mt-1 font-bold">{isAutoOn ? 'Active & Safe' : 'Ready'}</p>
                  </div>
                  <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-auto">Settings ⚙️</div>
                </div>

                {/* Device Health - Visual */}
                <div className="bg-zinc-900 rounded-3xl p-6 border-b-4 border-zinc-800 flex flex-col items-center text-center gap-4">
                  <div className="p-4 bg-amber-500/10 rounded-2xl">
                    <FiWifi className="text-amber-400 w-8 h-8" />
                  </div>
                  <div className="w-full space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase text-zinc-500">
                        <span>Signal</span>
                        <div className="flex gap-0.5 items-end h-3">
                            <div className="w-1.5 h-1 bg-emerald-500 rounded-sm" />
                            <div className="w-1.5 h-2 bg-emerald-500 rounded-sm" />
                            <div className="w-1.5 h-3 bg-emerald-500 rounded-sm" />
                            <div className="w-1.5 h-2 bg-zinc-700 rounded-sm" />
                        </div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase text-zinc-500">
                        <span>Battery</span>
                        <div className="flex items-center gap-1">
                            <FiBattery className="text-emerald-400 w-4 h-4" />
                            <span className="text-emerald-400">84%</span>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Automation Tab - Simplified */}
          {activeTab === 'automation' && (
            <motion.div key="automation" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                 <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800">
                    <div className="text-center mb-8">
                        <h3 className="text-white font-black text-xl mb-2">When should I Water?</h3>
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Select how wet you want your field</p>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        {[
                            { id: 'low', label: 'Dry Field', icon: FiCloud, color: 'text-amber-400', bg: 'bg-amber-400/10', threshold: 20 },
                            { id: 'med', label: 'Normal', icon: FiDroplet, color: 'text-blue-400', bg: 'bg-blue-400/10', threshold: 40 },
                            { id: 'high', label: 'Always Wet', icon: FiCloudRain, color: 'text-emerald-400', bg: 'bg-emerald-400/10', threshold: 60 }
                        ].map((preset) => (
                            <button 
                                key={preset.id}
                                className={`flex flex-col items-center gap-4 p-6 rounded-3xl border-2 transition-all active:scale-95 ${
                                    (farmProfile?.moisture_threshold || 30) === preset.threshold 
                                    ? `border-white ${preset.bg} shadow-xl` 
                                    : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950'
                                }`}
                            >
                                <preset.icon className={`w-12 h-12 ${preset.color}`} />
                                <span className="text-[10px] font-black uppercase tracking-tighter text-white">{preset.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="mt-12 pt-10 border-t border-zinc-800">
                        <div className="text-center mb-6">
                            <h3 className="text-white font-black text-lg mb-1 tracking-tight">Daily Water Gaps</h3>
                            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Best times for better yield</p>
                        </div>
                        <div className="flex justify-center gap-8">
                            <div className="flex flex-col items-center gap-3">
                                <div className="p-5 bg-amber-500/10 rounded-full border-2 border-amber-500/20 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                                    <FiSun className="w-8 h-8" />
                                </div>
                                <span className="text-[10px] font-black text-white uppercase">Morning Sunrise</span>
                            </div>
                            <div className="flex flex-col items-center gap-3">
                                <div className="p-5 bg-blue-500/10 rounded-full border-2 border-blue-500/20 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                                    <FiMoon className="w-8 h-8" />
                                </div>
                                <span className="text-[10px] font-black text-white uppercase">Night Sunset</span>
                            </div>
                        </div>
                    </div>
                 </div>
            </motion.div>
          )}

          {/* Remote Tab */}
          {activeTab === 'remote' && (
            <motion.div key="remote" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Bridge Interface */}
                    <div className="space-y-6">
                        <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800">
                             <h3 className="text-white font-black text-xl mb-2 tracking-tight">Your Farm's Phone Number</h3>
                             <p className="text-zinc-500 text-xs mb-8 font-bold uppercase tracking-widest leading-relaxed">Send an SMS to control the pump from any cell phone</p>
                             
                             <div className="bg-zinc-950 p-6 rounded-3xl border border-zinc-800 text-center mb-8">
                                <span className="text-2xl text-blue-400 font-black tracking-widest">+91 98700 000XX</span>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase mt-2">Save this as "Farm Pump" in your contacts</p>
                             </div>

                             <div className="space-y-4">
                                <h4 className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-4">How to Message:</h4>
                                <div className="p-4 bg-zinc-800/20 rounded-2xl border border-zinc-800 flex justify-between items-center group hover:bg-zinc-800/40 transition-all">
                                    <span className="text-xs text-white font-black">START</span>
                                    <span className="text-[10px] text-zinc-500 font-bold uppercase">To start water</span>
                                </div>
                                <div className="p-4 bg-zinc-800/20 rounded-2xl border border-zinc-800 flex justify-between items-center group hover:bg-zinc-800/40 transition-all">
                                    <span className="text-xs text-white font-black">STOP</span>
                                    <span className="text-[10px] text-zinc-500 font-bold uppercase">To stop water</span>
                                </div>
                                <div className="p-4 bg-zinc-800/20 rounded-2xl border border-zinc-800 flex justify-between items-center group hover:bg-zinc-800/40 transition-all">
                                    <span className="text-xs text-white font-black">STATUS</span>
                                    <span className="text-[10px] text-zinc-500 font-bold uppercase">To check moisture</span>
                                </div>
                             </div>
                        </div>
                    </div>

                    <div className="bg-zinc-900/30 p-10 rounded-3xl border-4 border-dashed border-zinc-800 flex flex-col items-center justify-center text-center opacity-70 group hover:opacity-100 hover:border-white transition-all cursor-pointer">
                        <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">🛎️</div>
                        <h3 className="text-white font-black text-2xl mb-3 tracking-tighter">Test Phone Link</h3>
                        <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest mb-8 max-w-[280px]">Simulate sending an SMS to your pump from another phone</p>
                        <button className="px-10 py-4 bg-white text-black font-black text-sm rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-95 transition-all">
                            SEND TEST "START" SMS
                        </button>
                    </div>
                 </div>
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
                <div className="text-6xl mb-6 animate-bounce">✨</div>
                <h3 className="text-white font-black text-2xl mb-3 tracking-tighter uppercase">AI Camera Check</h3>
                <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest mb-10 leading-relaxed">Take a photo of your field - our AI will tell you if it's healthy.</p>
                <label className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black cursor-pointer transition-all shadow-xl shadow-purple-900/40 active:scale-95">
                  <FiCamera className="w-6 h-6" />
                  {isVisionLoading ? 'AI IS THINKING...' : 'CAPTURE FIELD PHOTO'}
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoUpload} disabled={isVisionLoading} />
                </label>
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
