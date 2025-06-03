"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { 
  Calendar, 
  Clock, 
  User, 
  Video, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ExternalLink,
  Copy
} from "lucide-react"
import Link from "next/link"

interface AppointmentCardProps {
  appointment: {
    id: string
    title: string
    description: string | null
    scheduled_at: string
    duration_minutes: number
    status: "pending" | "approved" | "rejected" | "completed"
    meeting_url: string | null
    meeting_room_name: string | null
    expert_profiles?: {
      title: string
      hourly_rate: number
      users: {
        full_name: string
        avatar_url: string | null
      }
    }
    users?: {
      full_name: string
      avatar_url: string | null
    }
  }
  isExpert?: boolean
  onStatusChange?: (appointmentId: string, status: string) => void
}

export function AppointmentCard({ appointment, isExpert = false, onStatusChange }: AppointmentCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    approved: "bg-green-100 text-green-800 border-green-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
    completed: "bg-blue-100 text-blue-800 border-blue-200"
  }

  const statusIcons = {
    pending: AlertCircle,
    approved: CheckCircle,
    rejected: XCircle,
    completed: CheckCircle
  }

  const StatusIcon = statusIcons[appointment.status]

  const appointmentTime = new Date(appointment.scheduled_at)
  const now = new Date()
  const timeDiff = appointmentTime.getTime() - now.getTime()
  const isCallAvailable = appointment.status === "approved" && 
                          appointment.meeting_url && 
                          timeDiff <= 15 * 60 * 1000 && // 15 minutes before
                          timeDiff >= -30 * 60 * 1000    // 30 minutes after

  const handleStatusChange = async (status: string) => {
    if (!onStatusChange) return
    
    setIsLoading(true)
    try {
      await onStatusChange(appointment.id, status)
      toast({
        title: "Status Updated",
        description: `Appointment ${status === "approved" ? "approved" : "rejected"} successfully.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update appointment status.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyMeetingLink = () => {
    if (appointment.meeting_url) {
      const fullUrl = `${window.location.origin}${appointment.meeting_url}`
      navigator.clipboard.writeText(fullUrl)
      toast({
        title: "Link Copied",
        description: "Meeting link copied to clipboard.",
      })
    }
  }

  const getTimeDisplay = () => {
    const timeToAppointment = appointmentTime.getTime() - now.getTime()
    const hoursToAppointment = Math.floor(timeToAppointment / (1000 * 60 * 60))
    const minutesToAppointment = Math.floor((timeToAppointment % (1000 * 60 * 60)) / (1000 * 60))

    if (timeToAppointment < 0) {
      return "Past appointment"
    } else if (hoursToAppointment < 1) {
      return `In ${minutesToAppointment} minutes`
    } else if (hoursToAppointment < 24) {
      return `In ${hoursToAppointment}h ${minutesToAppointment}m`
    } else {
      return format(appointmentTime, "MMM d, yyyy 'at' h:mm a")
    }
  }

  const getParticipantInfo = () => {
    if (isExpert && appointment.users) {
      return appointment.users
    } else if (!isExpert && appointment.expert_profiles) {
      return appointment.expert_profiles.users
    }
    return null
  }

  const participantInfo = getParticipantInfo()

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{appointment.title}</CardTitle>
              <Badge className={statusColors[appointment.status]}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </Badge>
            </div>
            
            {participantInfo && (
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={participantInfo.avatar_url || ""} />
                  <AvatarFallback>
                    {participantInfo.full_name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{participantInfo.full_name}</p>
                  {!isExpert && appointment.expert_profiles && (
                    <p className="text-xs text-muted-foreground">
                      {appointment.expert_profiles.title} • ${appointment.expert_profiles.hourly_rate}/hr
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick actions for approved appointments */}
          {appointment.status === "approved" && (
            <div className="flex gap-2">
              {isCallAvailable && appointment.meeting_url && (
                <Button asChild size="sm">
                  <Link href={appointment.meeting_url}>
                    <Video className="h-4 w-4 mr-1" />
                    Join Call
                  </Link>
                </Button>
              )}
              <Button variant="outline" size="sm" asChild>
                <Link href={`/messages?user=${participantInfo?.full_name || 'unknown'}`}>
                  <MessageSquare className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {appointment.description && (
          <CardDescription className="text-sm">
            {appointment.description}
          </CardDescription>
        )}

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{format(appointmentTime, "MMM d, yyyy")}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{format(appointmentTime, "h:mm a")}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>({appointment.duration_minutes} min)</span>
          </div>
        </div>

        <div className="text-sm font-medium text-muted-foreground">
          {getTimeDisplay()}
        </div>

        {/* Meeting link section for approved appointments */}
        {appointment.status === "approved" && appointment.meeting_url && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Meeting Link</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyMeetingLink}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                  {isCallAvailable ? (
                    <Button asChild size="sm">
                      <Link href={appointment.meeting_url}>
                        <Video className="h-3 w-3 mr-1" />
                        Join Now
                      </Link>
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled
                      title={timeDiff > 15 * 60 * 1000 ? "Call available 15 minutes before appointment" : "Call has ended"}
                    >
                      <Video className="h-3 w-3 mr-1" />
                      {timeDiff > 15 * 60 * 1000 ? "Join Later" : "Call Ended"}
                    </Button>
                  )}
                </div>
              </div>
              
              {!isCallAvailable && timeDiff > 15 * 60 * 1000 && (
                <p className="text-xs text-muted-foreground">
                  Call will be available 15 minutes before the appointment
                </p>
              )}
            </div>
          </>
        )}

        {/* Expert actions for pending appointments */}
        {isExpert && appointment.status === "pending" && onStatusChange && (
          <>
            <Separator />
            <div className="flex gap-2">
              <Button
                onClick={() => handleStatusChange("approved")}
                disabled={isLoading}
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button
                variant="outline"
                onClick={() => handleStatusChange("rejected")}
                disabled={isLoading}
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Decline
              </Button>
            </div>
          </>
        )}

        {/* Additional info for completed appointments */}
        {appointment.status === "completed" && (
          <>
            <Separator />
            <div className="text-xs text-muted-foreground">
              Consultation completed on {format(appointmentTime, "MMM d, yyyy 'at' h:mm a")}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
} 