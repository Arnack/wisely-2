import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ExpertProfile } from "@/components/expert-profile"

export default async function ExpertProfilePage() {
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

  // Fetch expert profile data
  const { data: expertProfile } = await supabase
    .from("expert_profiles")
    .select(`
      *,
      users!inner(
        id,
        email,
        full_name,
        avatar_url,
        created_at
      )
    `)
    .eq("user_id", user.id)
    .single()

  if (!expertProfile) {
    redirect("/expert/dashboard")
  }

  // Fetch some stats for the profile
  const { data: totalAppointments } = await supabase
    .from("appointments")
    .select("id")
    .eq("expert_id", expertProfile.id)

  const { data: completedAppointments } = await supabase
    .from("appointments")
    .select("id")
    .eq("expert_id", expertProfile.id)
    .eq("status", "completed")

  const { data: upcomingAppointments } = await supabase
    .from("appointments")
    .select("id")
    .eq("expert_id", expertProfile.id)
    .in("status", ["pending", "approved"])

  const stats = {
    totalAppointments: totalAppointments?.length || 0,
    completedAppointments: completedAppointments?.length || 0,
    upcomingAppointments: upcomingAppointments?.length || 0,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your professional profile and preferences
        </p>
      </div>

      <ExpertProfile
        expertProfile={expertProfile}
        stats={stats}
      />
    </div>
  )
} 