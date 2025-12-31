import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error(`
    ----------------------------------------------------------------------------------
    ❌ Missing Supabase Enviroment Variables!
    ----------------------------------------------------------------------------------
    The application is technically functional but cannot connect to the database.
    Please create a .env.local file in the root directory with:
    
    NEXT_PUBLIC_SUPABASE_URL=your_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
    
    Data will NOT load until this is fixed.
    ----------------------------------------------------------------------------------
    `);
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(
    supabaseUrl || 'https://placeholder-project.supabase.co',
    supabaseAnonKey || 'placeholder-key'
);
