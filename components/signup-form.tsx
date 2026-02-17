"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signUp } from "@/lib/firebase/auth"

export function SignupForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [school, setSchool] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({})
    const [isLoading, setIsLoading] = useState(false)

    const router = useRouter()

    const requirements = [
        { label: "At least 6 characters", met: password.length >= 6 },
        { label: "One uppercase letter", met: /[A-Z]/.test(password) },
        { label: "One symbol", met: /[^A-Za-z0-9]/.test(password) },
        {
            label: "Passwords match",
            met: password.length > 0 && password === confirmPassword,
        },
    ]

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const newErrors: { [key: string]: string | undefined } = {}

        if (!fullName) newErrors.fullName = "Full Name is required"
        if (!email) newErrors.email = "Email is required"
        if (!school) newErrors.school = "School name is required"
        if (!password) newErrors.password = "Password is required"
        if (!confirmPassword) newErrors.confirmPassword = "Confirm Password is required"

        // Check password requirements
        if (password && !requirements.every(r => r.met)) {
            newErrors.password = "Password does not meet all requirements"
        }

        setErrors(newErrors)

        if (Object.keys(newErrors).length > 0) return

        setIsLoading(true)
        setErrors({})
        try {
            await signUp({ fullName, email, school, password })
            router.push("/signup/preferences")
        } catch (err) {
            setErrors({ general: err instanceof Error ? err.message : "Sign up failed" })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="overflow-hidden">
                <CardContent className="p-0">
                    <form className="p-6 md:p-8" onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col items-center text-center">
                                <h1 className="text-2xl font-bold">Sign Up</h1>
                                <p className="text-balance text-muted-foreground">
                                    Create an account to get started
                                </p>
                            </div>
                            {errors.general && (
                                <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                                    {errors.general}
                                </div>
                            )}
                            <div className="grid gap-2">
                                <Label htmlFor="full-name">Full Name</Label>
                                <Input
                                    id="full-name"
                                    placeholder="John Doe"
                                    required
                                    value={fullName}
                                    onChange={(e) => {
                                        setFullName(e.target.value)
                                        if (errors.fullName) setErrors({ ...errors, fullName: undefined })
                                    }}
                                />
                                {errors.fullName && <p className="text-sm text-red-500 font-medium">{errors.fullName}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    required
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value)
                                        if (errors.email) setErrors({ ...errors, email: undefined })
                                    }}
                                />
                                <p className="text-[10px] text-muted-foreground">
                                    * Please use your school email address.
                                </p>
                                {errors.email && <p className="text-sm text-red-500 font-medium">{errors.email}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="school">School name</Label>
                                <Input
                                    id="school"
                                    placeholder=""
                                    required
                                    value={school}
                                    onChange={(e) => {
                                        setSchool(e.target.value)
                                        if (errors.school) setErrors({ ...errors, school: undefined })
                                    }}
                                />
                                {errors.school && <p className="text-sm text-red-500 font-medium">{errors.school}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value)
                                            if (errors.password) setErrors({ ...errors, password: undefined })
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                        <span className="sr-only">Toggle password visibility</span>
                                    </Button>
                                </div>
                                {errors.password && <p className="text-sm text-red-500 font-medium">{errors.password}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="confirm-password">Confirm Password</Label>
                                <div className="relative">
                                    <Input
                                        id="confirm-password"
                                        type={showConfirmPassword ? "text" : "password"}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value)
                                            if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined })
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                        <span className="sr-only">Toggle password visibility</span>
                                    </Button>
                                </div>
                                {errors.confirmPassword && <p className="text-sm text-red-500 font-medium">{errors.confirmPassword}</p>}
                            </div>
                            <ul className="grid gap-1 text-xs">
                                {requirements.map((req, index) => (
                                    <li
                                        key={index}
                                        className={req.met ? "text-green-600" : "text-red-600"}
                                    >
                                        • {req.label}
                                    </li>
                                ))}
                            </ul>
                            <Button type="submit" className="w-full h-9" disabled={isLoading}>
                                {isLoading ? "Creating account..." : "Sign Up"}
                            </Button>
                            <div className="text-center text-sm">
                                Already have an account?{" "}
                                <Link href="/login" className="underline underline-offset-4">
                                    Log in
                                </Link>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
            <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
                By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
                and <a href="#">Privacy Policy</a>.
            </div>
        </div>
    )
}
