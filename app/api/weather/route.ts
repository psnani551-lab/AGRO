import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { location } = await request.json();

    if (!location) {
      return NextResponse.json(
        { error: 'Location is required' },
        { status: 400 }
      );
    }

    // Using OpenWeatherMap API (free tier)
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      console.warn("Missing OPENWEATHER_API_KEY, falling back to scientific simulation.");
      return NextResponse.json(generateScientificWeatherData(location));
    }

    // Geocoding: Convert location name to coordinates
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${apiKey}`;

    try {
      const geoResponse = await fetch(geoUrl);

      if (!geoResponse.ok) {
        throw new Error(`Geocoding failed: ${geoResponse.statusText}`);
      }

      const geoData = await geoResponse.json();

      if (!geoData || geoData.length === 0) {
        console.log('Location not found in OpenWeatherMap:', location);
        // Fallback to simulation if location is obscure
        return NextResponse.json(generateScientificWeatherData(location));
      }

      const { lat, lon } = geoData[0];
      console.log(`Weather API: Fetching real data for ${location} (${lat}, ${lon})`);

      // Fetch 7-day forecast
      const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
      const weatherResponse = await fetch(weatherUrl);

      if (!weatherResponse.ok) {
        throw new Error(`Weather fetch failed: ${weatherResponse.statusText}`);
      }

      const weatherData = await weatherResponse.json();

      // Process forecast data
      const forecast = processWeatherData(weatherData);

      const currentItem = weatherData.list[0];
      const current = {
        temp_c: Math.round(currentItem.main.temp),
        condition: { text: currentItem.weather[0].main },
        humidity: currentItem.main.humidity,
        wind_kph: Math.round(currentItem.wind.speed * 3.6),
      };

      return NextResponse.json({
        location: geoData[0].name,
        country: geoData[0].country,
        coordinates: { lat, lon },
        current,
        forecast,
        isRealData: true
      });

    } catch (apiError) {
      console.error('Weather API Request Failed:', apiError);
      // Fallback is still necessary for app stability, but we logged the error
      return NextResponse.json(generateScientificWeatherData(location));
    }
  } catch (error) {
    console.error('Weather API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}

function processWeatherData(data: any) {
  const dailyData: any = {};

  data.list.forEach((item: any) => {
    const date = new Date(item.dt * 1000).toLocaleDateString();

    if (!dailyData[date]) {
      dailyData[date] = {
        temps: [],
        humidity: [],
        rain: 0,
        description: item.weather[0].description,
      };
    }

    dailyData[date].temps.push(item.main.temp);
    dailyData[date].humidity.push(item.main.humidity);
    if (item.rain && item.rain['3h']) {
      dailyData[date].rain += item.rain['3h'];
    }
  });

  return Object.entries(dailyData).slice(0, 7).map(([date, data]: [string, any]) => ({
    date,
    temp: Math.round(data.temps.reduce((a: number, b: number) => a + b, 0) / data.temps.length),
    humidity: Math.round(data.humidity.reduce((a: number, b: number) => a + b, 0) / data.humidity.length),
    rain: Math.round(data.rain * 10) / 10,
    description: data.description,
  }));
}

function generateScientificWeatherData(location: string) {
  // Keeping this as a robust fallback for stability
  const date = new Date();
  const month = date.getMonth();

  let season = 'Winter';
  let baseTemp = 22;
  let humidityBase = 50;

  if (month >= 2 && month <= 4) { season = 'Summer'; baseTemp = 32; }
  else if (month >= 5 && month <= 8) { season = 'Monsoon'; baseTemp = 27; }
  else if (month === 9) { season = 'Post-Monsoon'; baseTemp = 26; }

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const seed = date.getDate();

  const forecast = days.map((day, index) => {
    const varTemp = Math.sin(index + seed) * 2;
    const avgTemp = Math.round(baseTemp + varTemp);
    return {
      date: day,
      temp: avgTemp,
      tempMin: avgTemp - 5,
      tempMax: avgTemp + 5,
      humidity: humidityBase,
      rain: 0,
      description: 'Clear'
    };
  });

  return {
    location: location,
    country: 'IN',
    coordinates: { lat: 17.3850, lon: 78.4867 },
    current: {
      temp_c: forecast[0].temp,
      condition: { text: "Simulated" },
      humidity: 50,
      wind_kph: 10
    },
    forecast,
    isMockData: true,
    simulationMode: true
  };
}
