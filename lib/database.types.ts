export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          role: "user" | "expert"
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          role?: "user" | "expert"
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: "user" | "expert"
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      expert_profiles: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          expertise_areas: string[]
          hourly_rate: number | null
          subscription_type: "free" | "premium"
          is_available: boolean
          rating: number
          total_reviews: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          expertise_areas?: string[]
          hourly_rate?: number | null
          subscription_type?: "free" | "premium"
          is_available?: boolean
          rating?: number
          total_reviews?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          expertise_areas?: string[]
          hourly_rate?: number | null
          subscription_type?: "free" | "premium"
          is_available?: boolean
          rating?: number
          total_reviews?: number
          created_at?: string
          updated_at?: string
        }
      }
      appointments: {
        Row: {
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
        }
        Insert: {
          id?: string
          user_id: string
          expert_id: string
          availability_slot_id: string
          title: string
          description?: string | null
          status?: "pending" | "approved" | "declined" | "completed" | "cancelled"
          scheduled_at: string
          duration_minutes?: number
          meeting_url?: string | null
          livekit_room_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          expert_id?: string
          availability_slot_id?: string
          title?: string
          description?: string | null
          status?: "pending" | "approved" | "declined" | "completed" | "cancelled"
          scheduled_at?: string
          duration_minutes?: number
          meeting_url?: string | null
          livekit_room_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      availability_slots: {
        Row: {
          id: string
          expert_id: string
          start_time: string
          end_time: string
          is_booked: boolean
          created_at: string
        }
        Insert: {
          id?: string
          expert_id: string
          start_time: string
          end_time: string
          is_booked?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          expert_id?: string
          start_time?: string
          end_time?: string
          is_booked?: boolean
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          appointment_id: string
          sender_id: string
          content: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          appointment_id: string
          sender_id: string
          content: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          appointment_id?: string
          sender_id?: string
          content?: string
          is_read?: boolean
          created_at?: string
        }
      }
    }
  }
}
