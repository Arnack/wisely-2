"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface UserNavProps {
  user: {
    id: string
    email: string
    full_name: string
    avatar_url?: string | null
    role: "user" | "expert"
  }
}

export function UserNav({ user }: UserNavProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  // Role-specific navigation paths
  const getProfilePath = () => {
    return user.role === "expert" ? "/expert/profile" : "/customer/profile"
  }

  const getSettingsPath = () => {
    return user.role === "expert" ? "/expert/settings" : "/customer/settings"
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar_url || ""} alt={user.full_name} />
            <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.full_name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            <p className="text-xs leading-none text-muted-foreground capitalize">
              {user.role === "expert" ? "Expert Account" : "Customer Account"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push(getProfilePath())}>
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push(getSettingsPath())}>
            Settings
          </DropdownMenuItem>
          {user.role === "expert" && (
            <DropdownMenuItem onClick={() => router.push("/expert/appointments")}>
              My Appointments
            </DropdownMenuItem>
          )}
          {user.role === "user" && (
            <DropdownMenuItem onClick={() => router.push("/appointments")}>
              My Appointments
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
