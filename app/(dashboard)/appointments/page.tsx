import { createClient } from "@/lib/supabase/server"
import { AppointmentCard } from "@/components/appointment-card"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import Link from "next/link"

export default async function AppointmentsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get user's appointments with expert details and meeting URLs
  const { data: appointments } = await supabase
    .from("appointments")
    .select(`
      *,
      expert_profiles!inner(
        title,
        hourly_rate,
        users!inner(full_name, avatar_url)
      )
    `)
    .eq("user_id", user.id)
    .order("scheduled_at", { ascending: false })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Appointments</h1>
        <p className="text-muted-foreground">Manage your consultation appointments</p>
      </div>

      {appointments && appointments.length > 0 ? (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              isExpert={false}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No appointments yet</h3>
          <p className="text-muted-foreground mb-4">Start by finding an expert and booking your first consultation</p>
          <Button asChild>
            <Link href="/experts">Find Experts</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
