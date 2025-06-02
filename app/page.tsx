import { createClient } from "@/lib/supabase/server"
import { SiteHeader } from "@/components/site-header"
import CustomerDashboard from "./(dashboard)/customer/dashboard/page"
import ExpertDashboard from "./(dashboard)/expert/dashboard/page"
import MarketingPage from "./(marketing)/page"

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If user is not logged in, show marketing page
  if (!user) {
    return <MarketingPage />
  }

  // Get user profile to determine role
  const { data: userProfile } = await supabase.from("users").select("*").eq("id", user.id).single()

  // Show appropriate dashboard based on user role with dashboard layout
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container py-6">
        {userProfile?.role === "expert" ? <ExpertDashboard /> : <CustomerDashboard />}
      </main>
    </div>
  )
} 