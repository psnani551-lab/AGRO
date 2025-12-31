export interface WeatherData {
    current: {
        temp_c: number;
        condition: { text: string; icon: string };
        wind_kph: number;
        humidity: number;
        rain: number;
    };
    forecast: {
        forecastday: Array<{
            date: string;
            day: {
                maxtemp_c: number;
                mintemp_c: number;
                condition: { text: string; icon: string };
                daily_chance_of_rain: number;
            };
        }>;
    };
    season: string;
}

export function getScientificWeatherData(location: string): WeatherData {
    // Deterministic simulation based on location string hash
    let hash = 0;
    for (let i = 0; i < location.length; i++) {
        hash = location.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Simulate Season based on month (assuming Northern Hemisphere for India context)
    const month = new Date().getMonth();
    let season = 'Winter';
    let baseTemp = 20;

    if (month >= 2 && month <= 5) { season = 'Summer'; baseTemp = 35; }
    else if (month >= 6 && month <= 9) { season = 'Monsoon'; baseTemp = 28; }

    // Simulate Current Weather
    const tempNoise = (Math.sin(hash) * 5);
    const temp = Math.round(baseTemp + tempNoise);

    let rain = 0;
    let humidity = 40;
    let condition = 'Sunny';

    if (season === 'Monsoon') {
        rain = Math.abs(Math.sin(hash * 2)) * 50; // Heavy rain 0-50mm
        humidity = 80 + (Math.sin(hash) * 15);
        condition = 'Rainy';
    } else if (season === 'Winter') {
        humidity = 30 + (Math.cos(hash) * 10);
        condition = 'Clear';
    } else {
        humidity = 20 + (Math.cos(hash) * 15);
        condition = 'Sunny';
    }

    return {
        current: {
            temp_c: temp,
            condition: { text: condition, icon: '//cdn.weatherapi.com/weather/64x64/day/113.png' },
            wind_kph: Math.abs(Math.cos(hash)) * 20,
            humidity: Math.round(humidity),
            rain: Math.round(rain)
        },
        forecast: {
            forecastday: Array(3).fill(null).map((_, i) => ({
                date: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
                day: {
                    maxtemp_c: temp + 2,
                    mintemp_c: temp - 2,
                    condition: { text: condition, icon: '//cdn.weatherapi.com/weather/64x64/day/113.png' },
                    daily_chance_of_rain: season === 'Monsoon' ? 80 : 10
                }
            }))
        },
        season
    };
}
