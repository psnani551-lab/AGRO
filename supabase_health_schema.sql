-- 🔋 Hardware Health & Resilience Updates
-- Run this in your Supabase SQL Editor

-- Add health tracking columns to sensor_readings
ALTER TABLE public.sensor_readings 
ADD COLUMN IF NOT EXISTS battery_voltage FLOAT,
ADD COLUMN IF NOT EXISTS signal_strength INTEGER,
ADD COLUMN IF NOT EXISTS sensor_type TEXT DEFAULT 'resistive';

-- Add comments for maintenance
COMMENT ON COLUMN public.sensor_readings.battery_voltage IS 'Voltage level for battery health monitoring (e.g., 3.3V - 4.2V).';
COMMENT ON COLUMN public.sensor_readings.signal_strength IS 'Signal strength/RSSI for connectivity monitoring.';
COMMENT ON COLUMN public.sensor_readings.sensor_type IS 'Type of sensor (resistive or capacitive) to apply correct calibration.';
