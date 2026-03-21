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

    if (!ndviData) {
      return NextResponse.json({ 
        message: 'No satellite data available for this period',
        status: 'pending' 
      });
    }

    const health = satelliteService.getHealthStatus(ndviData.stats.mean);

    return NextResponse.json({
      polygonId: activePolygonId,
      timestamp: ndviData.dt,
      ndvi: ndviData.stats,
      health: health,
      metadata: {
        cloudCover: ndviData.cl,
        dataConfidence: ndviData.dc
      }
    });

  } catch (error) {
    console.error('Satellite API Error:', error);
    return NextResponse.json({ error: 'Failed to process satellite data' }, { status: 500 });
  }
}
