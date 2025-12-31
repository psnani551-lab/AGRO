'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiX, FiCheck, FiSettings, FiCloudRain, FiTrendingUp, FiActivity, FiDroplet, FiSun } from 'react-icons/fi';
import { useI18n } from '@/lib/i18n';

interface Alert {
  id: string;
  type: 'weather' | 'market' | 'pest' | 'irrigation' | 'harvest';
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  date: string;
  read: boolean;
}

const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'weather',
    priority: 'high',
    title: 'alerts.demo.heavyRain.title',
    message: 'alerts.demo.heavyRain.message',
    date: '10 min ago',
    read: false
  },
  {
    id: '2',
    type: 'market',
    priority: 'medium',
    title: 'alerts.demo.priceSurge.title',
    message: 'alerts.demo.priceSurge.message',
    date: '2 hours ago',
    read: false
  },
  {
    id: '3',
    type: 'pest',
    priority: 'high',
    title: 'alerts.demo.pestRisk.title',
    message: 'alerts.demo.pestRisk.message',
    date: '5 hours ago',
    read: true
  },
  {
    id: '4',
    type: 'irrigation',
    priority: 'low',
    title: 'alerts.demo.irrigation.title',
    message: 'alerts.demo.irrigation.message',
    date: '1 day ago',
    read: true
  }
];

export default function AlertsDisplay() {
  const { t } = useI18n();
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [showPreferences, setShowPreferences] = useState(false);

  const unreadCount = alerts.filter(a => !a.read).length;

  const markAsRead = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  }, []);

  const markAllAsRead = useCallback(() => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  }, []);

  const deleteAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  const getIcon = (type: Alert['type']) => {
    switch (type) {
      case 'weather': return <FiCloudRain />;
      case 'market': return <FiTrendingUp />;
      case 'pest': return <FiActivity />;
      case 'irrigation': return <FiDroplet />;
      case 'harvest': return <FiSun />;
    }
  };

  const getTypeColor = (type: Alert['type']) => {
    switch (type) {
      case 'weather': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'market': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'pest': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'irrigation': return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20';
      case 'harvest': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <FiBell className="text-zinc-400 w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-zinc-900" />
            )}
          </div>
          <div>
            <h3 className="text-white font-bold">{t('alerts.yourAlerts')}</h3>
            <p className="text-xs text-zinc-500">
              {unreadCount} {unreadCount === 1 ? t('alerts.unreadNotifications') : t('alerts.unreadNotificationsPlural')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={markAllAsRead}
            className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
            title={t('alerts.markAllRead')}
          >
            <FiCheck className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowPreferences(!showPreferences)}
            className={`p-2 rounded-lg transition-colors ${showPreferences ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800 text-zinc-400 hover:text-white'}`}
            title={t('alerts.notificationPreferences')}
          >
            <FiSettings className="w-4 h-4" />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {showPreferences ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="p-4 space-y-3 bg-zinc-900/50 border-b border-zinc-800"
          >
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">{t('alerts.notificationPreferences')}</h4>
            {[
              { label: t('alerts.weatherAlerts'), checked: true },
              { label: t('alerts.marketPriceUpdates'), checked: true },
              { label: t('alerts.pestDiseaseWarnings'), checked: true },
              { label: t('alerts.irrigationReminders'), checked: true },
              { label: t('alerts.harvestRecommendations'), checked: false }
            ].map((pref, i) => (
              <label key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-800 cursor-pointer group">
                <span className="text-sm text-zinc-400 group-hover:text-zinc-300 font-medium">{pref.label}</span>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${pref.checked ? 'bg-green-500' : 'bg-zinc-700'}`}>
                  <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all shadow-sm ${pref.checked ? 'left-6' : 'left-1'}`} />
                </div>
              </label>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
        <AnimatePresence initial={false}>
          {alerts.map((alert) => (
            <motion.div
              key={alert.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`relative group p-4 rounded-xl border transition-all hover:bg-zinc-800/50 ${alert.read ? 'bg-transparent border-transparent opacity-60' : 'bg-zinc-800/30 border-zinc-800'}`}
            >
              <div className="flex gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getTypeColor(alert.type)}`}>
                  {getIcon(alert.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`font-bold text-sm truncate pr-2 ${alert.read ? 'text-zinc-500' : 'text-zinc-200'}`}>
                      {t(alert.title)}
                    </h4>
                    <span className="text-[10px] text-zinc-500 whitespace-nowrap bg-zinc-950 px-2 py-0.5 rounded-full border border-zinc-800">
                      {alert.date}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-2">
                    {t(alert.message)}
                  </p>
                  {!alert.read && (
                    <button
                      onClick={() => markAsRead(alert.id)}
                      className="text-[10px] font-bold text-green-500 hover:text-green-400 transition-colors uppercase tracking-wide flex items-center gap-1"
                    >
                      <FiCheck className="w-3 h-3" /> {t('alerts.markRead')}
                    </button>
                  )}
                </div>
              </div>
              <button
                onClick={() => deleteAlert(alert.id)}
                className="absolute top-2 right-2 p-1.5 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-zinc-900"
              >
                <FiX className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {alerts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-500 space-y-2">
            <FiBell className="w-8 h-8 opacity-20" />
            <p className="text-sm font-medium">{t('alerts.noNew')}</p>
          </div>
        )}
      </div>
    </div >
  );
}
