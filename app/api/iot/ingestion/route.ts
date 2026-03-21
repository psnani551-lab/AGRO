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
    const { farm_id, sensor_id, moisture, temperature, humidity, battery, signal, sensor_type } = body;

    if (!farm_id || !sensor_id) {
      return NextResponse.json(
        { error: 'farm_id and sensor_id are required' },
        { status: 400 }
      );
    }

    // --- NEW: CALIBRATION ENGINE ---
    let calibratedMoisture = moisture;
    if (sensor_type === 'capacitive' && moisture !== undefined) {
      // Capacitive sensors are more stable but often need a scaling factor
      calibratedMoisture = Math.min(100, Math.max(0, moisture * 1.05)); 
    }

    // 1. Log the reading in Supabase
    const { error: insertError } = await supabase
      .from('sensor_readings')
      .insert([
        {
          farm_id,
          sensor_id,
          moisture: calibratedMoisture,
          temperature,
          humidity,
          battery_level: battery,
          battery_voltage: battery, // Assuming battery field might pass voltage
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

    // 2. Proactive Alert & Maintenance Logic
    const alerts = [];

    // Critical Moisture Alert
    if (calibratedMoisture !== undefined && calibratedMoisture < 15) {
      alerts.push({
        farm_id,
        type: 'critical',
        title: 'Critical Soil Moisture',
        message: `Sensor ${sensor_id} reports critically low moisture (${calibratedMoisture}%). Immediate irrigation is recommended.`,
      });
    }

    // NEW: Low Battery Maintenance Alert
    if (battery !== undefined && battery < 3.4) {
      alerts.push({
        farm_id,
        type: 'maintenance',
        title: 'Sensor Low Battery',
        message: `Sensor ${sensor_id} battery is at ${battery}V. Please replace or recharge soon to avoid data loss.`,
      });
    }

    // NEW: Fault Detection (e.g., stuck sensor)
    if (calibratedMoisture !== undefined && calibratedMoisture > 98) {
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
