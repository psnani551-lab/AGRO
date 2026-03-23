'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCpu, FiCopy, FiCheckCircle, FiInfo, FiExternalLink, FiWind, FiDroplet } from 'react-icons/fi';
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
    String jsonPayload = "{\\"farm_id\\":\\"${farmId}\\",\\"sensor_id\\":\\"FIELD_01\\",\\"raw_moisture\\":" + String(rawMoisture) + "}";
    
    int httpResponseCode = http.POST(jsonPayload);
    http.end();
  }
}
  `;

  return (
    <div className="rounded-3xl bg-zinc-950 p-8 border border-zinc-800 shadow-2xl">
      <div className="flex flex-col items-center text-center gap-4 mb-10">
        <div className="p-5 bg-emerald-500/10 rounded-2xl text-emerald-400 border-2 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
          <FiCpu className="h-10 w-10" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-white tracking-tighter uppercase">Easy Sensor Setup</h3>
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Just Copy & Press Buttons</p>
        </div>
      </div>

      <div className="space-y-10">
        {/* Step 1: Copy Key */}
        <div className="bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800 relative group transition-all hover:bg-zinc-900 hover:border-zinc-700">
          <div className="absolute -top-4 -left-4 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center font-black text-xl shadow-xl">1</div>
          <h4 className="text-white font-black text-sm uppercase tracking-tighter mb-4">Copy Your Farm Key</h4>
          <div className="flex items-center gap-4">
            <code className="flex-1 bg-zinc-950 px-5 py-4 rounded-2xl border border-zinc-800 text-lg font-mono text-emerald-400 tracking-wider">
              {farmId.slice(0, 8)}...
            </code>
            <button
              onClick={copyToClipboard}
              className="px-6 py-4 bg-white hover:bg-zinc-200 text-black rounded-2xl transition-all active:scale-95 shadow-xl font-black text-xs uppercase"
            >
              {copied ? 'COPIED!' : 'COPY'}
            </button>
          </div>
        </div>

        {/* Step 2: Press Buttons */}
        <div className="bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800 relative group transition-all hover:bg-zinc-900 hover:border-zinc-700">
           <div className="absolute -top-4 -left-4 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center font-black text-xl shadow-xl">2</div>
           <h4 className="text-white font-black text-sm uppercase tracking-tighter mb-6">Press While Setting Up</h4>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Air Button */}
              <div className="flex flex-col items-center gap-4">
                 <div className={`p-6 rounded-3xl border-4 transition-all ${dryValue !== 4095 ? 'bg-emerald-500/10 border-emerald-500' : 'bg-zinc-950 border-zinc-800'}`}>
                    <FiWind className={`w-12 h-12 ${dryValue !== 4095 ? 'text-emerald-400' : 'text-zinc-600'}`} />
                 </div>
                 <button
                    onClick={() => handleStartCapture('dry')}
                    className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-xl ${
                        calibratingType === 'dry' ? 'bg-red-600 text-white animate-pulse' :
                        dryValue !== 4095 ? 'bg-zinc-800 text-zinc-500' : 'bg-white text-black hover:bg-zinc-200'
                    }`}
                 >
                    {calibratingType === 'dry' ? 'LISTENING...' : dryValue !== 4095 ? 'AIR DONE ✅' : 'PRESS: SENSOR IN AIR'}
                 </button>
              </div>

              {/* Water Button */}
              <div className="flex flex-col items-center gap-4">
                 <div className={`p-6 rounded-3xl border-4 transition-all ${wetValue !== 1500 ? 'bg-blue-500/10 border-blue-500' : 'bg-zinc-950 border-zinc-800'}`}>
                    <FiDroplet className={`w-12 h-12 ${wetValue !== 1500 ? 'text-blue-400' : 'text-zinc-600'}`} />
                 </div>
                 <button
                    onClick={() => handleStartCapture('wet')}
                    className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-xl ${
                        calibratingType === 'wet' ? 'bg-red-600 text-white animate-pulse' :
                        wetValue !== 1500 ? 'bg-zinc-800 text-zinc-500' : 'bg-white text-black hover:bg-zinc-200'
                    }`}
                 >
                    {calibratingType === 'wet' ? 'LISTENING...' : wetValue !== 1500 ? 'WATER DONE ✅' : 'PRESS: SENSOR IN WATER'}
                 </button>
              </div>
           </div>
        </div>

        {/* Success Message */}
        {calibrated && (
            <div className="bg-emerald-500/10 border-2 border-emerald-500 p-6 rounded-3xl flex items-center gap-5">
                <div className="text-4xl animate-bounce">🎉</div>
                <div>
                    <h5 className="text-emerald-400 font-black text-sm uppercase">Smart Sync Complete!</h5>
                    <p className="text-zinc-400 text-xs font-bold leading-relaxed mt-1">Your sensor is now scientific and linked to your farm. No more setup needed!</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}

