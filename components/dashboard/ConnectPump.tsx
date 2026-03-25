'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCpu, FiCopy, FiCheckCircle, FiInfo, FiLayers, FiActivity, FiArrowRight } from 'react-icons/fi';
import { useI18n } from '@/lib/i18n';

interface ConnectPumpProps {
  farmId: string;
}

export default function ConnectPump({ farmId }: ConnectPumpProps) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const pumpDeviceId = `${farmId}-PUMP`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pumpDeviceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pumpFirmware = `
// AGRO "Smart Finger" Pump Firmware (V1.0)
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h> // Ensure you install this library

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const String deviceId = "${pumpDeviceId}";
const String syncUrl = "https://agro-one-sepia.vercel.app/api/iot/pump-sync?deviceId=" + deviceId;
const String ackUrl  = "https://agro-one-sepia.vercel.app/api/iot/pump-ack";

const int RELAY_PIN = 26; // Connect 5V Relay IN to Pin 26

void setup() {
  Serial.begin(115200);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);
  WiFi.begin(ssid, password);
}

void loop() {
  if(WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(syncUrl);
    int httpCode = http.GET();
    
    if(httpCode == 200) {
      String payload = http.getString();
      if(payload.indexOf("START") > 0) {
        Serial.println("Command Received: START PUMP");
        
        digitalWrite(RELAY_PIN, HIGH);
        delay(1000); 
        digitalWrite(RELAY_PIN, LOW);
        
        String commandId = extractCommandId(payload);
        acknowledge(commandId, "EXECUTED");
      }
    }
    http.end();
  }
  delay(5000); // Poll every 5 seconds
}

void acknowledge(String id, String status) {
  HTTPClient http;
  http.begin(ackUrl);
  http.addHeader("Content-Type", "application/json");
  String payload = "{\\\\"commandId\\\\":\\\\"" + id + "\\\\",\\\\"status\\\\":\\\\"" + status + "\\\\"}";
  http.POST(payload);
  http.end();
}
  `;

  return (
    <div className="rounded-3xl bg-zinc-900/50 p-6 border border-zinc-800 backdrop-blur-sm">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3.5 bg-zinc-800 rounded-2xl text-white border border-zinc-700 shadow-xl">
          <FiLayers className="h-6 w-6 text-blue-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">{t('smartTools.pump.title')}</h3>
          <p className="text-xs text-zinc-500 font-medium">{t('smartTools.pump.subtitle')}</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Device Token */}
        <div className="p-5 bg-zinc-950 rounded-2xl border border-zinc-800 group transition-all hover:border-zinc-700">
          <label className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em] mb-3 block">
            {t('smartTools.pump.step1')}
          </label>
          <div className="flex items-center gap-3">
            <code className="flex-1 bg-zinc-900 px-4 py-3 rounded-xl border border-zinc-800 text-sm font-mono text-blue-400 truncate">
              {pumpDeviceId}
            </code>
            <button
              onClick={copyToClipboard}
              className="p-3.5 bg-white hover:bg-zinc-200 text-black rounded-xl transition-all active:scale-95 shadow-lg"
            >
              {copied ? <FiCheckCircle className="w-5 h-5 text-green-500" /> : <FiCopy className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Hardware Wiring instructions */}
        <div className="p-6 bg-gradient-to-br from-zinc-950 to-zinc-900 rounded-3xl border border-zinc-800 shadow-2xl">
          <div className="mb-6">
            <h4 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <span className="w-6 h-6 flex items-center justify-center bg-blue-500 text-white rounded-lg text-xs font-black">2</span> 
              {t('smartTools.pump.step2')}
            </h4>
            <p className="text-xs text-zinc-500 mt-2 leading-relaxed flex items-center gap-2">
              <FiInfo className="text-amber-500 flex-shrink-0" />
              {t('smartTools.pump.step2Desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800 flex items-start gap-4">
               <div className="mt-1 w-3 h-3 rounded-full bg-red-500 flex-shrink-0" />
               <div>
                  <h5 className="text-xs font-bold text-white mb-1">{t('smartTools.pump.vcc')}</h5>
                  <p className="text-[10px] text-zinc-500">{t('smartTools.pump.vccDesc')}</p>
               </div>
            </div>
            <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800 flex items-start gap-4">
               <div className="mt-1 w-3 h-3 rounded-full bg-zinc-500 flex-shrink-0" />
               <div>
                  <h5 className="text-xs font-bold text-white mb-1">{t('smartTools.pump.gnd')}</h5>
                  <p className="text-[10px] text-zinc-500">{t('smartTools.pump.gndDesc')}</p>
               </div>
            </div>
            <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800 flex items-start gap-4 md:col-span-2">
               <div className="mt-1 w-3 h-3 rounded-full bg-blue-500 flex-shrink-0" />
               <div>
                  <h5 className="text-xs font-bold text-white mb-1">{t('smartTools.pump.signal')}</h5>
                  <p className="text-[10px] text-zinc-500">{t('smartTools.pump.signalDesc')}</p>
               </div>
            </div>
          </div>
        </div>

        {/* Firmware */}
        <div className="space-y-4">
           <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-sm flex items-center gap-2 tracking-wide uppercase">
                <span className="w-6 h-6 flex items-center justify-center bg-zinc-800 text-zinc-400 rounded-lg text-xs font-black">3</span> 
                {t('smartTools.pump.step3')}
              </h4>
           </div>
          
          <div className="relative group">
            <pre className="bg-zinc-950 text-blue-400 p-6 rounded-3xl text-xs overflow-x-auto font-mono max-h-80 border border-zinc-800 shadow-inner group-hover:border-zinc-700 transition-all">
              {pumpFirmware}
            </pre>
            <div className="absolute top-4 right-4 flex gap-2">
              <span className="text-[10px] font-bold bg-zinc-800 text-zinc-300 px-3 py-1 rounded-lg border border-zinc-700">Arduino IoT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
