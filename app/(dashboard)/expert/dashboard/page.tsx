import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { 
  Calendar, 
  Users, 
  MessageSquare, 
  Clock, 
  Star,
  TrendingUp,
  DollarSign,
  BarChart3,
  Settings,
  Award,
  CheckCircle,
  AlertCircle,
  Eye
} from "lucide-react"

export default async function ExpertDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get user profile
  const { data: userProfile } = await supabase.from("users").select("*").eq("id", user.id).single()

  // Get expert profile
  const { data: expertProfile } = await supabase
    .from("expert_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (!expertProfile) return null

  // Get expert's appointments
  const { data: appointments } = await supabase
    .from("appointments")
    .select(`
      *,
      users!inner(full_name, avatar_url)
    `)
    .eq("expert_id", expertProfile.id)
    .order("scheduled_at", { ascending: true })
    .limit(10)

  // Get pending appointments
  const { count: pendingCount } = await supabase
    .from("appointments")
    .select("*", { count: "exact" })
    .eq("expert_id", expertProfile.id)
    .eq("status", "pending")

  // Get completed consultations count
  const { count: completedCount } = await supabase
    .from("appointments")
    .select("*", { count: "exact" })
    .eq("expert_id", expertProfile.id)
    .eq("status", "completed")

  // Get total earnings (completed appointments)
  const { data: completedAppointments } = await supabase
    .from("appointments")
    .select("duration_minutes")
    .eq("expert_id", expertProfile.id)
    .eq("status", "completed")

  const totalEarnings = completedAppointments?.reduce((total, apt) => {
    const hours = (apt.duration_minutes || 60) / 60
    return total + (hours * (expertProfile.hourly_rate || 0))
  }, 0) || 0

  // Get upcoming appointments
  const upcomingAppointments = appointments?.filter(apt => 
    apt.status === "approved" && new Date(apt.scheduled_at) > new Date()
  ) || []

  // Get pending appointment requests
  const pendingAppointments = appointments?.filter(apt => 
    apt.status === "pending"
  ) || []

  // Get this month's completed appointments
  const thisMonth = new Date()
  thisMonth.setDate(1)
  const { count: thisMonthCount } = await supabase
    .from("appointments")
    .select("*", { count: "exact" })
    .eq("expert_id", expertProfile.id)
    .eq("status", "completed")
    .gte("scheduled_at", thisMonth.toISOString())

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {userProfile?.full_name}! 🚀
          </h1>
          <p className="text-muted-foreground mt-2">
            {expertProfile.title} • Your expertise is making a difference
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={expertProfile.is_available ? "default" : "secondary"}>
            {expertProfile.is_available ? "Available" : "Unavailable"}
          </Badge>
          <Badge variant="outline">
            {expertProfile.subscription_type}
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalEarnings.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">
              From {completedCount || 0} consultations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting your response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thisMonthCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Completed sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expertProfile.rating}</div>
            <p className="text-xs text-muted-foreground">
              {expertProfile.total_reviews} reviews
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-5 w-5 text-blue-600" />
              Manage Calendar
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Button asChild className="w-full">
              <Link href="/expert/calendar">Set Availability</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-5 w-5 text-orange-600" />
              Appointments
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Button variant="outline" asChild className="w-full">
              <Link href="/expert/appointments">
                View Requests ({pendingCount || 0})
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings className="h-5 w-5 text-gray-600" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Button variant="outline" asChild className="w-full">
              <Link href="/expert/profile">Edit Profile</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-5 w-5 text-green-600" />
              Messages
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Button variant="outline" asChild className="w-full">
              <Link href="/messages">View Messages</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Pending Appointment Requests</span>
              <Badge variant="destructive">{pendingCount || 0}</Badge>
            </CardTitle>
            <CardDescription>New consultation requests awaiting approval</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingAppointments && pendingAppointments.length > 0 ? (
              <div className="space-y-4">
                {pendingAppointments.slice(0, 5).map((appointment) => (
                  <div key={appointment.id} className="flex items-start space-x-4 p-3 rounded-lg border border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20">
                    <Avatar>
                      <AvatarImage src={appointment.users.avatar_url || ""} />
                      <AvatarFallback>
                        {appointment.users.full_name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{appointment.title}</p>
                      <p className="text-sm text-muted-foreground">
                        by {appointment.users.full_name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(appointment.scheduled_at).toLocaleDateString()} at{" "}
                        {new Date(appointment.scheduled_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </div>
                      {appointment.description && (
                        <p className="text-xs text-muted-foreground mt-2">
                          "{appointment.description}"
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button size="sm" asChild>
                        <Link href={`/expert/appointments?id=${appointment.id}`}>Review</Link>
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" asChild className="w-full">
                  <Link href="/expert/appointments">View All Requests</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-4">No pending requests</p>
                <p className="text-xs text-muted-foreground">
                  Great! You're all caught up
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Upcoming Sessions
            </CardTitle>
            <CardDescription>Your confirmed consultations</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingAppointments && upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.slice(0, 5).map((appointment) => (
                  <div key={appointment.id} className="flex items-start space-x-4 p-3 rounded-lg border border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
                    <Avatar>
                      <AvatarImage src={appointment.users.avatar_url || ""} />
                      <AvatarFallback>
                        {appointment.users.full_name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{appointment.title}</p>
                      <p className="text-sm text-muted-foreground">
                        with {appointment.users.full_name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(appointment.scheduled_at).toLocaleDateString()} at{" "}
                        {new Date(appointment.scheduled_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </div>
                    </div>
                    <Badge variant="default">Confirmed</Badge>
                  </div>
                ))}
                <Button variant="outline" asChild className="w-full">
                  <Link href="/expert/appointments">View All Sessions</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-4">No upcoming sessions</p>
                <Button asChild>
                  <Link href="/expert/calendar">Set Your Availability</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Profile Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            Profile Performance
          </CardTitle>
          <CardDescription>Your profile metrics and opportunities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Profile Completeness</span>
                <span className="text-sm text-muted-foreground">85%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: "85%" }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Response Rate</span>
                <span className="text-sm text-muted-foreground">92%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: "92%" }}></div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Profile Views</span>
                </div>
                <div className="text-2xl font-bold">127</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Quick Improvements</h4>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>• Add more expertise areas</li>
                  <li>• Upload a professional photo</li>
                  <li>• Complete your bio</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expert Tips */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-green-600" />
            Expert Success Tips
          </CardTitle>
          <CardDescription>
            Best practices to maximize your consultation success
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Before Sessions</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Review client background</li>
                <li>• Prepare relevant materials</li>
                <li>• Test your video setup</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">During Sessions</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Listen actively to needs</li>
                <li>• Provide actionable advice</li>
                <li>• Share relevant resources</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 