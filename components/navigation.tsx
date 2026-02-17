"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Bell, Menu, X, ChevronDown, User, LogOut, Settings } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, userProfile, loading, logout } = useAuth()
  const notificationCount = 3
  const router = useRouter()

  const pathname = usePathname()
  // Show logged-in state based on actual authentication
  const isLoggedIn = !!user

  // Check if we're on a login page
  const isLoginPage = pathname?.startsWith("/login")

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="font-serif text-2xl md:text-3xl font-light tracking-wide">
              <span className="font-serif font-normal text-primary">Volun</span>
              <span className="font-serif font-normal text-orange-500">Track</span>
              <span className="font-serif font-normal text-primary"> Ontario</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {isLoggedIn && (
              <>
                <Link
                  href="/opportunities"
                  className="text-sm tracking-wider uppercase text-foreground/70 hover:text-foreground transition-colors"
                >
                  Opportunities
                </Link>
                <Link
                  href="/dashboard"
                  className="text-sm tracking-wider uppercase text-foreground/70 hover:text-foreground transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/feed"
                  className="text-sm tracking-wider uppercase text-foreground/70 hover:text-foreground transition-colors"
                >
                  Feed
                </Link>
                <Link
                  href="/about"
                  className="text-sm tracking-wider uppercase text-foreground/70 hover:text-foreground transition-colors"
                >
                  About
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            {isLoggedIn && (
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
            {isLoggedIn ? (
              /* Profile section */
              /* Profile section */
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="hidden sm:flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
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
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Edit User</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={async () => {
                      await logout()
                      router.push("/login")
                    }}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
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
                <Link href="/about">
                  <Button
                    variant={pathname?.startsWith("/about") ? "default" : "outline"}
                    className={`rounded-full px-6 tracking-wide uppercase text-xs ${pathname?.startsWith("/about")
                      ? "bg-primary text-primary-foreground"
                      : "border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                      }`}
                  >
                    Learn More
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
            {isLoggedIn && (
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
                <Link
                  href="/about"
                  className="block text-base tracking-wider uppercase text-foreground/70 hover:text-foreground transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
              </>
            )}
            <div className="pt-4 border-t border-border flex flex-col gap-4">
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
              <Link
                href="/about"
                className="block text-base tracking-wider uppercase text-foreground/70 hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
