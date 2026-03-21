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
  const [dryValue, setDryValue] = useState<number>(4095); // Default ESP32 12-bit max
  const [wetValue, setWetValue] = useState<number>(1500); 
  const [calibrated, setCalibrated] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(farmId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const esp32Snippet = `
// AGRO IoT Ingestion Snippet for ESP32
#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverUrl = "https://agro-one-sepia.vercel.app/api/iot/ingestion";

void sendData(float moisture, float temp) {
  if(WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    
    // CALIBRATED MAPPING: ${dryValue} (Dry) -> 0%, ${wetValue} (Wet) -> 100%
    float moistureRaw = analogRead(34);
    float moisture = map(moistureRaw, ${dryValue}, ${wetValue}, 0, 100);
    moisture = constrain(moisture, 0, 100);
    
    String jsonPayload = "{\\"farm_id\\":\\"${farmId}\\",\\"sensor_id\\":\\"ESP32_FIELD_01\\",\\"moisture\\":" + String(moisture) + ",\\"temperature\\":" + String(temp) + "}";
    
    int httpResponseCode = http.POST(jsonPayload);
    http.end();
  }
}
  `;

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-purple-100 dark:bg-purple-900/40 rounded-lg text-purple-600 dark:text-purple-400">
          <FiCpu className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Connect IoT Sensor</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Add ground-truth data to your dashboard</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Device Token */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
            Your Device Token (Farm ID)
          </label>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-white dark:bg-gray-800 px-3 py-2 rounded border border-gray-200 dark:border-gray-700 text-sm font-mono text-purple-600 dark:text-purple-400 truncate">
              {farmId}
            </code>
            <button
              onClick={copyToClipboard}
              className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
              title="Copy Token"
            >
              {copied ? <FiCheckCircle /> : <FiCopy />}
            </button>
          </div>
          <p className="text-[10px] text-gray-500 mt-2 italic">
            <FiInfo className="inline mr-1" /> Never share this token. It allows devices to post data to your farm.
          </p>
        </div>

        {/* CALIBRATION WIZARD */}
        <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100 uppercase tracking-tight flex items-center gap-2">
              <span className="p-1.5 bg-blue-500 text-white rounded-lg text-xs">A</span> Precision Calibration Wizard
            </h4>
            {!calibrated ? (
              <span className="text-[9px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full dark:bg-orange-900/40 dark:text-orange-300">UNTESTED</span>
            ) : (
              <span className="text-[9px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full dark:bg-green-900/40 dark:text-green-300">CALIBRATED</span>
            )}
          </div>
          
          <p className="text-[11px] text-blue-800/70 dark:text-blue-300/70 mb-5 leading-relaxed">
            Every soil probe is different. Run this test to map your raw voltage to 0-100% moisture.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-blue-900/40 dark:text-blue-100/40 uppercase">1. Dry Point (Air)</label>
              <input 
                type="number" 
                value={dryValue}
                onChange={(e) => { setDryValue(Number(e.target.value)); setCalibrated(true); }}
                className="w-full bg-white dark:bg-gray-800 border-2 border-blue-100 dark:border-blue-900 rounded-xl px-3 py-2 text-sm font-mono focus:border-blue-500 transition-all outline-none"
                placeholder="4095"
              />
              <p className="text-[9px] text-blue-500 italic">Hold probe in dry air</p>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-blue-900/40 dark:text-blue-100/40 uppercase">2. Wet Point (Water)</label>
              <input 
                type="number" 
                value={wetValue}
                onChange={(e) => { setWetValue(Number(e.target.value)); setCalibrated(true); }}
                className="w-full bg-white dark:bg-gray-800 border-2 border-blue-100 dark:border-blue-900 rounded-xl px-3 py-2 text-sm font-mono focus:border-blue-500 transition-all outline-none"
                placeholder="1500"
              />
              <p className="text-[9px] text-blue-500 italic">Dip probe in cup of water</p>
            </div>
          </div>

          <div className="bg-blue-900 text-blue-100 p-3 rounded-xl text-[10px] font-mono border border-blue-800 shadow-inner">
            <span className="text-blue-400 opacity-50">// Your generated formula</span><br/>
            float moisture = map(rawVal, <span className="text-yellow-400 font-bold">{dryValue}</span>, <span className="text-cyan-400 font-bold">{wetValue}</span>, 0, 100);
          </div>
        </div>

        {/* Quick Setup Instructions */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            Quick Setup (ESP32/Arduino)
          </h4>
          
          <div className="relative">
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-[11px] overflow-x-auto font-mono max-h-48">
              {esp32Snippet}
            </pre>
            <div className="absolute top-2 right-2 flex gap-2">
              <span className="text-[10px] bg-gray-700 text-gray-300 px-2 py-0.5 rounded">Arduino C++</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
              <p className="text-xs font-bold text-blue-900 dark:text-blue-100 mb-1">Buy Sensors</p>
              <p className="text-[11px] text-blue-800 dark:text-blue-300 mb-3">Compatible with capacitive soil moisture probes ($5-$15).</p>
              <a href="#" className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline">
                View Parts List <FiExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
              <p className="text-xs font-bold text-green-900 dark:text-green-100 mb-1">Standard API</p>
              <p className="text-[11px] text-green-800 dark:text-green-300 mb-3">JSON over HTTPS. Supports any device that can make POST requests.</p>
              <a href="#" className="text-xs font-bold text-green-600 dark:text-green-400 flex items-center gap-1 hover:underline">
                API Docs <FiExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
