


export interface Alert {
    id?: string;
    type: 'weather' | 'pest' | 'market' | 'general';
    severity: 'info' | 'warning' | 'critical';
    title: string;
    message: string;
    created_at?: string;
    is_read?: boolean;
}

export const generateAlerts = (weather: any, market: any, farmProfileOrCrop: any): Alert[] => {
    const alerts: Alert[] = [];
    const cropName = typeof farmProfileOrCrop === 'string' ? farmProfileOrCrop : farmProfileOrCrop?.crop || 'Crop';

    // --- Weather Analysis ---
    if (weather?.current) {
        const { temp_c, condition, wind_kph } = weather.current;

        // High Temp Warning
        if (temp_c > 35) {
            alerts.push({
                type: 'weather',
                severity: 'warning',
                title: 'High Heat Warning',
                message: `Temperature is ${Math.round(temp_c)}°C. Ensure adequate irrigation for ${cropName}.`,
            });
        }

        // Storm/Rain Warning
        if (condition?.text?.toLowerCase().includes('rain') || condition?.text?.toLowerCase().includes('storm')) {
            alerts.push({
                type: 'weather',
                severity: 'critical',
                title: 'Rain Alert',
                message: `Heavy rain detected (${condition.text}). Pause spraying activities.`,
            });
        }

        // Wind Warning
        if (wind_kph > 30) {
            alerts.push({
                type: 'weather',
                severity: 'warning',
                title: 'High Winds',
                message: `Wind speed ${wind_kph} km/h. Avoid high sprayers.`,
            });
        }
    }

    // --- Market Analysis ---
    if (market?.currentPrice) {
        const { modal, min, max } = market.currentPrice;

        // Price Drop Check (Simple heuristic)
        // In a real app, we'd compare to yesterday's price
        if (market.priceHistory && market.priceHistory.length > 0) {
            const lastMonthPrice = market.priceHistory[market.priceHistory.length - 1].avgPrice;
            if (modal < lastMonthPrice * 0.9) {
                alerts.push({
                    type: 'market',
                    severity: 'critical',
                    title: 'Price Drop Alert',
                    message: `Market price for ${market.cropName} has dropped below last month's average.`,
                });
            }
        }
    }

    return alerts;
};

import { db } from '@/lib/db';

export const saveAlerts = async (newAlerts: Alert[], userId?: string) => {
    if (newAlerts.length === 0) return;

    // If no user, we might save to localStorage or just return (skipping cloud)
    // For now, if no userId, we skip cloud save.
    if (!userId) {
        // Fallback to local storage for demo
        try {
            const current = localStorage.getItem('alerts');
            const parsed = current ? JSON.parse(current) : [];
            const combined = [...newAlerts, ...parsed].slice(0, 50); // Limit to 50
            localStorage.setItem('alerts', JSON.stringify(combined));
        } catch (e) { console.error(e); }
        return;
    }

    try {
        // Save to Supabase via DB helper
        // Process sequentially or parallel
        for (const alert of newAlerts) {
            await db.saveAlert(userId, {
                type: alert.type,
                severity: alert.severity,
                message: alert.message, // Map title + message? Schema has message. 
                // Schema: type, severity, message, is_read.
                // Alert interface: title, message.
                // Let's combine title and message or just use message.
                // Updating logic to Combine:
                is_read: false
            });
        }
    } catch (error) {
        console.error('Error saving alerts to DB:', error);
    }
};
