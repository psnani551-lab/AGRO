import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''; // Ideally Service Role
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * API: IoT Pump Acknowledge
 * Called by the physical ESP32 sitting at the pump.
 * It confirms that a command (e.g. START) was successfully executed by the hardware relay.
 */
export async function POST(request: NextRequest) {
  try {
    const { commandId, status, errorLog } = await request.json();

    if (!commandId || !status) {
      return NextResponse.json({ error: 'Missing commandId or status' }, { status: 400 });
    }

    // Update the command in the queue
    const { data: updatedCommand, error: updateError } = await supabase
      .from('machinery_commands')
      .update({ 
        status: status, // typically 'EXECUTED' or 'FAILED'
        executed_at: new Date().toISOString(),
        error_log: errorLog || null
      })
      .eq('id', commandId)
      .select()
      .single();

    if (updateError) {
      console.error('Pump Ack Error:', updateError);
      return NextResponse.json({ error: 'Failed to acknowledge command' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Command ${commandId} marked as ${status}`,
    });

  } catch (error) {
    console.error('IoT Ack Endpoint Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
