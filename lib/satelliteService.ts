import { supabase } from './supabaseClient';

const AGRO_API_KEY = process.env.AGRO_MONITORING_API_KEY;
const BASE_URL = 'https://api.agromonitoring.com/agro/1.0';

export interface NDVIStats {
  max: number;
  mean: number;
  min: number;
  std: number;
}

export interface SatData {
  dt: number;
  type: string;
  dc: number;
  cl: number;
  stats: NDVIStats;
}

export interface SoilData {
  dt: number;
  t10: number; // Temp at 10cm depth
  moisture: number; // m3/m3
  t0: number; // Surface temp
}

export interface AccumulatedData {
  gdd: number; // Growing Degree Days
  precipitation: number; // Total rainfall in period
}

/**
 * Satellite Service for AgroMonitoring Integration
 * Handles polygon registration and agricultural data retrieval
 */
export const satelliteService = {
  /**
   * Register a farm polygon with AgroMonitoring
   */
  async registerPolygon(farmId: string, name: string, coords: [number, number][]) {
    if (!AGRO_API_KEY) return { mockId: `mock_poly_${farmId}`, id: `mock_poly_${farmId}` };

    try {
      const response = await fetch(`${BASE_URL}/polygons?appid=${AGRO_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          geo_json: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Polygon',
              coordinates: [coords],
            },
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to register polygon');
      const data = await response.json();
      
      // Save ID to Supabase
      await supabase
        .from('farm_profiles')
        .update({ agro_monitoring_id: data.id })
        .eq('id', farmId);

      return data;
    } catch (error) {
      console.error('Satellite Register Error:', error);
      throw error;
    }
  },

  /**
   * Fetch the latest NDVI statistics for a polygon
   */
  async getLatestNDVI(polygonId: string): Promise<SatData | null> {
    if (!AGRO_API_KEY || polygonId.startsWith('mock_')) {
      return {
        dt: Date.now() / 1000,
        type: 'ndvi',
        dc: 0.85,
        cl: 5,
        stats: { max: 0.82, mean: 0.65, min: 0.45, std: 0.05 },
      };
    }

    try {
      const end = Math.floor(Date.now() / 1000);
      const start = end - 30 * 24 * 60 * 60;
      const response = await fetch(`${BASE_URL}/ndvi/history?polyid=${polygonId}&start=${start}&end=${end}&appid=${AGRO_API_KEY}`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.length > 0 ? data[data.length - 1] : null;
    } catch (error) {
      console.error('NDVI Error:', error);
      return null;
    }
  },

  /**
   * Fetch Soil Data (Virtual Sensing)
   */
  async getSoilData(polygonId: string): Promise<SoilData | null> {
    if (!AGRO_API_KEY || polygonId.startsWith('mock_')) {
      return { dt: Date.now() / 1000, t10: 24.5, moisture: 0.32, t0: 28.2 };
    }

    try {
      const response = await fetch(`${BASE_URL}/soil?polyid=${polygonId}&appid=${AGRO_API_KEY}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Soil Data Error:', error);
      return null;
    }
  },

  /**
   * Fetch Accumulated Temperature (GDD) and Precipitation
   */
  async getAccumulatedWeather(polygonId: string, start: number, end: number): Promise<AccumulatedData | null> {
    if (!AGRO_API_KEY || polygonId.startsWith('mock_')) {
      return { gdd: 1250, precipitation: 45.5 };
    }

    try {
      const response = await fetch(`${BASE_URL}/weather/history/accumulated?polyid=${polygonId}&start=${start}&end=${end}&appid=${AGRO_API_KEY}`);
      if (!response.ok) return null;
      const data = await response.json();
      return {
        gdd: data.temp_accumulated || 0,
        precipitation: data.precip_accumulated || 0
      };
    } catch (error) {
      console.error('Accumulated Weather Error:', error);
      return null;
    }
  },

  /**
   * Interpret NDVI value into human-readable health status
   */
  getHealthStatus(meanNDVI: number) {
    if (meanNDVI > 0.6) return { status: 'Healthy', color: 'green', description: 'Excellent vegetation density.' };
    if (meanNDVI > 0.4) return { status: 'Normal', color: 'yellow', description: 'Standard growth. Monitoring optimal.' };
    if (meanNDVI > 0.2) return { status: 'Stressed', color: 'orange', description: 'Possible moisture or nutrient stress.' };
    return { status: 'Critical', color: 'red', description: 'Sparse vegetation or significant crop failure.' };
  }
};
