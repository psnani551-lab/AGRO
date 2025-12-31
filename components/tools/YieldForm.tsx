'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiBarChart2, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { useI18n } from '@/lib/i18n';
import { slideUp } from '@/lib/anim';

interface YieldData {
  cropType: string;
  fieldSize: string;
  soilQuality: string;
  irrigationMethod: string;
  fertilizer: string;
  previousYield: string;
}

interface YieldPrediction {
  estimatedYield: number;
  yieldPerAcre: number;
  confidence: 'low' | 'medium' | 'high';
  factors: Array<{
    name: string;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
  }>;
  recommendations: string[];
  comparison: {
    vsLastYear: number;
    vsAverage: number;
  };
}

export default function YieldForm() {
  const { t } = useI18n();
  const [formData, setFormData] = useState<YieldData>({
    cropType: '',
    fieldSize: '',
    soilQuality: '',
    irrigationMethod: '',
    fertilizer: '',
    previousYield: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<YieldPrediction | null>(null);

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

  const soilQualities = [
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'average', label: 'Average' },
    { value: 'poor', label: 'Poor' },
  ];

  const irrigationMethods = [
    { value: 'drip', label: t('form.drip') },
    { value: 'sprinkler', label: t('form.sprinkler') },
    { value: 'flood', label: t('form.flood') },
    { value: 'manual', label: t('form.manual') },
  ];

  const fertilizerTypes = [
    { value: 'organic', label: 'Organic' },
    { value: 'chemical', label: 'Chemical' },
    { value: 'mixed', label: 'Mixed' },
    { value: 'none', label: 'None' },
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.cropType) newErrors.cropType = t('form.required');
    if (!formData.fieldSize || parseFloat(formData.fieldSize) <= 0) {
      newErrors.fieldSize = t('form.validSize');
    }
    if (!formData.soilQuality) newErrors.soilQuality = t('form.required');
    if (!formData.irrigationMethod) newErrors.irrigationMethod = t('form.required');
    if (!formData.fertilizer) newErrors.fertilizer = t('form.required');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateYield = (data: YieldData): YieldPrediction => {
    const fieldSize = parseFloat(data.fieldSize);
    const previousYield = data.previousYield ? parseFloat(data.previousYield) : 0;

    // Base yield per acre for different crops (in kg)
    const baseYields: Record<string, number> = {
      rice: 2500,
      wheat: 2000,
      cotton: 800,
      corn: 3000,
      soybean: 1500,
      sugarcane: 35000,
      potato: 15000,
      tomato: 20000,
    };

    // Soil quality multipliers
    const soilMultipliers: Record<string, number> = {
      excellent: 1.3,
      good: 1.1,
      average: 1.0,
      poor: 0.7,
    };

    // Irrigation method multipliers
    const irrigationMultipliers: Record<string, number> = {
      drip: 1.25,
      sprinkler: 1.15,
      flood: 1.0,
      manual: 0.85,
    };

    // Fertilizer multipliers
    const fertilizerMultipliers: Record<string, number> = {
      organic: 1.15,
      chemical: 1.2,
      mixed: 1.25,
      none: 0.8,
    };

    const baseYield = baseYields[data.cropType] || 2000;
    const soilMultiplier = soilMultipliers[data.soilQuality] || 1.0;
    const irrigationMultiplier = irrigationMultipliers[data.irrigationMethod] || 1.0;
    const fertilizerMultiplier = fertilizerMultipliers[data.fertilizer] || 1.0;

    // Calculate yield per acre
    const yieldPerAcre = Math.round(
      baseYield * soilMultiplier * irrigationMultiplier * fertilizerMultiplier
    );

    // Total estimated yield
    const estimatedYield = Math.round(yieldPerAcre * fieldSize);

    // Determine confidence level
    let confidence: 'low' | 'medium' | 'high';
    const totalMultiplier = soilMultiplier * irrigationMultiplier * fertilizerMultiplier;
    if (totalMultiplier >= 1.5) confidence = 'high';
    else if (totalMultiplier >= 1.0) confidence = 'medium';
    else confidence = 'low';

    // Analyze factors
    const factors = [];

    if (data.soilQuality === 'excellent' || data.soilQuality === 'good') {
      factors.push({
        name: 'Soil Quality',
        impact: 'positive' as const,
        description: 'Good soil quality will boost yield significantly',
      });
    } else if (data.soilQuality === 'poor') {
      factors.push({
        name: 'Soil Quality',
        impact: 'negative' as const,
        description: 'Poor soil quality may reduce yield potential',
      });
    }

    if (data.irrigationMethod === 'drip' || data.irrigationMethod === 'sprinkler') {
      factors.push({
        name: 'Irrigation Method',
        impact: 'positive' as const,
        description: 'Efficient irrigation system improves water usage',
      });
    } else if (data.irrigationMethod === 'manual') {
      factors.push({
        name: 'Irrigation Method',
        impact: 'negative' as const,
        description: 'Manual irrigation may lead to inconsistent watering',
      });
    }

    if (data.fertilizer === 'mixed' || data.fertilizer === 'chemical') {
      factors.push({
        name: 'Fertilizer Use',
        impact: 'positive' as const,
        description: 'Proper fertilization enhances crop nutrition',
      });
    } else if (data.fertilizer === 'none') {
      factors.push({
        name: 'Fertilizer Use',
        impact: 'negative' as const,
        description: 'Lack of fertilizer may limit growth potential',
      });
    }

    // Generate recommendations
    const recommendations = [];
    
    if (data.soilQuality === 'poor' || data.soilQuality === 'average') {
      recommendations.push('Consider soil testing and amendment to improve quality');
    }
    
    if (data.irrigationMethod === 'manual' || data.irrigationMethod === 'flood') {
      recommendations.push('Upgrade to drip or sprinkler irrigation for better efficiency');
    }
    
    if (data.fertilizer === 'none') {
      recommendations.push('Apply balanced fertilizers based on soil test results');
    }
    
    recommendations.push('Monitor crop health regularly for early pest detection');
    recommendations.push('Maintain proper spacing between plants for optimal growth');
    recommendations.push('Consider crop rotation to maintain soil fertility');

    // Calculate comparisons
    const avgYield = baseYield * fieldSize;
    const vsAverage = Math.round(((estimatedYield - avgYield) / avgYield) * 100);
    const vsLastYear = previousYield > 0 
      ? Math.round(((estimatedYield - previousYield) / previousYield) * 100)
      : 0;

    return {
      estimatedYield,
      yieldPerAcre,
      confidence,
      factors,
      recommendations,
      comparison: {
        vsLastYear,
        vsAverage,
      },
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const prediction = calculateYield(formData);
    setResult(prediction);
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

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-400 bg-green-500/20 border-green-500/50';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
      case 'low': return 'text-red-400 bg-red-500/20 border-red-500/50';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/50';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive': return <FiCheckCircle className="h-5 w-5 text-green-400" />;
      case 'negative': return <FiAlertCircle className="h-5 w-5 text-red-400" />;
      default: return <FiBarChart2 className="h-5 w-5 text-gray-400" />;
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

        {/* Field Size and Soil Quality */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              {t('form.farmSize')} *
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={formData.fieldSize}
              onChange={(e) => handleChange('fieldSize', e.target.value)}
              placeholder={t('form.farmSizePlaceholder')}
              className={`w-full rounded-lg bg-white/10 border ${
                errors.fieldSize ? 'border-red-500' : 'border-white/20'
              } px-4 py-3 text-white placeholder-gray-400 backdrop-blur-md focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50`}
            />
            {errors.fieldSize && (
              <p className="mt-1 text-sm text-red-400">{errors.fieldSize}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Soil Quality *
            </label>
            <select
              value={formData.soilQuality}
              onChange={(e) => handleChange('soilQuality', e.target.value)}
              className={`w-full rounded-lg bg-white/10 border ${
                errors.soilQuality ? 'border-red-500' : 'border-white/20'
              } px-4 py-3 text-white backdrop-blur-md focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50`}
            >
              <option value="" className="bg-gray-800">Select soil quality</option>
              {soilQualities.map((quality) => (
                <option key={quality.value} value={quality.value} className="bg-gray-800">
                  {quality.label}
                </option>
              ))}
            </select>
            {errors.soilQuality && (
              <p className="mt-1 text-sm text-red-400">{errors.soilQuality}</p>
            )}
          </div>
        </div>

        {/* Irrigation and Fertilizer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              {t('form.irrigationType')} *
            </label>
            <select
              value={formData.irrigationMethod}
              onChange={(e) => handleChange('irrigationMethod', e.target.value)}
              className={`w-full rounded-lg bg-white/10 border ${
                errors.irrigationMethod ? 'border-red-500' : 'border-white/20'
              } px-4 py-3 text-white backdrop-blur-md focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50`}
            >
              <option value="" className="bg-gray-800">{t('form.selectIrrigationType')}</option>
              {irrigationMethods.map((method) => (
                <option key={method.value} value={method.value} className="bg-gray-800">
                  {method.label}
                </option>
              ))}
            </select>
            {errors.irrigationMethod && (
              <p className="mt-1 text-sm text-red-400">{errors.irrigationMethod}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Fertilizer Type *
            </label>
            <select
              value={formData.fertilizer}
              onChange={(e) => handleChange('fertilizer', e.target.value)}
              className={`w-full rounded-lg bg-white/10 border ${
                errors.fertilizer ? 'border-red-500' : 'border-white/20'
              } px-4 py-3 text-white backdrop-blur-md focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50`}
            >
              <option value="" className="bg-gray-800">Select fertilizer type</option>
              {fertilizerTypes.map((type) => (
                <option key={type.value} value={type.value} className="bg-gray-800">
                  {type.label}
                </option>
              ))}
            </select>
            {errors.fertilizer && (
              <p className="mt-1 text-sm text-red-400">{errors.fertilizer}</p>
            )}
          </div>
        </div>

        {/* Previous Yield (Optional) */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Previous Year Yield (kg) - Optional
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={formData.previousYield}
            onChange={(e) => handleChange('previousYield', e.target.value)}
            placeholder="Enter last year's total yield"
            className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 backdrop-blur-md focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
          />
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
              <span>Calculating...</span>
            </>
          ) : (
            <>
              <FiTrendingUp className="h-5 w-5" />
              <span>Predict Yield</span>
            </>
          )}
        </button>
      </form>

      {/* Yield Prediction Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <h3 className="text-xl font-semibold text-white">Yield Forecast</h3>

          {/* Main Prediction */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border border-primary-500/50 bg-primary-500/20 p-4">
              <p className="text-sm text-primary-300 mb-1">Estimated Total Yield</p>
              <p className="text-3xl font-bold text-white">{result.estimatedYield.toLocaleString()}</p>
              <p className="text-sm text-primary-200">kg</p>
            </div>

            <div className="rounded-lg border border-blue-500/50 bg-blue-500/20 p-4">
              <p className="text-sm text-blue-300 mb-1">Yield Per Acre</p>
              <p className="text-3xl font-bold text-white">{result.yieldPerAcre.toLocaleString()}</p>
              <p className="text-sm text-blue-200">kg/acre</p>
            </div>

            <div className={`rounded-lg border p-4 ${getConfidenceColor(result.confidence)}`}>
              <p className="text-sm mb-1">Confidence Level</p>
              <p className="text-2xl font-bold capitalize">{result.confidence}</p>
            </div>
          </div>

          {/* Comparisons */}
          {(result.comparison.vsLastYear !== 0 || result.comparison.vsAverage !== 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.comparison.vsLastYear !== 0 && (
                <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-md">
                  <p className="text-sm text-gray-400 mb-2">vs. Last Year</p>
                  <p className={`text-2xl font-bold ${
                    result.comparison.vsLastYear > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {result.comparison.vsLastYear > 0 ? '+' : ''}{result.comparison.vsLastYear}%
                  </p>
                </div>
              )}

              <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-md">
                <p className="text-sm text-gray-400 mb-2">vs. Average</p>
                <p className={`text-2xl font-bold ${
                  result.comparison.vsAverage > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {result.comparison.vsAverage > 0 ? '+' : ''}{result.comparison.vsAverage}%
                </p>
              </div>
            </div>
          )}

          {/* Factors */}
          <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-md">
            <h4 className="font-medium text-white mb-3">Key Factors</h4>
            <div className="space-y-2">
              {result.factors.map((factor, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                  {getImpactIcon(factor.impact)}
                  <div className="flex-1">
                    <p className="text-white font-medium">{factor.name}</p>
                    <p className="text-sm text-gray-300">{factor.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-md">
            <h4 className="font-medium text-white mb-3">Recommendations</h4>
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
