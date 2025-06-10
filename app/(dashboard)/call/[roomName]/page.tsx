import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { VideoCall } from "@/components/video-call"

interface CallPageProps {
  params: {
    roomName: string
  }
  searchParams: {
    appointmentId?: string
  }
}

export default async function CallPage({ params, searchParams }: CallPageProps) {
  const supabase = await createClient()
  
  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get user profile
  const { data: userProfile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!userProfile) {
    redirect("/login")
  }

  // If appointmentId is provided, validate appointment access
  if (searchParams.appointmentId) {
    const { data: appointment } = await supabase
      .from("appointments")
      .select(`
        *,
        expert_profiles(
          user_id,
          users(id)
        )
      `)
      .eq("id", searchParams.appointmentId)
      .single()

    if (!appointment) {
      redirect("/appointments?error=appointment-not-found")
    }

    // Check if user is participant in this appointment
    const isCustomer = appointment.user_id === user.id
    const isExpert = appointment.expert_profiles?.users?.id === user.id

    if (!isCustomer && !isExpert) {
      redirect("/appointments?error=access-denied")
    }

    // Check if appointment is approved
    if (appointment.status !== "approved") {
      redirect("/appointments?error=appointment-not-approved")
    }

    // Check if appointment time is within valid range (15 min before to 30 min after)
    const appointmentTime = new Date(appointment.scheduled_at)
    const now = new Date()
    const fifteenMinsBefore = new Date(appointmentTime.getTime() - 15 * 60 * 1000)
    const thirtyMinsAfter = new Date(appointmentTime.getTime() + (appointment.duration_minutes || 60) * 60 * 1000 + 30 * 60 * 1000)

    if (now < fifteenMinsBefore || now > thirtyMinsAfter) {
      redirect("/appointments?error=call-time-invalid")
    }
  }

  return (
    <VideoCall
      roomName={params.roomName}
      userName={userProfile.full_name}
      userEmail={userProfile.email}
      appointmentId={searchParams.appointmentId}
    />
  )
} 