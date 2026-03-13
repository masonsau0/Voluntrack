"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Bell, Menu, X, ChevronDown, User, LogOut, UserCircle, Info } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/AuthContext"

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, userProfile, loading, logout } = useAuth()
  const router = useRouter()
  const notificationCount = 0

  const pathname = usePathname()
  // Detect if user is in org view
  const isOrgView = pathname?.startsWith("/org")
  // Use actual Firebase auth state instead of pathname-based heuristic
  const isAuthenticated = !loading && !!user

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href={isOrgView ? "/org/dashboard" : "/"} className="flex items-center">
            <span className="font-serif text-2xl md:text-3xl font-light tracking-wide">
              <span className="font-serif font-normal text-primary">Volun</span>
              <span className="font-serif font-normal text-orange-500">Track</span>
              <span className="font-serif font-normal text-primary"> Ontario</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {isAuthenticated && !isOrgView && (
              <>
                <Link
                  href="/opportunities"
                  className="text-sm tracking-wider uppercase text-foreground/70 hover:text-foreground transition-colors whitespace-nowrap"
                >
                  Opportunities
                </Link>
                <Link
                  href="/dashboard"
                  className="text-sm tracking-wider uppercase text-foreground/70 hover:text-foreground transition-colors whitespace-nowrap"
                >
                  Dashboard
                </Link>
                <Link
                  href="/feed"
                  className="text-sm tracking-wider uppercase text-foreground/70 hover:text-foreground transition-colors whitespace-nowrap"
                >
                  Feed
                </Link>
              </>
            )}
            {isAuthenticated && isOrgView && (
              <>
                <Link
                  href="/org/dashboard"
                  className={`text-sm tracking-wider uppercase transition-colors ${pathname?.startsWith("/org/dashboard") ? "text-foreground font-semibold" : "text-foreground/70 hover:text-foreground"
                    }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/org/opportunities"
                  className={`text-sm tracking-wider uppercase transition-colors ${pathname?.startsWith("/org/opportunities") ? "text-foreground font-semibold" : "text-foreground/70 hover:text-foreground"
                    }`}
                >
                  Opportunities
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <Button variant="ghost" size="icon" className="relative hidden sm:flex">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </Button>
            )}

            {/* Authentication vs Profile */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hidden sm:flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity outline-none">
                    <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    {loading ? (
                      <span className="text-sm font-medium text-muted-foreground">Loading...</span>
                    ) : (
                      <span className="text-sm font-medium">
                        {userProfile?.firstName || "User"}
                      </span>
                    )}
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/account" className="flex items-center gap-2 cursor-pointer">
                      <UserCircle className="h-4 w-4" />
                      My account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={isOrgView ? "/org/about" : "/about"} className="flex items-center gap-2 cursor-pointer">
                      <Info className="h-4 w-4" />
                      About
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive cursor-pointer"
                    onClick={async () => {
                      await logout()
                      router.push("/")
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              /* Auth Buttons */
              <div className="hidden sm:flex items-center gap-4">
                <Link href="/login">
                  <Button
                    variant={pathname?.startsWith("/login") ? "default" : "outline"}
                    className={`rounded-full px-6 tracking-wide uppercase text-xs ${pathname?.startsWith("/login")
                      ? "bg-primary text-primary-foreground"
                      : "border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                      }`}
                  >
                    Log in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    variant="outline"
                    className="rounded-full px-6 tracking-wide uppercase text-xs border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    Sign up
                  </Button>
                </Link>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="px-4 py-6 space-y-4">
            {isAuthenticated && !isOrgView && (
              <>
                <Link
                  href="/opportunities"
                  className="block text-base tracking-wider uppercase text-foreground/70 hover:text-foreground transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Opportunities
                </Link>
                <Link
                  href="/dashboard"
                  className="block text-base tracking-wider uppercase text-foreground/70 hover:text-foreground transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/feed"
                  className="block text-base tracking-wider uppercase text-foreground/70 hover:text-foreground transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Feed
                </Link>
              </>
            )}
            {isAuthenticated && isOrgView && (
              <>
                <Link
                  href="/org/dashboard"
                  className="block text-base tracking-wider uppercase text-foreground/70 hover:text-foreground transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/org/opportunities"
                  className="block text-base tracking-wider uppercase text-foreground/70 hover:text-foreground transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Opportunities
                </Link>
              </>
            )}
            <div className="pt-4 border-t border-border flex flex-col gap-4">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/account"
                    className="block text-base tracking-wider uppercase text-foreground/70 hover:text-foreground transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My account
                  </Link>

                  <button
                    className="block text-base tracking-wider uppercase text-destructive font-medium transition-colors text-left w-full"
                    onClick={async () => {
                      setMobileMenuOpen(false)
                      await logout()
                      router.push("/")
                    }}
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block text-base tracking-wider uppercase text-foreground/70 hover:text-foreground transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="block text-base tracking-wider uppercase text-primary font-medium transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
