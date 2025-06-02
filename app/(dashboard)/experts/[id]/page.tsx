import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Clock, Calendar } from "lucide-react"
import { BookingForm } from "@/components/booking-form"

interface ExpertProfilePageProps {
  params: {
    id: string
  }
}

export default async function ExpertProfilePage({ params }: ExpertProfilePageProps) {
  const supabase = await createClient()

  // Get expert profile with user data
  const { data: expert } = await supabase
    .from("expert_profiles")
    .select(`
      *,
      users!inner(
        full_name,
        avatar_url,
        email
      )
    `)
    .eq("id", params.id)
    .single()

  if (!expert) {
    notFound()
  }

  // Get available slots for the next 30 days
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

  const { data: availableSlots } = await supabase
    .from("availability_slots")
    .select("*")
    .eq("expert_id", params.id)
    .eq("is_booked", false)
    .gte("start_time", new Date().toISOString())
    .lte("start_time", thirtyDaysFromNow.toISOString())
    .order("start_time", { ascending: true })

  return (
    <div className="space-y-8">
      <div className="grid gap-8 md:grid-cols-3">
        {/* Expert Info */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={expert.users.avatar_url || ""} />
                  <AvatarFallback className="text-lg">
                    {expert.users.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-2xl">{expert.users.full_name}</CardTitle>
                  <CardDescription className="text-lg">{expert.title}</CardDescription>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="ml-1 font-medium">{expert.rating.toFixed(1)}</span>
                      <span className="ml-1 text-muted-foreground">({expert.total_reviews} reviews)</span>
                    </div>
                    <Badge variant={expert.subscription_type === "premium" ? "default" : "outline"}>
                      {expert.subscription_type}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">${expert.hourly_rate}/hour</span>
              </div>

              {expert.description && (
                <div>
                  <h3 className="font-semibold mb-2">About</h3>
                  <p className="text-muted-foreground">{expert.description}</p>
                </div>
              )}

              {expert.expertise_areas && expert.expertise_areas.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Expertise Areas</h3>
                  <div className="flex flex-wrap gap-2">
                    {expert.expertise_areas.map((area, index) => (
                      <Badge key={index} variant="secondary">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Booking Form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Book Consultation
              </CardTitle>
              <CardDescription>Select an available time slot to book your consultation</CardDescription>
            </CardHeader>
            <CardContent>
              <BookingForm
                expertId={expert.id}
                availableSlots={availableSlots || []}
                hourlyRate={expert.hourly_rate || 0}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
