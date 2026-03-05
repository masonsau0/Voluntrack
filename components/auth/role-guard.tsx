"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Loader2 } from "lucide-react"

export function RoleGuard({ children }: { children: React.ReactNode }) {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return

    // Allow unauthenticated users on public or auth routes (login, signup, etc.)
    // Note: Other auth guards (like ProtectedRoute) will handle whether they should be here
    if (!user || !userProfile) return

    const isOrgRoute = pathname.startsWith("/org")
    const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/signup")
    
    // Org accounts accessing non-/org routes
    if (userProfile.role === "volunteer_org" && !isOrgRoute && !isAuthRoute) {
      router.push("/org/dashboard")
    }
    
    // Student accounts accessing /org routes
    else if (userProfile.role === "student" && isOrgRoute) {
      router.push("/opportunities")
    }
  }, [user, userProfile, loading, pathname, router])

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Next.js will often render the page *before* the router.push completes.
  // We can return null to avoid flash of content if they're on the wrong route type.
  const isOrgRoute = pathname.startsWith("/org")
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/signup")

  if (userProfile?.role === "volunteer_org" && !isOrgRoute && !isAuthRoute) {
      return null
  }
  if (userProfile?.role === "student" && isOrgRoute) {
      return null
  }

  return <>{children}</>
}
