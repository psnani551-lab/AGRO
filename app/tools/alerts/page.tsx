'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { FiBell, FiAlertTriangle, FiInfo, FiCheckCircle } from 'react-icons/fi';
import { db } from '@/lib/db';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

// Type definition for an alert
interface Alert {
    id: string;
    type: 'weather' | 'pest' | 'market' | 'general';
    severity: 'info' | 'warning' | 'critical';
    title: string;
    message: string;
    created_at: string;
    is_read: boolean;
}

export default function AlertsPage() {
    const { t } = useI18n();
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);

    const { user } = useAuth();

    useEffect(() => {
        fetchAlerts();
    }, [user]);

    const fetchAlerts = async () => {
        // Use Guest ID if no user
        const userId = user?.id || '00000000-0000-0000-0000-000000000000';

        try {
            // We can't use db.getAlerts directly if it relies on server-side auth or strict typing that blocks null user.
            // Let's use Supabase direct query for robustness here or patch db.getAlerts later?
            // For now, direct query is safest for this "fix".
            const { data, error } = await supabase
                .from('alerts')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (data) setAlerts(data as Alert[]);
        } catch (e) {
            console.error('Error fetching alerts', e);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await db.markAlertRead(id);
            setAlerts(alerts.map(a => a.id === id ? { ...a, is_read: true } : a));
        } catch (e) {
            console.error('Error marking as read', e);
        }
    };

    const getIcon = (type: string, severity: string) => {
        if (severity === 'critical') return <FiAlertTriangle className="text-red-500" />;
        if (severity === 'warning') return <FiBell className="text-amber-500" />;
        return <FiInfo className="text-blue-500" />;
    };

    const getBorderColor = (severity: string) => {
        if (severity === 'critical') return 'border-l-red-500';
        if (severity === 'warning') return 'border-l-amber-500';
        return 'border-l-blue-500';
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-12 px-4 selection:bg-primary-500/30 selection:text-primary-200">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{t('tools.alerts')}</h1>
                    <span className="bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-bold border border-gray-200 dark:border-gray-700 shadow-sm">
                        {alerts.filter(a => !a.is_read).length} Unread
                    </span>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : alerts.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800/50 backdrop-blur-md rounded-3xl p-12 text-center shadow-lg border border-gray-200 dark:border-gray-700/50">
                        <div className="bg-gray-100 dark:bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 dark:text-gray-500">
                            <FiBell size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Alerts</h3>
                        <p className="text-gray-500 dark:text-gray-400">You're all caught up! No critical notifications right now.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {alerts.map((alert) => (
                            <div
                                key={alert.id}
                                className={`bg-white dark:bg-gray-800 relative overflow-hidden p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 border-l-4 ${getBorderColor(alert.severity)} transition-all hover:shadow-md dark:hover:bg-gray-750 dark:hover:shadow-black/20 ${alert.is_read ? 'opacity-60 grayscale-[0.5]' : ''}`}
                            >
                                <div className="flex items-start justify-between relative z-10">
                                    <div className="flex items-start gap-5">
                                        <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 shadow-inner">
                                            {getIcon(alert.type, alert.severity)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">{alert.title}</h3>
                                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium text-sm">{alert.message}</p>
                                            <span className="text-xs text-gray-500 dark:text-gray-600 mt-3 block font-mono">
                                                {new Date(alert.created_at).toLocaleDateString()} • {new Date(alert.created_at).toLocaleTimeString()}
                                            </span>
                                        </div>
                                    </div>
                                    {!alert.is_read && (
                                        <button
                                            onClick={() => markAsRead(alert.id)}
                                            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1 py-1 px-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-100 dark:border-primary-900/30 transition-all hover:bg-primary-100 dark:hover:bg-primary-900/40"
                                        >
                                            <FiCheckCircle /> Mark Read
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
