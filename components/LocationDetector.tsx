'use client';

import { useState } from 'react';
import { FiMapPin } from 'react-icons/fi';
import { getLocation, formatCoordinates, getErrorMessage, LocationCoordinates, GeolocationError } from '@/lib/geo';
import { useI18n } from '@/lib/i18n';

interface LocationDetectorProps {
  onLocationDetected: (location: LocationCoordinates) => void;
  onError?: (error: GeolocationError) => void;
}

export default function LocationDetector({ onLocationDetected, onError }: LocationDetectorProps) {
  const { t } = useI18n();
  const [status, setStatus] = useState<'idle' | 'detecting' | 'success' | 'error'>('idle');
  const [location, setLocation] = useState<LocationCoordinates | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleDetectLocation = async () => {
    setStatus('detecting');
    setErrorMessage('');

    try {
      const coords = await getLocation();
      setLocation(coords);
      setStatus('success');
      onLocationDetected(coords);
    } catch (error) {
      const geoError = error as GeolocationError;
      const message = getErrorMessage(geoError);
      setErrorMessage(message);
      setStatus('error');
      onError?.(geoError);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleDetectLocation}
        disabled={status === 'detecting'}
        aria-label={t('location.detect')}
        className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        <FiMapPin className="h-5 w-5" />
        <span className="text-sm font-medium">
          {status === 'detecting' ? t('location.detecting') : t('location.detect')}
        </span>
      </button>

      {status === 'success' && location && (
        <p className="text-sm text-green-600 dark:text-green-400">
          {t('location.success')}: {formatCoordinates(location)}
        </p>
      )}

      {status === 'error' && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
