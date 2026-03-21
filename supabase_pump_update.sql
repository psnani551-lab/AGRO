-- Add Pump Capacity and Irrigation Method to Farm Profiles
ALTER TABLE public.farm_profiles 
ADD COLUMN IF NOT EXISTS pump_capacity_lph NUMERIC DEFAULT 5000,
ADD COLUMN IF NOT EXISTS irrigation_method TEXT DEFAULT 'Drip' CHECK (irrigation_method IN ('Surface', 'Sprinkler', 'Drip'));

-- Add a comment to explain the unit
COMMENT ON COLUMN public.farm_profiles.pump_capacity_lph IS 'Pump capacity in Liters Per Hour (LPH)';
