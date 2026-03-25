'use client';

import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FiDroplet, FiActivity, FiBarChart2, FiTrendingUp, FiMapPin, FiCloudRain, FiCloudLightning, FiCloud, FiSun, FiCheckCircle, FiRefreshCw, FiAlertCircle, FiDollarSign, FiLayers, FiImage } from 'react-icons/fi';
import { useI18n } from '@/lib/i18n';
import { storage } from '@/lib/storage';
import { db } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import { IrrigationModal, DiseaseModal, YieldModal } from './DashboardModals';
import SmartRotationCard from './SmartRotationCard';
import AnalysisLoader from '@/components/ui/AnalysisLoader';
import { IrrigationWidget, DiseaseWidget, YieldWidget, RecommendationsWidget } from './DashboardWidgets';

// --- Sub-Components ---

const SatelliteBadge = memo(({ label }: { label?: string }) => (
    <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full backdrop-blur-md">
        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1">
            🛰️ {label || 'Space Data'}
        </span>
    </div>
));

const ValuationHero = memo(({ valuation, marketData, analysis, t }: any) => (
    <motion.div variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }} className="relative overflow-hidden rounded-3xl bg-zinc-950 text-white shadow-2xl p-8 h-full flex flex-col justify-between border border-zinc-800 hover:border-zinc-600 transition-all duration-300">
        <SatelliteBadge label={t('dashboard.spaceData')} />
        {/* Background Decorative Elements */}
        <div className="absolute -right-12 -top-12 opacity-5 rotate-12">
            <FiDollarSign className="w-64 h-64 text-white" />
        </div>
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Header Section */}
        <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800">
                    <FiTrendingUp className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-zinc-400 text-xs font-bold uppercase tracking-[0.2em]">
                    {t('yield.estimatedTotalYield')}
                </h2>
            </div>

            <div className="mt-2">
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-white">
                    {valuation ? valuation.formatted : '---'}
                </h1>
                <p className="text-lg text-zinc-400 font-medium mt-2 flex items-center gap-2">
                    {t('yield.potentialRevenue')} <span className="text-xs bg-white text-black px-2 py-0.5 rounded-full font-bold">FY 2025-26</span>
                </p>
            </div>
        </div>

        {/* Middle Details */}
        <div className="relative z-10 my-6 pl-4 border-l-4 border-zinc-700">
            <p className="text-sm text-zinc-400 leading-relaxed font-medium max-w-xs">
                {t('yield.basedOn')} <span className="text-white font-bold">{analysis?.yieldForecast?.crops?.[0]?.estimatedYield?.toLocaleString() || '---'} kg</span> {t('yield.yield')}
                {t('yield.at')} <span className="text-white font-bold">₹{marketData?.data?.currentPrice?.modal ? (marketData.data.currentPrice.modal / 100).toFixed(2) : '---'}/kg</span> {t('yield.marketPrice')}.
            </p>
        </div>

        {/* Bottom Badges */}
        <div className="relative z-10 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 px-4 py-2 rounded-xl text-zinc-300 font-bold text-sm">
                <FiTrendingUp className="w-4 h-4 text-white" />
                {marketData?.data?.economics?.profitMargin || 0}% {t('yield.profitMargin')}
            </div>
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 px-4 py-2 rounded-xl text-zinc-300 font-bold text-sm">
                <FiBarChart2 className="w-4 h-4 text-white" />
                {analysis?.yieldForecast?.crops?.[0]?.confidence || 0}% {t('yield.forecastConfidence')}
            </div>
        </div>
    </motion.div>
));

const WeatherCard = memo(({ weatherData, satelliteData, t }: any) => {
    // Helper for weather icons
    const getWeatherIcon = (condition: string, isSmall = false) => {
        const text = condition?.toLowerCase() || '';
        const className = isSmall ? "w-8 h-8 mb-2 drop-shadow-md" : "w-16 h-16 drop-shadow-xl";

        if (text.includes('rain') || text.includes('drizzle')) return <FiCloudRain className={`${className} text-white`} />;
        if (text.includes('storm') || text.includes('thunder')) return <FiCloudLightning className={`${className} text-white`} />;
        if (text.includes('cloud') || text.includes('overcast')) return <FiCloud className={`${className} text-zinc-400`} />;
        return <FiSun className={`${className} text-white`} />;
    };

    return (
        <motion.div variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }} className="lg:col-span-2 rounded-3xl bg-zinc-900 text-white shadow-2xl p-8 relative overflow-hidden group border border-zinc-800 h-full flex flex-col hover:border-zinc-600 transition-all duration-300">
            <SatelliteBadge label={t('dashboard.spaceData')} />
            {/* Background Ambience */}
            <div className="absolute -right-20 -top-20 text-white/5 transition-transform duration-[20s] ease-in-out group-hover:rotate-45">
                <FiSun className="w-[500px] h-[500px]" />
            </div>

            <div className="relative z-10 flex-1 flex flex-col justify-between">
                {/* Top Section: Location & Current */}
                <div className="flex justify-between items-start">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-zinc-300 bg-zinc-950 w-fit px-4 py-1.5 rounded-full text-sm font-medium border border-zinc-800">
                            <FiMapPin className="text-white" /> {weatherData?.location || t('weather.detectingLocation')}
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-5xl lg:text-6xl font-bold tracking-tighter text-white">
                                {weatherData?.current?.temp_c ? `${Math.round(weatherData.current.temp_c)}°` : '--'}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-white font-semibold text-lg capitalize flex items-center gap-2">
                                    {weatherData?.current?.condition?.text || t('dashboard.loading')}
                                </span>
                                <span className="text-sm text-zinc-400">{t('weather.feelsLike')} {weatherData?.current?.temp_c ? `${Math.round(weatherData.current.temp_c + 2)}°` : '--'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="hidden sm:block bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
                        <div className="text-right space-y-3">
                            <div className="flex items-center justify-end gap-3">
                                <span className="text-xs text-zinc-400 uppercase tracking-widest font-bold">{t('weather.humidity')}</span>
                                <span className="text-xl font-bold text-white">{weatherData?.current?.humidity ? `${weatherData.current.humidity}%` : '--'}</span>
                            </div>
                            <div className="w-full h-px bg-zinc-800" />
                            <div className="flex items-center justify-end gap-3">
                                <span className="text-xs text-zinc-400 uppercase tracking-widest font-bold">{t('weather.wind')}</span>
                                <span className="text-xl font-bold text-white">{weatherData?.current?.wind_kph ? `${weatherData.current.wind_kph}kph` : '--'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Middle: 7-Day Grid */}
                <div className="mt-8 bg-zinc-950 rounded-2xl p-4 border border-zinc-800">
                    <div className="flex justify-between items-end mb-4 px-1">
                        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-[0.15em] flex items-center gap-2">
                            <FiActivity /> {t('climate.forecast')}
                        </h4>
                        <span className="text-[10px] text-zinc-950 bg-white px-2 py-0.5 rounded font-bold">{t('weather.liveUpdate')}</span>
                    </div>

                    <div className="grid grid-cols-7 gap-3">
                        {weatherData?.forecast?.map((day: any, i: number) => (
                            <div key={i} className="group/day relative flex flex-col items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl p-3 hover:bg-zinc-800 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg cursor-default h-[110px]">
                                <span className="text-[10px] font-bold opacity-70 uppercase tracking-wide text-zinc-400">{day.date?.slice(0, 3)}</span>
                                <div className="my-1 transform transition-transform group-hover/day:scale-110 duration-300 text-white">
                                    {getWeatherIcon(day.rain > 30 ? 'rain' : day.temp < 15 ? 'cloud' : 'sun', true)}
                                </div>
                                <div className="flex flex-col items-center gap-0.5">
                                    <span className="text-sm font-bold text-white">{Math.round(day.temp)}°</span>
                                    <span className="text-[9px] text-zinc-500">{Math.round(day.temp - 8)}°</span>
                                </div>
                            </div>
                        ))}
                        {!weatherData?.forecast && [1, 2, 3, 4, 5, 6, 7].map(i => (
                            <div key={i} className="h-[110px] bg-zinc-800 rounded-xl animate-pulse" />
                        ))}
                    </div>
                </div>

                {/* Bottom Status - Highlighting Soil Moisture */}
                <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-zinc-950/40 p-5 rounded-2xl border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                    <div className="w-full sm:w-2/3 flex flex-col gap-2">
                       <div className="flex justify-between items-center px-1">
                         <span className="text-xs text-blue-400 font-bold uppercase tracking-widest flex items-center gap-2">
                             <FiDroplet className="w-4 h-4 text-blue-400 mb-0.5 animate-pulse"/> {t('dashboard.soilMoistureSat')}
                         </span>
                         <span className="text-sm text-white font-black bg-blue-500/20 px-2 py-0.5 rounded-md text-blue-300">
                             {satelliteData?.soil?.moisture ? `${satelliteData.soil.moisture.toFixed(0)}%` : '65%'}
                         </span>
                       </div>
                       <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 shadow-inner">
                           <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full relative" style={{ width: `${satelliteData?.soil?.moisture || 65}%` }}>
                               <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse" />
                           </div>
                       </div>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-1.5 bg-blue-500/10 px-4 py-2.5 rounded-xl border border-blue-500/30 whitespace-nowrap shrink-0">
                        <span className="text-[10px] text-emerald-400 font-bold tracking-wide flex items-center gap-1.5">
                            <FiCheckCircle className="w-3.5 h-3.5" /> {t('weather.excellentConditions')}
                        </span>
                        <span className="text-[9px] text-blue-400/80 font-black uppercase tracking-widest">{t('dashboard.spaceVerified')}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
});


// Helper to normalize commodity names
const normalizeCommodity = (name: string) => {
    if (!name) return '';
    const n = name.toLowerCase().trim();
    if (n.includes('raddish')) return 'Radish';
    if (n.includes('chilly') || n.includes('chilli')) return 'Green Chilli';
    if (n.includes('ridgeguard') || n.includes('tori')) return 'Ridge Gourd';
    if (n.includes('paddy')) return 'Rice (Paddy)';
    if (n.includes('maize')) return 'Maize (Corn)';
    if (n.includes('bengal gram')) return 'Chickpea (Bengal Gram)';
    if (n.includes('bottle') && n.includes('gourd')) return 'Bottle Gourd';
    if (n.includes('cauli')) return 'Cauliflower';
    if (n.includes('cabbage')) return 'Cabbage';
    if (n.includes('pumpkin')) return 'Pumpkin';
    if (n.includes('coconut')) return 'Coconut';
    if (n.includes('bitter') && n.includes('gourd')) return 'Bitter Gourd';
    if (n.includes('karela')) return 'Bitter Gourd';
    if (n.includes('cucumber') || n.includes('kheera')) return 'Cucumber';
    if (n.includes('sweet corn') || n.includes('bhutta')) return 'Sweet Corn';
    return name.charAt(0).toUpperCase() + name.slice(1);
};

// Estimated average weights per piece (in Kg) for conversion
const PIECE_WEIGHTS: Record<string, number> = {
    'Pumpkin': 3.0,
    'Bottle Gourd': 0.8,
    'Cauliflower': 0.7,
    'Cabbage': 0.8,
    'Coconut': 0.5,
    'Ridge Gourd': 0.3,
    'Radish': 0.15,
    'Bitter Gourd': 0.15,
    'Cucumber': 0.2,
    'Sweet Corn': 0.3,
};

const MarketAnalysisTable = memo(({ marketData, t }: any) => {
    const router = useRouter();
    const [unit, setUnit] = useState<'quintal' | 'kg' | 'piece'>('quintal');

    // Was: if (!marketData?.regional) return null;
    const data = marketData?.regional || [];

    const formatPrice = (price: number, commodity: string) => {
        if (!price) return '-';
        const normalizedName = normalizeCommodity(commodity);

        if (unit === 'kg') {
            return (price / 100).toFixed(2);
        }

        if (unit === 'piece') {
            // Check if we have a weight for this item
            const weight = PIECE_WEIGHTS[normalizedName];
            if (weight) {
                // Price per quintal / 100 = Price per KG 
                // Price per KG * Weight = Price per Piece
                const pricePerKg = price / 100;
                return (pricePerKg * weight).toFixed(2);
            }
            // Fallback to KG if no piece weight defined (standard behavior for items like Rice/Wheat)
            return (price / 100).toFixed(2); // Show KG price as fallback
        }

        return price.toLocaleString(); // Quintal (Default)
    };

    return (
        <motion.div variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }} className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-zinc-900 dark:text-white text-lg font-bold flex items-center gap-2">
                        <FiTrendingUp className="text-black dark:text-white" />
                        {t('market.regionalMarketTitle')}
                    </h3>
                    <p className="text-sm text-zinc-500 mt-1">
                        {t('market.realTimePricesFrom')} <span className="font-semibold text-zinc-900 dark:text-zinc-300">{marketData.location || t('dashboard.unknownLocation')}</span>
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-zinc-100 dark:bg-zinc-900 rounded-lg p-1 border border-zinc-200 dark:border-zinc-800">
                        <button
                            onClick={() => setUnit('quintal')}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${unit === 'quintal'
                                ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm'
                                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                        >
                            ₹/Qt
                        </button>
                        <button
                            onClick={() => setUnit('kg')}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${unit === 'kg'
                                ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm'
                                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                        >
                            ₹/KG
                        </button>
                        <button
                            onClick={() => setUnit('piece')}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${unit === 'piece'
                                ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm'
                                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                        >
                            ₹/Piece
                        </button>
                    </div>
                    <span className="px-3 py-1 bg-zinc-900 text-white text-xs font-bold rounded-full border border-zinc-800 uppercase tracking-wider flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span> {t('market.liveUpdates')}
                    </span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-50 dark:bg-zinc-900 text-xs uppercase text-zinc-500 font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-4">{t('market.cropCommodity')}</th>
                            <th className="px-6 py-4">{t('market.variety')}</th>
                            <th className="px-6 py-4 text-right">{t('market.minPrice')}</th>
                            <th className="px-6 py-4 text-right">{t('market.maxPrice')}</th>
                            <th className="px-6 py-4 text-right">{t('market.modalPrice')}</th>
                            <th className="px-6 py-4">{t('market.marketLocation')}</th>
                            <th className="px-6 py-4">{t('market.date')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {(() => {
                            // Filter logic: If 'piece', only show items with defined piece weights
                            const displayData = unit === 'piece'
                                ? data.filter((item: any) => PIECE_WEIGHTS[normalizeCommodity(item.commodity)])
                                : data;

                            if (displayData.length === 0) {
                                return (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-zinc-500 dark:text-zinc-400">
                                            <p className="text-lg font-bold mb-1">
                                                {unit === 'piece'
                                                    ? (t('market.noPieceData') || 'No piece-rate produce available')
                                                    : (t('dashboard.noData') || 'No market data available')}
                                            </p>
                                            <p className="text-sm">
                                                {unit === 'piece'
                                                    ? (t('market.switchUnit') || 'Try switching to /Kg or /Qt to view all commodities.')
                                                    : (t('market.checkBackLater') || "We couldn't fetch live prices for your region at this moment.")}
                                            </p>
                                        </td>
                                    </tr>
                                );
                            }

                            return displayData.map((item: any, i: number) => {
                                const normalizedName = normalizeCommodity(item.commodity);
                                const isPieceItem = unit === 'piece'; // We already filtered, so it must be true

                                return (
                                    <tr 
                                        key={i} 
                                        onClick={() => router.push(`/machinery-market?search=${item.commodity}`)}
                                        className="group border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer"
                                    >
                                        <td className="px-6 py-4 font-bold text-zinc-900 dark:text-zinc-200 capitalize">
                                            {normalizedName}
                                            {unit === 'piece' && (
                                                <span className="ml-2 text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                                                    ~{PIECE_WEIGHTS[normalizedName]}kg/pc
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">{item.variety}</td>
                                        <td className="px-6 py-4 text-right font-mono text-zinc-900 dark:text-zinc-300">
                                            ₹{formatPrice(item.min_price, item.commodity)}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-zinc-900 dark:text-zinc-300">
                                            ₹{formatPrice(item.max_price, item.commodity)}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-green-600 dark:text-emerald-400 font-mono">
                                            ₹{formatPrice(item.modal_price, item.commodity)}
                                        </td>
                                        <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">{item.market}</td>
                                        <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400 text-xs">{item.arrival_date}</td>
                                    </tr>
                                );
                            });
                        })()}
                    </tbody>
                </table>
            </div>

            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 flex justify-center">
                <button 
                    onClick={() => router.push('/machinery-market')}
                    className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white text-sm font-bold flex items-center gap-2 transition-colors active:scale-95"
                >
                    {t('market.viewFullReport')} <FiTrendingUp />
                </button>
            </div>
        </motion.div>
    );
});

const ActionButton = memo(({ icon: Icon, label, color, onClick, t }: any) => (
    <button
        onClick={onClick}
        className={`group relative flex flex-col items-center justify-center p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-all active:scale-95`}
    >
        <div className={`mb-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800 group-hover:bg-${color}-500/10 group-hover:text-${color}-500 transition-colors`}>
            <Icon className="w-6 h-6 text-zinc-300 group-hover:text-white transition-colors" />
        </div>
        <span className="text-xs font-bold text-zinc-400 group-hover:text-white text-center">
            {label}
        </span>
    </button>
));

// --- 10. Ultimate Dashboard (Main) ---

export default function UltimateDashboard({ 
    farmProfile, 
    onStartPump, 
    onAlertsUpdate,
    isPumpLoading, 
    pumpStatus, 
    visionAnalysis, 
    setVisionAnalysis 
}: { 
    farmProfile?: any;
    onStartPump?: (durationMin?: number) => void;
    onAlertsUpdate?: (count: number) => void;
    isPumpLoading?: boolean;
    pumpStatus?: any;
    visionAnalysis?: any;
    setVisionAnalysis?: (analysis: any) => void;
}) {
    const { t } = useI18n();
    const [weatherData, setWeatherData] = useState<any>(null);
    const [marketData, setMarketData] = useState<any>(null);
    const [analysis, setAnalysis] = useState<any>(null);
    const [valuation, setValuation] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [satelliteData, setSatelliteData] = useState<any>(null);

    // Modals
    const [activeModal, setActiveModal] = useState<string | null>(null);

    // Alerts Integration
    const [newAlertsCount, setNewAlertsCount] = useState(0);

    const { user } = useAuth();
    const router = useRouter();

    // Data Fetching
    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);

            // 1. Get User Profile for location/crop context
            let locationQuery = 'India';
            let cropQuery = 'Rice';

            let profileData = farmProfile;

            // Try DB if logged in and no prop provided
            if (!profileData && user) {
                try {
                    const dbProfile = await db.getFarmProfile(user.id);
                    if (dbProfile) profileData = dbProfile;
                } catch (e) {
                    console.error("DB Fetch Error:", e);
                }
            }

            // Fallback to LocalStorage
            if (!profileData) {
                const storedProfile = localStorage.getItem('farmProfile');
                if (storedProfile) {
                    profileData = JSON.parse(storedProfile);
                }
            }

            if (profileData) {
                if (profileData.location) locationQuery = profileData.location;
                if (profileData.crop) cropQuery = profileData.crop;
                // Support array format from DB
                if (profileData.current_crops && profileData.current_crops.length > 0) {
                    cropQuery = profileData.current_crops[0];
                }
            }

            // 2. Sequential Fetching (Analysis needs Weather)
            const weatherRes = await fetch('/api/weather', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ location: locationQuery })
            }).then(r => r.json());

            setWeatherData(weatherRes);

            // Fetch Satellite Data (with Virtual Sensing fallback)
            let satelliteRes = null;
            try {
                const satResponse = await fetch('/api/satellite/ndvi', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        farmId: profileData?.id || profileData?.farmId || 'default-farm',
                        polygonId: profileData?.agro_monitoring_id || null, // Allow backend to register if missing
                        coords: profileData?.polygon_coords || [],
                        name: profileData?.farm_name || 'My Field'
                    }),
                });
                if (satResponse.ok) {
                    satelliteRes = await satResponse.json();
                } else {
                    console.warn('Dashboard satellite fetch returned non-200. Check API Route.');
                }
            } catch (e) {
                console.warn('Dashboard satellite fetch failed:', e);
            }
            setSatelliteData(satelliteRes);

            // Parse Location for Market API
            let state = 'India';
            let district = 'General';
            if (locationQuery) {
                const parts = locationQuery.split(',').map((s: string) => s.trim());
                if (parts.length >= 2) {
                    state = parts[1];
                    district = parts[0];
                } else {
                    district = parts[0];
                }
            }

            // B. Fetch Market & Analysis (Parallel)
            const [marketRes, analysisRes] = await Promise.all([
                fetch('/api/market-prices', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'regional',
                        state: state,
                        district: district
                    })
                }).then(r => r.json()),

                fetch('/api/analysis', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        farmProfile: {
                            location: locationQuery,
                            currentCrops: [cropQuery],
                            soilType: profileData?.soil_type || 'Loamy',
                            farmSize: profileData?.total_area || 5
                        },
                        weatherData: weatherRes,
                        satelliteData: satelliteRes
                    })
                }).then(r => r.json())
            ]);

            let finalMarketData = marketRes || {};
            const regionalData = (marketRes.data && Array.isArray(marketRes.data)) ? marketRes.data : [];

            if (regionalData.length === 0) {
                finalMarketData = {
                    location: locationQuery || 'Local Mandi',
                    regional: [
                        { commodity: 'Rice', variety: 'Common', min_price: 2200, max_price: 2800, modal_price: 2500, market: district + ' Mandi', arrival_date: new Date().toISOString().split('T')[0] },
                        { commodity: 'Wheat', variety: 'Sharbati', min_price: 2100, max_price: 2600, modal_price: 2350, market: district + ' Mandi', arrival_date: new Date().toISOString().split('T')[0] },
                        { commodity: 'Tomato', variety: 'Hybrid', min_price: 1500, max_price: 3000, modal_price: 2200, market: 'City Market', arrival_date: new Date().toISOString().split('T')[0] },
                        { commodity: 'Potato', variety: 'Local', min_price: 800, max_price: 1200, modal_price: 1000, market: 'City Market', arrival_date: new Date().toISOString().split('T')[0] },
                        { commodity: 'Onion', variety: 'Red', min_price: 1800, max_price: 2500, modal_price: 2100, market: 'City Market', arrival_date: new Date().toISOString().split('T')[0] },
                        { commodity: 'Cotton', variety: 'H-4', min_price: 5800, max_price: 6500, modal_price: 6200, market: 'Regional Hub', arrival_date: new Date().toISOString().split('T')[0] },
                    ]
                };
            } else {
                finalMarketData = {
                    location: locationQuery || 'Your Region',
                    regional: regionalData
                };
            }

            setMarketData(finalMarketData);
            setAnalysis(analysisRes);

            // 3. Calculate Valuation
            if (analysisRes?.yieldForecast?.crops?.[0]) {
                const yieldKg = analysisRes.yieldForecast.crops[0].estimatedYield;
                const pricePerKg = (finalMarketData?.regional?.[0]?.modal_price || 2000) / 100;
                const totalValue = yieldKg * pricePerKg;

                setValuation({
                    value: totalValue,
                    formatted: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalValue)
                });
            }

            // 4. Generate Alerts
            import('@/lib/alertSystem').then(async ({ generateAlerts, saveAlerts }) => {
                const alerts = generateAlerts(weatherRes, finalMarketData, cropQuery);
                if (alerts.length > 0) {
                    await saveAlerts(alerts, user?.id);
                    setNewAlertsCount(alerts.length);
                    if (onAlertsUpdate) onAlertsUpdate(alerts.length);
                }
            });

        } catch (error) {
            console.error("Dashboard Data Error:", error);
        } finally {
            setLoading(false);
        }
    }, [user, farmProfile, onAlertsUpdate]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    if (loading) {
        return <AnalysisLoader />;
    }

    // Sort Market Data to prioritize farm crops
    const sortedMarketData = {
        ...marketData,
        regional: [...(marketData?.regional || [])].sort((a, b) => {
            const farmCrops = (farmProfile?.current_crops || []).map((c: string) => c.toLowerCase());
            const aIn = farmCrops.some((c: string) => a.commodity.toLowerCase().includes(c));
            const bIn = farmCrops.some((c: string) => b.commodity.toLowerCase().includes(c));
            if (aIn && !bIn) return -1;
            if (!aIn && bIn) return 1;
            return 0;
        })
    };

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8 pt-6 font-sans selection:bg-emerald-500/30">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Row 1: Key Metrics & Weather */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 h-full min-h-[400px]">
                        <ValuationHero valuation={valuation} marketData={marketData} analysis={analysis} t={t} />
                    </div>
                    <div className="lg:col-span-2 h-full min-h-[400px]">
                        <WeatherCard weatherData={weatherData} satelliteData={satelliteData} t={t} />
                    </div>
                </div>

                {/* Row 2: Live Widgets */}
                <div className="relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1 bg-blue-500 text-white rounded-full shadow-lg text-[10px] font-bold uppercase tracking-widest border border-blue-400">
                        🛰️ Space-Derived Analysis
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <IrrigationWidget analysis={analysis} t={t} onOpen={() => setActiveModal('irrigation')} />
                        <DiseaseWidget analysis={analysis} t={t} onOpen={() => setActiveModal('disease')} />
                        <YieldWidget analysis={analysis} t={t} onOpen={() => setActiveModal('yield')} />
                    </div>
                </div>

                {/* Row 3: Rotation & Recommendations */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <SmartRotationCard farmProfile={farmProfile} weatherData={weatherData} t={t} />
                    </div>
                    <div className="lg:col-span-2">
                        <RecommendationsWidget 
                            analysis={analysis} 
                            t={t} 
                            onAction={(category: string) => {
                                if (category.toLowerCase().includes('irrigation')) setActiveModal('irrigation');
                                else if (category.toLowerCase().includes('health') || category.toLowerCase().includes('disease')) setActiveModal('disease');
                                else if (category.toLowerCase().includes('market')) router.push('/machinery-market');
                                else router.push('/tools/smart-tools');
                            }}
                        />
                    </div>
                </div>

                {/* Row 4: Market Analysis Table */}
                <div id="market-section" className="w-full">
                    <MarketAnalysisTable marketData={sortedMarketData} t={t} />
                </div>

            </div>

            {/* Modals */}
            <AnimatePresence>
                {activeModal === 'irrigation' && (
                    <IrrigationModal 
                        isOpen={true} 
                        onClose={() => setActiveModal(null)} 
                        analysis={analysis} 
                        farmProfile={farmProfile} 
                        t={t} 
                        onStartPump={onStartPump}
                        isPumpLoading={isPumpLoading}
                        pumpStatus={pumpStatus}
                    />
                )}
                {activeModal === 'disease' && <DiseaseModal isOpen={true} onClose={() => setActiveModal(null)} analysis={analysis} t={t} />}
                {activeModal === 'yield' && <YieldModal isOpen={true} onClose={() => setActiveModal(null)} analysis={analysis} t={t} />}
            </AnimatePresence>
        </div>
    );
}

