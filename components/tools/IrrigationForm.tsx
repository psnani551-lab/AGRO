'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiDroplet, FiCalendar, FiClock, FiDollarSign } from 'react-icons/fi';
import { useI18n } from '@/lib/i18n';
import { slideUp } from '@/lib/anim';

interface IrrigationData {
  cropType: string;
  fieldSize: string;
  soilType: string;
  soilMoisture: string;
  weatherCondition: string;
}

interface IrrigationSchedule {
  nextIrrigation: string;
  duration: number;
  waterAmount: number;
  reason: string;
  totalWaterUsage: number;
  costSavings: number;
  schedule: Array<{
    day: string;
    time: string;
    duration: number;
    amount: number;
  }>;
}

export default function IrrigationForm() {
  const { t } = useI18n();
  const [formData, setFormData] = useState<IrrigationData>({
    cropType: '',
    fieldSize: '',
    soilType: '',
    soilMoisture: '',
    weatherCondition: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IrrigationSchedule | null>(null);

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

  const soilTypes = [
    { value: 'clay', label: t('form.clay') },
    { value: 'sandy', label: t('form.sandy') },
    { value: 'loamy', label: t('form.loamy') },
    { value: 'silty', label: t('form.silty') },
  ];

  const weatherConditions = [
    { value: 'sunny', label: 'Sunny' },
    { value: 'cloudy', label: 'Cloudy' },
    { value: 'rainy', label: 'Rainy' },
    { value: 'windy', label: 'Windy' },
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.cropType) {
      newErrors.cropType = t('form.required');
    }

    if (!formData.fieldSize || parseFloat(formData.fieldSize) <= 0) {
      newErrors.fieldSize = t('form.validSize');
    }

    if (!formData.soilType) {
      newErrors.soilType = t('form.required');
    }

    if (!formData.soilMoisture || parseFloat(formData.soilMoisture) < 0 || parseFloat(formData.soilMoisture) > 100) {
      newErrors.soilMoisture = 'Valid soil moisture required (0% to 100%)';
    }

    if (!formData.weatherCondition) {
      newErrors.weatherCondition = t('form.required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateIrrigation = (data: IrrigationData): IrrigationSchedule => {
    const fieldSize = parseFloat(data.fieldSize);
    const soilMoisture = parseFloat(data.soilMoisture);

    // Base water requirement per acre (liters)
    const cropWaterRequirements: Record<string, number> = {
      rice: 1500,
      wheat: 800,
      cotton: 1200,
      corn: 1000,
      soybean: 900,
      sugarcane: 2000,
      potato: 700,
      tomato: 600,
    };

    // Soil type multipliers
    const soilMultipliers: Record<string, number> = {
      clay: 0.8,    // Retains water well
      sandy: 1.3,   // Drains quickly
      loamy: 1.0,   // Ideal
      silty: 0.9,   // Good retention
    };

    // Weather condition multipliers
    const weatherMultipliers: Record<string, number> = {
      sunny: 1.2,
      cloudy: 0.9,
      rainy: 0.3,
      windy: 1.1,
    };

    // Soil moisture adjustment
    let moistureMultiplier = 1.0;
    if (soilMoisture < 30) moistureMultiplier = 1.5;
    else if (soilMoisture < 50) moistureMultiplier = 1.2;
    else if (soilMoisture > 80) moistureMultiplier = 0.5;

    const baseWater = cropWaterRequirements[data.cropType] || 1000;
    const soilMultiplier = soilMultipliers[data.soilType] || 1.0;
    const weatherMultiplier = weatherMultipliers[data.weatherCondition] || 1.0;

    const totalWaterUsage = Math.round(
      baseWater * fieldSize * soilMultiplier * weatherMultiplier * moistureMultiplier
    );

    // Calculate irrigation timing
    let nextIrrigation = 'Today';
    let duration = 60; // minutes
    let reason = 'Regular irrigation schedule';

    if (soilMoisture < 30) {
      nextIrrigation = 'Immediately';
      duration = 90;
      reason = 'Low soil moisture detected';
    } else if (soilMoisture < 50) {
      nextIrrigation = 'Within 6 hours';
      duration = 75;
      reason = 'Moderate soil moisture';
    } else if (data.weatherCondition === 'rainy') {
      nextIrrigation = 'In 2-3 days';
      duration = 30;
      reason = 'Recent rainfall detected';
    } else if (data.weatherCondition === 'sunny') {
      nextIrrigation = 'Today evening';
      duration = 80;
      reason = 'Hot weather conditions';
    }

    // Generate 7-day schedule
    const schedule = [];
    const days = ['Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
    
    for (let i = 0; i < 7; i++) {
      let dayDuration = duration;
      let dayAmount = Math.round(totalWaterUsage / 7);

      // Adjust based on weather pattern
      if (data.weatherCondition === 'rainy' && i < 2) {
        dayDuration = 0;
        dayAmount = 0;
      } else if (data.weatherCondition === 'sunny') {
        dayDuration = Math.round(duration * 1.1);
        dayAmount = Math.round(dayAmount * 1.1);
      }

      schedule.push({
        day: days[i],
        time: i % 2 === 0 ? '6:00 AM' : '6:00 PM',
        duration: dayDuration,
        amount: dayAmount,
      });
    }

    // Calculate cost savings (assuming $0.001 per liter saved)
    const standardUsage = baseWater * fieldSize * 1.5; // Inefficient irrigation
    const costSavings = Math.round((standardUsage - totalWaterUsage) * 0.001);

    return {
      nextIrrigation,
      duration,
      waterAmount: Math.round(totalWaterUsage / 7), // Daily amount
      reason,
      totalWaterUsage,
      costSavings: Math.max(0, costSavings),
      schedule,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    // Simulate calculation delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const irrigationResult = calculateIrrigation(formData);
    setResult(irrigationResult);
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

        {/* Field Size and Soil Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              {t('form.fieldSize')} *
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={formData.fieldSize}
              onChange={(e) => handleChange('fieldSize', e.target.value)}
              placeholder={t('form.fieldSizePlaceholder')}
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
              {t('form.soilType')} *
            </label>
            <select
              value={formData.soilType}
              onChange={(e) => handleChange('soilType', e.target.value)}
              className={`w-full rounded-lg bg-white/10 border ${
                errors.soilType ? 'border-red-500' : 'border-white/20'
              } px-4 py-3 text-white backdrop-blur-md focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50`}
            >
              <option value="" className="bg-gray-800">{t('form.selectSoilType')}</option>
              {soilTypes.map((soil) => (
                <option key={soil.value} value={soil.value} className="bg-gray-800">
                  {soil.label}
                </option>
              ))}
            </select>
            {errors.soilType && (
              <p className="mt-1 text-sm text-red-400">{errors.soilType}</p>
            )}
          </div>
        </div>

        {/* Soil Moisture and Weather */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              {t('form.soilMoisture')} *
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={formData.soilMoisture}
              onChange={(e) => handleChange('soilMoisture', e.target.value)}
              placeholder={t('form.soilMoisturePlaceholder')}
              className={`w-full rounded-lg bg-white/10 border ${
                errors.soilMoisture ? 'border-red-500' : 'border-white/20'
              } px-4 py-3 text-white placeholder-gray-400 backdrop-blur-md focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50`}
            />
            {errors.soilMoisture && (
              <p className="mt-1 text-sm text-red-400">{errors.soilMoisture}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              {t('form.weatherCondition')} *
            </label>
            <select
              value={formData.weatherCondition}
              onChange={(e) => handleChange('weatherCondition', e.target.value)}
              className={`w-full rounded-lg bg-white/10 border ${
                errors.weatherCondition ? 'border-red-500' : 'border-white/20'
              } px-4 py-3 text-white backdrop-blur-md focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50`}
            >
              <option value="" className="bg-gray-800">{t('form.selectWeather')}</option>
              {weatherConditions.map((weather) => (
                <option key={weather.value} value={weather.value} className="bg-gray-800">
                  {weather.label}
                </option>
              ))}
            </select>
            {errors.weatherCondition && (
              <p className="mt-1 text-sm text-red-400">{errors.weatherCondition}</p>
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
              <span>{t('form.calculating')}</span>
            </>
          ) : (
            <>
              <FiDroplet className="h-5 w-5" />
              <span>{t('irrigation.calculateSchedule')}</span>
            </>
          )}
        </button>
      </form>

      {/* Irrigation Schedule Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <h3 className="text-xl font-semibold text-white">{t('irrigation.irrigationSchedule')}</h3>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border border-blue-500/50 bg-blue-500/20 p-4">
              <div className="flex items-center gap-2 text-blue-400">
                <FiCalendar className="h-5 w-5" />
                <span className="font-medium">{t('irrigation.nextIrrigation')}</span>
              </div>
              <p className="text-white text-lg font-semibold mt-1">{result.nextIrrigation}</p>
              <p className="text-blue-200 text-sm">{result.reason}</p>
            </div>

            <div className="rounded-lg border border-green-500/50 bg-green-500/20 p-4">
              <div className="flex items-center gap-2 text-green-400">
                <FiDroplet className="h-5 w-5" />
                <span className="font-medium">{t('irrigation.waterUsage')}</span>
              </div>
              <p className="text-white text-lg font-semibold mt-1">
                {result.totalWaterUsage.toLocaleString()} liters
              </p>
              <p className="text-green-200 text-sm">{t('irrigation.weeklyTotal')}</p>
            </div>

            <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/20 p-4">
              <div className="flex items-center gap-2 text-yellow-400">
                <FiDollarSign className="h-5 w-5" />
                <span className="font-medium">{t('irrigation.costSavings')}</span>
              </div>
              <p className="text-white text-lg font-semibold mt-1">
                ${result.costSavings}
              </p>
              <p className="text-yellow-200 text-sm">{t('irrigation.vsStandard')}</p>
            </div>
          </div>

          {/* 7-Day Schedule */}
          <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-md">
            <h4 className="font-medium text-white mb-4">{t('irrigation.schedule7Day')}</h4>
            <div className="space-y-2">
              {result.schedule.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div className="flex items-center gap-3">
                    <FiClock className="h-4 w-4 text-gray-400" />
                    <span className="text-white font-medium">{item.day}</span>
                    <span className="text-gray-300">{item.time}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-white">
                      {item.duration} min • {item.amount.toLocaleString()} L
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
