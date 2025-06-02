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
  Search,
  BookOpen,
  Award,
  ArrowRight,
  Plus
} from "lucide-react"

export default async function CustomerDashboardPage() {
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
        users!inner(full_name, avatar_url),
        rating,
        hourly_rate
      )
    `)
    .eq("user_id", user.id)
    .order("scheduled_at", { ascending: true })
    .limit(5)

  // Get recommended experts (top-rated and available)
  const { data: recommendedExperts } = await supabase
    .from("expert_profiles")
    .select(`
      *,
      users!inner(full_name, avatar_url)
    `)
    .eq("is_available", true)
    .order("rating", { ascending: false })
    .limit(4)

  // Get recent consultations count
  const { count: totalConsultations } = await supabase
    .from("appointments")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .eq("status", "completed")

  // Get upcoming appointments count
  const { count: upcomingCount } = await supabase
    .from("appointments")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .in("status", ["pending", "approved"])

  const upcomingAppointments = appointments?.filter(apt => 
    apt.status === "pending" || apt.status === "approved"
  ) || []

  const completedAppointments = appointments?.filter(apt => 
    apt.status === "completed"
  ) || []

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {userProfile?.full_name}! 👋
        </h1>
        <p className="text-muted-foreground mt-2">
          Ready to connect with experts and accelerate your growth?
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Consultations</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConsultations || 0}</div>
            <p className="text-xs text-muted-foreground">
              Completed sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled consultations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expert Network</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1000+</div>
            <p className="text-xs text-muted-foreground">
              Available experts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">95%</div>
            <p className="text-xs text-muted-foreground">
              Positive outcomes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Find Experts
            </CardTitle>
            <CardDescription>
              Discover verified experts in your field of interest
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/experts">
                Browse All Experts
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-green-600" />
              Quick Book
            </CardTitle>
            <CardDescription>
              Get instant help from available experts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild className="w-full">
              <Link href="/experts?available=true">
                Book Now
                <Calendar className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              Messages
            </CardTitle>
            <CardDescription>
              Continue conversations with your experts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild className="w-full">
              <Link href="/messages">View Messages</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Upcoming Consultations</span>
              <Badge variant="secondary">{upcomingCount || 0}</Badge>
            </CardTitle>
            <CardDescription>Your next scheduled sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingAppointments && upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-start space-x-4 p-3 rounded-lg border">
                    <Avatar>
                      <AvatarImage src={appointment.expert_profiles.users.avatar_url || ""} />
                      <AvatarFallback>
                        {appointment.expert_profiles.users.full_name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{appointment.title}</p>
                      <p className="text-sm text-muted-foreground">
                        with {appointment.expert_profiles.users.full_name}
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
                    <Badge variant={appointment.status === "approved" ? "default" : "secondary"}>
                      {appointment.status}
                    </Badge>
                  </div>
                ))}
                <Button variant="outline" asChild className="w-full">
                  <Link href="/appointments">View All Appointments</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-4">No upcoming consultations</p>
                <Button asChild>
                  <Link href="/experts">Book Your First Consultation</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recommended Experts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Recommended for You
            </CardTitle>
            <CardDescription>Top-rated experts ready to help</CardDescription>
          </CardHeader>
          <CardContent>
            {recommendedExperts && recommendedExperts.length > 0 ? (
              <div className="space-y-4">
                {recommendedExperts.map((expert) => (
                  <div key={expert.id} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <Avatar>
                      <AvatarImage src={expert.users.avatar_url || ""} />
                      <AvatarFallback>
                        {expert.users.full_name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{expert.users.full_name}</p>
                      <p className="text-xs text-muted-foreground">{expert.title}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs ml-1">{expert.rating}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          ${expert.hourly_rate}/hr
                        </span>
                      </div>
                    </div>
                    <Button size="sm" asChild>
                      <Link href={`/experts/${expert.id}`}>View</Link>
                    </Button>
                  </div>
                ))}
                <Button variant="outline" asChild className="w-full">
                  <Link href="/experts">Explore All Experts</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Loading recommendations...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      {completedAppointments && completedAppointments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
            <CardDescription>Your consultation history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedAppointments.slice(0, 3).map((appointment) => (
                <div key={appointment.id} className="flex items-center space-x-4 p-2 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{appointment.title}</p>
                    <p className="text-xs text-muted-foreground">
                      with {appointment.expert_profiles.users.full_name} • {" "}
                      {new Date(appointment.scheduled_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline">Completed</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Learning Resources */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Get the Most from Your Consultations
          </CardTitle>
          <CardDescription>
            Tips and resources to maximize your expert sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Before Your Session</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Prepare specific questions</li>
                <li>• Share relevant background</li>
                <li>• Set clear objectives</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">During Your Session</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Take detailed notes</li>
                <li>• Ask follow-up questions</li>
                <li>• Request specific examples</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 