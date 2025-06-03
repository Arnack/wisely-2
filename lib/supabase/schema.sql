-- Add meeting URL to appointments table
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS meeting_url TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS meeting_room_name TEXT;

-- Create call logs table
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

-- Create indexes for call logs
CREATE INDEX IF NOT EXISTS idx_call_logs_user_id ON call_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_room_name ON call_logs(room_name);
CREATE INDEX IF NOT EXISTS idx_call_logs_started_at ON call_logs(started_at);

-- RLS policies for call logs
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own call logs" ON call_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own call logs" ON call_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own call logs" ON call_logs
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to generate meeting URL when appointment is approved
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

-- Create trigger to automatically generate meeting URLs
DROP TRIGGER IF EXISTS trigger_generate_meeting_url ON appointments;
CREATE TRIGGER trigger_generate_meeting_url
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION generate_meeting_url();

-- Also handle new appointments that are created as approved
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

DROP TRIGGER IF EXISTS trigger_generate_meeting_url_insert ON appointments;
CREATE TRIGGER trigger_generate_meeting_url_insert
  BEFORE INSERT ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION generate_meeting_url_on_insert(); 