"use client"

import { useState, useMemo, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Search, 
  Filter, 
  Star, 
  Clock, 
  Grid, 
  List, 
  SlidersHorizontal,
  MapPin,
  TrendingUp,
  Users,
  DollarSign,
  Award,
  ChevronDown,
  X,
  Loader2,
  Calendar,
  MessageSquare,
  RotateCcw
} from "lucide-react"
import Link from "next/link"

interface ExpertData {
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
  users: {
    full_name: string
    avatar_url: string | null
    email: string
  }
}

interface ExpertsSearchProps {
  initialExperts: ExpertData[]
  expertiseAreas: string[]
}

interface SearchFilters {
  searchTerm: string
  selectedExpertise: string[]
  minRating: number
  maxHourlyRate: number
  subscriptionType: "all" | "free" | "premium"
  sortBy: "rating" | "price" | "reviews" | "newest"
  sortOrder: "asc" | "desc"
}

const ITEMS_PER_PAGE = 12

export function ExpertsSearch({ initialExperts, expertiseAreas }: ExpertsSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [experts, setExperts] = useState<ExpertData[]>(initialExperts)
  const [isLoading, setIsLoading] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [currentPage, setCurrentPage] = useState(1)
  
  // Current search filters (what user is editing)
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: searchParams.get("search") || "",
    selectedExpertise: searchParams.get("expertise")?.split(",").filter(Boolean) || [],
    minRating: Number(searchParams.get("minRating")) || 0,
    maxHourlyRate: Number(searchParams.get("maxRate")) || 500,
    subscriptionType: (searchParams.get("type") as "all" | "free" | "premium") || "all",
    sortBy: (searchParams.get("sortBy") as "rating" | "price" | "reviews" | "newest") || "rating",
    sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc"
  })

  // Applied filters (what's actually being used for search)
  const [appliedFilters, setAppliedFilters] = useState<SearchFilters>(filters)

  const supabase = createClient()

  // Fetch experts with filters
  const fetchExperts = useCallback(async (searchFilters: SearchFilters) => {
    setIsLoading(true)
    try {
      let query = supabase
        .from("expert_profiles")
        .select(`
          *,
          users!inner(
            full_name,
            avatar_url,
            email
          )
        `)
        .eq("is_available", true)

      // Apply filters
      if (searchFilters.minRating > 0) {
        query = query.gte("rating", searchFilters.minRating)
      }

      if (searchFilters.maxHourlyRate < 500) {
        query = query.lte("hourly_rate", searchFilters.maxHourlyRate)
      }

      if (searchFilters.subscriptionType !== "all") {
        query = query.eq("subscription_type", searchFilters.subscriptionType)
      }

      // Apply sorting
      const sortColumn = searchFilters.sortBy === "price" ? "hourly_rate" : 
                        searchFilters.sortBy === "reviews" ? "total_reviews" :
                        searchFilters.sortBy === "newest" ? "created_at" : "rating"
      
      query = query.order(sortColumn, { ascending: searchFilters.sortOrder === "asc" })

      const { data, error } = await query

      if (error) throw error

      let filteredData = data || []

      // Apply text search and expertise filters on client side for better UX
      if (searchFilters.searchTerm) {
        const searchLower = searchFilters.searchTerm.toLowerCase()
        filteredData = filteredData.filter(expert =>
          expert.users.full_name.toLowerCase().includes(searchLower) ||
          expert.title.toLowerCase().includes(searchLower) ||
          expert.description?.toLowerCase().includes(searchLower) ||
          expert.expertise_areas.some((area: string) => area.toLowerCase().includes(searchLower))
        )
      }

      if (searchFilters.selectedExpertise.length > 0) {
        filteredData = filteredData.filter(expert =>
          searchFilters.selectedExpertise.some(skill =>
            expert.expertise_areas.includes(skill)
          )
        )
      }

      setExperts(filteredData)
    } catch (error) {
      console.error("Error fetching experts:", error)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  // Apply search when button is clicked
  const handleSearch = useCallback(() => {
    setAppliedFilters(filters)
    setCurrentPage(1)
    fetchExperts(filters)
    
    // Update URL
    const params = new URLSearchParams()
    if (filters.searchTerm) params.set("search", filters.searchTerm)
    if (filters.selectedExpertise.length > 0) params.set("expertise", filters.selectedExpertise.join(","))
    if (filters.minRating > 0) params.set("minRating", filters.minRating.toString())
    if (filters.maxHourlyRate < 500) params.set("maxRate", filters.maxHourlyRate.toString())
    if (filters.subscriptionType !== "all") params.set("type", filters.subscriptionType)
    if (filters.sortBy !== "rating") params.set("sortBy", filters.sortBy)
    if (filters.sortOrder !== "desc") params.set("sortOrder", filters.sortOrder)

    const newUrl = params.toString() ? `?${params.toString()}` : ""
    router.replace(`/experts${newUrl}`, { scroll: false })
  }, [filters, fetchExperts, router])

  // Handle Enter key in search input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // Filtered and paginated results
  const paginatedExperts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return experts.slice(startIndex, endIndex)
  }, [experts, currentPage])

  const totalPages = Math.ceil(experts.length / ITEMS_PER_PAGE)

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    const defaultFilters = {
      searchTerm: "",
      selectedExpertise: [],
      minRating: 0,
      maxHourlyRate: 500,
      subscriptionType: "all" as const,
      sortBy: "rating" as const,
      sortOrder: "desc" as const
    }
    setFilters(defaultFilters)
    setAppliedFilters(defaultFilters)
    setCurrentPage(1)
    fetchExperts(defaultFilters)
    router.replace("/experts", { scroll: false })
  }

  const toggleExpertise = (expertise: string) => {
    const newSelected = filters.selectedExpertise.includes(expertise)
      ? filters.selectedExpertise.filter(e => e !== expertise)
      : [...filters.selectedExpertise, expertise]
    updateFilter("selectedExpertise", newSelected)
  }

  const ExpertCard = ({ expert, isListView = false }: { expert: ExpertData, isListView?: boolean }) => {
    if (isListView) {
      return (
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={expert.users.avatar_url || ""} />
                <AvatarFallback className="text-lg">
                  {expert.users.full_name
                    .split(" ")
                    .map(n => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">{expert.users.full_name}</h3>
                    <p className="text-muted-foreground">{expert.title}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{expert.rating.toFixed(1)}</span>
                      <span className="text-sm text-muted-foreground">({expert.total_reviews})</span>
                    </div>
                    <p className="text-lg font-semibold">${expert.hourly_rate}/hour</p>
                  </div>
                </div>

                {expert.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {expert.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {expert.expertise_areas.slice(0, 4).map((area, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {area}
                      </Badge>
                    ))}
                    {expert.expertise_areas.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{expert.expertise_areas.length - 4}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/experts/${expert.id}`}>
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Message
                      </Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href={`/experts/${expert.id}`}>
                        <Calendar className="h-4 w-4 mr-1" />
                        Book Now
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={expert.users.avatar_url || ""} />
              <AvatarFallback>
                {expert.users.full_name
                  .split(" ")
                  .map(n => n[0])
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

          {expert.description && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {expert.description}
            </p>
          )}

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
    )
  }

  // Check if filters have changes that aren't applied yet
  const hasUnappliedChanges = JSON.stringify(filters) !== JSON.stringify(appliedFilters)

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search experts by name, title, or skills..."
            value={filters.searchTerm}
            onChange={(e) => updateFilter("searchTerm", e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-9"
          />
        </div>
        <Button 
          onClick={handleSearch}
          disabled={isLoading}
          className="shrink-0"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Search className="h-4 w-4 mr-2" />
          )}
          Search
        </Button>
        {hasUnappliedChanges && (
          <Button 
            variant="outline"
            onClick={clearFilters}
            className="shrink-0"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        )}
      </div>

      {/* Filters Row */}
      <div className="grid gap-4 md:grid-cols-5 p-4 bg-muted/30 rounded-lg border">
        {/* Expertise Areas */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Expertise</Label>
          <Select 
            value={filters.selectedExpertise.length > 0 ? "selected" : "all"}
            onValueChange={(value) => {
              if (value === "all") {
                updateFilter("selectedExpertise", [])
              }
            }}
          >
            <SelectTrigger className="h-9">
              <div className="flex items-center gap-2">
                {filters.selectedExpertise.length > 0 ? (
                  <Badge variant="secondary" className="text-xs">
                    {filters.selectedExpertise.length} selected
                  </Badge>
                ) : (
                  "All areas"
                )}
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All areas</SelectItem>
              <div className="border-t my-1" />
              <div className="px-2 py-1 max-h-48 overflow-y-auto">
                <div className="grid gap-2">
                  {expertiseAreas.map(area => (
                    <div key={area} className="flex items-center space-x-2">
                      <Checkbox
                        id={`filter-${area}`}
                        checked={filters.selectedExpertise.includes(area)}
                        onCheckedChange={() => toggleExpertise(area)}
                      />
                      <Label htmlFor={`filter-${area}`} className="text-sm cursor-pointer">
                        {area}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </SelectContent>
          </Select>
        </div>

        {/* Rating Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Min Rating: {filters.minRating > 0 ? `${filters.minRating}+` : 'Any'}
          </Label>
          <div className="px-3">
            <Slider
              value={[filters.minRating]}
              onValueChange={([value]) => updateFilter("minRating", value)}
              max={5}
              min={0}
              step={0.5}
              className="w-full"
            />
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Max Rate: ${filters.maxHourlyRate}{filters.maxHourlyRate >= 500 ? '+' : ''}
          </Label>
          <div className="px-3">
            <Slider
              value={[filters.maxHourlyRate]}
              onValueChange={([value]) => updateFilter("maxHourlyRate", value)}
              max={500}
              min={25}
              step={25}
              className="w-full"
            />
          </div>
        </div>

        {/* Account Type */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Account Type</Label>
          <Select 
            value={filters.subscriptionType} 
            onValueChange={(value) => updateFilter("subscriptionType", value)}
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="free">Free Experts</SelectItem>
              <SelectItem value="premium">Premium Experts</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Sort By</Label>
          <Select 
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onValueChange={(value) => {
              const [sortBy, sortOrder] = value.split("-") as [typeof filters.sortBy, typeof filters.sortOrder]
              updateFilter("sortBy", sortBy)
              updateFilter("sortOrder", sortOrder)
            }}
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating-desc">Highest Rated</SelectItem>
              <SelectItem value="rating-asc">Lowest Rated</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="reviews-desc">Most Reviews</SelectItem>
              <SelectItem value="newest-desc">Newest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Applied Filters */}
      {(appliedFilters.selectedExpertise.length > 0 || appliedFilters.searchTerm || 
        appliedFilters.minRating > 0 || appliedFilters.maxHourlyRate < 500 || 
        appliedFilters.subscriptionType !== "all") && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {appliedFilters.searchTerm && (
            <Badge variant="secondary" className="px-3 py-1">
              Search: "{appliedFilters.searchTerm}"
            </Badge>
          )}
          {appliedFilters.selectedExpertise.map(skill => (
            <Badge key={skill} variant="secondary" className="px-3 py-1">
              {skill}
            </Badge>
          ))}
          {appliedFilters.minRating > 0 && (
            <Badge variant="secondary" className="px-3 py-1">
              {appliedFilters.minRating}+ Rating
            </Badge>
          )}
          {appliedFilters.maxHourlyRate < 500 && (
            <Badge variant="secondary" className="px-3 py-1">
              Under ${appliedFilters.maxHourlyRate}/hr
            </Badge>
          )}
          {appliedFilters.subscriptionType !== "all" && (
            <Badge variant="secondary" className="px-3 py-1">
              {appliedFilters.subscriptionType} Only
            </Badge>
          )}
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {isLoading ? "Loading..." : `${experts.length} experts found`}
          </span>
          {hasUnappliedChanges && (
            <Badge variant="outline" className="text-xs">
              Filters changed - click Search to apply
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading experts...</span>
        </div>
      ) : paginatedExperts.length > 0 ? (
        <div className={viewMode === "grid" ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
          {paginatedExperts.map(expert => (
            <ExpertCard key={expert.id} expert={expert} isListView={viewMode === "list"} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No experts found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search criteria or filters
          </p>
          <Button onClick={clearFilters} variant="outline">
            Clear All Filters
          </Button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          <div className="flex space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = currentPage <= 3 ? i + 1 : 
                           currentPage >= totalPages - 2 ? totalPages - 4 + i :
                           currentPage - 2 + i
              
              if (pageNum < 1 || pageNum > totalPages) return null
              
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              )
            })}
          </div>
          
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
} 