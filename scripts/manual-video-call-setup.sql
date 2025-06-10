-- Video Call System Database Setup
-- Run these commands in your Supabase SQL Editor: https://app.supabase.com/project/[your-project]/sql

-- Step 1: Ensure meeting URL columns exist (should already be done)
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS meeting_url TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS meeting_room_name TEXT;

-- Step 2: Create call logs table
CREATE TABLE IF NOT EXISTS call_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_name TEXT NOT NULL,
  participant_identity TEXT NOT NULL,
  participant_name TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Create indexes for call logs
CREATE INDEX IF NOT EXISTS idx_call_logs_user_id ON call_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_room_name ON call_logs(room_name);
CREATE INDEX IF NOT EXISTS idx_call_logs_started_at ON call_logs(started_at);

-- Step 4: Enable Row Level Security on call logs
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies for call logs
CREATE POLICY IF NOT EXISTS "Users can view their own call logs" ON call_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own call logs" ON call_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own call logs" ON call_logs
  FOR UPDATE USING (auth.uid() = user_id);

-- Step 6: Create trigger function for automatic meeting URL generation
CREATE OR REPLACE FUNCTION generate_meeting_url()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate meeting URL when status changes to 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    NEW.meeting_room_name = 'appointment-' || NEW.id::text;
    NEW.meeting_url = '/call/' || NEW.meeting_room_name || '?appointmentId=' || NEW.id::text;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create trigger function for inserts
CREATE OR REPLACE FUNCTION generate_meeting_url_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' THEN
    NEW.meeting_room_name = 'appointment-' || NEW.id::text;
    NEW.meeting_url = '/call/' || NEW.meeting_room_name || '?appointmentId=' || NEW.id::text;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Create triggers
DROP TRIGGER IF EXISTS trigger_generate_meeting_url ON appointments;
CREATE TRIGGER trigger_generate_meeting_url
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION generate_meeting_url();

DROP TRIGGER IF EXISTS trigger_generate_meeting_url_insert ON appointments;
CREATE TRIGGER trigger_generate_meeting_url_insert
  BEFORE INSERT ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION generate_meeting_url_on_insert();

-- Step 9: Update existing approved appointments with meeting URLs
UPDATE appointments 
SET 
  meeting_room_name = 'appointment-' || id::text,
  meeting_url = '/call/appointment-' || id::text || '?appointmentId=' || id::text
WHERE status = 'approved' AND (meeting_url IS NULL OR meeting_room_name IS NULL);

-- Verification queries (optional - run these to check everything worked)
-- Check if call_logs table exists and has correct structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'call_logs' 
ORDER BY ordinal_position;

-- Check if meeting URL columns exist in appointments
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'appointments' AND column_name IN ('meeting_url', 'meeting_room_name');

-- Check if any approved appointments have meeting URLs
SELECT id, status, meeting_url, meeting_room_name 
FROM appointments 
WHERE status = 'approved' 
LIMIT 5;

-- Check if triggers exist
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE event_object_table = 'appointments' AND trigger_name LIKE '%meeting%'; 