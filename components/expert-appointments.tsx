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
import { AppointmentCard } from "@/components/appointment-card"

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

export function ExpertAppointments({ appointments: initialAppointments, expertId }: ExpertAppointmentsProps) {
  const [appointments, setAppointments] = useState(initialAppointments)
  const { toast } = useToast()
  const supabase = createClient()

  const handleStatusChange = async (appointmentId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq("id", appointmentId)

      if (error) throw error

      // Update local state
      setAppointments(prev => 
        prev.map(appointment => 
          appointment.id === appointmentId 
            ? { ...appointment, status }
            : appointment
        )
      )

      toast({
        title: "Status Updated",
        description: `Appointment ${status === "approved" ? "approved" : "rejected"} successfully.`,
      })
    } catch (error) {
      console.error("Error updating appointment status:", error)
      throw error
    }
  }

  const filterAppointmentsByStatus = (status?: string) => {
    if (!status) return appointments
    return appointments.filter(appointment => appointment.status === status)
  }

  const pendingAppointments = filterAppointmentsByStatus("pending")
  const approvedAppointments = filterAppointmentsByStatus("approved")
  const completedAppointments = filterAppointmentsByStatus("completed")
  const rejectedAppointments = filterAppointmentsByStatus("declined")

  return (
    <div className="space-y-6">
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({appointments.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingAppointments.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedAppointments.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedAppointments.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedAppointments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {appointments.length > 0 ? (
            appointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                isExpert={true}
                onStatusChange={handleStatusChange}
              />
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No appointments found
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingAppointments.length > 0 ? (
            pendingAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                isExpert={true}
                onStatusChange={handleStatusChange}
              />
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No pending appointments
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedAppointments.length > 0 ? (
            approvedAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                isExpert={true}
                onStatusChange={handleStatusChange}
              />
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No approved appointments
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedAppointments.length > 0 ? (
            completedAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                isExpert={true}
                onStatusChange={handleStatusChange}
              />
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No completed appointments
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejectedAppointments.length > 0 ? (
            rejectedAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                isExpert={true}
                onStatusChange={handleStatusChange}
              />
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No rejected appointments
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 