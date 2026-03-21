'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiFileText, FiCalendar, FiFilter, FiCheckCircle } from 'react-icons/fi';

interface ExportPortalProps {
  farmId: string;
}

export const ExportPortal: React.FC<ExportPortalProps> = ({ farmId }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dataTypes, setDataTypes] = useState<string[]>(['sensors']);
  const [format, setFormat] = useState<'csv' | 'json'>('csv');

  const handleExport = async () => {
    setLoading(true);
    setSuccess(false);

    try {
      const response = await fetch('/api/export/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmId,
          dataTypes,
          format,
          dateRange: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
            end: new Date().toISOString()
          }
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `agro_export_${Date.now()}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        setSuccess(true);
      }
    } catch (error) {
      console.error('Export UI Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleType = (type: string) => {
    setDataTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <FiFileText className="text-blue-400" /> B2B Export Center
          </h3>
          <p className="text-xs text-white/60 mt-1 italic">Professional Data Portability for Auditing</p>
        </div>
        <div className="bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
          <span className="text-[10px] font-bold text-blue-400">ENTERPRISE READY</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="text-[10px] uppercase font-bold text-white/40 block mb-3 flex items-center gap-1">
            <FiFilter className="h-3 w-3" /> Select Datasets
          </label>
          <div className="flex flex-wrap gap-2">
            {['sensors', 'machinery', 'satellite'].map(type => (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                  dataTypes.includes(type) 
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] uppercase font-bold text-white/40 block mb-3 flex items-center gap-1">
            <FiCalendar className="h-3 w-3" /> Export Format
          </label>
          <div className="flex gap-2">
            {(['csv', 'json'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                  format === f 
                    ? 'bg-white text-blue-900' 
                    : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/5'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handleExport}
        disabled={loading || dataTypes.length === 0}
        className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm transition-all shadow-xl ${
          loading 
            ? 'bg-white/20 text-white/50 cursor-not-allowed' 
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:scale-[1.02] active:scale-95'
        }`}
      >
        {loading ? (
          'GENERATING EXPORT...'
        ) : success ? (
          <>
            <FiCheckCircle className="h-5 w-5" /> EXPORT DOWNLOADED
          </>
        ) : (
          <>
            <FiDownload className="h-5 w-5" /> DOWNLOAD BULK DATA
          </>
        )}
      </button>

      <p className="text-[10px] text-center text-white/30 mt-4 italic">
        * Exports are limited to 1,000 rows per request. For bulk enterprise API access, contact support.
      </p>
    </div>
  );
};
