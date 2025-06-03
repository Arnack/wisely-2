import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ExpertAppointments } from "@/components/expert-appointments"

export default async function ExpertAppointmentsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get user profile to check role
  const { data: userProfile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!userProfile || userProfile.role !== "expert") {
    redirect("/")
  }

  // Get expert profile
  const { data: expertProfile } = await supabase
    .from("expert_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (!expertProfile) {
    redirect("/expert/dashboard")
  }

  // Get all appointments for this expert with client details
  const { data: appointments } = await supabase
    .from("appointments")
    .select(`
      *,
      users!inner(
        id,
        full_name,
        email,
        avatar_url
      ),
      availability_slots(
        start_time,
        end_time
      )
    `)
    .eq("expert_id", expertProfile.id)
    .order("scheduled_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
        <p className="text-muted-foreground">
          Manage your consultation appointments and client requests
        </p>
      </div>

      <ExpertAppointments
        appointments={appointments || []}
        expertId={expertProfile.id}
      />
    </div>
  )
} 