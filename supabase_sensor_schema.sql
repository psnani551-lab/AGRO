-- 🚀 Sensor Readings Table for IoT Integration
-- Run this in your Supabase SQL Editor

-- 1. Create the sensor_readings table
CREATE TABLE IF NOT EXISTS public.sensor_readings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    farm_id UUID REFERENCES public.farm_profiles(id) ON DELETE CASCADE,
    sensor_id TEXT NOT NULL,
    moisture FLOAT, -- Soil moisture percentage (0-100)
    temperature FLOAT, -- Ambient temperature in Celsius
    humidity FLOAT, -- Relative humidity percentage
    battery_level FLOAT, -- Battery percentage (0-100)
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
-- Users can read sensor data for their own farms
CREATE POLICY "Users can view sensor readings for their own farms" 
ON public.sensor_readings 
FOR SELECT 
USING (
    farm_id IN (
        SELECT id FROM public.farm_profiles WHERE user_id = auth.uid()
    )
);

-- IoT devices can insert data (we will use a service role or a specific API key logic in the route)
-- For simplicity in this demo, we allow authenticated inserts if linked to a valid farm
CREATE POLICY "Users can insert sensor readings for their own farms" 
ON public.sensor_readings 
FOR INSERT 
WITH CHECK (
    farm_id IN (
        SELECT id FROM public.farm_profiles WHERE user_id = auth.uid()
    )
);

-- 4. Create an index for faster lookups by farm and time
CREATE INDEX IF NOT EXISTS idx_sensor_readings_farm_time 
ON public.sensor_readings(farm_id, created_at DESC);

COMMENT ON TABLE public.sensor_readings IS 'Stores time-series telemetry data from farm IoT sensors.';
