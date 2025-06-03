import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { AccessToken } from "livekit-server-sdk"

// LiveKit configuration - these should be environment variables in production
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || "devkey"
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || "secret"

export async function POST(request: NextRequest) {
  try {
    const { roomName, participantName, participantIdentity } = await request.json()

    if (!roomName || !participantName || !participantIdentity) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      )
    }

    // Verify user authentication
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Verify user has access to this room (based on appointment or expert profile)
    // Room name format: appointment-{appointmentId} or expert-{expertId}-{timestamp}
    if (roomName.startsWith("appointment-")) {
      const appointmentId = roomName.replace("appointment-", "")
      
      const { data: appointment } = await supabase
        .from("appointments")
        .select(`
          *,
          expert_profiles!inner(user_id)
        `)
        .eq("id", appointmentId)
        .eq("status", "approved")
        .single()

      if (!appointment) {
        return NextResponse.json(
          { error: "Appointment not found or not approved" },
          { status: 404 }
        )
      }

      // Check if user is either the client or the expert
      const isClient = appointment.user_id === user.id
      const isExpert = appointment.expert_profiles.user_id === user.id

      if (!isClient && !isExpert) {
        return NextResponse.json(
          { error: "Access denied" },
          { status: 403 }
        )
      }

      // Check if appointment is within the allowed time window
      const appointmentTime = new Date(appointment.scheduled_at)
      const now = new Date()
      const timeDiff = appointmentTime.getTime() - now.getTime()
      const fifteenMinutes = 15 * 60 * 1000
      const thirtyMinutes = 30 * 60 * 1000

      if (timeDiff > fifteenMinutes || timeDiff < -thirtyMinutes) {
        return NextResponse.json(
          { error: "Call is not available at this time" },
          { status: 403 }
        )
      }
    }

    // Create LiveKit access token
    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: participantIdentity,
      name: participantName,
      // Token expires in 24 hours
      ttl: 24 * 60 * 60,
    })

    // Grant permissions
    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      canUpdateOwnMetadata: true,
    })

    const token = at.toJwt()

    // Log the call initiation
    try {
      await supabase
        .from("call_logs")
        .insert({
          room_name: roomName,
          participant_identity: participantIdentity,
          participant_name: participantName,
          user_id: user.id,
          started_at: new Date().toISOString(),
        })
    } catch (error) {
      console.error("Error logging call:", error)
      // Don't fail the token generation if logging fails
    }

    return NextResponse.json({ token })
  } catch (error) {
    console.error("Error generating LiveKit token:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 