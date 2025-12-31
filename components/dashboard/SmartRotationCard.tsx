'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiRefreshCw, FiArrowRight, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { useI18n } from '@/lib/i18n';
import { getCropData } from '@/lib/cropDatabase';

interface Props {
    farmProfile: any;
    weatherData: any;
    t: any;
}

export default function SmartRotationCard({ farmProfile, weatherData, t }: Props) {
    const currentCrop = farmProfile?.crop?.toLowerCase() || 'rice';
    const soilType = farmProfile?.soilType || 'Loamy';

    // Logic ported from RotationForm.tsx
    const rotationPlan = useMemo(() => {
        const rotationMap: Record<string, string[]> = {
            rice: ['wheat', 'soybean', 'rice'],
            wheat: ['soybean', 'corn', 'wheat'],
            cotton: ['wheat', 'soybean', 'cotton'],
            corn: ['soybean', 'wheat', 'corn'],
            soybean: ['wheat', 'corn', 'soybean'],
            sugarcane: ['wheat', 'soybean', 'sugarcane'],
            potato: ['wheat', 'soybean', 'potato'],
            tomato: ['wheat', 'soybean', 'tomato'],
        };

        const rotation = rotationMap[currentCrop] || ['wheat', 'soybean', currentCrop];

        return [
            {
                season: t('rotation.season1') || 'Next Season',
                crop: rotation[0],
                benefits: [
                    'breakPestCycles',
                    'optimizeNutrients',
                ],
                soilMatch: true // Simplified logic
            },
            {
                season: t('rotation.season2') || 'Following Season',
                crop: rotation[1],
                benefits: [
                    'restoreNitrogen',
                    'improveStructure',
                ],
                soilMatch: true
            },
            {
                season: t('rotation.season3') || 'Future Season',
                crop: rotation[2],
                benefits: [
                    'maintainBalance',
                    'economicStability',
                ],
                soilMatch: true
            }
        ];
    }, [currentCrop, t]);

    // Enhanced Interlinking Logic
    const nextCropData = getCropData(rotationPlan[0].crop);
    const isSoilCompatible = nextCropData?.soilTypes.some(s =>
        s.toLowerCase().includes(soilType.toLowerCase())
    );

    return (
        <motion.div
            variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}
            className="bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-800 hover:border-zinc-700 transition-all duration-300 group"
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-zinc-950 rounded-xl text-white group-hover:bg-white group-hover:text-black transition-colors border border-zinc-800">
                        <FiRefreshCw className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-lg">{t('tools.rotation') || 'Smart Crop Rotation'}</h3>
                        <p className="text-zinc-500 text-xs mt-0.5">{t('yield.basedOn') || 'Based on'} <span className="text-zinc-300">{currentCrop}</span> & <span className="text-zinc-300">{soilType}</span></p>
                    </div>
                </div>
                {isSoilCompatible ? (
                    <span className="text-[10px] font-bold bg-primary-600/20 text-primary-400 border border-primary-600/30 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                        <FiCheckCircle className="w-3 h-3" /> {t('rotation.soilOptimized') || 'Soil Optimized'}
                    </span>
                ) : (
                    <span className="text-[10px] font-bold bg-yellow-600/20 text-yellow-500 border border-yellow-600/30 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                        <FiAlertCircle className="w-3 h-3" /> {t('rotation.soilCheck') || 'Soil Check'}
                    </span>
                )}
            </div>

            <div className="space-y-4">
                {rotationPlan.map((step, idx) => (
                    <div key={idx} className="relative pl-6 border-l-2 border-zinc-800 last:border-0 pb-4 last:pb-0">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-zinc-950 border-2 border-zinc-700 group-hover:border-white transition-colors"></div>

                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{step.season}</span>
                            {idx === 0 && isSoilCompatible && (
                                <span className="text-[10px] text-green-400 font-bold">{t('rotation.recommended') || 'Recommended'}</span>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <h4 className="text-xl font-bold text-white capitalize">{step.crop}</h4>
                            {idx === 0 && (
                                <FiArrowRight className="text-zinc-600" />
                            )}
                        </div>

                        <div className="mt-2 flex flex-wrap gap-2">
                            {step.benefits.map((b, i) => (
                                <span key={i} className="text-[10px] bg-zinc-950 text-zinc-400 px-2 py-1 rounded border border-zinc-800">
                                    {t(`rotation.benefitsList.${b}`) || b}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-800">
                <p className="text-xs text-zinc-500 leading-relaxed">
                    <span className="text-zinc-300 font-bold">{t('rotation.aiInsight') || 'AI Insight'}:</span> {t('rotation.insight', { crop: rotationPlan[0].crop, soil: soilType })
                        .replace('{{crop}}', rotationPlan[0].crop)
                        .replace('{{soil}}', soilType)}
                </p>
            </div>
        </motion.div>
    );
}
