import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Clock } from "lucide-react"
import Link from "next/link"

export default async function ExpertsPage() {
  const supabase = await createClient()

  // Get all expert profiles with user data
  const { data: experts } = await supabase
    .from("expert_profiles")
    .select(`
      *,
      users!inner(
        full_name,
        avatar_url
      )
    `)
    .eq("is_available", true)
    .order("rating", { ascending: false })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Find Experts</h1>
        <p className="text-muted-foreground">Browse and connect with verified experts in various fields</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">{/* TODO: Add search and filter components */}</div>
      </div>

      {/* Experts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {experts?.map((expert) => (
          <Card key={expert.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={expert.users.avatar_url || ""} />
                  <AvatarFallback>
                    {expert.users.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg">{expert.users.full_name}</CardTitle>
                  <CardDescription>{expert.title}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="ml-1 text-sm font-medium">{expert.rating.toFixed(1)}</span>
                </div>
                <span className="text-sm text-muted-foreground">({expert.total_reviews} reviews)</span>
              </div>

              {expert.description && <p className="text-sm text-muted-foreground line-clamp-3">{expert.description}</p>}

              {expert.expertise_areas && expert.expertise_areas.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {expert.expertise_areas.slice(0, 3).map((area, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {area}
                    </Badge>
                  ))}
                  {expert.expertise_areas.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{expert.expertise_areas.length - 3} more
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">${expert.hourly_rate}/hour</span>
                </div>
                <Badge variant={expert.subscription_type === "premium" ? "default" : "outline"}>
                  {expert.subscription_type}
                </Badge>
              </div>

              <Button asChild className="w-full">
                <Link href={`/experts/${expert.id}`}>View Profile</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {!experts ||
        (experts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No experts found. Check back later!</p>
          </div>
        ))}
    </div>
  )
}
