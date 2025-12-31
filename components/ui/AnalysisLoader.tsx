'use client';

import { motion } from 'framer-motion';
import { FiCpu, FiDatabase, FiCloudLightning, FiActivity } from 'react-icons/fi';
import { useState, useEffect } from 'react';

import { useI18n } from '@/lib/i18n';

export default function AnalysisLoader() {
    const { t } = useI18n();
    const [step, setStep] = useState(0);

    const steps = [
        { text: t('loader.initializing'), icon: FiCpu },
        { text: t('loader.analyzing'), icon: FiCloudLightning },
        { text: t('loader.querying'), icon: FiDatabase },
        { text: t('loader.calibrating'), icon: FiActivity },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
        }, 800);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] w-full p-8 text-center space-y-8 bg-zinc-950/50 rounded-3xl border border-zinc-800 backdrop-blur-sm">

            {/* Animated Icon Container */}
            <div className="relative">
                <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full scale-150 animate-pulse" />
                <motion.div
                    key={step}
                    initial={{ scale: 0.8, opacity: 0, rotate: -180 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0.8, opacity: 0, rotate: 180 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="relative z-10 w-24 h-24 bg-zinc-900 border-2 border-zinc-700 rounded-2xl flex items-center justify-center text-white shadow-2xl"
                >
                    {steps[step].icon({ className: "w-10 h-10" })}
                </motion.div>

                {/* Orbital Loading Rings */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-zinc-800 rounded-full animate-[spin_3s_linear_infinite]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-zinc-800/50 rounded-full animate-[spin_5s_linear_infinite_reverse]" />
            </div>

            <div className="space-y-4 max-w-md">
                <motion.h3
                    key={steps[step].text}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-xl font-bold text-white tracking-tight"
                >
                    {steps[step].text}
                </motion.h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                    {t('loader.description')}
                </p>

                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden mt-6">
                    <motion.div
                        className="h-full bg-white rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>
        </div>
    );
}
