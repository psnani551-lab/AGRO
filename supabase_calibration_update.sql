-- FIX: Add Calibration Columns to Farm Profiles for "Zero-Code" IoT Setup
ALTER TABLE public.farm_profiles 
ADD COLUMN IF NOT EXISTS sensor_dry_value INTEGER DEFAULT 4095,
ADD COLUMN IF NOT EXISTS sensor_wet_value INTEGER DEFAULT 1500,
ADD COLUMN IF NOT EXISTS calibration_status TEXT DEFAULT NULL;

COMMENT ON COLUMN public.farm_profiles.calibration_status IS 'Can be NULL, "dry", or "wet". Used to capture raw sensor values remotely.';
