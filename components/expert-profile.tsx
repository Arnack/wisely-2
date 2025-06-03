"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  User, 
  Mail, 
  DollarSign, 
  Star, 
  Calendar, 
  TrendingUp,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Upload,
  MapPin,
  Briefcase,
  Clock,
  Users,
  Award,
  Target
} from "lucide-react"

interface ExpertProfileData {
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
    id: string
    email: string
    full_name: string
    avatar_url: string | null
    created_at: string
  }
}

interface ProfileStats {
  totalAppointments: number
  completedAppointments: number
  upcomingAppointments: number
}

interface ExpertProfileProps {
  expertProfile: ExpertProfileData
  stats: ProfileStats
}

const EXPERTISE_OPTIONS = [
  "Software Engineer", 
  "Product Manager", 
  "UX Designer", 
  "Data Scientist",
  "Marketing Manager", 
  "Business Analyst", 
  "Project Manager",
  "DevOps Engineer", 
  "Frontend Developer", 
  "Backend Developer",
  "English Language Tutor",
  "Chinese Mandarin Tutor",
  "Spanish Language Tutor",
  "French Language Tutor",
  "German Language Tutor",
  "Startup Founder",
  "Technical Writer",
  "Career Coach"
]

export function ExpertProfile({ expertProfile, stats }: ExpertProfileProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [newSkill, setNewSkill] = useState("")
  const [isSkillDialogOpen, setIsSkillDialogOpen] = useState(false)
  
  const [formData, setFormData] = useState({
    full_name: expertProfile.users.full_name,
    title: expertProfile.title,
    description: expertProfile.description || "",
    hourly_rate: expertProfile.hourly_rate || 0,
    expertise_areas: expertProfile.expertise_areas,
    is_available: expertProfile.is_available,
  })

  const supabase = createClient()
  const { toast } = useToast()

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Update user table
      const { error: userError } = await supabase
        .from("users")
        .update({
          full_name: formData.full_name,
          updated_at: new Date().toISOString(),
        })
        .eq("id", expertProfile.user_id)

      if (userError) throw userError

      // Update expert profile
      const { error: profileError } = await supabase
        .from("expert_profiles")
        .update({
          title: formData.title,
          description: formData.description,
          hourly_rate: formData.hourly_rate,
          expertise_areas: formData.expertise_areas,
          is_available: formData.is_available,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", expertProfile.user_id)

      if (profileError) throw profileError

      toast({
        title: "Success",
        description: "Profile updated successfully",
      })

      // Refresh the page to show updated data
      window.location.reload()
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addSkill = () => {
    if (newSkill && !formData.expertise_areas.includes(newSkill)) {
      setFormData(prev => ({
        ...prev,
        expertise_areas: [...prev.expertise_areas, newSkill]
      }))
      setNewSkill("")
      setIsSkillDialogOpen(false)
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      expertise_areas: prev.expertise_areas.filter(skill => skill !== skillToRemove)
    }))
  }

  return (
    <div className="space-y-6">
      {/* Profile Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Consultations</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAppointments}</div>
            <p className="text-xs text-muted-foreground">
              All time bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Sessions</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedAppointments}</div>
            <p className="text-xs text-muted-foreground">
              Successfully finished
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingAppointments}</div>
            <p className="text-xs text-muted-foreground">
              Pending & approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              {expertProfile.rating.toFixed(1)}
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            </div>
            <p className="text-xs text-muted-foreground">
              {expertProfile.total_reviews} reviews
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Manage your professional profile and contact information
              </CardDescription>
            </div>
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={expertProfile.users.avatar_url || ""} />
              <AvatarFallback className="text-lg">
                {expertProfile.users.full_name
                  .split(" ")
                  .map(n => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{formData.full_name}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {expertProfile.users.email}
              </p>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Change Photo
              </Button>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Professional Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Senior Software Engineer"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Professional Bio</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Tell clients about your experience, skills, and what you can help them with..."
              rows={4}
            />
          </div>

          {/* Hourly Rate */}
          <div className="space-y-2">
            <Label htmlFor="hourly_rate">Hourly Rate (USD)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="hourly_rate"
                type="number"
                min="0"
                step="5"
                value={formData.hourly_rate}
                onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: parseInt(e.target.value) || 0 }))}
                className="pl-10"
                placeholder="150"
              />
            </div>
          </div>

          {/* Availability Status */}
          <div className="space-y-2">
            <Label>Availability Status</Label>
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_available}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_available: checked }))}
              />
              <Label>
                {formData.is_available ? "Available for new bookings" : "Not accepting new bookings"}
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expertise Areas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Expertise Areas</CardTitle>
              <CardDescription>
                Manage your skills and areas of expertise
              </CardDescription>
            </div>
            <Dialog open={isSkillDialogOpen} onOpenChange={setIsSkillDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Skill
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Skill</DialogTitle>
                  <DialogDescription>
                    Add a new area of expertise to your profile
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Skill</Label>
                    <Select value={newSkill} onValueChange={setNewSkill}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a skill" />
                      </SelectTrigger>
                      <SelectContent>
                        {EXPERTISE_OPTIONS
                          .filter(skill => !formData.expertise_areas.includes(skill))
                          .map(skill => (
                            <SelectItem key={skill} value={skill}>
                              {skill}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={addSkill} disabled={!newSkill} className="flex-1">
                      Add Skill
                    </Button>
                    <Button variant="outline" onClick={() => setIsSkillDialogOpen(false)} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {formData.expertise_areas.map((skill) => (
              <Badge key={skill} variant="secondary" className="px-3 py-1">
                {skill}
                <button
                  onClick={() => removeSkill(skill)}
                  className="ml-2 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {formData.expertise_areas.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No expertise areas added yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            View your account details and subscription status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Account Type</Label>
              <div className="px-3 py-2 border rounded-md bg-muted/50">
                <Badge variant={expertProfile.subscription_type === "premium" ? "default" : "secondary"}>
                  {expertProfile.subscription_type === "premium" ? "Premium Expert" : "Free Account"}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Member Since</Label>
              <div className="px-3 py-2 border rounded-md bg-muted/50">
                {new Date(expertProfile.users.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Profile Completion</Label>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Profile completion</span>
                <span>85%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground">
                Add more skills and complete your bio to improve your profile visibility
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 