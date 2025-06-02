import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ExpertCalendar } from "@/components/expert-calendar"

export default async function ExpertCalendarPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get user profile
  const { data: userProfile } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (userProfile?.role !== "expert") {
    redirect("/")
  }

  // Get expert profile
  const { data: expertProfile } = await supabase
    .from("expert_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (!expertProfile) {
    redirect("/")
  }

  // Get availability slots for the next 3 months
  const threeMonthsFromNow = new Date()
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3)

  const { data: availabilitySlots } = await supabase
    .from("availability_slots")
    .select("*")
    .eq("expert_id", expertProfile.id)
    .gte("start_time", new Date().toISOString())
    .lte("start_time", threeMonthsFromNow.toISOString())
    .order("start_time", { ascending: true })

  // Get appointments for the next 3 months
  const { data: appointments } = await supabase
    .from("appointments")
    .select(`
      *,
      users!inner(full_name, avatar_url)
    `)
    .eq("expert_id", expertProfile.id)
    .gte("scheduled_at", new Date().toISOString())
    .lte("scheduled_at", threeMonthsFromNow.toISOString())
    .order("scheduled_at", { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Calendar Management</h1>
        <p className="text-muted-foreground">
          Manage your availability and view upcoming appointments
        </p>
      </div>

      <ExpertCalendar
        expertId={expertProfile.id}
        initialAvailabilitySlots={availabilitySlots || []}
        initialAppointments={appointments || []}
        hourlyRate={expertProfile.hourly_rate || 0}
      />
    </div>
  )
} 