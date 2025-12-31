'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiAlertTriangle, FiCheckCircle, FiInfo } from 'react-icons/fi';
import { useI18n } from '@/lib/i18n';
import { slideUp } from '@/lib/anim';

interface DiseaseRiskData {
  cropType: string;
  temperature: string;
  humidity: string;
  rainfall: string;
}

interface RiskResult {
  riskLevel: 'low' | 'medium' | 'high';
  diseases: string[];
  pests: string[];
  recommendations: string[];
}

export default function DiseaseRiskForm() {
  const { t } = useI18n();
  const [formData, setFormData] = useState<DiseaseRiskData>({
    cropType: '',
    temperature: '',
    humidity: '',
    rainfall: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RiskResult | null>(null);

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

    if (!formData.cropType) {
      newErrors.cropType = t('form.required');
    }

    if (!formData.temperature || parseFloat(formData.temperature) < -10 || parseFloat(formData.temperature) > 60) {
      newErrors.temperature = 'Valid temperature required (-10°C to 60°C)';
    }

    if (!formData.humidity || parseFloat(formData.humidity) < 0 || parseFloat(formData.humidity) > 100) {
      newErrors.humidity = 'Valid humidity required (0% to 100%)';
    }

    if (!formData.rainfall || parseFloat(formData.rainfall) < 0) {
      newErrors.rainfall = 'Valid rainfall required (≥ 0mm)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateRisk = (data: DiseaseRiskData): RiskResult => {
    const temp = parseFloat(data.temperature);
    const humidity = parseFloat(data.humidity);
    const rainfall = parseFloat(data.rainfall);

    let riskScore = 0;

    // Temperature risk factors
    if (temp > 30 || temp < 10) riskScore += 2;
    else if (temp > 25 || temp < 15) riskScore += 1;

    // Humidity risk factors
    if (humidity > 80) riskScore += 3;
    else if (humidity > 60) riskScore += 1;

    // Rainfall risk factors
    if (rainfall > 100) riskScore += 2;
    else if (rainfall > 50) riskScore += 1;

    let riskLevel: 'low' | 'medium' | 'high';
    if (riskScore <= 2) riskLevel = 'low';
    else if (riskScore <= 4) riskLevel = 'medium';
    else riskLevel = 'high';

    // Crop-specific diseases and pests
    const cropRisks: Record<string, { diseases: string[]; pests: string[] }> = {
      rice: {
        diseases: ['Blast', 'Brown Spot', 'Bacterial Blight'],
        pests: ['Stem Borer', 'Brown Planthopper', 'Rice Bug']
      },
      wheat: {
        diseases: ['Rust', 'Powdery Mildew', 'Septoria Leaf Blotch'],
        pests: ['Aphids', 'Hessian Fly', 'Armyworm']
      },
      cotton: {
        diseases: ['Fusarium Wilt', 'Verticillium Wilt', 'Bacterial Blight'],
        pests: ['Bollworm', 'Whitefly', 'Thrips']
      },
      corn: {
        diseases: ['Northern Corn Leaf Blight', 'Gray Leaf Spot', 'Common Rust'],
        pests: ['Corn Borer', 'Fall Armyworm', 'Cutworm']
      },
      soybean: {
        diseases: ['Soybean Rust', 'Frogeye Leaf Spot', 'Sudden Death Syndrome'],
        pests: ['Soybean Aphid', 'Bean Leaf Beetle', 'Stink Bug']
      },
      sugarcane: {
        diseases: ['Red Rot', 'Smut', 'Wilt'],
        pests: ['Sugarcane Borer', 'Whitefly', 'Scale Insects']
      },
      potato: {
        diseases: ['Late Blight', 'Early Blight', 'Potato Virus Y'],
        pests: ['Colorado Potato Beetle', 'Aphids', 'Wireworm']
      },
      tomato: {
        diseases: ['Late Blight', 'Fusarium Wilt', 'Bacterial Spot'],
        pests: ['Hornworm', 'Whitefly', 'Aphids']
      }
    };

    const cropData = cropRisks[data.cropType] || { diseases: [], pests: [] };

    // Risk-based recommendations
    const recommendations = [];
    if (riskLevel === 'high') {
      recommendations.push('Apply preventive fungicide spray immediately');
      recommendations.push('Increase field monitoring frequency');
      recommendations.push('Ensure proper drainage to reduce moisture');
      recommendations.push('Consider resistant varieties for next season');
    } else if (riskLevel === 'medium') {
      recommendations.push('Monitor crops closely for early symptoms');
      recommendations.push('Maintain proper field hygiene');
      recommendations.push('Apply organic preventive measures');
    } else {
      recommendations.push('Continue regular monitoring');
      recommendations.push('Maintain good agricultural practices');
      recommendations.push('Keep fields clean and well-ventilated');
    }

    return {
      riskLevel,
      diseases: cropData.diseases,
      pests: cropData.pests,
      recommendations
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const riskResult = calculateRisk(formData);
    setResult(riskResult);
    setLoading(false);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Clear result when form changes
    if (result) {
      setResult(null);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/50';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/50';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/50';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low': return FiCheckCircle;
      case 'medium': return FiInfo;
      case 'high': return FiAlertTriangle;
      default: return FiInfo;
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
            className={`w-full rounded-lg bg-white/10 border ${ errors.cropType ? 'border-red-500' : 'border-white/20'
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

        {/* Environmental Conditions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Temperature */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              {t('disease.temperature')} *
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.temperature}
              onChange={(e) => handleChange('temperature', e.target.value)}
              placeholder={t('disease.temperaturePlaceholder')}
              className={`w-full rounded-lg bg-white/10 border ${
                errors.temperature ? 'border-red-500' : 'border-white/20'
              } px-4 py-3 text-white placeholder-gray-400 backdrop-blur-md focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50`}
            />
            {errors.temperature && (
              <p className="mt-1 text-sm text-red-400">{errors.temperature}</p>
            )}
          </div>

          {/* Humidity */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              {t('disease.humidity')} *
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={formData.humidity}
              onChange={(e) => handleChange('humidity', e.target.value)}
              placeholder={t('disease.humidityPlaceholder')}
              className={`w-full rounded-lg bg-white/10 border ${
                errors.humidity ? 'border-red-500' : 'border-white/20'
              } px-4 py-3 text-white placeholder-gray-400 backdrop-blur-md focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50`}
            />
            {errors.humidity && (
              <p className="mt-1 text-sm text-red-400">{errors.humidity}</p>
            )}
          </div>

          {/* Rainfall */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              {t('disease.rainfall')} *
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={formData.rainfall}
              onChange={(e) => handleChange('rainfall', e.target.value)}
              placeholder={t('disease.rainfallPlaceholder')}
              className={`w-full rounded-lg bg-white/10 border ${
                errors.rainfall ? 'border-red-500' : 'border-white/20'
              } px-4 py-3 text-white placeholder-gray-400 backdrop-blur-md focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50`}
            />
            {errors.rainfall && (
              <p className="mt-1 text-sm text-red-400">{errors.rainfall}</p>
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
              <span>{t('disease.checking')}</span>
            </>
          ) : (
            <>
              <FiSearch className="h-5 w-5" />
              <span>{t('disease.checkRisk')}</span>
            </>
          )}
        </button>
      </form>

      {/* Risk Assessment Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <h3 className="text-xl font-semibold text-white">{t('disease.riskAssessment')}</h3>

          {/* Risk Level */}
          <div className={`rounded-lg border p-4 ${getRiskColor(result.riskLevel)}`}>
            <div className="flex items-center gap-2">
              {(() => {
                const Icon = getRiskIcon(result.riskLevel);
                return <Icon className="h-5 w-5" />;
              })()}
              <span className="font-medium">
                {t('disease.riskLevel')}: {t(`disease.${result.riskLevel}Risk`)}
              </span>
            </div>
          </div>

          {/* Diseases */}
          {result.diseases.length > 0 && (
            <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-md">
              <h4 className="font-medium text-white mb-2">Common Diseases</h4>
              <ul className="space-y-1">
                {result.diseases.map((disease, index) => (
                  <li key={index} className="text-gray-300 text-sm">• {disease}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Pests */}
          {result.pests.length > 0 && (
            <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-md">
              <h4 className="font-medium text-white mb-2">Common Pests</h4>
              <ul className="space-y-1">
                {result.pests.map((pest, index) => (
                  <li key={index} className="text-gray-300 text-sm">• {pest}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-md">
            <h4 className="font-medium text-white mb-2">{t('disease.recommendations')}</h4>
            <ul className="space-y-1">
              {result.recommendations.map((rec, index) => (
                <li key={index} className="text-gray-300 text-sm">• {rec}</li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
