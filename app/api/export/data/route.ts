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

    let exportData: any = {};

    // 1. Fetch Sensor Data if requested
    if (dataTypes.includes('sensors')) {
      const { data: sensors } = await supabase
        .from('sensor_readings')
        .select('*')
        .eq('farm_id', farmId)
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end)
        .order('created_at', { ascending: false });
      exportData.sensors = sensors || [];
    }

    // 2. Fetch Machinery Logs if requested
    if (dataTypes.includes('machinery')) {
      const { data: machinery } = await supabase
        .from('machinery_commands')
        .select('*')
        .eq('farm_id', farmId)
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end)
        .order('created_at', { ascending: false });
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
