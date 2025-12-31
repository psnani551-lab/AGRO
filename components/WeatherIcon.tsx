import React from 'react';
import { WiDaySunny, WiCloudy, WiRain, WiThunderstorm, WiSnow, WiFog, WiNightClear, WiNightAltCloudy } from 'react-icons/wi';

interface WeatherIconProps {
  condition: string;
  size?: number;
  isNight?: boolean;
}

export default function WeatherIcon({ condition, size = 48, isNight = false }: WeatherIconProps) {
  const getWeatherIcon = () => {
    const conditionLower = condition.toLowerCase();
    
    // Clear/Sunny
    if (conditionLower.includes('clear') || conditionLower.includes('sunny')) {
      return isNight ? <WiNightClear size={size} /> : <WiDaySunny size={size} />;
    }
    
    // Cloudy
    if (conditionLower.includes('cloud') || conditionLower.includes('overcast')) {
      return isNight ? <WiNightAltCloudy size={size} /> : <WiCloudy size={size} />;
    }
    
    // Rain
    if (conditionLower.includes('rain') || conditionLower.includes('drizzle') || conditionLower.includes('shower')) {
      return <WiRain size={size} />;
    }
    
    // Thunderstorm
    if (conditionLower.includes('thunder') || conditionLower.includes('storm')) {
      return <WiThunderstorm size={size} />;
    }
    
    // Snow
    if (conditionLower.includes('snow') || conditionLower.includes('sleet')) {
      return <WiSnow size={size} />;
    }
    
    // Fog/Mist
    if (conditionLower.includes('fog') || conditionLower.includes('mist') || conditionLower.includes('haze')) {
      return <WiFog size={size} />;
    }
    
    // Default to cloudy
    return <WiCloudy size={size} />;
  };

  const getIconColor = () => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('clear') || conditionLower.includes('sunny')) {
      return 'text-amber-400';
    }
    if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
      return 'text-blue-500';
    }
    if (conditionLower.includes('thunder') || conditionLower.includes('storm')) {
      return 'text-purple-500';
    }
    if (conditionLower.includes('cloud')) {
      return 'text-gray-400';
    }
    return 'text-sky-400';
  };

  return (
    <div className={`weather-icon ${getIconColor()} transition-colors duration-300`}>
      {getWeatherIcon()}
    </div>
  );
}
