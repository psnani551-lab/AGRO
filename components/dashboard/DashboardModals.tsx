import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiDroplet, FiActivity, FiBarChart2, FiCheckCircle, FiTrendingUp } from 'react-icons/fi';

// --- Generic Modal Shell ---
export const DashboardModal = ({ isOpen, onClose, title, icon: Icon, colorClass = "bg-zinc-950", children }: any) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e: any) => e.stopPropagation()}
                className="bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border border-zinc-800"
            >
                <div className={`p-4 ${colorClass} text-white flex justify-between items-center border-b border-zinc-800`}>
                    <div className="flex items-center gap-2">
                        {Icon && <Icon className="w-5 h-5 text-zinc-400" />}
                        <h3 className="font-bold text-lg">{title}</h3>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                        <FiX className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {children}
                </div>
            </motion.div>
        </div>
    );
};

// --- Specific Modals ---

export const IrrigationModal = ({ isOpen, onClose, analysis, t }: any) => (
    <DashboardModal title={t('dashboard.smartIrrigation') || "Irrigation Planner"} icon={FiDroplet} isOpen={isOpen} onClose={onClose}>
        <div className="space-y-4">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{t('dashboard.schedule') || 'Schedule'}: {analysis?.irrigationPlan?.wateringSchedule}</h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{t('dashboard.irrigationDesc') || 'Recommended watering based on FAO-56 Penman-Monteith method using recent weather data.'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-2 right-2 p-1.5 bg-blue-500/10 rounded-full text-blue-500">
                        <FiDroplet className="w-4 h-4" />
                    </div>
                    <span className="text-xs text-gray-500 block mb-1">{t('dashboard.amount') || 'Amount Per Session'}</span>
                    <span className="font-bold text-lg relative z-10">
                        {typeof analysis?.irrigationPlan?.amountPerIrrigation === 'number'
                            ? `${analysis.irrigationPlan.amountPerIrrigation.toFixed(1)} mm`
                            : analysis?.irrigationPlan?.amountPerIrrigation ||
                            (typeof analysis?.irrigationPlan?.dailyWaterAmount === 'number'
                                ? `${analysis.irrigationPlan.dailyWaterAmount} mm`
                                : analysis?.irrigationPlan?.dailyWaterAmount)}
                    </span>
                </div>
                <div className="p-3 border rounded-lg flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-2 right-2 p-1.5 bg-purple-500/10 rounded-full text-purple-500">
                        <FiCheckCircle className="w-4 h-4" />
                    </div>
                    <span className="text-xs text-gray-500 block mb-1">{t('dashboard.weekly') || 'Weekly Total'}</span>
                    <span className="font-bold text-lg relative z-10">
                        {typeof analysis?.irrigationPlan?.weeklyTotal === 'number'
                            ? `${analysis.irrigationPlan.weeklyTotal.toFixed(1)} mm`
                            : analysis?.irrigationPlan?.weeklyTotal}
                    </span>
                </div>
            </div>

            {/* Smart 7-Day Schedule */}
            {analysis?.irrigationPlan?.smartSchedule && (
                <div className="mt-6">
                    <h5 className="font-bold text-zinc-900 dark:text-white mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                        <FiDroplet className="text-zinc-500" /> {t('dashboard.smartForecast') || '7-Day Smart Forecast'}
                    </h5>
                    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x">
                        {analysis.irrigationPlan.smartSchedule.map((day: any, i: number) => (
                            <div key={i} className={`snap-start flex-shrink-0 w-28 p-3 rounded-xl border text-center relative transition-all ${day.action === 'Irrigate'
                                ? 'bg-zinc-900 border-zinc-800 shadow-md transform scale-105'
                                : day.action === 'Skip'
                                    ? 'bg-zinc-50 border-zinc-200 opacity-60'
                                    : 'bg-white border-zinc-200'
                                }`}>
                                <span className={`text-xs font-bold block mb-2 uppercase ${day.action === 'Irrigate' ? 'text-zinc-400' : 'text-zinc-500'}`}>{day.day}</span>
                                <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 ${day.action === 'Irrigate' ? 'bg-white text-black' :
                                    day.action === 'Skip' ? 'bg-zinc-200 text-zinc-400' :
                                        'bg-zinc-100 text-zinc-500'
                                    }`}>
                                    {day.icon === 'droplet' && <FiDroplet className="w-5 h-5" />}
                                    {day.icon === 'rain' && <FiCheckCircle className="w-5 h-5" />}
                                    {day.icon === 'cloud' && <div className="w-2 h-2 rounded-full bg-zinc-400" />}
                                </div>
                                <span className={`text-xs font-black block uppercase ${day.action === 'Irrigate' ? 'text-white' : 'text-zinc-400'
                                    }`}>{day.action}</span>
                                {day.amount !== '-' && <span className="text-[10px] text-zinc-300 font-mono mt-1 block">{day.amount}</span>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {analysis?.irrigationPlan?.steps && (
                <div className="mt-4">
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-2">{t('dashboard.irrigationProcess') || 'Irrigation Process'} ({analysis.irrigationPlan.method})</h5>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
                        {analysis.irrigationPlan.steps.map((step: string, i: number) => (
                            <div key={i} className="flex gap-3 text-sm">
                                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs mt-0.5 dark:bg-white dark:text-black">
                                    {i + 1}
                                </span>
                                <p className="text-zinc-700 dark:text-zinc-200">{step}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    </DashboardModal>
);

export const DiseaseModal = ({ isOpen, onClose, analysis, t }: any) => {
    const risk = analysis?.diseaseRisk || {};
    const isHigh = risk.level === 'High';
    const isMedium = risk.level === 'Medium';

    // Determine Color Theme based on Risk
    const themeColor = isHigh ? 'red' : isMedium ? 'orange' : 'green';
    const ThemeIcon = isHigh ? FiActivity : isMedium ? FiActivity : FiCheckCircle;

    return (
        <DashboardModal title={t('dashboard.diseaseDetection') || "Health & Disease Analysis"} icon={FiActivity} isOpen={isOpen} onClose={onClose}>
            <div className="space-y-6">

                {/* 1. Main Status Card */}
                <div className={`p-5 rounded-2xl flex items-center justify-between border ${isHigh
                    ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                    : isMedium
                        ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800'
                        : 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'}`}>
                    <div>
                        <span className="text-xs uppercase tracking-wide font-bold opacity-70 flex items-center gap-2">
                            {t('dashboard.riskLevel') || 'Risk Level'}
                        </span>
                        <h2 className={`text-3xl font-black mt-1 ${isHigh ? 'text-red-600' : isMedium ? 'text-orange-500' : 'text-green-600'}`}>
                            {risk.level || 'Unknown'}
                        </h2>
                        <p className="text-sm mt-1 opacity-80 font-medium">
                            {risk.score}% {t('disease.riskScore') || 'Risk Probability'}
                        </p>
                    </div>
                    <div className={`p-4 rounded-full ${isHigh ? 'bg-red-100 text-red-500' : isMedium ? 'bg-orange-100 text-orange-500' : 'bg-green-100 text-green-500'}`}>
                        <ThemeIcon className="w-8 h-8" />
                    </div>
                </div>

                {/* 2. Contributing Factors (Grid) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3 border rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                        <span className="text-xs text-zinc-500 block mb-1">Humidity Impact</span>
                        <div className="font-semibold text-sm flex items-center gap-2">
                            <FiDroplet className="text-blue-500" /> {risk.factors?.humidity || 'Normal'}
                        </div>
                    </div>
                    <div className="p-3 border rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                        <span className="text-xs text-zinc-500 block mb-1">Temp Impact</span>
                        <div className="font-semibold text-sm flex items-center gap-2">
                            <FiActivity className="text-red-400" /> {risk.factors?.temperature || 'Normal'}
                        </div>
                    </div>
                    <div className="p-3 border rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                        <span className="text-xs text-zinc-500 block mb-1">Rain Impact</span>
                        <div className="font-semibold text-sm flex items-center gap-2">
                            <FiBarChart2 className="text-indigo-400" /> {risk.factors?.rainfall || 'Normal'}
                        </div>
                    </div>
                </div>

                {/* 3. AI Prevention Checklist */}
                <div>
                    <h5 className="font-bold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
                        <FiCheckCircle className="text-green-500" /> Prevention & Action Plan
                    </h5>
                    <div className="space-y-2">
                        {risk.recommendations?.map((step: string, i: number) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
                                <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                                    <span className="text-[10px] font-bold text-zinc-500">{i + 1}</span>
                                </div>
                                <p className="text-sm text-zinc-600 dark:text-zinc-300">{step}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </DashboardModal>
    );
};

export const YieldModal = ({ isOpen, onClose, analysis, t }: any) => {
    const [activeScenarios, setActiveScenarios] = useState<string[]>([]);

    // Reset scenarios when modal opens
    useEffect(() => {
        if (isOpen) setActiveScenarios([]);
    }, [isOpen]);

    if (!isOpen) return null;

    const crop = analysis?.yieldForecast?.crops?.[0];
    const scenarios = crop?.scenarios || [];
    const baseYield = crop?.estimatedYield || 0;

    // Calculate projected yield based on active scenarios
    const projectedYield = activeScenarios.reduce((total, scenarioId) => {
        const scenario = scenarios.find((s: any) => s.id === scenarioId);
        return total + (scenario?.yieldBoost || 0);
    }, baseYield);

    // Calculate potential revenue gain (assuming specific price or default)
    const pricePerKg = analysis?.marketData?.currentPrice?.modal || 30; // Fallback price
    const extraRevenue = (projectedYield - baseYield) * pricePerKg;

    return (
        <DashboardModal title={t('dashboard.yieldOptimization') || "Yield Optimization Engine"} icon={FiBarChart2} isOpen={isOpen} onClose={onClose}>
            <div className="space-y-6">
                {/* Hero Section */}
                <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                    <div className="text-center md:text-left mb-4 md:mb-0">
                        <span className="text-sm uppercase tracking-wide text-zinc-500 dark:text-zinc-400 font-semibold">{t('dashboard.projectedYield') || 'Projected Yield'}</span>
                        <div className="flex items-baseline gap-2 justify-center md:justify-start">
                            <span className="text-4xl font-bold text-zinc-900 dark:text-white">
                                {projectedYield.toLocaleString()}
                            </span>
                            <span className="text-zinc-500">kg</span>
                        </div>
                        {extraRevenue > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-black font-bold text-sm mt-1 bg-white border border-zinc-200 px-2 py-0.5 rounded-full inline-block shadow-sm"
                            >
                                +₹{extraRevenue.toLocaleString()} {t('dashboard.potentialRevenue') || 'potential revenue'}
                            </motion.div>
                        )}
                    </div>
                    <div className="text-right hidden md:block">
                        <span className="text-sm text-gray-500 block">{t('dashboard.maxPotential') || 'Max Potential'}</span>
                        <span className="text-xl font-bold text-gray-400">{crop?.potentialYield?.toLocaleString()} kg</span>
                    </div>
                </div>

                {/* Yield Gap Visualizer */}
                <div>
                    <h4 className="font-semibold text-zinc-900 dark:text-zinc-200 mb-3 flex items-center gap-2">
                        <FiActivity className="text-zinc-500" /> {t('dashboard.gapAnalysis') || 'Yield Gap Analysis'}
                    </h4>
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs text-zinc-500">
                                <span>{t('dashboard.soilHealth') || 'Soil Health Impact'}</span>
                                <span>{crop?.factors?.soil || '0%'}</span>
                            </div>
                            <div className="h-2 bg-zinc-100 rounded-full overflow-hidden border border-zinc-100 dark:border-zinc-800">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(crop?.numericFactors?.soil * 100 || 0, 100)}%` }}
                                    className="h-full rounded-full bg-zinc-900 dark:bg-white"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>{t('dashboard.waterStress') || 'Water Stress'}</span>
                                <span>{crop?.factors?.irrigation || '0%'}</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(crop?.numericFactors?.irrigation * 100 || 0, 100)}%` }}
                                    className={`h-full rounded-full ${crop?.numericFactors?.irrigation < 1 ? 'bg-orange-400' : 'bg-green-500'}`}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scenario Simulator */}
                <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                        <FiTrendingUp className="text-green-500" /> {t('dashboard.simulator') || 'What-If Simulator'}
                    </h4>
                    <div className="space-y-3">
                        {scenarios.length > 0 ? (
                            scenarios.map((scenario: any) => {
                                const isActive = activeScenarios.includes(scenario.id);
                                return (
                                    <div
                                        key={scenario.id}
                                        onClick={() => {
                                            setActiveScenarios(prev =>
                                                isActive ? prev.filter(id => id !== scenario.id) : [...prev, scenario.id]
                                            );
                                        }}
                                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${isActive
                                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                            : 'border-transparent bg-gray-50 dark:bg-gray-700/50 hover:border-gray-200'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded flex items-center justify-center border ${isActive ? 'bg-purple-600 border-purple-600' : 'border-gray-400'}`}>
                                                {isActive && <FiCheckCircle className="text-white w-3.5 h-3.5" />}
                                            </div>
                                            <div>
                                                <h5 className="font-semibold text-sm text-gray-900 dark:text-gray-100">{scenario.name}</h5>
                                                <p className="text-xs text-gray-500">{scenario.description}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="block font-bold text-green-600 text-sm">{scenario.impact}</span>
                                            <span className="text-[10px] text-gray-400 uppercase tracking-wider">{scenario.cost} Cost</span>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-sm text-gray-500 italic">{t('dashboard.noScenarios') || 'No improvement scenarios available for current conditions.'}</p>
                        )}
                    </div>
                </div>
            </div>
        </DashboardModal>
    );
};
