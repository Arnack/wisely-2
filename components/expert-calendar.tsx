"use client"

import { useState, useEffect, useCallback } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  CalendarPlus, 
  Clock, 
  Users, 
  DollarSign,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  CalendarDays,
  Plus,
  MousePointer,
  Calendar
} from "lucide-react"

interface AvailabilitySlot {
  id: string
  expert_id: string
  start_time: string
  end_time: string
  is_booked: boolean
  created_at: string
}

interface Appointment {
  id: string
  user_id: string
  expert_id: string
  availability_slot_id: string
  title: string
  description?: string
  status: "pending" | "approved" | "declined" | "completed" | "cancelled"
  scheduled_at: string
  duration_minutes: number
  users: {
    full_name: string
    avatar_url?: string
  }
}

interface ExpertCalendarProps {
  expertId: string
  initialAvailabilitySlots: AvailabilitySlot[]
  initialAppointments: Appointment[]
  hourlyRate: number
}

interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  backgroundColor?: string
  borderColor?: string
  textColor?: string
  extendedProps?: {
    type: "availability" | "appointment"
    status?: string
    isBooked?: boolean
    clientName?: string
    clientAvatar?: string
    description?: string
  }
}

interface BulkAvailabilityForm {
  date: string
  startTime: string
  endTime: string
  slotDuration: number
  recurring: boolean
  recurringDays: string[]
  recurringWeeks: number
}

interface QuickCreateForm {
  startTime: string
  endTime: string
  slotDuration: number
  splitIntoSlots: boolean
}

export function ExpertCalendar({ 
  expertId, 
  initialAvailabilitySlots, 
  initialAppointments,
  hourlyRate 
}: ExpertCalendarProps) {
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>(initialAvailabilitySlots)
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false)
  const [isQuickCreateDialogOpen, setIsQuickCreateDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedTimeRange, setSelectedTimeRange] = useState<{start: Date, end: Date} | null>(null)
  const [showInstructions, setShowInstructions] = useState(false)
  const [showStats, setShowStats] = useState(false)
  
  const [bulkForm, setBulkForm] = useState<BulkAvailabilityForm>({
    date: "",
    startTime: "09:00",
    endTime: "17:00",
    slotDuration: 60,
    recurring: false,
    recurringDays: [],
    recurringWeeks: 4
  })

  const [quickCreateForm, setQuickCreateForm] = useState<QuickCreateForm>({
    startTime: "",
    endTime: "",
    slotDuration: 60,
    splitIntoSlots: true
  })

  const supabase = createClient()
  const { toast } = useToast()

  // Convert slots and appointments to calendar events
  const convertToEvents = useCallback(() => {
    const calendarEvents: CalendarEvent[] = []

    // Add availability slots
    availabilitySlots.forEach(slot => {
      calendarEvents.push({
        id: `slot-${slot.id}`,
        title: slot.is_booked ? "Booked" : "Available",
        start: slot.start_time,
        end: slot.end_time,
        backgroundColor: slot.is_booked ? "#ef4444" : "#22c55e",
        borderColor: slot.is_booked ? "#dc2626" : "#16a34a",
        textColor: "#ffffff",
        extendedProps: {
          type: "availability",
          isBooked: slot.is_booked
        }
      })
    })

    // Add appointments
    appointments.forEach(appointment => {
      const statusColors = {
        pending: { bg: "#f59e0b", border: "#d97706" },
        approved: { bg: "#3b82f6", border: "#2563eb" },
        declined: { bg: "#ef4444", border: "#dc2626" },
        completed: { bg: "#10b981", border: "#059669" },
        cancelled: { bg: "#6b7280", border: "#4b5563" }
      }

      const colors = statusColors[appointment.status] || statusColors.pending

      calendarEvents.push({
        id: `appointment-${appointment.id}`,
        title: `${appointment.title} - ${appointment.users.full_name}`,
        start: appointment.scheduled_at,
        end: new Date(new Date(appointment.scheduled_at).getTime() + appointment.duration_minutes * 60000).toISOString(),
        backgroundColor: colors.bg,
        borderColor: colors.border,
        textColor: "#ffffff",
        extendedProps: {
          type: "appointment",
          status: appointment.status,
          clientName: appointment.users.full_name,
          clientAvatar: appointment.users.avatar_url,
          description: appointment.description
        }
      })
    })

    setEvents(calendarEvents)
  }, [availabilitySlots, appointments])

  useEffect(() => {
    convertToEvents()
  }, [convertToEvents])

  // Handle date click (for creating new availability)
  const handleDateClick = (selectInfo: any) => {
    const clickedDate = selectInfo.dateStr || selectInfo.start.toISOString().split('T')[0]
    setSelectedDate(clickedDate)
    setBulkForm(prev => ({ ...prev, date: clickedDate }))
    setIsBulkDialogOpen(true)
  }

  // Handle drag selection (for creating availability slots)
  const handleSelect = (selectInfo: any) => {
    const start = selectInfo.start
    const end = selectInfo.end
    
    setSelectedTimeRange({ start, end })
    setQuickCreateForm({
      startTime: start.toTimeString().slice(0, 5),
      endTime: end.toTimeString().slice(0, 5),
      slotDuration: 60,
      splitIntoSlots: true
    })
    setIsQuickCreateDialogOpen(true)
  }

  // Handle event click (for viewing/editing)
  const handleEventClick = (clickInfo: any) => {
    const event = clickInfo.event
    const calendarEvent: CalendarEvent = {
      id: event.id,
      title: event.title,
      start: event.start.toISOString(),
      end: event.end ? event.end.toISOString() : event.start.toISOString(),
      backgroundColor: event.backgroundColor,
      borderColor: event.borderColor,
      textColor: event.textColor,
      extendedProps: event.extendedProps
    }
    setSelectedEvent(calendarEvent)
    setIsEventDialogOpen(true)
  }

  // Create availability slots from drag selection
  const createQuickAvailability = async () => {
    if (!selectedTimeRange) return

    setIsLoading(true)
    try {
      const slots: Omit<AvailabilitySlot, 'id' | 'created_at'>[] = []

      if (quickCreateForm.splitIntoSlots) {
        // Split into multiple slots based on duration
        let currentTime = new Date(selectedTimeRange.start)
        const endTime = new Date(selectedTimeRange.end)

        while (currentTime < endTime) {
          const slotEnd = new Date(currentTime.getTime() + quickCreateForm.slotDuration * 60 * 1000)
          
          if (slotEnd <= endTime) {
            slots.push({
              expert_id: expertId,
              start_time: currentTime.toISOString(),
              end_time: slotEnd.toISOString(),
              is_booked: false
            })
          }
          
          currentTime = new Date(currentTime.getTime() + quickCreateForm.slotDuration * 60 * 1000)
        }
      } else {
        // Create one big slot for the entire selection
        slots.push({
          expert_id: expertId,
          start_time: selectedTimeRange.start.toISOString(),
          end_time: selectedTimeRange.end.toISOString(),
          is_booked: false
        })
      }

      // Insert slots into database
      const { data, error } = await supabase
        .from('availability_slots')
        .insert(slots)
        .select()

      if (error) throw error

      if (data) {
        setAvailabilitySlots(prev => [...prev, ...data])
        toast({
          title: "Success",
          description: `Created ${data.length} availability slot${data.length > 1 ? 's' : ''}`,
        })
      }

      setIsQuickCreateDialogOpen(false)
      setSelectedTimeRange(null)
      setQuickCreateForm({
        startTime: "",
        endTime: "",
        slotDuration: 60,
        splitIntoSlots: true
      })
    } catch (error) {
      console.error('Error creating availability:', error)
      toast({
        title: "Error",
        description: "Failed to create availability slots",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Create bulk availability slots
  const createBulkAvailability = async () => {
    setIsLoading(true)
    try {
      const slots: Omit<AvailabilitySlot, 'id' | 'created_at'>[] = []
      const startDate = new Date(bulkForm.date)

      const generateSlotsForDate = (date: Date) => {
        const [startHour, startMinute] = bulkForm.startTime.split(':').map(Number)
        const [endHour, endMinute] = bulkForm.endTime.split(':').map(Number)
        
        let currentTime = new Date(date)
        currentTime.setHours(startHour, startMinute, 0, 0)
        
        const endTime = new Date(date)
        endTime.setHours(endHour, endMinute, 0, 0)

        while (currentTime < endTime) {
          const slotEnd = new Date(currentTime.getTime() + bulkForm.slotDuration * 60 * 1000)
          
          if (slotEnd <= endTime) {
            slots.push({
              expert_id: expertId,
              start_time: currentTime.toISOString(),
              end_time: slotEnd.toISOString(),
              is_booked: false
            })
          }
          
          currentTime = new Date(currentTime.getTime() + bulkForm.slotDuration * 60 * 1000)
        }
      }

      if (bulkForm.recurring && bulkForm.recurringDays.length > 0) {
        // Generate recurring slots
        for (let week = 0; week < bulkForm.recurringWeeks; week++) {
          bulkForm.recurringDays.forEach(dayStr => {
            const dayOfWeek = parseInt(dayStr) // 0 = Sunday, 1 = Monday, etc.
            const date = new Date(startDate)
            date.setDate(date.getDate() + (week * 7) + (dayOfWeek - startDate.getDay()))
            
            if (date >= startDate) {
              generateSlotsForDate(date)
            }
          })
        }
      } else {
        // Generate slots for single date
        generateSlotsForDate(startDate)
      }

      // Insert slots into database
      const { data, error } = await supabase
        .from('availability_slots')
        .insert(slots)
        .select()

      if (error) throw error

      if (data) {
        setAvailabilitySlots(prev => [...prev, ...data])
        toast({
          title: "Success",
          description: `Created ${data.length} availability slots`,
        })
      }

      setIsBulkDialogOpen(false)
      setBulkForm({
        date: "",
        startTime: "09:00",
        endTime: "17:00",
        slotDuration: 60,
        recurring: false,
        recurringDays: [],
        recurringWeeks: 4
      })
    } catch (error) {
      console.error('Error creating availability:', error)
      toast({
        title: "Error",
        description: "Failed to create availability slots",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Delete availability slot
  const deleteAvailabilitySlot = async (slotId: string) => {
    try {
      const { error } = await supabase
        .from('availability_slots')
        .delete()
        .eq('id', slotId)

      if (error) throw error

      setAvailabilitySlots(prev => prev.filter(slot => slot.id !== slotId))
      toast({
        title: "Success",
        description: "Availability slot deleted",
      })
      setIsEventDialogOpen(false)
    } catch (error) {
      console.error('Error deleting slot:', error)
      toast({
        title: "Error",
        description: "Failed to delete availability slot",
        variant: "destructive",
      })
    }
  }

  // Update appointment status
  const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId)

      if (error) throw error

      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId ? { ...apt, status: status as any } : apt
        )
      )

      toast({
        title: "Success",
        description: `Appointment ${status}`,
      })
      setIsEventDialogOpen(false)
    } catch (error) {
      console.error('Error updating appointment:', error)
      toast({
        title: "Error",
        description: "Failed to update appointment",
        variant: "destructive",
      })
    }
  }

  const getEventDetails = (event: CalendarEvent) => {
    if (event.extendedProps?.type === "availability") {
      const slotId = event.id.replace('slot-', '')
      const slot = availabilitySlots.find(s => s.id === slotId)
      return { type: "availability", data: slot }
    } else if (event.extendedProps?.type === "appointment") {
      const appointmentId = event.id.replace('appointment-', '')
      const appointment = appointments.find(a => a.id === appointmentId)
      return { type: "appointment", data: appointment }
    }
    return null
  }

  return (
    <div className="space-y-4">
      {/* Usage Instructions */}
      {showInstructions && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MousePointer className="h-4 w-4 text-blue-600" />
              How to Use Your Calendar
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Creating Availability</h4>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  <li>• <strong>Drag</strong> on the calendar to select time ranges</li>
                  <li>• <strong>Click</strong> on a date for bulk scheduling</li>
                  <li>• Use "Add Availability" button for advanced options</li>
                </ul>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Managing Appointments</h4>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  <li>• <strong>Click</strong> any event to view details</li>
                  <li>• Approve/decline pending appointments</li>
                  <li>• Delete unused availability slots</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar Stats */}
      {showStats && (
        <div className="grid gap-3 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-sm font-medium">Available Slots</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-1">
              <div className="text-xl font-bold">
                {availabilitySlots.filter(slot => !slot.is_booked).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Open for booking
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-sm font-medium">Booked Slots</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-1">
              <div className="text-xl font-bold">
                {availabilitySlots.filter(slot => slot.is_booked).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently booked
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-sm font-medium">Pending Appointments</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-1">
              <div className="text-xl font-bold">
                {appointments.filter(apt => apt.status === "pending").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting response
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-sm font-medium">Hourly Rate</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-1">
              <div className="text-xl font-bold">${hourlyRate}</div>
              <p className="text-xs text-muted-foreground">
                Per consultation
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Calendar Controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Calendar</CardTitle>
              <CardDescription className="text-sm">
                Drag to select time ranges, click dates for bulk scheduling, or click events to manage them.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowInstructions(!showInstructions)}
              >
                {showInstructions ? "Hide" : "Show"} Instructions
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStats(!showStats)}
              >
                {showStats ? "Hide" : "Show"} Statistics
              </Button>
              <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Availability
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Availability Slots</DialogTitle>
                    <DialogDescription>
                      Create availability slots for clients to book consultations
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={bulkForm.date}
                        onChange={(e) => setBulkForm(prev => ({ ...prev, date: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startTime">Start Time</Label>
                        <Input
                          id="startTime"
                          type="time"
                          value={bulkForm.startTime}
                          onChange={(e) => setBulkForm(prev => ({ ...prev, startTime: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endTime">End Time</Label>
                        <Input
                          id="endTime"
                          type="time"
                          value={bulkForm.endTime}
                          onChange={(e) => setBulkForm(prev => ({ ...prev, endTime: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="slotDuration">Slot Duration (minutes)</Label>
                      <Select 
                        value={bulkForm.slotDuration.toString()} 
                        onValueChange={(value) => setBulkForm(prev => ({ ...prev, slotDuration: parseInt(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="90">1.5 hours</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="recurring"
                          checked={bulkForm.recurring}
                          onCheckedChange={(checked) => setBulkForm(prev => ({ ...prev, recurring: checked }))}
                        />
                        <Label htmlFor="recurring">Recurring weekly</Label>
                      </div>
                    </div>

                    {bulkForm.recurring && (
                      <>
                        <div className="space-y-2">
                          <Label>Repeat on days</Label>
                          <div className="grid grid-cols-7 gap-1">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                              <Button
                                key={day}
                                type="button"
                                variant={bulkForm.recurringDays.includes(index.toString()) ? "default" : "outline"}
                                size="sm"
                                className="text-xs"
                                onClick={() => {
                                  const dayStr = index.toString()
                                  setBulkForm(prev => ({
                                    ...prev,
                                    recurringDays: prev.recurringDays.includes(dayStr)
                                      ? prev.recurringDays.filter(d => d !== dayStr)
                                      : [...prev.recurringDays, dayStr]
                                  }))
                                }}
                              >
                                {day}
                              </Button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="recurringWeeks">Number of weeks</Label>
                          <Select 
                            value={bulkForm.recurringWeeks.toString()} 
                            onValueChange={(value) => setBulkForm(prev => ({ ...prev, recurringWeeks: parseInt(value) }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 week</SelectItem>
                              <SelectItem value="2">2 weeks</SelectItem>
                              <SelectItem value="4">4 weeks</SelectItem>
                              <SelectItem value="8">8 weeks</SelectItem>
                              <SelectItem value="12">12 weeks</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}

                    <Button 
                      onClick={createBulkAvailability} 
                      disabled={isLoading || !bulkForm.date}
                      className="w-full"
                    >
                      {isLoading ? "Creating..." : "Create Availability"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="calendar-container">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              events={events}
              dateClick={handleDateClick}
              select={handleSelect}
              eventClick={handleEventClick}
              height="500px"
              slotMinTime="06:00:00"
              slotMaxTime="22:00:00"
              businessHours={{
                daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
                startTime: '09:00',
                endTime: '18:00',
              }}
              weekends={true}
              selectable={true}
              selectMirror={true}
              nowIndicator={true}
              eventOverlap={false}
              eventConstraint="businessHours"
              selectConstraint="businessHours"
              unselectAuto={true}
              longPressDelay={300}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Create Dialog (from drag selection) */}
      {selectedTimeRange && (
        <Dialog open={isQuickCreateDialogOpen} onOpenChange={setIsQuickCreateDialogOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-4 w-4" />
                Create Availability
              </DialogTitle>
              <DialogDescription className="text-sm">
                {selectedTimeRange.start.toLocaleDateString()} • {selectedTimeRange.start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {selectedTimeRange.end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="splitIntoSlots"
                    checked={quickCreateForm.splitIntoSlots}
                    onCheckedChange={(checked) => setQuickCreateForm(prev => ({ ...prev, splitIntoSlots: checked }))}
                  />
                  <Label htmlFor="splitIntoSlots" className="text-sm">Split into multiple slots</Label>
                </div>
              </div>

              {quickCreateForm.splitIntoSlots && (
                <div className="space-y-2">
                  <Label htmlFor="quickSlotDuration" className="text-sm">Slot Duration (minutes)</Label>
                  <Select 
                    value={quickCreateForm.slotDuration.toString()} 
                    onValueChange={(value) => setQuickCreateForm(prev => ({ ...prev, slotDuration: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="p-2 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">
                  {quickCreateForm.splitIntoSlots ? (
                    <>
                      Will create{" "}
                      <span className="font-medium">
                        {Math.floor((selectedTimeRange.end.getTime() - selectedTimeRange.start.getTime()) / (quickCreateForm.slotDuration * 60 * 1000))}
                      </span>{" "}
                      slots of {quickCreateForm.slotDuration} minutes each
                    </>
                  ) : (
                    <>
                      Will create{" "}
                      <span className="font-medium">1 slot</span>{" "}
                      for the entire {Math.round((selectedTimeRange.end.getTime() - selectedTimeRange.start.getTime()) / (60 * 1000))} minute period
                    </>
                  )}
                </p>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setIsQuickCreateDialogOpen(false)
                    setSelectedTimeRange(null)
                  }}
                  className="flex-1"
                  size="sm"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={createQuickAvailability} 
                  disabled={isLoading}
                  className="flex-1"
                  size="sm"
                >
                  {isLoading ? "Creating..." : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Event Details Dialog */}
      {selectedEvent && (
        <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-lg">
                {selectedEvent.extendedProps?.type === "availability" ? "Availability Slot" : "Appointment"}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {new Date(selectedEvent.start).toLocaleString()} - {new Date(selectedEvent.end).toLocaleString()}
              </DialogDescription>
            </DialogHeader>

            {selectedEvent.extendedProps?.type === "availability" ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">Status:</span>
                  <Badge variant={selectedEvent.extendedProps.isBooked ? "destructive" : "default"}>
                    {selectedEvent.extendedProps.isBooked ? "Booked" : "Available"}
                  </Badge>
                </div>
                
                {!selectedEvent.extendedProps.isBooked && (
                  <Button
                    variant="destructive"
                    onClick={() => deleteAvailabilitySlot(selectedEvent.id.replace('slot-', ''))}
                    className="w-full"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Availability Slot
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={selectedEvent.extendedProps?.clientAvatar || ""} />
                    <AvatarFallback className="text-xs">
                      {selectedEvent.extendedProps?.clientName
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{selectedEvent.extendedProps?.clientName}</p>
                    <p className="text-xs text-muted-foreground">{selectedEvent.title}</p>
                  </div>
                </div>

                {selectedEvent.extendedProps?.description && (
                  <div className="p-2 bg-muted rounded-lg">
                    <p className="text-xs">{selectedEvent.extendedProps.description}</p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">Status:</span>
                  <Badge variant={
                    selectedEvent.extendedProps?.status === "approved" ? "default" :
                    selectedEvent.extendedProps?.status === "pending" ? "secondary" :
                    selectedEvent.extendedProps?.status === "declined" ? "destructive" :
                    selectedEvent.extendedProps?.status === "completed" ? "default" : "secondary"
                  }>
                    {selectedEvent.extendedProps?.status}
                  </Badge>
                </div>

                {selectedEvent.extendedProps?.status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => updateAppointmentStatus(selectedEvent.id.replace('appointment-', ''), 'approved')}
                      className="flex-1"
                      size="sm"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => updateAppointmentStatus(selectedEvent.id.replace('appointment-', ''), 'declined')}
                      className="flex-1"
                      size="sm"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Decline
                    </Button>
                  </div>
                )}

                {selectedEvent.extendedProps?.status === "approved" && (
                  <Button
                    variant="outline"
                    onClick={() => updateAppointmentStatus(selectedEvent.id.replace('appointment-', ''), 'completed')}
                    className="w-full"
                    size="sm"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Completed
                  </Button>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Legend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Calendar Legend</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-xs">Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-xs">Booked</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className="text-xs">Pending</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-xs">Approved</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-500 rounded"></div>
              <span className="text-xs">Completed</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 