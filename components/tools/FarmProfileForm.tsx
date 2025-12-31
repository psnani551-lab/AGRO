'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSave, FiMapPin, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { useI18n } from '@/lib/i18n';
import { db } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import LocationDetector from '@/components/LocationDetector';
import { slideUp } from '@/lib/anim';

interface FarmProfileData {
  farmName: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  farmSize: string;
  soilType: string;
  irrigationType: string;
  currentCrops: string;
}

export default function FarmProfileForm() {
  const { t } = useI18n();
  const [formData, setFormData] = useState<FarmProfileData>({
    farmName: '',
    location: { latitude: 0, longitude: 0, address: '' },
    farmSize: '',
    soilType: '',
    irrigationType: '',
    currentCrops: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);

  const { user } = useAuth();

  // Load saved profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        try {
          const dbProfile = await db.getFarmProfile(user.id);
          if (dbProfile) {
            setFormData({
              farmName: dbProfile.farm_name,
              location: {
                latitude: dbProfile.latitude,
                longitude: dbProfile.longitude,
                address: dbProfile.location || ''
              },
              farmSize: dbProfile.total_area?.toString() || '',
              soilType: dbProfile.soil_type,
              irrigationType: dbProfile.irrigation_source,
              currentCrops: dbProfile.current_crops ? dbProfile.current_crops.join(', ') : ''
            });
          }
        } catch (e) { console.error(e); }
      } else {
        // Fallback to local
        try {
          const saved = localStorage.getItem('farmProfile');
          if (saved) setFormData(JSON.parse(saved));
        } catch (e) { }
      }
    };
    loadProfile();
  }, [user]);

  const handleLocationDetected = (location: { lat: number; lng: number }) => {
    setFormData(prev => ({
      ...prev,
      location: {
        latitude: location.lat,
        longitude: location.lng,
        address: `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
      }
    }));
    setLocationDetected(true);
    setTimeout(() => setLocationDetected(false), 3000);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.farmName.trim()) {
      newErrors.farmName = t('form.required');
    }

    if (!formData.location.address.trim()) {
      newErrors.location = t('form.required');
    }

    if (!formData.farmSize || parseFloat(formData.farmSize) <= 0) {
      newErrors.farmSize = t('form.validSize');
    }

    if (!formData.soilType) {
      newErrors.soilType = t('form.required');
    }

    if (!formData.irrigationType) {
      newErrors.irrigationType = t('form.required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (user) {
        await db.saveFarmProfile(user.id, {
          farm_name: formData.farmName,
          location: formData.location.address,
          latitude: formData.location.latitude,
          longitude: formData.location.longitude,
          total_area: parseFloat(formData.farmSize),
          soil_type: formData.soilType,
          irrigation_source: formData.irrigationType,
          current_crops: formData.currentCrops.split(',').map(s => s.trim())
        });
      }

      // Also save to localStorage for Chat Context fallback (until we fully migrate chat to use DB only)
      // ChatWidget reads localStorage in line 85.
      // I actually updated ChatWidget to use DB if user exists, but it keeps fallback.
      // So let's keep it sync.
      localStorage.setItem('farmProfile', JSON.stringify(formData));

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Error saving profile", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <motion.form
      variants={slideUp}
      initial="initial"
      animate="animate"
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Success Message */}
      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-lg bg-green-500/20 border border-green-500/50 p-4 text-white"
        >
          <FiCheckCircle className="h-5 w-5" />
          <span>{t('form.saved')}</span>
        </motion.div>
      )}

      {/* Location Detected Message */}
      {locationDetected && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-lg bg-blue-500/20 border border-blue-500/50 p-4 text-white"
        >
          <FiMapPin className="h-5 w-5" />
          <span>{t('form.locationDetected')}</span>
        </motion.div>
      )}

      {/* Farm Name */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          {t('form.farmName')} *
        </label>
        <input
          type="text"
          value={formData.farmName}
          onChange={(e) => handleChange('farmName', e.target.value)}
          placeholder={t('form.farmNamePlaceholder')}
          className={`w-full rounded-lg bg-white/10 border ${errors.farmName ? 'border-red-500' : 'border-white/20'
            } px-4 py-3 text-white placeholder-gray-400 backdrop-blur-md focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50`}
        />
        {errors.farmName && (
          <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
            <FiAlertCircle className="h-4 w-4" />
            {errors.farmName}
          </p>
        )}
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          {t('form.location')} *
        </label>
        <div className="space-y-2">
          <LocationDetector onLocationDetected={handleLocationDetected} />
          <input
            type="text"
            value={formData.location.address}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              location: { ...prev.location, address: e.target.value }
            }))}
            placeholder={t('form.locationPlaceholder')}
            className={`w-full rounded-lg bg-white/10 border ${errors.location ? 'border-red-500' : 'border-white/20'
              } px-4 py-3 text-white placeholder-gray-400 backdrop-blur-md focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50`}
          />
          {errors.location && (
            <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
              <FiAlertCircle className="h-4 w-4" />
              {errors.location}
            </p>
          )}
        </div>
      </div>

      {/* Farm Size */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          {t('form.farmSize')} *
        </label>
        <input
          type="number"
          step="0.1"
          value={formData.farmSize}
          onChange={(e) => handleChange('farmSize', e.target.value)}
          placeholder={t('form.farmSizePlaceholder')}
          className={`w-full rounded-lg bg-white/10 border ${errors.farmSize ? 'border-red-500' : 'border-white/20'
            } px-4 py-3 text-white placeholder-gray-400 backdrop-blur-md focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50`}
        />
        {errors.farmSize && (
          <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
            <FiAlertCircle className="h-4 w-4" />
            {errors.farmSize}
          </p>
        )}
      </div>

      {/* Soil Type */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          {t('form.soilType')} *
        </label>
        <select
          value={formData.soilType}
          onChange={(e) => handleChange('soilType', e.target.value)}
          className={`w-full rounded-lg bg-white/10 border ${errors.soilType ? 'border-red-500' : 'border-white/20'
            } px-4 py-3 text-white backdrop-blur-md focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50`}
        >
          <option value="" className="bg-gray-800">{t('form.selectSoilType')}</option>
          <option value="clay" className="bg-gray-800">{t('form.clay')}</option>
          <option value="sandy" className="bg-gray-800">{t('form.sandy')}</option>
          <option value="loamy" className="bg-gray-800">{t('form.loamy')}</option>
          <option value="silty" className="bg-gray-800">{t('form.silty')}</option>
          <option value="peaty" className="bg-gray-800">{t('form.peaty')}</option>
          <option value="chalky" className="bg-gray-800">{t('form.chalky')}</option>
        </select>
        {errors.soilType && (
          <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
            <FiAlertCircle className="h-4 w-4" />
            {errors.soilType}
          </p>
        )}
      </div>

      {/* Irrigation Type */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          {t('form.irrigationType')} *
        </label>
        <select
          value={formData.irrigationType}
          onChange={(e) => handleChange('irrigationType', e.target.value)}
          className={`w-full rounded-lg bg-white/10 border ${errors.irrigationType ? 'border-red-500' : 'border-white/20'
            } px-4 py-3 text-white backdrop-blur-md focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50`}
        >
          <option value="" className="bg-gray-800">{t('form.selectIrrigationType')}</option>
          <option value="drip" className="bg-gray-800">{t('form.drip')}</option>
          <option value="sprinkler" className="bg-gray-800">{t('form.sprinkler')}</option>
          <option value="flood" className="bg-gray-800">{t('form.flood')}</option>
          <option value="manual" className="bg-gray-800">{t('form.manual')}</option>
        </select>
        {errors.irrigationType && (
          <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
            <FiAlertCircle className="h-4 w-4" />
            {errors.irrigationType}
          </p>
        )}
      </div>

      {/* Current Crops */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          {t('form.currentCrops')}
        </label>
        <textarea
          value={formData.currentCrops}
          onChange={(e) => handleChange('currentCrops', e.target.value)}
          placeholder={t('form.cropsPlaceholder')}
          rows={3}
          className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 backdrop-blur-md focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
        />
        <p className="mt-1 text-sm text-gray-300">
          {t('form.cropsExample')}
        </p>
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
            <span>{t('form.saving')}</span>
          </>
        ) : (
          <>
            <FiSave className="h-5 w-5" />
            <span>{t('form.save')}</span>
          </>
        )}
      </button>
    </motion.form>
  );
}
