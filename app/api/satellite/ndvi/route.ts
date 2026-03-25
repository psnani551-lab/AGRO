import { NextRequest, NextResponse } from 'next/server';
import { satelliteService } from '@/lib/satelliteService';

export async function POST(request: NextRequest) {
  try {
    const { farmId, polygonId, coords, name } = await request.json();

    let activePolygonId = polygonId;

    // 1. If we have coordinates but no polygon ID, register it
    if (!activePolygonId && coords && coords.length > 0) {
      const registration = await satelliteService.registerPolygon(farmId, name || 'My Field', coords);
      activePolygonId = registration.id || registration.mockId;
    }

    if (!activePolygonId) {
      return NextResponse.json({ error: 'No polygon ID or coordinates provided' }, { status: 400 });
    }

    // 2. Fetch NDVI data
    const ndviData = await satelliteService.getLatestNDVI(activePolygonId);

    // 3. Fetch Soil Data (Virtual Sensing)
    const soilData = await satelliteService.getSoilData(activePolygonId);

    // 4. Fetch Accumulated Weather (GDD/Rain)
    const now = Math.floor(Date.now() / 1000);
    const seasonStart = now - (90 * 24 * 60 * 60); // Default to last 90 days for GDD
    const accumulated = await satelliteService.getAccumulatedWeather(activePolygonId, seasonStart, now);

    // 4. Fetch Latest Imagery Metadata
    const imagery = await satelliteService.getLatestImagery(activePolygonId);

    if (!ndviData && !soilData && !imagery) {
      return NextResponse.json({ 
        message: 'No satellite data available for this period',
        status: 'pending' 
      });
    }

    const health = ndviData ? satelliteService.getHealthStatus(ndviData.stats.mean) : null;

    return NextResponse.json({
      polygonId: activePolygonId,
      timestamp: ndviData?.dt || soilData?.dt || now,
      ndvi: ndviData?.stats || null,
      health: health,
      imagery: imagery,
      soil: soilData ? {
        moisture: soilData.moisture * 100, // Convert to percentage
        temp_t10: soilData.t10,
        temp_surface: soilData.t0
      } : null,
      accumulated: accumulated,
      metadata: {
        cloudCover: ndviData?.cl,
        dataConfidence: ndviData?.dc || 0.8
      }
    });

  } catch (error) {
    console.error('Satellite API Error:', error);
    return NextResponse.json({ error: 'Failed to process satellite data' }, { status: 500 });
  }
}
