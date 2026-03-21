import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

/**
 * IoT Calibration Status API
 * GET /api/iot/calibrate/status?farm_id=uuid
 * 
 * Used by the dashboard to poll for the result of a calibration capture.
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const farm_id = searchParams.get('farm_id');

    if (!farm_id) {
      return NextResponse.json({ error: 'farm_id is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('farm_profiles')
      .select('calibration_status, sensor_dry_value, sensor_wet_value')
      .eq('id', farm_id)
      .single();

    if (error) {
       return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 });
    }

    return NextResponse.json({ 
      status: data.calibration_status,
      dry: data.sensor_dry_value,
      wet: data.sensor_wet_value
    });

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
