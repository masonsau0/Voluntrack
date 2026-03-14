"use client"

import React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { signIn } from "@/lib/firebase/auth"
import { Loader2 } from "lucide-react"

export function LoginForm({
  className,
  showSignUp = false,
  redirectTo = "/dashboard",
  ...props
}: React.ComponentProps<"div"> & { showSignUp?: boolean; redirectTo?: string }) {
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [errors, setErrors] = React.useState<{ email?: string; password?: string; general?: string }>({})
  const [isLoading, setIsLoading] = React.useState(false)

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: typeof errors = {}

    if (!email) {
      newErrors.email = "Email is required"
    }
    if (!password) {
      newErrors.password = "Password is required"
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const user = await signIn(email, password)
      const token = await user.getIdToken()
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      router.push(redirectTo)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred during login"
      setErrors({ general: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden bg-sky-50/80 backdrop-blur-sm border border-sky-200/50">
        <CardContent className="p-0">
          <form className="p-6 md:p-8 font-serif" onSubmit={handleSubmit} data-testid="login-form">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-serif font-bold">Login</h1>
                <p className="text-balance text-muted-foreground font-serif">
                  {/* Login to your Acme Inc account */}
                </p>
              </div>
              {errors.general && (
                <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md font-serif">
                  {errors.general}
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="email" className="font-serif">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  className="font-serif"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errors.email) setErrors({ ...errors, email: undefined })
                  }}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 font-medium font-serif">{errors.email}</p>
                )}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password" className="font-serif">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="ml-auto text-sm underline-offset-2 hover:underline font-serif"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="font-serif"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password) setErrors({ ...errors, password: undefined })
                  }}
                />
                {errors.password && (
                  <p className="text-sm text-red-500 font-medium font-serif">{errors.password}</p>
                )}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="show-password"
                    checked={showPassword}
                    onCheckedChange={(checked) => setShowPassword(checked === true)}
                  />
                  <Label htmlFor="show-password" className="cursor-pointer">
                    Show Password
                  </Label>
                </div>
              </div>
              <Button type="submit" className="w-full font-serif" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
              {showSignUp && (
                <div className="text-center text-sm pt-2">
                  <span className="text-muted-foreground font-serif">Don't have an account? </span>
                  <Link
                    href="/signup"
                    className="underline-offset-2 hover:underline text-primary font-medium font-serif"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

    </div>
  )
}
