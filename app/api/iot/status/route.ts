import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * API: IoT Command Status
 * Provides the current execution status of a queued machinery command.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const commandId = searchParams.get('commandId');

  if (!commandId) {
    return NextResponse.json({ error: 'Missing commandId' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('machinery_commands')
      .select('status, executed_at, error_log')
      .eq('id', commandId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Command not found' }, { status: 404 });
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Status Check Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
