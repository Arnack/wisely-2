import { AppointmentCard } from "@/components/appointment-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Video, Calendar, Clock, Users, Zap } from "lucide-react"
import Link from "next/link"

export default function CallDemoPage() {
  // Mock appointments demonstrating different states
  const mockAppointments = [
    {
      id: "appointment-1",
      title: "Business Strategy Consultation",
      description: "Discussing growth strategies and market expansion plans for Q2 2024",
      scheduled_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes from now
      duration_minutes: 60,
      status: "approved" as const,
      meeting_url: "/call/business-strategy-room?appointmentId=appointment-1",
      meeting_room_name: "business-strategy-room",
      expert_profiles: {
        title: "Business Strategy Expert",
        hourly_rate: 150,
        users: {
          full_name: "John Smith",
          avatar_url: null
        }
      }
    },
    {
      id: "appointment-2", 
      title: "Technical Architecture Review",
      description: "Code review and system architecture optimization consultation",
      scheduled_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
      duration_minutes: 90,
      status: "approved" as const,
      meeting_url: "/call/tech-review-room?appointmentId=appointment-2",
      meeting_room_name: "tech-review-room",
      expert_profiles: {
        title: "Senior Software Architect",
        hourly_rate: 200,
        users: {
          full_name: "Sarah Johnson",
          avatar_url: null
        }
      }
    },
    {
      id: "appointment-3",
      title: "Marketing Strategy Session",
      description: "Digital marketing strategies and campaign optimization",
      scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
      duration_minutes: 45,
      status: "approved" as const,
      meeting_url: "/call/marketing-session?appointmentId=appointment-3",
      meeting_room_name: "marketing-session",
      expert_profiles: {
        title: "Digital Marketing Expert",
        hourly_rate: 120,
        users: {
          full_name: "Mike Chen",
          avatar_url: null
        }
      }
    },
    {
      id: "appointment-4",
      title: "Financial Planning Consultation",
      description: "Investment strategies and financial portfolio review",
      scheduled_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      duration_minutes: 60,
      status: "completed" as const,
      meeting_url: "/call/financial-planning?appointmentId=appointment-4",
      meeting_room_name: "financial-planning",
      expert_profiles: {
        title: "Financial Advisor",
        hourly_rate: 180,
        users: {
          full_name: "Emma Davis",
          avatar_url: null
        }
      }
    },
    {
      id: "appointment-5",
      title: "Product Design Review",
      description: "UX/UI design consultation and user experience optimization",
      scheduled_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      duration_minutes: 120,
      status: "pending" as const,
      meeting_url: null,
      meeting_room_name: null,
      expert_profiles: {
        title: "UX/UI Design Expert",
        hourly_rate: 140,
        users: {
          full_name: "Alex Rodriguez",
          avatar_url: null
        }
      }
    }
  ]

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Video Call System Demo</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Experience our integrated video calling system with LiveKit integration, 
          automatic meeting link generation, and real-time consultation management.
        </p>
      </div>

      {/* Features Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="text-center">
            <Video className="h-12 w-12 mx-auto text-primary" />
            <CardTitle>HD Video Calls</CardTitle>
            <CardDescription>
              Professional video conferencing with LiveKit integration
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <ul className="text-sm space-y-1">
              <li>• HD video and audio</li>
              <li>• Screen sharing</li>
              <li>• Real-time chat</li>
              <li>• Recording capabilities</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <Calendar className="h-12 w-12 mx-auto text-primary" />
            <CardTitle>Smart Scheduling</CardTitle>
            <CardDescription>
              Automatic meeting links for approved appointments
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <ul className="text-sm space-y-1">
              <li>• Auto-generated meeting URLs</li>
              <li>• Time-based access control</li>
              <li>• Calendar integration</li>
              <li>• Reminder notifications</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <Users className="h-12 w-12 mx-auto text-primary" />
            <CardTitle>Expert Management</CardTitle>
            <CardDescription>
              Complete consultation lifecycle management
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <ul className="text-sm space-y-1">
              <li>• Appointment approval</li>
              <li>• Real-time status updates</li>
              <li>• Call duration tracking</li>
              <li>• Session completion</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Demo Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Live Demo Appointments</h2>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/test-call">
                <Video className="h-4 w-4 mr-2" />
                Test Video Call
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/call/demo-room-live">
                <Zap className="h-4 w-4 mr-2" />
                Live Demo Room
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          {mockAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              isExpert={false}
            />
          ))}
        </div>
      </div>

      {/* Expert View Demo */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Expert View Demo</h2>
        <p className="text-muted-foreground">
          This shows how experts see appointments with approval/rejection capabilities.
        </p>
        
        <div className="grid gap-4">
          {mockAppointments.map((appointment) => (
            <AppointmentCard
              key={`expert-${appointment.id}`}
              appointment={{
                ...appointment,
                users: appointment.expert_profiles.users
              }}
              isExpert={true}
              onStatusChange={async (id, status) => {
                // Mock status change
                console.log(`Changing appointment ${id} to ${status}`)
                return Promise.resolve()
              }}
            />
          ))}
        </div>
      </div>

      {/* Technical Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Technical Implementation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Features Implemented:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>✓ LiveKit video conferencing integration</li>
                <li>✓ Automatic meeting URL generation on approval</li>
                <li>✓ Time-based access control (15 min before to 30 min after)</li>
                <li>✓ Database triggers for meeting room creation</li>
                <li>✓ Real-time appointment status management</li>
                <li>✓ Call duration tracking and completion</li>
                <li>✓ Professional UI with responsive design</li>
                <li>✓ Role-based views (customer vs expert)</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Database Schema:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• appointments.meeting_url (auto-generated)</li>
                <li>• appointments.meeting_room_name</li>
                <li>• call_logs table for session tracking</li>
                <li>• Database triggers for URL generation</li>
                <li>• RLS policies for secure access</li>
              </ul>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-2">API Endpoints:</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <Badge variant="secondary" className="mb-2">POST /api/livekit/token</Badge>
                <p className="text-muted-foreground">Generates secure LiveKit access tokens with room permissions</p>
              </div>
              <div>
                <Badge variant="secondary" className="mb-2">GET /call/[roomName]</Badge>
                <p className="text-muted-foreground">Video call page with authentication and time validation</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 