import type React from "react"
import { SiteHeader } from "@/components/site-header"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container py-6">{children}</main>
    </div>
  )
}
