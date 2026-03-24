import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * API: B2B Data Export
 * Generates formatted CSV/JSON for bulk agricultural analysis.
 */
export async function POST(request: NextRequest) {
  try {
    const { farmId, dataTypes, dateRange, format } = await request.json();

    if (!farmId || !dataTypes || !dateRange) {
      return NextResponse.json({ error: 'Missing export parameters' }, { status: 400 });
    }

    const isValidUUID = (id: string) => id && id.length === 36;
    let exportData: any = {};

    // 1. Fetch Sensor Data if requested
    if (dataTypes.includes('sensors')) {
      let query = supabase
        .from('sensor_readings')
        .select('*')
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end)
        .order('created_at', { ascending: false })
        .limit(1000);
        
      if (isValidUUID(farmId)) {
        query = query.eq('farm_id', farmId);
      }

      const { data: sensors, error: sensorError } = await query;
        
      if (sensorError) console.error("Export Query Error (Sensors):", sensorError);
      exportData.sensors = sensors || [];
    }

    // 2. Fetch Machinery/IoT Commands if requested
    if (dataTypes.includes('machinery')) {
      let query = supabase
        .from('iot_commands')
        .select('*')
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end)
        .order('created_at', { ascending: false })
        .limit(1000);
        
      if (isValidUUID(farmId)) {
        query = query.eq('farm_id', farmId);
      }

      const { data: machinery, error: machineError } = await query;
        
      if (machineError) console.error("Export Query Error (Machinery):", machineError);
      exportData.machinery = machinery || [];
    }

    // 3. Format result
    if (format === 'csv') {
      const csv = convertToCSV(exportData);
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="agro_export_${farmId}_${Date.now()}.csv"`
        }
      });
    }

    return NextResponse.json(exportData);

  } catch (error) {
    console.error('Export Error:', error);
    return NextResponse.json({ error: 'Failed to generate export' }, { status: 500 });
  }
}

/**
 * Helper: Simple JSON to CSV converter for agricultural datasets
 */
function convertToCSV(data: any) {
  const lines: string[] = [];
  
  // Header row
  lines.push('Category,Timestamp,DeviceID,Value,Unit,Status');

  if (data.sensors) {
    data.sensors.forEach((s: any) => {
      lines.push(`Sensor,${s.created_at},${s.sensor_type || 'N/A'},${s.moisture},%,${s.signal_strength || 'OK'}`);
    });
  }

  if (data.machinery) {
    data.machinery.forEach((m: any) => {
      lines.push(`Machinery,${m.created_at},${m.device_id},${m.command_type},action,${m.status}`);
    });
  }

  return lines.join('\n');
}
