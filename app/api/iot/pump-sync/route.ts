import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''; // Ideally Service Role for IoT
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * API: IoT Pump Sync
 * Polled by the physical ESP32 sitting at the pump.
 * It checks if there are any PENDING commands for its device_id.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');

    if (!deviceId) {
      return NextResponse.json({ error: 'Missing deviceId parameter' }, { status: 400 });
    }

    // Find the oldest PENDING command for this device
    const { data: commands, error: commandError } = await supabase
      .from('machinery_commands')
      .select('*')
      .eq('device_id', deviceId)
      .eq('status', 'PENDING')
      .order('created_at', { ascending: true })
      .limit(1);

    if (commandError) {
      console.error('Pump Sync Error:', commandError);
      return NextResponse.json({ error: 'Failed to retrieve commands' }, { status: 500 });
    }

    if (!commands || commands.length === 0) {
      // No pending commands, ESP32 just goes back to sleep/polling
      return NextResponse.json({ command: null });
    }

    const command = commands[0];

    // Mark as SENT so we don't pick it up again on the next poll
    await supabase
      .from('machinery_commands')
      .update({ status: 'SENT' })
      .eq('id', command.id);

    return NextResponse.json({ 
      command: {
        id: command.id,
        action: command.command_type,
        durationMin: command.parameters?.duration_min || 0
      }
    });

  } catch (error) {
    console.error('IoT Sync Endpoint Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
