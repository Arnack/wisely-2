"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function MainNav() {
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
        href="/experts"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/experts" ? "text-foreground" : "text-muted-foreground",
        )}
      >
        Find Experts
      </Link>
      <Link
        href="/appointments"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/appointments" ? "text-foreground" : "text-muted-foreground",
        )}
      >
        My Appointments
      </Link>
      <Link
        href="/call-demo"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/call-demo" ? "text-foreground" : "text-muted-foreground",
        )}
      >
        Video Demo
      </Link>
    </nav>
  )
}
