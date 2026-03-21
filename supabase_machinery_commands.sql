
-- MACHINERY COMMANDS SCHEMA
-- This table acts as the command queue for IoT devices (Pumps, Valves, etc.)

CREATE TABLE IF NOT EXISTS public.machinery_commands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL, -- e.g., 'PUMP-01'
    command_type TEXT NOT NULL, -- 'START', 'STOP', 'STATUS'
    parameters JSONB DEFAULT '{}'::jsonb, -- e.g., {"duration_min": 30}
    status TEXT DEFAULT 'PENDING', -- 'PENDING', 'SENT', 'EXECUTED', 'FAILED'
    created_at TIMESTAMPTZ DEFAULT now(),
    executed_at TIMESTAMPTZ,
    error_log TEXT
);

-- Index for fast lookup by device
CREATE INDEX IF NOT EXISTS idx_machinery_commands_device ON public.machinery_commands(device_id, status);

COMMENT ON TABLE public.machinery_commands IS 'Command queue for IoT machinery (Pumps/Valves). Hardware pols this table for instruction.';
