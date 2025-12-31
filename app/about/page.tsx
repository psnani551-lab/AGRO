'use client';
import { motion } from 'framer-motion';
import { FiMonitor, FiShoppingCart, FiCpu, FiSun, FiDatabase, FiCloudLightning, FiShield } from 'react-icons/fi';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';

export default function AboutPage() {
    const { t } = useI18n();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-12 px-4 selection:bg-emerald-500/30 selection:text-emerald-900 dark:selection:text-emerald-200 overflow-x-hidden font-sans transition-colors duration-300">

            {/* Background Gradients (Subtle Green Only) */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-normal" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-normal" />
            </div>

            <div className="max-w-6xl mx-auto space-y-16 relative z-10">

                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center max-w-4xl mx-auto mb-20"
                >
                    <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-white/5 border border-emerald-200 dark:border-white/10 text-emerald-800 dark:text-zinc-300 text-xs font-bold tracking-[0.2em] uppercase backdrop-blur-md">
                        {t('about.heroTag')}
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight leading-tight">
                        {t('about.titlePart1')} <br />
                        <span className="text-emerald-600 dark:text-emerald-500">
                            {t('about.titlePart2')}
                        </span>
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-zinc-400 leading-relaxed font-normal max-w-2xl mx-auto">
                        {t('about.subtitle')}
                    </p>
                </motion.div>

                {/* CORE FEATURES SHOWCASE */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Feature 1: Dashboard */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white dark:bg-zinc-950 p-8 rounded-[2rem] border border-gray-100 dark:border-zinc-800/50 hover:border-emerald-500/50 transition-all duration-300 group shadow-xl dark:shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-6 right-6">
                            <span className="bg-gray-100 dark:bg-white text-gray-900 dark:text-black text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                {t('about.features.dashboard.tag')}
                            </span>
                        </div>
                        <div className="w-14 h-14 bg-emerald-50 dark:bg-zinc-900 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-500 mb-6 border border-emerald-100 dark:border-zinc-800 group-hover:scale-110 transition-transform">
                            <FiMonitor size={28} />
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">{t('about.features.dashboard.title')}</h3>
                        <p className="text-gray-600 dark:text-zinc-400 mb-8 leading-relaxed">
                            {t('about.features.dashboard.desc')}
                        </p>
                        <Link href="/dashboard" className="inline-flex items-center text-emerald-600 dark:text-emerald-500 font-bold hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors uppercase text-sm tracking-widest">
                            {t('about.features.dashboard.action')} <span className="ml-2">&rarr;</span>
                        </Link>
                    </motion.div>

                    {/* Feature 2: Marketplace */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="bg-white dark:bg-zinc-950 p-8 rounded-[2rem] border border-gray-100 dark:border-zinc-800/50 hover:border-emerald-500/50 transition-all duration-300 group shadow-xl dark:shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-6 right-6">
                            <span className="bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border border-gray-200 dark:border-zinc-700">
                                {t('about.features.market.tag')}
                            </span>
                        </div>
                        <div className="w-14 h-14 bg-emerald-50 dark:bg-zinc-900 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-500 mb-6 border border-emerald-100 dark:border-zinc-800 group-hover:scale-110 transition-transform">
                            <FiShoppingCart size={28} />
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">{t('about.features.market.title')}</h3>
                        <p className="text-gray-600 dark:text-zinc-400 mb-8 leading-relaxed">
                            {t('about.features.market.desc')}
                        </p>
                        <Link href="/machinery-market" className="inline-flex items-center text-emerald-600 dark:text-emerald-500 font-bold hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors uppercase text-sm tracking-widest">
                            {t('about.features.market.action')} <span className="ml-2">&rarr;</span>
                        </Link>
                    </motion.div>

                    {/* Feature 3: AI Analysis */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-white dark:bg-zinc-950 p-8 rounded-[2rem] border border-gray-100 dark:border-zinc-800/50 hover:border-emerald-500/50 transition-all duration-300 group shadow-xl dark:shadow-2xl relative overflow-hidden"
                    >
                        <div className="w-14 h-14 bg-emerald-50 dark:bg-zinc-900 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-500 mb-6 border border-emerald-100 dark:border-zinc-800 group-hover:scale-110 transition-transform">
                            <FiCpu size={28} />
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">{t('about.features.ai.title')}</h3>
                        <p className="text-gray-600 dark:text-zinc-400 mb-8 leading-relaxed">
                            {t('about.features.ai.desc')}
                        </p>
                        <Link href="/tools/farm-profile" className="inline-flex items-center text-emerald-600 dark:text-emerald-500 font-bold hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors uppercase text-sm tracking-widest">
                            {t('about.features.ai.action')} <span className="ml-2">&rarr;</span>
                        </Link>
                    </motion.div>

                    {/* Feature 4: Weather & Soil */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="bg-white dark:bg-zinc-950 p-8 rounded-[2rem] border border-gray-100 dark:border-zinc-800/50 hover:border-emerald-500/50 transition-all duration-300 group shadow-xl dark:shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-6 right-6">
                            <span className="bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border border-gray-200 dark:border-zinc-700">
                                {t('about.features.weather.tag')}
                            </span>
                        </div>
                        <div className="w-14 h-14 bg-emerald-50 dark:bg-zinc-900 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-500 mb-6 border border-emerald-100 dark:border-zinc-800 group-hover:scale-110 transition-transform">
                            <FiSun size={28} />
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">{t('about.features.weather.title')}</h3>
                        <p className="text-gray-600 dark:text-zinc-400 mb-8 leading-relaxed">
                            {t('about.features.weather.desc')}
                        </p>
                        <span className="inline-flex items-center text-gray-400 dark:text-zinc-500 font-bold uppercase text-sm tracking-widest cursor-default">
                            {t('about.features.weather.tagLabel')}
                        </span>
                    </motion.div>
                </div>

                {/* RELIABILITY HIGHLIGHTS */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="py-16"
                >
                    <div className="text-center mb-16">
                        <h2 className="text-gray-900 dark:text-white text-xs font-bold uppercase tracking-[0.2em] mb-4">{t('about.trust.tag')}</h2>
                        <h3 className="text-4xl font-bold text-gray-900 dark:text-white">{t('about.trust.title')}</h3>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Card 1 */}
                        <div className="bg-white dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800 rounded-3xl p-8 hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors group shadow-lg dark:shadow-none">
                            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-500 mb-6">
                                <FiDatabase size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t('about.trust.cards.realtime.title')}</h3>
                            <p className="text-gray-600 dark:text-zinc-400 leading-relaxed text-sm">
                                {t('about.trust.cards.realtime.desc')}
                            </p>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-white dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800 rounded-3xl p-8 hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors group shadow-lg dark:shadow-none">
                            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-500 mb-6">
                                <FiCloudLightning size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t('about.trust.cards.scientific.title')}</h3>
                            <p className="text-gray-600 dark:text-zinc-400 leading-relaxed text-sm">
                                {t('about.trust.cards.scientific.desc')}
                            </p>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-white dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800 rounded-3xl p-8 hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors group shadow-lg dark:shadow-none">
                            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-500 mb-6">
                                <FiShield size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t('about.trust.cards.verified.title')}</h3>
                            <p className="text-gray-600 dark:text-zinc-400 leading-relaxed text-sm">
                                {t('about.trust.cards.verified.desc')}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Footer Message */}
                <div className="text-center pt-10 pb-20 border-t border-gray-200 dark:border-zinc-900">
                    <p className="text-gray-500 dark:text-zinc-500 text-sm font-medium">
                        {t('about.footer')}
                    </p>
                </div>

            </div>
        </div>
    );
}
