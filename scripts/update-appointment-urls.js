const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function updateAppointmentUrls() {
  console.log('🔄 Updating approved appointments with meeting URLs...\n')

  try {
    // Fetch all approved appointments
    const { data: appointments, error: fetchError } = await supabase
      .from('appointments')
      .select('id, status, meeting_url, meeting_room_name')
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
      if (appointment.meeting_url && appointment.meeting_room_name) {
        console.log(`⏭️  Skipping appointment ${appointment.id} - already has meeting URL`)
        skipped++
        continue
      }

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
        console.log(`✅ Updated appointment ${appointment.id}`)
        console.log(`   Room: ${meetingRoomName}`)
        console.log(`   URL: ${meetingUrl}`)
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

// Run the update
updateAppointmentUrls()
  .then(() => {
    console.log('\n✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Failed:', error)
    process.exit(1)
  }) 