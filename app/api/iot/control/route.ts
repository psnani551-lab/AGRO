import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * API: IoT Machinery Control
 * Handles sending commands (START/STOP) to field hardware via the machinery_commands queue.
 */
export async function POST(request: NextRequest) {
  try {
    const { deviceId, action, farmId, userId, durationMin } = await request.json();

    if (!deviceId || !action || !farmId || !userId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // 1. Ownership & Security Validation (Hardening)
    const { data: farm, error: farmError } = await supabase
      .from('farm_profiles')
      .select('id')
      .eq('id', farmId)
      .eq('user_id', userId)
      .single();

    if (farmError || !farm) {
      return NextResponse.json({ error: 'Unauthorized: Farm access denied' }, { status: 403 });
    }

    // 2. Queue the command
    const { data: command, error: commandError } = await supabase
      .from('machinery_commands')
      .insert({
        farm_id: farmId,
        device_id: deviceId,
        command_type: action,
        parameters: { duration_min: durationMin || 30 },
        status: 'PENDING'
      })
      .select()
      .single();

    if (commandError) {
      console.error('Command Queue Error:', commandError);
      return NextResponse.json({ error: 'Failed to queue command' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Command '${action}' queued for device ${deviceId}`,
      commandId: command.id
    });

  } catch (error) {
    console.error('IoT Control Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
