import { VideoCall } from "@/components/video-call"

export default function TestCallPage() {
  // Mock data for testing
  const mockAppointment = {
    id: "test-appointment-123",
    title: "Business Strategy Consultation",
    description: "Discussing growth strategies and market expansion",
    scheduled_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes from now
    duration_minutes: 60,
    status: "approved" as const,
    meeting_url: "/call/test-room?appointmentId=test-appointment-123",
    meeting_room_name: "test-room",
    expert_profiles: {
      title: "Business Strategy Expert",
      hourly_rate: 150,
      users: {
        full_name: "John Smith",
        avatar_url: null
      }
    }
  }

  return (
    <div className="h-screen w-full">
      <VideoCall
        roomName="test-room"
        userName="Test User"
        userEmail="test@example.com"
        appointmentId="test-appointment-123"
      />
    </div>
  )
} 