import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

/**
 * IoT Calibration Control API
 * POST /api/iot/calibrate
 * 
 * Used by the dashboard to toggle "Capture Mode" for a farm.
 * Payload: { farm_id: "uuid", status: "dry" | "wet" | null }
 */

export async function POST(request: NextRequest) {
  try {
    const { farm_id, status } = await request.json();

    if (!farm_id) {
      return NextResponse.json({ error: 'farm_id is required' }, { status: 400 });
    }

    // Update the farm profile with the new calibration status
    const { error } = await supabase
      .from('farm_profiles')
      .update({ calibration_status: status })
      .eq('id', farm_id);

    if (error) {
      console.error('Calibration Toggle Error:', error);
      return NextResponse.json({ error: 'Failed to update calibration status' }, { status: 500 });
    }

    return NextResponse.json({ success: true, status });

  } catch (error) {
    console.error('Calibration API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
