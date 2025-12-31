'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiAlertTriangle, FiAlertCircle, FiCheckCircle, FiX } from 'react-icons/fi';
import { useI18n } from '@/lib/i18n';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: Date;
}

export default function AlertsPanel() {
  const { t } = useI18n();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    // Load alerts from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('alerts');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setAlerts(parsed);
        } catch (e) {
          console.error('Failed to parse alerts:', e);
        }
      }
    }
  }, []);

  const visibleAlerts = alerts.filter(a => !dismissed.includes(a.id));
  const criticalCount = visibleAlerts.filter(a => a.type === 'critical').length;

  const getAlertStyle = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200';
      default: return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'critical': return <FiAlertTriangle className="h-5 w-5 text-red-500" />;
      case 'warning': return <FiAlertCircle className="h-5 w-5 text-yellow-500" />;
      default: return <FiCheckCircle className="h-5 w-5 text-blue-500" />;
    }
  };

  if (visibleAlerts.length === 0) {
    return (
      <div className="rounded-lg bg-green-50 border border-green-200 p-4 dark:bg-green-900/20 dark:border-green-800">
        <div className="flex items-center gap-2">
          <FiCheckCircle className="h-5 w-5 text-green-500" />
          <span className="font-medium text-green-800 dark:text-green-200">🟢 {t('dashboard.noData')} - {t('dashboard.noDataMessage')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          🚨 {t('dashboard.metricsTitle')}
          {criticalCount > 0 && (
            <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">{criticalCount} {t('dashboard.high')}</span>
          )}
        </h2>
      </div>
      {visibleAlerts.map((alert, index) => (
        <motion.div
          key={alert.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`rounded-lg border p-4 ${getAlertStyle(alert.type)}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              {getIcon(alert.type)}
              <p className="text-sm">{alert.message}</p>
            </div>
            <button onClick={() => setDismissed([...dismissed, alert.id])} className="hover:opacity-70">
              <FiX className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
