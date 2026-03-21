import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

/**
 * IoT Ingestion API
 * POST /api/iot/ingestion
 * 
 * Expected Payload:
 * {
 *   "farm_id": "uuid",
 *   "sensor_id": "string",
 *   "moisture": number,
 *   "temperature": number,
 *   "humidity": number,
 *   "battery": number
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { farm_id, sensor_id, moisture, raw_moisture, temperature, humidity, battery, signal, sensor_type } = body;

    if (!farm_id || !sensor_id) {
      return NextResponse.json(
        { error: 'farm_id and sensor_id are required' },
        { status: 400 }
      );
    }

    // --- 1. FETCH FARM CALIBRATION PROFILE ---
    const { data: profile } = await supabase
      .from('farm_profiles')
      .select('sensor_dry_value, sensor_wet_value, calibration_status')
      .eq('id', farm_id)
      .single();

    // --- 2. LIVE CALIBRATION CAPTURE ---
    if (profile?.calibration_status && raw_moisture !== undefined) {
      const updateData: any = { calibration_status: null }; // RESET status to end calibration mode
      if (profile.calibration_status === 'dry') updateData.sensor_dry_value = raw_moisture;
      if (profile.calibration_status === 'wet') updateData.sensor_wet_value = raw_moisture;
      
      // Update the profile with the new "locked in" value and reset status
      await supabase.from('farm_profiles').update(updateData).eq('id', farm_id);
    }

    // --- 3. SERVER-SIDE MOISTURE CALCULATION (ZERO-CODE) ---
    let finalMoisture = moisture;
    if (raw_moisture !== undefined) {
      const dry = profile?.sensor_dry_value || 4095;
      const wet = profile?.sensor_wet_value || 1500;
      
      // Simple map: (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min
      // But for resistive/capacitive, in_min is often "Dry" and in_max is "Wet"
      const moistureCalc = ((raw_moisture - dry) * (100 - 0)) / (wet - dry);
      finalMoisture = Math.min(100, Math.max(0, Math.round(moistureCalc)));
    }

    // Adapt Legacy: if old code sends pre-calculated moisture, we still respect it
    if (finalMoisture === undefined) finalMoisture = moisture;

    // --- 4. LOG READINGS ---
    const { error: insertError } = await supabase
      .from('sensor_readings')
      .insert([
        {
          farm_id,
          sensor_id,
          moisture: finalMoisture,
          temperature,
          humidity,
          battery_level: battery,
          signal_strength: signal,
          sensor_type: sensor_type || 'resistive',
        },
      ]);

    if (insertError) {
      console.error('Database Ingestion Error:', insertError);
      return NextResponse.json(
        { error: 'Failed to log sensor data' },
        { status: 500 }
      );
    }

    // --- 5. PROACTIVE ALERT & MAINTENANCE LOGIC ---
    const alerts = [];

    // Critical Moisture Alert
    if (finalMoisture !== undefined && finalMoisture < 15) {
      alerts.push({
        farm_id,
        type: 'critical',
        title: 'Critical Soil Moisture',
        message: `Sensor ${sensor_id} reports critically low moisture (${finalMoisture}%). Immediate irrigation is recommended.`,
      });
    }

    // Low Battery Maintenance Alert
    if (battery !== undefined && battery < 3.4) {
      alerts.push({
        farm_id,
        type: 'maintenance',
        title: 'Sensor Low Battery',
        message: `Sensor ${sensor_id} battery is at ${battery}V. Please replace or recharge soon to avoid data loss.`,
      });
    }

    // Fault Detection (e.g., stuck sensor)
    if (finalMoisture !== undefined && finalMoisture > 98) {
      alerts.push({
        farm_id,
        type: 'maintenance',
        title: 'Possible Sensor Fault',
        message: `Sensor ${sensor_id} is reporting max moisture (99%+). This may indicate a short circuit or corrosion.`,
      });
    }

    if (alerts.length > 0) {
      await supabase.from('alerts').insert(alerts.map(a => ({ ...a, is_read: false })));
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Data ingested successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('IoT Ingestion API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
