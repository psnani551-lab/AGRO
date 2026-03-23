-- 🚀 Advanced IoT Motor Control & Automation
-- Run this in your Supabase SQL Editor

-- 1. Add automation fields to farm_profiles
ALTER TABLE public.farm_profiles 
ADD COLUMN IF NOT EXISTS is_auto_irrigation BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS moisture_threshold NUMERIC DEFAULT 30,
ADD COLUMN IF NOT EXISTS irrigation_schedule JSONB DEFAULT '[]'::jsonb;

-- 2. Add comments for clarity
COMMENT ON COLUMN public.farm_profiles.is_auto_irrigation IS 'Toggle for automated threshold-based irrigation';
COMMENT ON COLUMN public.farm_profiles.moisture_threshold IS 'Soil moisture percentage (%) that triggers the pump';
COMMENT ON COLUMN public.farm_profiles.irrigation_schedule IS 'Array of objects [{ "time": "hh:mm", "duration": mm }]';

-- 3. Create a table for Remote Command Logs (SMS/Voice Simulation)
CREATE TABLE IF NOT EXISTS public.remote_commands (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    farm_id UUID REFERENCES public.farm_profiles(id) ON DELETE CASCADE,
    source TEXT NOT NULL, -- 'SMS', 'Voice', 'App'
    command TEXT NOT NULL, -- e.g. "START PUMP 30m"
    status TEXT DEFAULT 'Pending', -- 'Pending', 'Executed', 'Failed'
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.remote_commands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own remote commands" 
ON public.remote_commands FOR SELECT 
USING (farm_id IN (SELECT id FROM public.farm_profiles WHERE user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_remote_commands_farm ON public.remote_commands(farm_id, created_at DESC);
