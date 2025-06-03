import { createClient } from "@/lib/supabase/server"
import { ExpertsSearch } from "@/components/experts-search"

export default async function ExpertsPage() {
  const supabase = await createClient()

  // Get all expert profiles with user data for initial load
  const { data: experts } = await supabase
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
    .order("rating", { ascending: false })

  // Get all unique expertise areas for filters
  const { data: allExperts } = await supabase
    .from("expert_profiles")
    .select("expertise_areas")
    .eq("is_available", true)

  const allExpertiseAreas = Array.from(
    new Set(
      allExperts?.flatMap(expert => expert.expertise_areas || []) || []
    )
  ).sort()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Find Experts</h1>
        <p className="text-muted-foreground">
          Browse and connect with verified experts in various fields
        </p>
      </div>

      <ExpertsSearch 
        initialExperts={experts || []} 
        expertiseAreas={allExpertiseAreas}
      />
    </div>
  )
}
