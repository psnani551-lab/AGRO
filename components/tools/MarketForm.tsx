'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiBarChart2 } from 'react-icons/fi';
import { useI18n } from '@/lib/i18n';
import { slideUp } from '@/lib/anim';

interface MarketData {
  cropType: string;
  quantity: string;
  location: string;
}

interface MarketAnalysis {
  currentPrice: number;
  priceChange: number;
  trend: 'up' | 'down' | 'stable';
  demand: 'high' | 'medium' | 'low';
  forecast: Array<{
    month: string;
    price: number;
    change: number;
  }>;
  insights: string[];
  recommendations: string[];
}

export default function MarketForm() {
  const { t } = useI18n();
  const [formData, setFormData] = useState<MarketData>({
    cropType: '',
    quantity: '',
    location: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MarketAnalysis | null>(null);

  const crops = [
    { value: 'rice', label: t('disease.rice') },
    { value: 'wheat', label: t('disease.wheat') },
    { value: 'cotton', label: t('disease.cotton') },
    { value: 'corn', label: t('disease.corn') },
    { value: 'soybean', label: t('disease.soybean') },
    { value: 'sugarcane', label: t('disease.sugarcane') },
    { value: 'potato', label: t('disease.potato') },
    { value: 'tomato', label: t('disease.tomato') },
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.cropType) newErrors.cropType = t('form.required');
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = 'Valid quantity required';
    }
    if (!formData.location.trim()) newErrors.location = t('form.required');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateMarketAnalysis = (data: MarketData): MarketAnalysis => {
    // Base prices per kg (in local currency)
    const basePrices: Record<string, number> = {
      rice: 25,
      wheat: 22,
      cotton: 55,
      corn: 18,
      soybean: 35,
      sugarcane: 3,
      potato: 15,
      tomato: 20,
    };

    const basePrice = basePrices[data.cropType] || 20;
    const variation = (Math.random() - 0.5) * 10;
    const currentPrice = Math.round((basePrice + variation) * 100) / 100;
    const priceChange = Math.round((Math.random() - 0.5) * 20 * 100) / 100;

    // Determine trend
    let trend: 'up' | 'down' | 'stable';
    if (priceChange > 5) trend = 'up';
    else if (priceChange < -5) trend = 'down';
    else trend = 'stable';

    // Determine demand
    const demandRandom = Math.random();
    let demand: 'high' | 'medium' | 'low';
    if (demandRandom > 0.6) demand = 'high';
    else if (demandRandom > 0.3) demand = 'medium';
    else demand = 'low';

    // Generate 6-month forecast
    const months = ['Current', 'Month +1', 'Month +2', 'Month +3', 'Month +4', 'Month +5'];
    const forecast = months.map((month, index) => {
      const monthPrice = currentPrice + (index * (Math.random() - 0.4) * 3);
      const monthChange = index === 0 ? priceChange : Math.round((Math.random() - 0.5) * 15 * 100) / 100;
      return {
        month,
        price: Math.round(monthPrice * 100) / 100,
        change: monthChange,
      };
    });

    // Generate insights
    const insights = [];
    
    if (trend === 'up') {
      insights.push('Prices are trending upward - good time to sell');
      insights.push('Increased demand in urban markets');
    } else if (trend === 'down') {
      insights.push('Prices declining - consider storage options');
      insights.push('Market oversupply detected');
    } else {
      insights.push('Stable market conditions');
      insights.push('Consistent demand patterns');
    }

    if (demand === 'high') {
      insights.push('High demand in your region');
      insights.push('Multiple buyers actively purchasing');
    } else if (demand === 'low') {
      insights.push('Lower demand - explore alternative markets');
    }

    // Generate recommendations
    const recommendations = [];
    const quantity = parseFloat(data.quantity);
    const totalValue = Math.round(currentPrice * quantity);

    recommendations.push(`Estimated value: ₹${totalValue.toLocaleString()} for ${quantity}kg`);

    if (trend === 'up') {
      recommendations.push('Hold for 2-3 weeks for better prices');
      recommendations.push('Monitor daily price movements');
    } else if (trend === 'down') {
      recommendations.push('Sell immediately to avoid further losses');
      recommendations.push('Consider contract farming for next season');
    } else {
      recommendations.push('Current prices are fair - safe to sell');
      recommendations.push('Negotiate for bulk discounts');
    }

    if (demand === 'high') {
      recommendations.push('Leverage high demand for better negotiations');
    } else {
      recommendations.push('Explore direct-to-consumer channels');
    }

    recommendations.push('Check government procurement prices');
    recommendations.push('Consider quality grading for premium prices');

    return {
      currentPrice,
      priceChange,
      trend,
      demand,
      forecast,
      insights,
      recommendations,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const analysis = generateMarketAnalysis(formData);
    setResult(analysis);
    setLoading(false);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (result) {
      setResult(null);
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-400 bg-green-500/20 border-green-500/50';
      case 'down': return 'text-red-400 bg-red-500/20 border-red-500/50';
      case 'stable': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/50';
    }
  };

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'high': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <motion.div
      variants={slideUp}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Crop Type */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            {t('disease.cropType')} *
          </label>
          <select
            value={formData.cropType}
            onChange={(e) => handleChange('cropType', e.target.value)}
            className={`w-full rounded-lg bg-white/10 border ${
              errors.cropType ? 'border-red-500' : 'border-white/20'
            } px-4 py-3 text-white backdrop-blur-md focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50`}
          >
            <option value="" className="bg-gray-800">{t('disease.selectCrop')}</option>
            {crops.map((crop) => (
              <option key={crop.value} value={crop.value} className="bg-gray-800">
                {crop.label}
              </option>
            ))}
          </select>
          {errors.cropType && (
            <p className="mt-1 text-sm text-red-400">{errors.cropType}</p>
          )}
        </div>

        {/* Quantity and Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              {t('form.quantity')} *
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={formData.quantity}
              onChange={(e) => handleChange('quantity', e.target.value)}
              placeholder={t('form.quantityPlaceholder')}
              className={`w-full rounded-lg bg-white/10 border ${
                errors.quantity ? 'border-red-500' : 'border-white/20'
              } px-4 py-3 text-white placeholder-gray-400 backdrop-blur-md focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50`}
            />
            {errors.quantity && (
              <p className="mt-1 text-sm text-red-400">{errors.quantity}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              {t('form.locationInput')} *
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder={t('form.locationInputPlaceholder')}
              className={`w-full rounded-lg bg-white/10 border ${
                errors.location ? 'border-red-500' : 'border-white/20'
              } px-4 py-3 text-white placeholder-gray-400 backdrop-blur-md focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50`}
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-400">{errors.location}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-white font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>{t('market.analyzingMarket')}</span>
            </>
          ) : (
            <>
              <FiBarChart2 className="h-5 w-5" />
              <span>{t('market.getAnalysis')}</span>
            </>
          )}
        </button>
      </form>

      {/* Market Analysis Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <h3 className="text-xl font-semibold text-white">{t('market.marketAnalysis')}</h3>

          {/* Current Price & Trend */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border border-primary-500/50 bg-primary-500/20 p-4">
              <div className="flex items-center gap-2 text-primary-300 mb-2">
                <FiDollarSign className="h-5 w-5" />
                <span className="text-sm font-medium">{t('market.currentPrice')}</span>
              </div>
              <p className="text-3xl font-bold text-white">₹{result.currentPrice}</p>
              <p className="text-sm text-primary-200">{t('market.pricePerKg')}</p>
            </div>

            <div className={`rounded-lg border p-4 ${getTrendColor(result.trend)}`}>
              <div className="flex items-center gap-2 mb-2">
                {result.trend === 'up' ? (
                  <FiTrendingUp className="h-5 w-5" />
                ) : result.trend === 'down' ? (
                  <FiTrendingDown className="h-5 w-5" />
                ) : (
                  <FiBarChart2 className="h-5 w-5" />
                )}
                <span className="text-sm font-medium">{t('market.priceTrend')}</span>
              </div>
              <p className="text-2xl font-bold capitalize">{t(`market.${result.trend}`)}</p>
              <p className="text-sm">
                {result.priceChange > 0 ? '+' : ''}{result.priceChange}% change
              </p>
            </div>

            <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-md">
              <p className="text-sm text-gray-400 mb-2">{t('market.marketDemand')}</p>
              <p className={`text-2xl font-bold capitalize ${getDemandColor(result.demand)}`}>
                {t(`market.${result.demand}`)}
              </p>
              <p className="text-sm text-gray-300">{t('market.currentDemandLevel')}</p>
            </div>
          </div>

          {/* Price Forecast */}
          <div className="rounded-lg border border-white/20 bg-white/10 p-6 backdrop-blur-md">
            <h4 className="text-lg font-semibold text-white mb-4">{t('market.priceForecast')}</h4>
            
            <div className="space-y-3">
              {result.forecast.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <span className="text-white font-medium">{item.month}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-white font-semibold">₹{item.price}</span>
                    <span className={`text-sm ${
                      item.change > 0 ? 'text-green-400' : item.change < 0 ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {item.change > 0 ? '+' : ''}{item.change}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Market Insights */}
          <div className="rounded-lg border border-white/20 bg-white/10 p-6 backdrop-blur-md">
            <h4 className="text-lg font-semibold text-white mb-4">{t('market.marketInsights')}</h4>
            
            <div className="space-y-2">
              {result.insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                  <FiBarChart2 className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300">{insight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="rounded-lg border border-white/20 bg-white/10 p-6 backdrop-blur-md">
            <h4 className="text-lg font-semibold text-white mb-4">{t('disease.recommendations')}</h4>
            
            <ul className="space-y-2">
              {result.recommendations.map((rec, index) => (
                <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                  <span className="text-primary-400 mt-1">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
