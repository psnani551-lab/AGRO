'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCloud, FiSun, FiCloudRain, FiWind, FiThermometer, FiDroplet } from 'react-icons/fi';
import { useI18n } from '@/lib/i18n';
import { getToolTranslation } from '@/lib/i18nToolsExtended';
import { slideUp } from '@/lib/anim';

interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'windy';
  forecast: Array<{
    day: string;
    temp: number;
    condition: string;
    rainfall: number;
  }>;
  recommendations: string[];
}

export default function ClimateForm() {
  const { t, locale } = useI18n();
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
        return <FiSun className="h-8 w-8 text-yellow-400" />;
      case 'cloudy':
        return <FiCloud className="h-8 w-8 text-gray-400" />;
      case 'rainy':
        return <FiCloudRain className="h-8 w-8 text-blue-400" />;
      case 'windy':
        return <FiWind className="h-8 w-8 text-cyan-400" />;
      default:
        return <FiCloud className="h-8 w-8 text-gray-400" />;
    }
  };

  const generateMockWeather = (loc: string): WeatherData => {
    // Generate realistic mock weather data
    const conditions: Array<'sunny' | 'cloudy' | 'rainy' | 'windy'> = ['sunny', 'cloudy', 'rainy', 'windy'];
    const currentCondition = conditions[Math.floor(Math.random() * conditions.length)];
    const baseTemp = 25 + Math.random() * 10;
    const humidity = 50 + Math.random() * 40;
    const rainfall = currentCondition === 'rainy' ? 10 + Math.random() * 40 : Math.random() * 5;
    const windSpeed = 5 + Math.random() * 15;

    // Generate 7-day forecast
    const days = ['Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
    const forecast = days.map((day, index) => ({
      day,
      temp: Math.round(baseTemp + (Math.random() - 0.5) * 6),
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      rainfall: Math.round(Math.random() * 20),
    }));

    // Generate farming recommendations based on weather
    const recommendations = [];
    
    if (currentCondition === 'rainy') {
      recommendations.push('Delay irrigation - sufficient rainfall expected');
      recommendations.push('Ensure proper drainage in fields');
      recommendations.push('Monitor for fungal diseases');
      recommendations.push('Postpone fertilizer application');
    } else if (currentCondition === 'sunny') {
      recommendations.push('Increase irrigation frequency');
      recommendations.push('Apply mulch to retain soil moisture');
      recommendations.push('Monitor crops for heat stress');
      recommendations.push('Best time for harvesting');
    } else if (currentCondition === 'windy') {
      recommendations.push('Secure greenhouse structures');
      recommendations.push('Avoid pesticide spraying');
      recommendations.push('Check for wind damage on crops');
      recommendations.push('Provide support to tall crops');
    } else {
      recommendations.push('Good conditions for most farming activities');
      recommendations.push('Suitable for planting and transplanting');
      recommendations.push('Apply fertilizers as scheduled');
      recommendations.push('Regular monitoring recommended');
    }

    // Add temperature-based recommendations
    if (baseTemp > 35) {
      recommendations.push('Extreme heat alert - provide shade for sensitive crops');
    } else if (baseTemp < 15) {
      recommendations.push('Cool weather - protect frost-sensitive crops');
    }

    return {
      location: loc,
      temperature: Math.round(baseTemp),
      humidity: Math.round(humidity),
      rainfall: Math.round(rainfall),
      windSpeed: Math.round(windSpeed),
      condition: currentCondition,
      forecast,
      recommendations,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!location.trim()) {
      return;
    }

    setLoading(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const weather = generateMockWeather(location);
    setWeatherData(weather);
    setLoading(false);
  };

  return (
    <motion.div
      variants={slideUp}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* Location Input */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            {getToolTranslation(locale, 'climate', 'locationLabel')}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={getToolTranslation(locale, 'climate', 'locationPlaceholder')}
              className="flex-1 rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 backdrop-blur-md focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            />
            <button
              type="submit"
              disabled={loading || !location.trim()}
              className="flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-white font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                getToolTranslation(locale, 'climate', 'getWeather')
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Weather Display */}
      {weatherData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Current Weather */}
          <div className="rounded-lg border border-white/20 bg-white/10 p-6 backdrop-blur-md">
            <h3 className="text-xl font-semibold text-white mb-4">
              Current Weather - {weatherData.location}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Main Weather Info */}
              <div className="flex items-center gap-4">
                {getWeatherIcon(weatherData.condition)}
                <div>
                  <p className="text-4xl font-bold text-white">{weatherData.temperature}°C</p>
                  <p className="text-gray-300 capitalize">{weatherData.condition}</p>
                </div>
              </div>

              {/* Weather Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <FiDroplet className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-sm text-gray-400">Humidity</p>
                    <p className="text-white font-semibold">{weatherData.humidity}%</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <FiCloudRain className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-sm text-gray-400">Rainfall</p>
                    <p className="text-white font-semibold">{weatherData.rainfall}mm</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <FiWind className="h-5 w-5 text-cyan-400" />
                  <div>
                    <p className="text-sm text-gray-400">Wind Speed</p>
                    <p className="text-white font-semibold">{weatherData.windSpeed} km/h</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <FiThermometer className="h-5 w-5 text-red-400" />
                  <div>
                    <p className="text-sm text-gray-400">Feels Like</p>
                    <p className="text-white font-semibold">{weatherData.temperature + 2}°C</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 7-Day Forecast */}
          <div className="rounded-lg border border-white/20 bg-white/10 p-6 backdrop-blur-md">
            <h3 className="text-xl font-semibold text-white mb-4">7-Day Forecast</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {weatherData.forecast.map((day, index) => (
                <div
                  key={index}
                  className="rounded-lg bg-white/5 p-3 text-center"
                >
                  <p className="text-sm text-gray-400 mb-2">{day.day}</p>
                  <div className="flex justify-center mb-2">
                    {getWeatherIcon(day.condition)}
                  </div>
                  <p className="text-white font-semibold">{day.temp}°C</p>
                  <p className="text-xs text-blue-400 mt-1">{day.rainfall}mm</p>
                </div>
              ))}
            </div>
          </div>

          {/* Farming Recommendations */}
          <div className="rounded-lg border border-white/20 bg-white/10 p-6 backdrop-blur-md">
            <h3 className="text-xl font-semibold text-white mb-4">Farming Recommendations</h3>
            
            <div className="space-y-3">
              {weatherData.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-white/5"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 text-sm font-semibold">
                    {index + 1}
                  </div>
                  <p className="text-gray-300">{rec}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Seasonal Planning */}
          <div className="rounded-lg border border-white/20 bg-white/10 p-6 backdrop-blur-md">
            <h3 className="text-xl font-semibold text-white mb-4">Seasonal Planning Tips</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                <h4 className="font-semibold text-green-400 mb-2">Best Crops for Current Season</h4>
                <ul className="space-y-1 text-gray-300 text-sm">
                  <li>• Rice (Kharif season)</li>
                  <li>• Cotton</li>
                  <li>• Maize</li>
                  <li>• Soybean</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <h4 className="font-semibold text-blue-400 mb-2">Upcoming Season Preparation</h4>
                <ul className="space-y-1 text-gray-300 text-sm">
                  <li>• Prepare soil for Rabi crops</li>
                  <li>• Plan wheat cultivation</li>
                  <li>• Check irrigation systems</li>
                  <li>• Stock winter crop seeds</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Initial State Message */}
      {!weatherData && !loading && (
        <div className="text-center py-12">
          <FiCloud className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">Enter your location to get weather-based farming guidance</p>
        </div>
      )}
    </motion.div>
  );
}
