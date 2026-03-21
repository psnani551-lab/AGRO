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

/**
 * Satellite Service for AgroMonitoring Integration
 * Handles polygon registration and NDVI data retrieval
 */
export const satelliteService = {
  /**
   * Register a farm polygon with AgroMonitoring
   */
  async registerPolygon(farmId: string, name: string, coords: [number, number][]) {
    if (!AGRO_API_KEY) return { mockId: `mock_poly_${farmId}` };

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
      // Return mock data for demonstration
      return {
        dt: Date.now() / 1000,
        type: 'ndvi',
        dc: 0.85,
        cl: 5,
        stats: {
          max: 0.82,
          mean: 0.65,
          min: 0.45,
          std: 0.05,
        },
      };
    }

    try {
      // Get the latest 5 imagery stats
      const end = Math.floor(Date.now() / 1000);
      const start = end - 30 * 24 * 60 * 60; // Last 30 days
      
      const response = await fetch(
        `${BASE_URL}/ndvi/history?polyid=${polygonId}&start=${start}&end=${end}&appid=${AGRO_API_KEY}`
      );

      if (!response.ok) return null;
      const data = await response.json();
      
      // Return the most recent entry
      return data.length > 0 ? data[data.length - 1] : null;
    } catch (error) {
      console.error('Satellite NDVI Error:', error);
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
