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
    const { farmId, dataTypes, dateRange, format, locale, farmProfile, analysis } = await request.json();

    if (!farmId || !dataTypes || !dateRange) {
      return NextResponse.json({ error: 'Missing export parameters' }, { status: 400 });
    }

    const isValidUUID = (id: string) => id && id.length === 36;
    let exportData: any = { 
      metadata: { locale, farmProfile, analysis }
    };

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
          'Content-Type': 'text/csv; charset=utf-8',
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
  const { locale, farmProfile, analysis } = data.metadata || {};
  const lines: string[] = [];

  const headers: any = {
    en: {
      profile: '--- FARM PROFILE ---',
      name: 'Farm Name',
      location: 'Location',
      crop: 'Current Crop',
      soil: 'Soil Type',
      analysis: '--- ANALYSIS SUMMARY ---',
      stage: 'Growth Stage',
      confidence: 'Confidence',
      recommendation: 'Top Recommendation',
      telemetry: '--- TELEMETRY LOGS ---',
      cat: 'Category',
      time: 'Timestamp',
      id: 'DeviceID',
      val: 'Value',
      unit: 'Unit',
      status: 'Status'
    },
    hi: {
      profile: '--- फार्म प्रोफाइल ---',
      name: 'खेत का नाम',
      location: 'स्थान',
      crop: 'वर्तमान फसल',
      soil: 'मिट्टी का प्रकार',
      analysis: '--- विश्लेषण सारांश ---',
      stage: 'वृद्धि चरण',
      confidence: 'आत्मविश्वास',
      recommendation: 'शीर्ष सिफारिश',
      telemetry: '--- टेलीमेट्री लॉग ---',
      cat: 'श्रेणी',
      time: 'समय',
      id: 'डिवाइस आईडी',
      val: 'मूल्य',
      unit: 'इकाई',
      status: 'स्थिति'
    },
    te: {
      profile: '--- వ్యవసాయ ప్రొఫైల్ ---',
      name: 'పొలం పేరు',
      location: 'ప్రాంతం',
      crop: 'ప్రస్తుత పంట',
      soil: 'మట్టి రకం',
      analysis: '--- విశ్లేషణ సారాంశం ---',
      stage: 'పెరుగుదల దశ',
      confidence: 'విశ్వసనీయత',
      recommendation: 'ప్రధాన సిఫార్సు',
      telemetry: '--- టెలిమెట్రీ లాగ్‌లు ---',
      cat: 'వర్గం',
      time: 'సమయం',
      id: 'డివైస్ ఐడి',
      val: 'విలువ',
      unit: 'యూనిట్',
      status: 'స్థితి'
    }
  };

  const t = headers[locale] || headers.en;

  // 1. PROFILE SECTION
  lines.push(t.profile);
  lines.push(`${t.name},${farmProfile?.farmName || 'N/A'}`);
  lines.push(`${t.location},"${farmProfile?.location?.address || farmProfile?.location || 'N/A'}"`);
  lines.push(`${t.crop},${farmProfile?.currentCrops?.[0] || 'N/A'}`);
  lines.push(`${t.soil},${farmProfile?.soilType || 'N/A'}`);
  lines.push('');

  // 2. ANALYSIS SECTION
  if (analysis) {
    lines.push(t.analysis);
    lines.push(`${t.stage},${analysis.irrigationPlan?.growthStage || 'N/A'}`);
    lines.push(`${t.confidence},${analysis.yieldForecast?.confidence || 'N/A'}%`);
    lines.push(`${t.recommendation},"${analysis.irrigationPlan?.instructions?.slice(0, 100) || 'N/A'}..."`);
    lines.push('');
  }

  // 3. TELEMETRY SECTION
  lines.push(t.telemetry);
  lines.push(`${t.cat},${t.time},${t.id},${t.val},${t.unit},${t.status}`);

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
