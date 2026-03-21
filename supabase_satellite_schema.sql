-- 🛰️ Satellite Context for Farm Profiles
-- Run this in your Supabase SQL Editor

-- Add satellite-related columns to farm_profiles
ALTER TABLE public.farm_profiles 
ADD COLUMN IF NOT EXISTS polygon_coords JSONB, -- Array of [lat, lon] coordinates defining the field
ADD COLUMN IF NOT EXISTS agro_monitoring_id TEXT; -- ID returned by the AgroMonitoring API

COMMENT ON COLUMN public.farm_profiles.polygon_coords IS 'GeoJSON-style array of coordinates for satellite monitoring.';
COMMENT ON COLUMN public.farm_profiles.agro_monitoring_id IS 'Unique ID for the field on the AgroMonitoring platform.';

-- Example update for a sample farm (centered around a field in Punjab)
-- UPDATE public.farm_profiles 
-- SET polygon_coords = '[[75.8573, 30.9010], [75.8583, 30.9010], [75.8583, 30.9020], [75.8573, 30.9020], [75.8573, 30.9010]]'::jsonb
-- WHERE id = 'your-farm-id';
