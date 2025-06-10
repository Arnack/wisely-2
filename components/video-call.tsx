"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Room, RoomEvent, DisconnectReason } from "livekit-client"
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
  ConnectionStateToast,
} from "@livekit/components-react"
import "@livekit/components-styles"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff,
  Monitor,
  MessageSquare,
  Users,
  Clock,
  AlertCircle,
  CheckCircle
} from "lucide-react"

interface VideoCallProps {
  roomName: string
  userName: string
  userEmail: string
  appointmentId?: string
}

// LiveKit server URL - needs NEXT_PUBLIC_ prefix for client-side access
const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL || ""

export function VideoCall({ roomName, userName, userEmail, appointmentId }: VideoCallProps) {
  const [token, setToken] = useState<string>("")
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [callDuration, setCallDuration] = useState(0)
  const [participantCount, setParticipantCount] = useState(1)
  const [showChat, setShowChat] = useState(false)
  const [appointment, setAppointment] = useState<any>(null)

  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  // Check if we have a real LiveKit server configured
  const hasRealLiveKit = LIVEKIT_URL && LIVEKIT_URL !== ""

  // Fetch appointment details if appointmentId is provided
  useEffect(() => {
    if (appointmentId) {
      fetchAppointmentDetails()
    }
  }, [appointmentId])

  const fetchAppointmentDetails = async () => {
    try {
      const { data } = await supabase
        .from("appointments")
        .select(`
          *,
          expert_profiles(
            title,
            users(full_name)
          ),
          users(full_name)
        `)
        .eq("id", appointmentId)
        .single()

      if (data) {
        setAppointment(data)
      }
    } catch (error) {
      console.error("Error fetching appointment:", error)
    }
  }

  // Generate access token for LiveKit
  const generateToken = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Only try to generate real token if we have a LiveKit server configured
      if (hasRealLiveKit) {
        const response = await fetch("/api/livekit/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roomName,
            participantName: userName,
            participantIdentity: userEmail,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          setToken(data.token)
          setIsLoading(false)
          return
        }
      }
      
      // Fallback to mock token if no real server or if request failed
      console.log("Using mock token - LiveKit server not configured or unavailable")
      setToken("mock-token-for-demo")
    } catch (error) {
      console.error("Error generating token:", error)
      // Use mock token as fallback
      setToken("mock-token-for-demo")
    } finally {
      setIsLoading(false)
    }
  }, [roomName, userName, userEmail, hasRealLiveKit])

  useEffect(() => {
    generateToken()
  }, [generateToken])

  // Track call duration
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isConnected) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isConnected])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleDisconnect = useCallback(async () => {
    // Update appointment status or log call completion
    if (appointmentId && callDuration > 60) { // Only if call lasted more than 1 minute
      try {
        await supabase
          .from("appointments")
          .update({ 
            status: "completed",
            updated_at: new Date().toISOString()
          })
          .eq("id", appointmentId)

        toast({
          title: "Call Completed",
          description: "The consultation has been marked as completed.",
        })
      } catch (error) {
        console.error("Error updating appointment:", error)
      }
    }

    router.push("/appointments")
  }, [appointmentId, callDuration, router, supabase, toast])

  const handleRoomConnected = useCallback(() => {
    setIsConnected(true)
    setError(null)
    
    toast({
      title: "Connected",
      description: "You've successfully joined the call",
    })
  }, [toast])

  const handleRoomDisconnected = useCallback(() => {
    setIsConnected(false)
    handleDisconnect()
  }, [handleDisconnect])

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Joining Call...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
              <p className="text-sm text-muted-foreground">
                Preparing your video call experience...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Connection Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm">{error}</p>
              <div className="flex gap-2">
                <Button onClick={generateToken} className="flex-1">
                  Try Again
                </Button>
                <Button variant="outline" onClick={() => router.back()} className="flex-1">
                  Go Back
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Real LiveKit implementation (when server is configured)
  if (hasRealLiveKit && token !== "mock-token-for-demo") {
    return (
      <div className="h-screen">
        <LiveKitRoom
          video={true}
          audio={true}
          token={token}
          serverUrl={LIVEKIT_URL}
          data-lk-theme="default"
          style={{ height: "100vh" }}
          onConnected={handleRoomConnected}
          onDisconnected={handleRoomDisconnected}
        >
          {/* Call Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-black/50 text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-lg font-semibold">Video Call</h1>
                {appointment && (
                  <span className="text-sm opacity-90">{appointment.title}</span>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-mono">{formatDuration(callDuration)}</span>
                </div>
                <Badge variant="secondary">
                  <Users className="h-3 w-3 mr-1" />
                  {participantCount}
                </Badge>
              </div>
            </div>
          </div>

          {/* Main Video Conference */}
          <VideoConference />
          
          {/* Audio Renderer */}
          <RoomAudioRenderer />
          
          {/* Connection Toast */}
          <ConnectionStateToast />
        </LiveKitRoom>
      </div>
    )
  }

  // Mock implementation for demo - used when no real LiveKit server is configured
  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold">Video Call</h1>
              {!hasRealLiveKit && (
                <Badge variant="outline" className="text-xs">
                  Demo Mode
                </Badge>
              )}
            </div>
            {appointment && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>•</span>
                <span>{appointment.title}</span>
                {appointment.expert_profiles && (
                  <>
                    <span>with</span>
                    <span className="font-medium">{appointment.expert_profiles.users.full_name}</span>
                  </>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-mono">{formatDuration(callDuration)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="text-sm">{participantCount}</span>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          </div>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 flex">
        {/* Main Video */}
        <div className="flex-1 bg-gray-800 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white space-y-4">
              <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center mx-auto">
                <Video className="h-16 w-16 text-gray-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">{userName}</h3>
                <p className="text-gray-400">
                  {hasRealLiveKit ? "Connecting to LiveKit..." : "Demo Video Call Interface"}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {hasRealLiveKit 
                    ? "Please wait while we connect you to the video call..." 
                    : "This is a demo interface. Configure LiveKit server for real video calls."
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Participant Video (Demo) */}
          <div className="absolute top-4 right-4 w-48 h-36 bg-gray-700 rounded-lg border-2 border-white">
            <div className="h-full flex items-center justify-center text-white text-sm">
              Participant Video
            </div>
          </div>
        </div>

        {/* Chat Panel */}
        {showChat && (
          <div className="w-80 bg-white border-l flex flex-col">
            <div className="p-4 border-b">
              <h3 className="font-semibold flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Chat
              </h3>
            </div>
            <div className="flex-1 p-4 space-y-3 text-sm">
              <div className="bg-gray-100 p-2 rounded">
                <strong>System:</strong> Call started
              </div>
              <div className="bg-blue-50 p-2 rounded">
                <strong>You:</strong> Hello! Ready for our consultation.
              </div>
            </div>
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Type a message..." 
                  className="flex-1 px-3 py-2 border rounded text-sm"
                />
                <Button size="sm">Send</Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-white border-t p-4">
        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" size="sm">
            <Mic className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Monitor className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowChat(!showChat)}
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={handleDisconnect}
          >
            <PhoneOff className="h-4 w-4 mr-2" />
            End Call
          </Button>
        </div>
      </div>
    </div>
  )
} 