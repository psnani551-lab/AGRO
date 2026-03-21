import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { calculateTrustScore } from '@/lib/trustScore';

export async function POST(request: NextRequest) {
  try {
    const { farmId } = await request.json();

    if (!farmId) {
      return NextResponse.json({ error: 'farmId is required' }, { status: 400 });
    }

    // 1. Gather Trust Data
    const [sensorCheck, satelliteCheck, readingsCount] = await Promise.all([
      supabase.from('sensor_readings').select('id').eq('farm_id', farmId).limit(1),
      supabase.from('farm_profiles').select('agro_monitoring_id').eq('id', farmId).single(),
      supabase.from('sensor_readings').select('id', { count: 'exact' }).eq('farm_id', farmId),
    ]);

    const trustResult = calculateTrustScore({
      hasSensors: !sensorCheck.error && sensorCheck.data.length > 0,
      hasSatellite: !satelliteCheck.error && !!satelliteCheck.data?.agro_monitoring_id,
      analysisCount: 12, // Mocked for now, in real app we'd track analysis logs
      dataReadingsCount: readingsCount.count || 0,
    });

    // 2. Generate Certificate Structure
    const certificate = {
      certificateId: `AGRO-CERT-${farmId.substring(0, 8).toUpperCase()}`,
      issuedDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      trustScore: trustResult.score,
      badge: trustResult.label,
      verifiedMetrics: [
        { name: 'Ground Moisture (IoT)', status: !sensorCheck.error && sensorCheck.data.length > 0 ? 'Verified' : 'N/A' },
        { name: 'Field Health (Satellite)', status: !!satelliteCheck.data?.agro_monitoring_id ? 'Verified' : 'N/A' },
        { name: 'Science Engine', status: 'FAO-56 Standard' }
      ]
    };

    return NextResponse.json(certificate);

  } catch (error) {
    console.error('Certificate API Error:', error);
    return NextResponse.json({ error: 'Failed to generate certificate' }, { status: 500 });
  }
}
