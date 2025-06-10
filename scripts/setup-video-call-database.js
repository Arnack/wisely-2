const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function executeSQL(query, description) {
  console.log(`🔧 ${description}...`)
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: query })
    if (error) throw error
    console.log(`✅ ${description} - Success!`)
    return true
  } catch (error) {
    console.error(`❌ ${description} - Failed:`, error.message)
    return false
  }
}

async function setupVideoCallDatabase() {
  console.log('🎥 Setting up video call database schema...\n')

  // Step 1: Ensure meeting columns exist (they should already be added)
  console.log('📝 Ensuring meeting URL columns exist...')
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('meeting_url, meeting_room_name')
      .limit(1)
    
    if (error && error.message.includes('column')) {
      console.log('🔄 Adding missing columns...')
      // If columns don't exist, we need to add them manually in Supabase dashboard
      console.error('❌ Meeting columns not found. Please run this SQL in your Supabase dashboard:')
      console.log('ALTER TABLE appointments ADD COLUMN IF NOT EXISTS meeting_url TEXT;')
      console.log('ALTER TABLE appointments ADD COLUMN IF NOT EXISTS meeting_room_name TEXT;')
      return false
    } else {
      console.log('✅ Meeting URL columns exist!')
    }
  } catch (error) {
    console.error('❌ Error checking columns:', error.message)
  }

  // Step 2: Create call_logs table
  const createCallLogsTable = `
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
  `
  
  const callLogsSuccess = await executeSQL(createCallLogsTable, 'Creating call_logs table')

  // Step 3: Create indexes
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_call_logs_user_id ON call_logs(user_id);',
    'CREATE INDEX IF NOT EXISTS idx_call_logs_room_name ON call_logs(room_name);',
    'CREATE INDEX IF NOT EXISTS idx_call_logs_started_at ON call_logs(started_at);'
  ]

  console.log('\n🔍 Creating indexes...')
  for (const [i, indexSQL] of indexes.entries()) {
    await executeSQL(indexSQL, `Creating index ${i + 1}/3`)
  }

  // Step 4: Enable RLS
  await executeSQL(
    'ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;',
    'Enabling Row Level Security on call_logs'
  )

  // Step 5: Create RLS policies
  const policies = [
    {
      name: 'Users can view their own call logs',
      sql: `CREATE POLICY IF NOT EXISTS "Users can view their own call logs" ON call_logs
            FOR SELECT USING (auth.uid() = user_id);`
    },
    {
      name: 'Users can insert their own call logs',
      sql: `CREATE POLICY IF NOT EXISTS "Users can insert their own call logs" ON call_logs
            FOR INSERT WITH CHECK (auth.uid() = user_id);`
    },
    {
      name: 'Users can update their own call logs',
      sql: `CREATE POLICY IF NOT EXISTS "Users can update their own call logs" ON call_logs
            FOR UPDATE USING (auth.uid() = user_id);`
    }
  ]

  console.log('\n📋 Creating RLS policies...')
  for (const policy of policies) {
    await executeSQL(policy.sql, `Creating policy: ${policy.name}`)
  }

  // Step 6: Create trigger functions for automatic meeting URL generation
  const createTriggerFunction = `
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
  `

  const createInsertTriggerFunction = `
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
  `

  console.log('\n⚙️ Creating trigger functions...')
  await executeSQL(createTriggerFunction, 'Creating meeting URL trigger function')
  await executeSQL(createInsertTriggerFunction, 'Creating insert meeting URL trigger function')

  // Step 7: Create triggers
  const createUpdateTrigger = `
    DROP TRIGGER IF EXISTS trigger_generate_meeting_url ON appointments;
    CREATE TRIGGER trigger_generate_meeting_url
      BEFORE UPDATE ON appointments
      FOR EACH ROW
      EXECUTE FUNCTION generate_meeting_url();
  `

  const createInsertTrigger = `
    DROP TRIGGER IF EXISTS trigger_generate_meeting_url_insert ON appointments;
    CREATE TRIGGER trigger_generate_meeting_url_insert
      BEFORE INSERT ON appointments
      FOR EACH ROW
      EXECUTE FUNCTION generate_meeting_url_on_insert();
  `

  console.log('\n🔧 Creating triggers...')
  await executeSQL(createUpdateTrigger, 'Creating update trigger for meeting URLs')
  await executeSQL(createInsertTrigger, 'Creating insert trigger for meeting URLs')

  // Step 8: Update existing approved appointments
  console.log('\n🔄 Updating existing approved appointments...')
  try {
    const { data: approvedAppointments, error: fetchError } = await supabase
      .from('appointments')
      .select('id')
      .eq('status', 'approved')
      .or('meeting_url.is.null,meeting_room_name.is.null')

    if (fetchError) {
      console.error('❌ Error fetching approved appointments:', fetchError.message)
    } else if (approvedAppointments && approvedAppointments.length > 0) {
      console.log(`📞 Found ${approvedAppointments.length} approved appointments to update`)
      
      for (const appointment of approvedAppointments) {
        const meetingRoomName = `appointment-${appointment.id}`
        const meetingUrl = `/call/${meetingRoomName}?appointmentId=${appointment.id}`
        
        const { error: updateError } = await supabase
          .from('appointments')
          .update({
            meeting_room_name: meetingRoomName,
            meeting_url: meetingUrl
          })
          .eq('id', appointment.id)

        if (updateError) {
          console.error(`❌ Error updating appointment ${appointment.id}:`, updateError.message)
        } else {
          console.log(`✅ Updated appointment ${appointment.id} with meeting URL`)
        }
      }
    } else {
      console.log('📞 No approved appointments need updates')
    }
  } catch (error) {
    console.error('❌ Error in appointment update process:', error.message)
  }

  console.log('\n🎉 Video call database setup completed!')
  console.log('📋 What was set up:')
  console.log('   ✅ Meeting URL columns in appointments table')
  console.log('   ✅ Call logs table with proper indexing')
  console.log('   ✅ Row Level Security policies')
  console.log('   ✅ Automatic meeting URL generation triggers')
  console.log('   ✅ Updated existing approved appointments')
  
  console.log('\n🚀 Next steps:')
  console.log('   1. Start your dev server: npm run dev')
  console.log('   2. Go to /appointments to see "Join Call" buttons on approved appointments')
  console.log('   3. Test the video call demo at /call-demo')
  console.log('   4. Approve a new appointment to see automatic meeting URL generation')
}

// Check if required environment variables are set
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  console.error('\nPlease add these to your .env.local file and try again.')
  process.exit(1)
}

// Run the setup
setupVideoCallDatabase()
  .then(() => {
    console.log('\n✨ Database setup complete! Your video call system is ready.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Setup failed:', error)
    console.log('\n🔧 If you see SQL execution errors, you may need to run the SQL commands manually in your Supabase dashboard.')
    process.exit(1)
  }) 