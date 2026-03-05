"use client"

import { AuthProvider } from "@/contexts/AuthContext"
import { Toaster } from "@/components/ui/sonner"
import { RoleGuard } from "@/components/auth/role-guard"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <RoleGuard>
        {children}
        <Toaster />
      </RoleGuard>
    </AuthProvider>
  )
}
