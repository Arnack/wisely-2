import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, MessageSquare, Video } from "lucide-react"
import Link from "next/link"

export default async function AppointmentsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get user's appointments with expert details
  const { data: appointments } = await supabase
    .from("appointments")
    .select(`
      *,
      expert_profiles!inner(
        title,
        users!inner(full_name, avatar_url)
      )
    `)
    .eq("user_id", user.id)
    .order("scheduled_at", { ascending: false })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "declined":
        return "bg-red-100 text-red-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Appointments</h1>
        <p className="text-muted-foreground">Manage your consultation appointments</p>
      </div>

      {appointments && appointments.length > 0 ? (
        <div className="space-y-4">
          {appointments.map((appointment) => {
            const { date, time } = formatDateTime(appointment.scheduled_at)
            const isUpcoming = new Date(appointment.scheduled_at) > new Date()
            const canJoinMeeting = appointment.status === "approved" && appointment.meeting_url && isUpcoming

            return (
              <Card key={appointment.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={appointment.expert_profiles.users.avatar_url || ""} />
                        <AvatarFallback>
                          {appointment.expert_profiles.users.full_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{appointment.title}</CardTitle>
                        <CardDescription>
                          with {appointment.expert_profiles.users.full_name} • {appointment.expert_profiles.title}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{date}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{time}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">{appointment.duration_minutes} minutes</div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {appointment.status === "approved" && (
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/messages/${appointment.id}`}>
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Message
                          </Link>
                        </Button>
                      )}

                      {canJoinMeeting && (
                        <Button size="sm" asChild>
                          <Link href={appointment.meeting_url!} target="_blank">
                            <Video className="h-4 w-4 mr-1" />
                            Join Meeting
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>

                  {appointment.description && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm">{appointment.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
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
