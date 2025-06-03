import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ExpertSettings } from "@/components/expert-settings"

export default async function ExpertSettingsPage() {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings, notifications, and preferences
        </p>
      </div>

      <ExpertSettings
        expertProfile={expertProfile}
        user={userProfile}
      />
    </div>
  )
} 