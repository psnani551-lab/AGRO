export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export interface GeolocationError {
  code: number;
  message: string;
}

export const getLocation = (): Promise<LocationCoordinates> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        code: 0,
        message: 'Geolocation is not supported by your browser',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject({
          code: error.code,
          message: error.message,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
};

export const formatCoordinates = (coords: LocationCoordinates): string => {
  return `${coords.lat.toFixed(4)}°, ${coords.lng.toFixed(4)}°`;
};

export const getErrorMessage = (error: GeolocationError): string => {
  switch (error.code) {
    case 1:
      return 'Location permission denied. Please enable location access.';
    case 2:
      return 'Location unavailable. Please check your device settings.';
    case 3:
      return 'Location request timed out. Please try again.';
    default:
      return 'Unable to detect location. Please try again.';
  }
};
