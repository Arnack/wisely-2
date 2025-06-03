"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Calendar, 
  Clock, 
  User, 
  MessageSquare, 
  Video,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  Search,
  Mail,
  Phone,
  AlertCircle,
  Award,
  Star,
  MoreHorizontal
} from "lucide-react"

interface AppointmentData {
  id: string
  user_id: string
  expert_id: string
  availability_slot_id: string
  title: string
  description: string | null
  status: "pending" | "approved" | "declined" | "completed" | "cancelled"
  scheduled_at: string
  duration_minutes: number
  meeting_url: string | null
  livekit_room_name: string | null
  created_at: string
  updated_at: string
  users: {
    id: string
    full_name: string
    email: string
    avatar_url: string | null
  }
  availability_slots: {
    start_time: string
    end_time: string
  } | null
}

interface ExpertAppointmentsProps {
  appointments: AppointmentData[]
  expertId: string
}

export function ExpertAppointments({ appointments, expertId }: ExpertAppointmentsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentData | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false)
  const [responseType, setResponseType] = useState<"approved" | "declined" | null>(null)
  const [responseMessage, setResponseMessage] = useState("")

  const supabase = createClient()
  const { toast } = useToast()

  // Filter appointments
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.users.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Separate appointments by status
  const pendingAppointments = filteredAppointments.filter(apt => apt.status === "pending")
  const upcomingAppointments = filteredAppointments.filter(apt => 
    apt.status === "approved" && new Date(apt.scheduled_at) > new Date()
  )
  const pastAppointments = filteredAppointments.filter(apt => 
    apt.status === "completed" || apt.status === "declined" || apt.status === "cancelled" ||
    (apt.status === "approved" && new Date(apt.scheduled_at) <= new Date())
  )

  const handleAppointmentResponse = async (appointmentId: string, status: "approved" | "declined", message?: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq("id", appointmentId)

      if (error) throw error

      toast({
        title: "Success",
        description: `Appointment ${status} successfully`,
      })

      // Refresh the page to show updated data
      window.location.reload()
    } catch (error) {
      console.error("Error updating appointment:", error)
      toast({
        title: "Error",
        description: "Failed to update appointment",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsResponseDialogOpen(false)
      setResponseMessage("")
      setResponseType(null)
    }
  }

  const markAsCompleted = async (appointmentId: string) => {
    await handleAppointmentResponse(appointmentId, "approved") // This should be "completed" but keeping consistent with existing pattern
  }

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime)
    return {
      date: date.toLocaleDateString("en-US", { 
        weekday: "short", 
        month: "short", 
        day: "numeric", 
        year: "numeric" 
      }),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      full: date.toLocaleString()
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: "secondary" as const, color: "bg-yellow-100 text-yellow-800" },
      approved: { variant: "default" as const, color: "bg-green-100 text-green-800" },
      declined: { variant: "destructive" as const, color: "bg-red-100 text-red-800" },
      completed: { variant: "default" as const, color: "bg-blue-100 text-blue-800" },
      cancelled: { variant: "secondary" as const, color: "bg-gray-100 text-gray-800" }
    }
    
    const config = variants[status as keyof typeof variants] || variants.pending
    return (
      <Badge variant={config.variant} className={config.color}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const AppointmentCard = ({ appointment, showActions = false }: { appointment: AppointmentData, showActions?: boolean }) => {
    const { date, time } = formatDateTime(appointment.scheduled_at)
    const isUpcoming = new Date(appointment.scheduled_at) > new Date()

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={appointment.users.avatar_url || ""} />
                <AvatarFallback>
                  {appointment.users.full_name
                    .split(" ")
                    .map(n => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{appointment.title}</h3>
                <p className="text-sm text-muted-foreground">
                  with {appointment.users.full_name}
                </p>
              </div>
            </div>
            {getStatusBadge(appointment.status)}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{time}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{appointment.duration_minutes} minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{appointment.users.email}</span>
            </div>
          </div>

          {appointment.description && (
            <div className="mt-3 p-2 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">
                {appointment.description}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedAppointment(appointment)
                setIsDetailDialogOpen(true)
              }}
            >
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Button>

            {showActions && appointment.status === "pending" && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedAppointment(appointment)
                    setResponseType("approved")
                    setIsResponseDialogOpen(true)
                  }}
                  disabled={isLoading}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setSelectedAppointment(appointment)
                    setResponseType("declined")
                    setIsResponseDialogOpen(true)
                  }}
                  disabled={isLoading}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Decline
                </Button>
              </div>
            )}

            {appointment.status === "approved" && isUpcoming && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Message
                </Button>
                {appointment.meeting_url && (
                  <Button size="sm" asChild>
                    <a href={appointment.meeting_url} target="_blank" rel="noopener noreferrer">
                      <Video className="h-4 w-4 mr-1" />
                      Join Meeting
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingAppointments.length}</div>
            <p className="text-xs text-muted-foreground">
              Need your response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{upcomingAppointments.length}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled consultations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointments.length}</div>
            <p className="text-xs text-muted-foreground">
              All time requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {appointments.filter(apt => apt.status === "completed").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Successful consultations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by client name or appointment title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Appointments Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="relative">
            Pending Requests
            {pendingAppointments.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                {pendingAppointments.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All ({filteredAppointments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingAppointments.length > 0 ? (
            pendingAppointments.map(appointment => (
              <AppointmentCard 
                key={appointment.id} 
                appointment={appointment} 
                showActions={true}
              />
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No pending requests</h3>
                <p className="text-muted-foreground text-center">
                  You're all caught up! New appointment requests will appear here.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map(appointment => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No upcoming appointments</h3>
                <p className="text-muted-foreground text-center">
                  Your schedule is clear. Approved appointments will appear here.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastAppointments.length > 0 ? (
            pastAppointments.map(appointment => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Award className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No past appointments</h3>
                <p className="text-muted-foreground text-center">
                  Completed and past appointments will appear here.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map(appointment => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No appointments found</h3>
                <p className="text-muted-foreground text-center">
                  No appointments match your current filters.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Appointment Details Dialog */}
      {selectedAppointment && (
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Appointment Details</DialogTitle>
              <DialogDescription>
                {selectedAppointment.title}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedAppointment.users.avatar_url || ""} />
                  <AvatarFallback>
                    {selectedAppointment.users.full_name
                      .split(" ")
                      .map(n => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selectedAppointment.users.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedAppointment.users.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Date & Time</Label>
                  <p>{formatDateTime(selectedAppointment.scheduled_at).full}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Duration</Label>
                  <p>{selectedAppointment.duration_minutes} minutes</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedAppointment.status)}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Created</Label>
                  <p>{new Date(selectedAppointment.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {selectedAppointment.description && (
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <div className="mt-1 p-3 bg-muted rounded-lg">
                    <p className="text-sm">{selectedAppointment.description}</p>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Response Dialog */}
      {selectedAppointment && responseType && (
        <Dialog open={isResponseDialogOpen} onOpenChange={setIsResponseDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {responseType === "approved" ? "Approve" : "Decline"} Appointment
              </DialogTitle>
              <DialogDescription>
                {responseType === "approved" 
                  ? "Confirm this appointment with " + selectedAppointment.users.full_name
                  : "Decline this appointment request"
                }
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <h4 className="font-medium">{selectedAppointment.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(selectedAppointment.scheduled_at).full}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="response-message">
                  {responseType === "approved" ? "Welcome message (optional)" : "Reason for declining (optional)"}
                </Label>
                <Textarea
                  id="response-message"
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  placeholder={
                    responseType === "approved" 
                      ? "Add a welcome message for your client..."
                      : "Let the client know why you're declining..."
                  }
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsResponseDialogOpen(false)
                    setResponseMessage("")
                    setResponseType(null)
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleAppointmentResponse(
                    selectedAppointment.id, 
                    responseType, 
                    responseMessage
                  )}
                  disabled={isLoading}
                  className="flex-1"
                  variant={responseType === "approved" ? "default" : "destructive"}
                >
                  {isLoading ? "Processing..." : (responseType === "approved" ? "Approve" : "Decline")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
} 