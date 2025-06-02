import { redirect } from "next/navigation"

export default async function DashboardPage() {
  // Redirect to root page where role-specific dashboards are now handled
  redirect("/")
}
