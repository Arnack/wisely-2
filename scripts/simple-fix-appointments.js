const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function fixAppointments() {
  console.log('🔧 Checking and fixing appointment meeting URLs...\n')

  try {
    // First, let's check what columns exist
    console.log('📋 Checking existing columns in appointments table...')
    
    // Try to select just the basic columns first
    const { data: testData, error: testError } = await supabase
      .from('appointments')
      .select('id, status')
      .limit(1)

    if (testError) {
      console.error('❌ Error accessing appointments table:', testError.message)
      return
    }

    console.log('✅ Basic columns accessible')

    // Now try to check if meeting_url column exists
    let hasMeetingUrl = false
    let hasMeetingRoomName = false

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('meeting_url')
        .limit(1)
      
      if (!error) {
        hasMeetingUrl = true
        console.log('✅ meeting_url column exists')
      }
    } catch (error) {
      console.log('❌ meeting_url column does not exist')
    }

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('meeting_room_name')
        .limit(1)
      
      if (!error) {
        hasMeetingRoomName = true
        console.log('✅ meeting_room_name column exists')
      }
    } catch (error) {
      console.log('❌ meeting_room_name column does not exist')
    }

    if (!hasMeetingUrl) {
      console.log('\n❌ The meeting_url column is missing from the appointments table.')
      console.log('🔧 You need to run this SQL command in your Supabase SQL Editor:')
      console.log('\nALTER TABLE appointments ADD COLUMN meeting_url TEXT;')
      console.log('ALTER TABLE appointments ADD COLUMN meeting_room_name TEXT;')
      console.log('\nAfter running that SQL, run this script again.')
      return
    }

    // Fetch all approved appointments 
    console.log('\n📞 Fetching approved appointments...')
    const selectColumns = hasMeetingRoomName 
      ? 'id, status, meeting_url, meeting_room_name'
      : 'id, status, meeting_url'

    const { data: appointments, error: fetchError } = await supabase
      .from('appointments')
      .select(selectColumns)
      .eq('status', 'approved')

    if (fetchError) {
      console.error('❌ Error fetching appointments:', fetchError.message)
      return
    }

    if (!appointments || appointments.length === 0) {
      console.log('📞 No approved appointments found')
      return
    }

    console.log(`📞 Found ${appointments.length} approved appointments`)
    
    let updated = 0
    let skipped = 0

    for (const appointment of appointments) {
      // Check if meeting URL already exists
      const hasUrl = appointment.meeting_url
      const hasRoomName = hasMeetingRoomName ? appointment.meeting_room_name : false

      if (hasUrl && (!hasMeetingRoomName || hasRoomName)) {
        console.log(`⏭️  Skipping appointment ${appointment.id} - already has meeting URL`)
        skipped++
        continue
      }

      const meetingRoomName = `appointment-${appointment.id}`
      const meetingUrl = `/call/${meetingRoomName}?appointmentId=${appointment.id}`
      
      const updateData = { meeting_url: meetingUrl }
      if (hasMeetingRoomName) {
        updateData.meeting_room_name = meetingRoomName
      }

      const { error: updateError } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', appointment.id)

      if (updateError) {
        console.error(`❌ Error updating appointment ${appointment.id}:`, updateError.message)
      } else {
        console.log(`✅ Updated appointment ${appointment.id}`)
        console.log(`   URL: ${meetingUrl}`)
        if (hasMeetingRoomName) {
          console.log(`   Room: ${meetingRoomName}`)
        }
        updated++
      }
    }

    console.log('\n🎉 Update completed!')
    console.log(`📊 Summary:`)
    console.log(`   ✅ Updated: ${updated} appointments`)
    console.log(`   ⏭️  Skipped: ${skipped} appointments (already had URLs)`)
    console.log(`   📞 Total: ${appointments.length} approved appointments`)

    if (updated > 0) {
      console.log('\n🚀 Next steps:')
      console.log('   1. Start your dev server: npm run dev')
      console.log('   2. Go to /appointments to see "Join Call" buttons')
      console.log('   3. Test clicking on a "Join Call" button')
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error)
  }
}

// Check environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  console.error('\nPlease add these to your .env.local file and try again.')
  process.exit(1)
}

// Run the fix
fixAppointments()
  .then(() => {
    console.log('\n✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Failed:', error)
    process.exit(1)
  }) 