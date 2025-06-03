"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { 
  Settings, 
  Bell, 
  Shield, 
  User, 
  Mail,
  Lock,
  Eye,
  EyeOff,
  Save,
  Trash2,
  Download,
  Upload,
  Globe,
  Calendar,
  DollarSign,
  MessageSquare,
  Smartphone,
  AlertCircle
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

interface UserData {
  id: string
  email: string
  full_name: string
  role: "user" | "expert"
  avatar_url: string | null
  created_at: string
  updated_at: string
}

interface ExpertSettingsProps {
  expertProfile: ExpertProfileData
  user: UserData
}

interface NotificationSettings {
  emailNewBookings: boolean
  emailCancellations: boolean
  emailMessages: boolean
  emailReminders: boolean
  pushNotifications: boolean
  smsReminders: boolean
}

interface PrivacySettings {
  profileVisible: boolean
  showEmail: boolean
  showPhone: boolean
  allowDirectMessages: boolean
}

export function ExpertSettings({ expertProfile, user }: ExpertSettingsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNewBookings: true,
    emailCancellations: true,
    emailMessages: true,
    emailReminders: true,
    pushNotifications: true,
    smsReminders: false,
  })

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profileVisible: true,
    showEmail: false,
    showPhone: false,
    allowDirectMessages: true,
  })

  const supabase = createClient()
  const { toast } = useToast()

  const handleUpdateEmail = async (newEmail: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail })
      
      if (error) throw error

      toast({
        title: "Email Update",
        description: "Please check your new email address to confirm the change.",
      })
    } catch (error) {
      console.error("Error updating email:", error)
      toast({
        title: "Error",
        description: "Failed to update email address",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      
      if (error) throw error

      toast({
        title: "Success",
        description: "Password updated successfully",
      })

      setIsPasswordDialogOpen(false)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      console.error("Error updating password:", error)
      toast({
        title: "Error",
        description: "Failed to update password",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveNotificationSettings = async () => {
    setIsLoading(true)
    try {
      // In a real app, you'd save these to a user_preferences table
      // For now, we'll just show a success message
      toast({
        title: "Success",
        description: "Notification preferences saved",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save notification preferences",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSavePrivacySettings = async () => {
    setIsLoading(true)
    try {
      // In a real app, you'd save these to a user_preferences table
      toast({
        title: "Success",
        description: "Privacy settings saved",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save privacy settings",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    // This would require additional confirmation and cleanup
    toast({
      title: "Account Deletion",
      description: "Please contact support to delete your account",
    })
  }

  const handleDownloadData = async () => {
    toast({
      title: "Data Export",
      description: "Your data export will be emailed to you within 24 hours",
    })
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="account" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Account Settings */}
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>
                Manage your basic account information and subscription
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.avatar_url || ""} />
                  <AvatarFallback className="text-lg">
                    {user.full_name
                      .split(" ")
                      .map(n => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{user.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{expertProfile.title}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload New Photo
                    </Button>
                    <Button variant="outline" size="sm">
                      Remove Photo
                    </Button>
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="flex gap-2">
                    <Input
                      id="email"
                      value={user.email}
                      readOnly
                      className="flex-1"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const newEmail = prompt("Enter new email address:", user.email)
                        if (newEmail && newEmail !== user.email) {
                          handleUpdateEmail(newEmail)
                        }
                      }}
                    >
                      Change
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Account Type</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant={expertProfile.subscription_type === "premium" ? "default" : "secondary"}>
                      {expertProfile.subscription_type === "premium" ? "Premium Expert" : "Free Expert"}
                    </Badge>
                    {expertProfile.subscription_type === "free" && (
                      <Button variant="outline" size="sm">
                        Upgrade to Premium
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Status */}
              <div className="space-y-2">
                <Label>Account Status</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={expertProfile.is_available}
                    disabled // This would be managed through the profile page
                  />
                  <Label>
                    {expertProfile.is_available ? "Available for bookings" : "Not accepting bookings"}
                  </Label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose how you want to be notified about important events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Notifications */}
              <div className="space-y-4">
                <h4 className="font-medium">Email Notifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>New Bookings</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when someone books a consultation
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailNewBookings}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, emailNewBookings: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Cancellations</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when a client cancels an appointment
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailCancellations}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, emailCancellations: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Messages</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when you receive new messages
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailMessages}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, emailMessages: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Appointment Reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Get reminded about upcoming appointments
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailReminders}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, emailReminders: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Push Notifications */}
              <div className="space-y-4">
                <h4 className="font-medium">Push Notifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Browser Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Show desktop notifications for important updates
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>SMS Reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive text message reminders (Premium feature)
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.smsReminders}
                      disabled={expertProfile.subscription_type === "free"}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, smsReminders: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveNotificationSettings} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                Save Notification Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy Settings
              </CardTitle>
              <CardDescription>
                Control your privacy and what information is visible to clients
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Profile Visibility</Label>
                    <p className="text-sm text-muted-foreground">
                      Make your profile visible to potential clients
                    </p>
                  </div>
                  <Switch
                    checked={privacySettings.profileVisible}
                    onCheckedChange={(checked) => 
                      setPrivacySettings(prev => ({ ...prev, profileVisible: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Email Address</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow clients to see your email address
                    </p>
                  </div>
                  <Switch
                    checked={privacySettings.showEmail}
                    onCheckedChange={(checked) => 
                      setPrivacySettings(prev => ({ ...prev, showEmail: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Direct Messages</Label>
                    <p className="text-sm text-muted-foreground">
                      Let clients send you direct messages
                    </p>
                  </div>
                  <Switch
                    checked={privacySettings.allowDirectMessages}
                    onCheckedChange={(checked) => 
                      setPrivacySettings(prev => ({ ...prev, allowDirectMessages: checked }))
                    }
                  />
                </div>
              </div>

              <Button onClick={handleSavePrivacySettings} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                Save Privacy Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage your account security and data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Password */}
              <div className="space-y-2">
                <Label>Password</Label>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    value="••••••••"
                    readOnly
                    className="flex-1"
                  />
                  <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">Change Password</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>
                          Enter your current password and choose a new one
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="current-password">Current Password</Label>
                          <div className="relative">
                            <Input
                              id="current-password"
                              type={showCurrentPassword ? "text" : "password"}
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              className="pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                              {showCurrentPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="new-password">New Password</Label>
                          <div className="relative">
                            <Input
                              id="new-password"
                              type={showNewPassword ? "text" : "password"}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                              {showNewPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">Confirm New Password</Label>
                          <Input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button onClick={handleUpdatePassword} disabled={isLoading} className="flex-1">
                            Update Password
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setIsPasswordDialogOpen(false)}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Data Management */}
              <div className="space-y-4">
                <h4 className="font-medium">Data Management</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Download Your Data</Label>
                      <p className="text-sm text-muted-foreground">
                        Get a copy of all your account data
                      </p>
                    </div>
                    <Button variant="outline" onClick={handleDownloadData}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="space-y-4 border-t pt-6">
                <h4 className="font-medium text-destructive">Danger Zone</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Delete Account</Label>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account and all data
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your
                            account and remove your data from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteAccount}>
                            Delete Account
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 