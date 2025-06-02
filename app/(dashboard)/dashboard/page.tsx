import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, Users, MessageSquare, Clock } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get user profile
  const { data: userProfile } = await supabase.from("users").select("*").eq("id", user.id).single()

  // Get user's appointments
  const { data: appointments } = await supabase
    .from("appointments")
    .select(`
      *,
      expert_profiles!inner(
        title,
        users!inner(full_name)
      )
    `)
    .eq("user_id", user.id)
    .order("scheduled_at", { ascending: true })
    .limit(5)

  // Get expert's appointments if user is an expert
  let expertAppointments = null
  if (userProfile?.role === "expert") {
    const { data: expertProfile } = await supabase.from("expert_profiles").select("id").eq("user_id", user.id).single()

    if (expertProfile) {
      const { data } = await supabase
        .from("appointments")
        .select(`
          *,
          users!inner(full_name)
        `)
        .eq("expert_id", expertProfile.id)
        .order("scheduled_at", { ascending: true })
        .limit(5)

      expertAppointments = data
    }
  }

  const isExpert = userProfile?.role === "expert"

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {userProfile?.full_name}!</h1>
        <p className="text-muted-foreground">
          {isExpert ? "Manage your consultations and calendar" : "Here's what's happening with your consultations"}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {!isExpert && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Find Experts</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/experts">Browse Experts</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">My Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/appointments">View All</Link>
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {isExpert && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Calendar</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/expert/calendar">Manage Calendar</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Appointments</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/expert/appointments">View Requests</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profile</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/expert/profile">Edit Profile</Link>
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild className="w-full">
              <Link href="/messages">View Messages</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Appointments */}
      <div className="grid gap-4 md:grid-cols-2">
        {!isExpert && (
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Your next consultations</CardDescription>
            </CardHeader>
            <CardContent>
              {appointments && appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center space-x-4">
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{appointment.title}</p>
                        <p className="text-sm text-muted-foreground">
                          with {appointment.expert_profiles.users.full_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(appointment.scheduled_at).toLocaleDateString()} at{" "}
                          {new Date(appointment.scheduled_at).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">{appointment.status}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No upcoming appointments</p>
              )}
            </CardContent>
          </Card>
        )}

        {isExpert && expertAppointments && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Appointment Requests</CardTitle>
              <CardDescription>Pending and upcoming consultations</CardDescription>
            </CardHeader>
            <CardContent>
              {expertAppointments.length > 0 ? (
                <div className="space-y-4">
                  {expertAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center space-x-4">
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{appointment.title}</p>
                        <p className="text-sm text-muted-foreground">with {appointment.users.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(appointment.scheduled_at).toLocaleDateString()} at{" "}
                          {new Date(appointment.scheduled_at).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">{appointment.status}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No recent requests</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
