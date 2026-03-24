-- 🚜 Phase G: Smart Pump Integration Schema Update
-- Run this in your Supabase SQL Editor

-- 1. Add Pump Device ID to farm_profiles to separate it from the soil sensor node
ALTER TABLE public.farm_profiles 
ADD COLUMN IF NOT EXISTS pump_device_id TEXT;

COMMENT ON COLUMN public.farm_profiles.pump_device_id IS 'Unique ID of the ESP32 node controlling the pump relay';

-- 2. Create the IoT Commands Queue Table
CREATE TABLE IF NOT EXISTS public.iot_commands (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    farm_id UUID REFERENCES public.farm_profiles(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL,
    command_type TEXT NOT NULL CHECK (command_type IN ('START', 'STOP')),
    duration_min INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'EXECUTED', 'FAILED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.iot_commands ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for iot_commands
-- Users can see commands for their own farm
CREATE POLICY "Users can view their own IoT commands" ON public.iot_commands
    FOR SELECT USING (
        farm_id IN (
            SELECT id FROM public.farm_profiles WHERE user_id = auth.uid()
        )
    );

-- Users can insert commands for their own farm
CREATE POLICY "Users can insert IoT commands" ON public.iot_commands
    FOR INSERT WITH CHECK (
        farm_id IN (
            SELECT id FROM public.farm_profiles WHERE user_id = auth.uid()
        )
    );

-- Devices (API keys in the real world) would need permission to update to EXECUTED, 
-- but since we are using service role or standard API endpoints, we can manage updates server-side.

-- Add indexes for faster polling
CREATE INDEX IF NOT EXISTS idx_iot_commands_device_status ON public.iot_commands(device_id, status);
