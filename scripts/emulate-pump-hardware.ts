import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * HARDWARE EMULATOR: Irrigation Pump
 * This script simulates the field-side hardware that listens for commands.
 */
async function emulatePump() {
  console.log('🔌 [HARDWARE] Pump Emulator Started. Waiting for commands...');
  console.log('📡 Listening to table: machinery_commands');

  // Real-time listener for new commands
  const channel = supabase
    .channel('machinery_commands_changes')
    .on('postgres_changes', { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'machinery_commands' 
    }, (payload) => {
      const command = payload.new;
      handleCommand(command);
    })
    .subscribe();

  async function handleCommand(command: any) {
    console.log(`\n📥 [COMMAND RECEIVED] Action: ${command.command_type} | Device: ${command.device_id}`);
    
    if (command.command_type === 'START') {
      console.log(`🚿 [ACTION] Starting Pump for ${command.parameters?.duration_min} minutes...`);
      
      // Simulate hardware delay
      await new Promise(r => setTimeout(r, 2000));
      
      console.log('✅ [STATUS] Pump is now RUNNING in the field.');
      
      // Update status in DB to EXECUTED
      const { error } = await supabase
        .from('machinery_commands')
        .update({ status: 'EXECUTED', executed_at: new Date().toISOString() })
        .eq('id', command.id);

      if (error) console.error('❌ [ERROR] Failed to update command status:', error.message);
    }
    
    if (command.command_type === 'STOP') {
      console.log('🛑 [ACTION] Stopping Pump.');
      await new Promise(r => setTimeout(r, 1000));
      console.log('✅ [STATUS] Pump STOPPED.');
      
      await supabase
        .from('machinery_commands')
        .update({ status: 'EXECUTED', executed_at: new Date().toISOString() })
        .eq('id', command.id);
    }
  }
}

emulatePump().catch(console.error);
