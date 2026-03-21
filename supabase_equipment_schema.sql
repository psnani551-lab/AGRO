-- 🚜 Equipment Metadata for Farm Profiles
-- Run this in your Supabase SQL Editor

-- Add pump and efficiency columns to farm_profiles
ALTER TABLE public.farm_profiles 
ADD COLUMN IF NOT EXISTS pump_flow_rate FLOAT DEFAULT 400.0, -- Liters Per Minute (LPM)
ADD COLUMN IF NOT EXISTS irrigation_efficiency FLOAT DEFAULT 0.85; -- 0.0 to 1.0

-- Add comments for clarity
COMMENT ON COLUMN public.farm_profiles.pump_flow_rate IS 'Standard pump flow rate in Liters Per Minute. Default 400 LPM (~5HP).';
COMMENT ON COLUMN public.farm_profiles.irrigation_efficiency IS 'Efficiency of the irrigation setup (Drip ~0.9, Flood ~0.5).';

-- Update existing records with defaults if needed
UPDATE public.farm_profiles 
SET pump_flow_rate = 400.0, irrigation_efficiency = 0.85 
WHERE pump_flow_rate IS NULL;
