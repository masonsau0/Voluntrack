"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[] // For future RBAC
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
    
    // Future RBAC logic
    // if (!loading && user && allowedRoles && userProfile && !allowedRoles.includes(userProfile.role)) {
    //   router.push("/unauthorized")
    // }
  }, [user, loading, router, allowedRoles, userProfile])

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Future RBAC check for rendering
  // if (allowedRoles && userProfile && !allowedRoles.includes(userProfile.role)) {
  //   return null
  // }

  return <>{children}</>
}
