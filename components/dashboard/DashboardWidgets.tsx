import { FiDroplet, FiActivity, FiBarChart2, FiArrowRight } from 'react-icons/fi';

export const IrrigationWidget = ({ analysis, t, onOpen }: any) => {
    const plan = analysis?.irrigationPlan || {};
    return (
        <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800 flex flex-col justify-between h-full group hover:border-zinc-700 transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-lg">
                    <FiDroplet className="w-5 h-5" />
                </div>
                <div className="px-2 py-1 bg-zinc-950 rounded text-[10px] text-zinc-500 font-bold uppercase tracking-wider border border-zinc-800">
                    {t('dashboard.reliability') || '98% RELIABLE'}
                </div>
            </div>

            <div>
                <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">{t('dashboard.smartIrrigation') || 'Irrigation Plan'}</h3>
                <p className="text-xl font-bold text-white mb-4">{plan.wateringSchedule || 'Loading...'}</p>

                <div className="space-y-2 mb-6">
                    <div className="flex justify-between items-center text-sm border-b border-zinc-800 pb-2">
                        <span className="text-zinc-500">{t('dashboard.amount') || 'Amount'}</span>
                        <span className="font-mono text-zinc-300">
                            {/* Ensure number formatting to 1 decimal place + single unit */}
                            {typeof plan.amountPerIrrigation === 'number'
                                ? `${plan.amountPerIrrigation.toFixed(1)} mm`
                                : plan.amountPerIrrigation || '---'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-zinc-800 pb-2">
                        <span className="text-zinc-500">{t('dashboard.weekly') || 'Weekly'}</span>
                        <span className="font-mono text-zinc-300">
                            {typeof plan.weeklyTotal === 'number'
                                ? `${plan.weeklyTotal.toFixed(1)} mm`
                                : plan.weeklyTotal || '---'}
                        </span>
                    </div>
                </div>
            </div>

            <button
                onClick={onOpen}
                className="w-full py-3 bg-zinc-950 hover:bg-black border border-zinc-800 rounded-xl text-sm font-bold text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-2 group-hover:border-zinc-600"
            >
                {t('dashboard.viewPlanner') || 'View Planner'}
            </button>
        </div>
    );
};

export const DiseaseWidget = ({ analysis, t, onOpen }: any) => {
    const risk = analysis?.diseaseRisk || {};
    const isHigh = risk.level === 'High';

    return (
        <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800 flex flex-col justify-between h-full group hover:border-zinc-700 transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-lg ${isHigh ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                    <FiActivity className="w-5 h-5" />
                </div>
                <div className="px-2 py-1 bg-zinc-950 rounded text-[10px] text-zinc-500 font-bold uppercase tracking-wider border border-zinc-800">
                    {t('dashboard.expertSystem') || 'EXPERT SYSTEM'}
                </div>
            </div>

            <div>
                <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">{t('dashboard.diseaseRisk') || 'Disease Risk'}</h3>
                <p className={`text-xl font-bold mb-2 ${isHigh ? 'text-red-400' : 'text-white'}`}>
                    {risk.level || 'Analyzing...'}
                </p>
                <p className="text-sm text-zinc-500 mb-6 line-clamp-2 h-10">
                    {risk.diseases?.[0]?.riskFactors?.[0] || t('disease.noThreats') || 'No immediate threats detected based on current conditions.'}
                </p>
            </div>

            <button
                onClick={onOpen}
                className="w-full py-3 bg-zinc-950 hover:bg-black border border-zinc-800 rounded-xl text-sm font-bold text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-2 group-hover:border-zinc-600"
            >
                {t('dashboard.analyzeHealth') || 'Analyze Health'}
            </button>
        </div>
    );
};

export const YieldWidget = ({ analysis, t, onOpen }: any) => {
    const yieldData = analysis?.yieldForecast?.crops?.[0] || {};
    const percentage = yieldData.weatherMultiplier ? Math.round((yieldData.weatherMultiplier - 0.5) * 200) : 75; // Mock progress

    // Format numbers
    const estimated = yieldData.estimatedYield ? yieldData.estimatedYield.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '---';
    const potential = yieldData.potentialYield ? yieldData.potentialYield.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '---';

    return (
        <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800 flex flex-col justify-between h-full group hover:border-zinc-700 transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-purple-500/10 text-purple-500 rounded-lg">
                    <FiBarChart2 className="w-5 h-5" />
                </div>
                <div className="px-2 py-1 bg-zinc-950 rounded text-[10px] text-zinc-500 font-bold uppercase tracking-wider border border-zinc-800">
                    {t('dashboard.faoModel') || 'FAO-56 MODEL'}
                </div>
            </div>

            <div>
                <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">{t('dashboard.yieldForecast') || 'Yield Forecast'}</h3>
                <p className="text-2xl font-bold text-white mb-1">
                    {estimated} <span className="text-sm text-zinc-500 font-normal">kg</span>
                </p>

                <div className="mt-4 mb-6">
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                    </div>
                    <div className="flex justify-between mt-1 text-[10px] text-zinc-500 font-mono">
                        <span>{t('dashboard.current') || 'CURRENT'}</span>
                        <span>{t('dashboard.potential') || 'POTENTIAL'}: {potential}</span>
                    </div>
                </div>
            </div>

            <button
                onClick={onOpen}
                className="w-full py-3 bg-zinc-950 hover:bg-black border border-zinc-800 rounded-xl text-sm font-bold text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-2 group-hover:border-zinc-600"
            >
                {t('dashboard.optimizeYield') || 'Optimize Yield'}
            </button>
        </div>
    );
};

export const RecommendationsWidget = ({ analysis, t }: any) => {
    const recommendations = analysis?.recommendations || [];

    // Fill with placeholders if empty to maintain layout
    const displayItems = recommendations.length > 0 ? recommendations : [
        { category: 'General', message: t('recommendations.gathering') || 'Gathering insights...', action: t('recommendations.wait') || 'Please wait' },
        { category: 'System', message: t('recommendations.analyzing') || 'Analyzing farm data...', action: t('recommendations.processing') || 'Processing' }
    ];

    return (
        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 h-full">
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <span className="p-1.5 bg-zinc-800 rounded-lg text-zinc-400">⚡</span>
                {t('recommendations.title') || 'AI Recommendations'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayItems.map((item: any, i: number) => (
                    <div key={i} className="flex gap-4 p-4 bg-zinc-950 rounded-xl border border-zinc-900/50 hover:border-zinc-700 transition-all group">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-900 text-white font-bold flex items-center justify-center border border-zinc-800 group-hover:bg-white group-hover:text-black transition-colors">
                            {i + 1}
                        </div>
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-0.5 block">{item.category}</span>
                            <p className="text-zinc-300 font-medium text-sm leading-snug mb-1">{item.message}</p>
                            <p className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                                <FiArrowRight className="w-3 h-3" /> {item.action}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
