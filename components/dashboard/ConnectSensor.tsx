'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCpu, FiCopy, FiCheckCircle, FiInfo, FiExternalLink } from 'react-icons/fi';
import { useI18n } from '@/lib/i18n';

interface ConnectSensorProps {
  farmId: string;
}

export default function ConnectSensor({ farmId }: ConnectSensorProps) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const [calibrated, setCalibrated] = useState(false);
  const [dryValue, setDryValue] = useState<number>(4095);
  const [wetValue, setWetValue] = useState<number>(1500);
  const [calibratingType, setCalibratingType] = useState<'dry' | 'wet' | null>(null);
  const [lastRaw, setLastRaw] = useState<number | null>(null);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(farmId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartCapture = async (type: 'dry' | 'wet') => {
    setCalibratingType(type);
    try {
      await fetch('/api/iot/calibrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farm_id: farmId, status: type })
      });
      
      const poll = setInterval(async () => {
        const response = await fetch(`/api/iot/calibrate/status?farm_id=${farmId}`);
        const data = await response.json();
        if (data.status === null) {
          setCalibratingType(null);
          if (data.dry) setDryValue(data.dry);
          if (data.wet) setWetValue(data.wet);
          setCalibrated(true);
          clearInterval(poll);
        }
      }, 2000);
    } catch {}
  };

  const universalFirmware = `
// AGRO Universal Sensor Firmware (V2.0 - Zero-Code)
#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverUrl = "https://agro-one-sepia.vercel.app/api/iot/ingestion";

void sendData() {
  if(WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    
    int rawMoisture = analogRead(34);
    
    String jsonPayload = "{\\\\"farm_id\\\\":\\\\"${farmId}\\\\",\\\\"sensor_id\\\\":\\\\"FIELD_01\\\\",\\\\"raw_moisture\\\\":" + String(rawMoisture) + "}";
    
    int httpResponseCode = http.POST(jsonPayload);
    http.end();
  }
}
  `;

  return (
    <div className="rounded-3xl bg-zinc-900/50 p-6 border border-zinc-800 backdrop-blur-sm">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3.5 bg-zinc-800 rounded-2xl text-white border border-zinc-700 shadow-xl">
          <FiCpu className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">{t('smartTools.sensor.title')}</h3>
          <p className="text-xs text-zinc-500 font-medium">{t('smartTools.sensor.subtitle')}</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Device Token */}
        <div className="p-5 bg-zinc-950 rounded-2xl border border-zinc-800 group transition-all hover:border-zinc-700">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-3 block">
            {t('smartTools.sensor.step1')}
          </label>
          <div className="flex items-center gap-3">
            <code className="flex-1 bg-zinc-900 px-4 py-3 rounded-xl border border-zinc-800 text-sm font-mono text-emerald-400 truncate">
              {farmId}
            </code>
            <button
              onClick={copyToClipboard}
              className="p-3.5 bg-white hover:bg-zinc-200 text-black rounded-xl transition-all active:scale-95 shadow-lg"
            >
              {copied ? <FiCheckCircle className="w-5 h-5" /> : <FiCopy className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-[10px] text-zinc-600 mt-3 flex items-center gap-1.5 font-medium italic">
            <FiInfo className="opacity-50" /> {t('smartTools.sensor.copyHint')}
          </p>
        </div>

        {/* AUTOMATIC CALIBRATION WIZARD */}
        <div className="p-6 bg-gradient-to-br from-zinc-950 to-zinc-900 rounded-3xl border border-zinc-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
             {calibrated ? (
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">{t('smartTools.sensor.ready')}</span>
            ) : (
              <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">{t('smartTools.sensor.setupNeeded')}</span>
            )}
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <span className="w-6 h-6 flex items-center justify-center bg-white text-black rounded-lg text-xs font-black">2</span> 
              {t('smartTools.sensor.step2')}
            </h4>
            <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
              {t('smartTools.sensor.step2Desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
            {/* AIR CAPTURE */}
            <div className={`p-5 rounded-2xl border transition-all ${
              calibratingType === 'dry' ? 'bg-red-500/10 border-red-500/50 scale-[1.02]' : 'bg-zinc-900 border-zinc-800'
            }`}>
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold text-zinc-500 uppercase">{t('smartTools.sensor.stepA')}</span>
                {dryValue !== 4095 && <span className="text-xs font-mono text-zinc-300 font-bold">{dryValue}</span>}
              </div>
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-700 shadow-lg">
                   <FiCheckCircle className={`w-8 h-8 transition-colors ${dryValue !== 4095 ? 'text-emerald-400' : 'text-zinc-600'}`} />
                </div>
                <h5 className="text-sm font-bold text-white">{t('smartTools.sensor.holdAir')}</h5>
                <button
                  onClick={() => handleStartCapture('dry')}
                  disabled={!!calibratingType}
                  className={`w-full py-2.5 rounded-xl text-xs font-black transition-all ${
                    calibratingType === 'dry' ? 'bg-red-500 text-white animate-pulse' : 
                    dryValue !== 4095 ? 'bg-zinc-800 text-zinc-400 border border-zinc-700' : 'bg-white text-black hover:bg-zinc-200'
                  }`}
                >
                  {calibratingType === 'dry' ? t('smartTools.sensor.listening') : dryValue !== 4095 ? t('smartTools.sensor.recaptureAir') : t('smartTools.sensor.captureAir')}
                </button>
              </div>
            </div>

            {/* WATER CAPTURE */}
            <div className={`p-5 rounded-2xl border transition-all ${
              calibratingType === 'wet' ? 'bg-blue-500/10 border-blue-500/50 scale-[1.02]' : 'bg-zinc-900 border-zinc-800'
            }`}>
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold text-zinc-500 uppercase">{t('smartTools.sensor.stepB')}</span>
                {wetValue !== 1500 && <span className="text-xs font-mono text-zinc-300 font-bold">{wetValue}</span>}
              </div>
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-700 shadow-lg">
                   <FiCheckCircle className={`w-8 h-8 transition-colors ${wetValue !== 1500 ? 'text-blue-400' : 'text-zinc-600'}`} />
                </div>
                <h5 className="text-sm font-bold text-white">{t('smartTools.sensor.dipWater')}</h5>
                <button
                  onClick={() => handleStartCapture('wet')}
                  disabled={!!calibratingType}
                  className={`w-full py-2.5 rounded-xl text-xs font-black transition-all ${
                    calibratingType === 'wet' ? 'bg-blue-500 text-white animate-pulse' : 
                    wetValue !== 1500 ? 'bg-zinc-800 text-zinc-400 border border-zinc-700' : 'bg-white text-black hover:bg-zinc-200'
                  }`}
                >
                  {calibratingType === 'wet' ? t('smartTools.sensor.listening') : wetValue !== 1500 ? t('smartTools.sensor.recaptureWater') : t('smartTools.sensor.captureWater')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Universal Firmware */}
        <div className="space-y-4">
           <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-sm flex items-center gap-2 tracking-wide uppercase">
                <span className="w-6 h-6 flex items-center justify-center bg-zinc-800 text-zinc-400 rounded-lg text-xs font-black">3</span> 
                {t('smartTools.sensor.step3')}
              </h4>
              <span className="text-[10px] font-bold text-zinc-500">{t('smartTools.sensor.worksForAny')}</span>
           </div>
          
          <div className="relative group">
            <pre className="bg-zinc-950 text-emerald-500/90 p-6 rounded-3xl text-xs overflow-x-auto font-mono max-h-64 border border-zinc-800 shadow-inner group-hover:border-zinc-700 transition-all">
              {universalFirmware}
            </pre>
            <div className="absolute top-4 right-4 flex gap-2">
              <span className="text-[10px] font-bold bg-zinc-800 text-zinc-300 px-3 py-1 rounded-lg border border-zinc-700">Arduino C++</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-xl"><FiCheckCircle className="text-emerald-400 w-4 h-4" /></div>
                <div>
                   <p className="text-xs font-bold text-white leading-none">{t('smartTools.sensor.autoSync')}</p>
                   <p className="text-[10px] text-zinc-500 mt-1">{t('smartTools.sensor.autoSyncDesc')}</p>
                </div>
             </div>
             <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-xl"><FiCheckCircle className="text-blue-500 w-4 h-4" /></div>
                <div>
                   <p className="text-xs font-bold text-white leading-none">{t('smartTools.sensor.serverMath')}</p>
                   <p className="text-[10px] text-zinc-500 mt-1">{t('smartTools.sensor.serverMathDesc')}</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
