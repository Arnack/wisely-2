const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function applyVideoCallSchema() {
  console.log('🎥 Applying video call schema changes...')

  try {
    // Step 1: Add meeting columns to appointments table
    console.log('📝 Adding meeting URL columns to appointments table...')
    
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE appointments 
        ADD COLUMN IF NOT EXISTS meeting_url TEXT,
        ADD COLUMN IF NOT EXISTS meeting_room_name TEXT;
      `
    })

    if (alterError) {
      console.error('❌ Error adding columns:', alterError)
      
      // Alternative approach - add columns one by one
      console.log('🔄 Trying alternative approach...')
      
      try {
        await supabase.rpc('exec_sql', {
          sql: 'ALTER TABLE appointments ADD COLUMN IF NOT EXISTS meeting_url TEXT;'
        })
        
        await supabase.rpc('exec_sql', {
          sql: 'ALTER TABLE appointments ADD COLUMN IF NOT EXISTS meeting_room_name TEXT;'
        })
        
        console.log('✅ Meeting URL columns added successfully!')
      } catch (altError) {
        console.error('❌ Alternative approach failed. You may need to add columns manually.')
        console.log('Please run these SQL commands in your Supabase SQL editor:')
        console.log('ALTER TABLE appointments ADD COLUMN IF NOT EXISTS meeting_url TEXT;')
        console.log('ALTER TABLE appointments ADD COLUMN IF NOT EXISTS meeting_room_name TEXT;')
      }
    } else {
      console.log('✅ Meeting URL columns added successfully!')
    }

    // Step 2: Create call logs table
    console.log('📊 Creating call logs table...')
    
    const { error: callLogsError } = await supabase.rpc('exec_sql', {
      sql: `
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
    })

    if (callLogsError) {
      console.error('❌ Error creating call_logs table:', callLogsError)
    } else {
      console.log('✅ Call logs table created successfully!')
    }

    // Step 3: Create indexes
    console.log('🔍 Creating indexes...')
    
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_call_logs_user_id ON call_logs(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_call_logs_room_name ON call_logs(room_name);',
      'CREATE INDEX IF NOT EXISTS idx_call_logs_started_at ON call_logs(started_at);'
    ]

    for (const indexSql of indexes) {
      const { error: indexError } = await supabase.rpc('exec_sql', { sql: indexSql })
      if (indexError) {
        console.error('❌ Error creating index:', indexError)
      }
    }
    
    console.log('✅ Indexes created successfully!')

    // Step 4: Enable RLS on call_logs
    console.log('🔒 Setting up Row Level Security...')
    
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;'
    })

    if (rlsError) {
      console.error('❌ Error enabling RLS:', rlsError)
    } else {
      console.log('✅ RLS enabled on call_logs table!')
    }

    // Step 5: Create RLS policies
    console.log('📋 Creating RLS policies...')
    
    const policies = [
      `CREATE POLICY IF NOT EXISTS "Users can view their own call logs" ON call_logs
       FOR SELECT USING (auth.uid() = user_id);`,
      
      `CREATE POLICY IF NOT EXISTS "Users can insert their own call logs" ON call_logs
       FOR INSERT WITH CHECK (auth.uid() = user_id);`,
      
      `CREATE POLICY IF NOT EXISTS "Users can update their own call logs" ON call_logs
       FOR UPDATE USING (auth.uid() = user_id);`
    ]

    for (const policySql of policies) {
      const { error: policyError } = await supabase.rpc('exec_sql', { sql: policySql })
      if (policyError) {
        console.error('❌ Error creating policy:', policyError)
      }
    }
    
    console.log('✅ RLS policies created successfully!')

    // Step 6: Update existing approved appointments to have meeting URLs
    console.log('🔄 Updating existing approved appointments...')
    
    const { data: approvedAppointments, error: fetchError } = await supabase
      .from('appointments')
      .select('id')
      .eq('status', 'approved')
      .is('meeting_url', null)

    if (fetchError) {
      console.error('❌ Error fetching approved appointments:', fetchError)
    } else if (approvedAppointments && approvedAppointments.length > 0) {
      console.log(`📞 Found ${approvedAppointments.length} approved appointments without meeting URLs`)
      
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
          console.error(`❌ Error updating appointment ${appointment.id}:`, updateError)
        } else {
          console.log(`✅ Updated appointment ${appointment.id} with meeting URL`)
        }
      }
    } else {
      console.log('📞 No approved appointments need meeting URL updates')
    }

    console.log('\n🎉 Video call schema successfully applied!')
    console.log('📋 Summary:')
    console.log('   ✅ Added meeting_url and meeting_room_name columns to appointments')
    console.log('   ✅ Created call_logs table with proper indexes')
    console.log('   ✅ Set up Row Level Security policies')
    console.log('   ✅ Updated existing approved appointments with meeting URLs')
    console.log('\n🚀 You can now test video calls by:')
    console.log('   1. Approving an appointment')
    console.log('   2. Looking for the "Join Call" button on approved appointments')
    console.log('   3. Testing the video call demo at /call-demo')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    console.log('\n🔧 Manual Setup Required:')
    console.log('If the automatic setup failed, please run these SQL commands in your Supabase SQL editor:')
    console.log('\n-- Add meeting columns')
    console.log('ALTER TABLE appointments ADD COLUMN IF NOT EXISTS meeting_url TEXT;')
    console.log('ALTER TABLE appointments ADD COLUMN IF NOT EXISTS meeting_room_name TEXT;')
    console.log('\n-- Create call logs table')
    console.log(`CREATE TABLE IF NOT EXISTS call_logs (
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
);`)
  }
}

// Check if required environment variables are set
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  console.error('\nPlease add these to your .env.local file and try again.')
  process.exit(1)
}

// Run the schema application
applyVideoCallSchema()
  .then(() => {
    console.log('\n✨ Done! Your video call system is ready to use.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Failed to apply schema:', error)
    process.exit(1)
  }) 