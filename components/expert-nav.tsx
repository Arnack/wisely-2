"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function ExpertNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center space-x-6 lg:space-x-8">
      <Link
        href="/"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/" ? "text-foreground" : "text-muted-foreground",
        )}
      >
        Dashboard
      </Link>
      <Link
        href="/expert/calendar"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/expert/calendar" ? "text-foreground" : "text-muted-foreground",
        )}
      >
        Calendar
      </Link>
      <Link
        href="/expert/appointments"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/expert/appointments" ? "text-foreground" : "text-muted-foreground",
        )}
      >
        Appointments
      </Link>
      <Link
        href="/expert/profile"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/expert/profile" ? "text-foreground" : "text-muted-foreground",
        )}
      >
        Profile
      </Link>
    </nav>
  )
}
