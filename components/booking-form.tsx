"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Clock } from "lucide-react"

interface BookingFormProps {
  expertId: string
  availableSlots: Array<{
    id: string
    start_time: string
    end_time: string
  }>
  hourlyRate: number
}

export function BookingForm({ expertId, availableSlots, hourlyRate }: BookingFormProps) {
  const [selectedSlot, setSelectedSlot] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSlot || !title.trim()) return

    setIsLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to book an appointment.",
          variant: "destructive",
        })
        router.push("/login")
        return
      }

      const slot = availableSlots.find((s) => s.id === selectedSlot)
      if (!slot) {
        toast({
          title: "Error",
          description: "Selected time slot is no longer available.",
          variant: "destructive",
        })
        return
      }

      // Create appointment
      const { error } = await supabase.from("appointments").insert({
        user_id: user.id,
        expert_id: expertId,
        availability_slot_id: selectedSlot,
        title: title.trim(),
        description: description.trim() || null,
        scheduled_at: slot.start_time,
        status: "pending",
      })

      if (error) {
        toast({
          title: "Error",
          description: "Failed to book appointment. Please try again.",
          variant: "destructive",
        })
        return
      }

      // Mark slot as booked
      await supabase.from("availability_slots").update({ is_booked: true }).eq("id", selectedSlot)

      toast({
        title: "Success",
        description: "Appointment request sent! The expert will review and respond soon.",
      })

      router.push("/appointments")
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
  }

  const groupSlotsByDate = () => {
    const grouped: { [key: string]: typeof availableSlots } = {}

    availableSlots.forEach((slot) => {
      const date = new Date(slot.start_time).toLocaleDateString()
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(slot)
    })

    return grouped
  }

  const groupedSlots = groupSlotsByDate()

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Consultation Topic</Label>
        <Input
          id="title"
          placeholder="What would you like to discuss?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Additional Details (Optional)</Label>
        <Textarea
          id="description"
          placeholder="Provide any additional context or questions..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Select Time Slot</Label>
        {Object.keys(groupedSlots).length > 0 ? (
          <Select value={selectedSlot} onValueChange={setSelectedSlot}>
            <SelectTrigger>
              <SelectValue placeholder="Choose an available time" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(groupedSlots).map(([date, slots]) => (
                <div key={date}>
                  <div className="px-2 py-1 text-sm font-semibold text-muted-foreground">{date}</div>
                  {slots.map((slot) => {
                    const { time } = formatDateTime(slot.start_time)
                    const endTime = formatDateTime(slot.end_time).time
                    return (
                      <SelectItem key={slot.id} value={slot.id}>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>
                            {time} - {endTime}
                          </span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </div>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-2" />
            <p>No available time slots</p>
            <p className="text-sm">Please check back later</p>
          </div>
        )}
      </div>

      {selectedSlot && (
        <div className="p-3 bg-muted rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Consultation Fee:</span>
            <span className="font-semibold">${hourlyRate}/hour</span>
          </div>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={!selectedSlot || !title.trim() || isLoading}>
        {isLoading ? "Booking..." : "Request Appointment"}
      </Button>
    </form>
  )
}
