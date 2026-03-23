"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signUp } from "@/lib/firebase/auth"
import { containsInappropriateContent } from "@/lib/opportunityValidation"

export function SignupForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [termsAgreed, setTermsAgreed] = useState(false)
    const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({})
    const [isLoading, setIsLoading] = useState(false)

    const router = useRouter()

    const requirements = [
        { label: "At least 8 characters", met: password.length >= 8 },
        { label: "One uppercase letter", met: /[A-Z]/.test(password) },
        {
            label: "Passwords match",
            met: password.length > 0 && password === confirmPassword,
        },
    ]

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const newErrors: { [key: string]: string | undefined } = {}

        if (!firstName) newErrors.firstName = "First Name is required"
        else if (containsInappropriateContent(firstName)) newErrors.firstName = "This field contains inappropriate content."
        if (!lastName) newErrors.lastName = "Last Name is required"
        else if (containsInappropriateContent(lastName)) newErrors.lastName = "This field contains inappropriate content."
        if (!email) newErrors.email = "Email is required"
        if (!password) newErrors.password = "Password is required"
        if (!confirmPassword) newErrors.confirmPassword = "Confirm Password is required"
        if (!termsAgreed) newErrors.terms = "You must agree to the Terms and Conditions to create an account"
        // Check password requirements
        if (password && !requirements.every(r => r.met)) {
            newErrors.password = "Password does not meet all requirements"
        }

        setErrors(newErrors)

        if (Object.keys(newErrors).length > 0) return

        setIsLoading(true)
        setErrors({})

        try {
            await signUp({
                email,
                password,
                firstName,
                lastName,
                role: "student"
            })
            router.push("/signup/preferences")
        } catch (err) {
            setErrors({ general: err instanceof Error ? err.message : "Sign up failed" })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="overflow-hidden rounded-2xl">
                <CardContent className="p-0">
                    <form className="p-6 md:p-8 font-serif" onSubmit={handleSubmit} noValidate>
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col items-center text-center">
                                <h1 className="text-2xl font-serif font-bold">Sign Up</h1>
                                <p className="text-balance text-muted-foreground">
                                    Create an account to get started
                                </p>
                            </div>
                            {errors.general && (
                                <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                                    {errors.general}
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="first-name" className="font-serif">First Name</Label>
                                    <Input
                                        id="first-name"
                                        placeholder="John"
                                        required
                                        value={firstName}
                                        onChange={(e) => {
                                            setFirstName(e.target.value)
                                            if (errors.firstName) setErrors({ ...errors, firstName: undefined })
                                        }}
                                    />
                                    {errors.firstName && <p className="text-sm text-red-500 font-medium">{errors.firstName}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="last-name" className="font-serif">Last Name</Label>
                                    <Input
                                        id="last-name"
                                        placeholder="Doe"
                                        required
                                        value={lastName}
                                        onChange={(e) => {
                                            setLastName(e.target.value)
                                            if (errors.lastName) setErrors({ ...errors, lastName: undefined })
                                        }}
                                    />
                                    {errors.lastName && <p className="text-sm text-red-500 font-medium">{errors.lastName}</p>}
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="font-serif">Email</Label>
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
                                <p className="text-[10px] text-muted-foreground font-serif">
                                    * Please use your school email address.
                                </p>
                                {errors.email && <p className="text-sm text-red-500 font-medium">{errors.email}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password" className="font-serif">Password</Label>
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
                                <Label htmlFor="confirm-password" className="font-serif">Confirm Password</Label>
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
                            <div className="space-y-2">
                                <div className="flex items-start gap-3">
                                    <Checkbox
                                        id="terms"
                                        checked={termsAgreed}
                                        onCheckedChange={(checked) => {
                                            setTermsAgreed(checked === true)
                                            if (errors.terms) setErrors({ ...errors, terms: undefined })
                                        }}
                                        className="mt-0.5 shrink-0"
                                    />
                                    <Label
                                        htmlFor="terms"
                                        className="cursor-pointer text-sm font-serif leading-relaxed font-normal text-muted-foreground"
                                    >
                                        By signing up, you agree to our{" "}
                                        <Dialog>
                                        <DialogTrigger asChild>
                                            <button
                                                type="button"
                                                className="text-primary hover:underline underline-offset-2 font-serif inline"
                                            >
                                                Terms and condition
                                            </button>
                                        </DialogTrigger>
                                    <DialogContent className="max-w-[650px] max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden rounded-none bg-white">
                                        <DialogHeader className="shrink-0 px-6 pt-6 pb-4 text-center border-b border-gray-200">
                                            <DialogTitle className="text-lg font-semibold text-foreground">
                                                Terms & Conditions
                                            </DialogTitle>
                                            <p className="text-xs text-gray-500 mt-1">
                                                VolunTrack Ontario · <span className="font-semibold text-gray-500">Student Users Under 18</span>
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                Last updated: March 2026
                                            </p>
                                        </DialogHeader>
                                        <div className="overflow-y-auto flex-1 px-6 py-5 min-h-0">
                                            <div className="text-sm text-foreground/90 leading-[1.5] max-w-[65ch] mx-auto space-y-8">
                                                <p>
                                                    By creating an account on VolunTrack Ontario, you agree to the following terms:
                                                </p>
                                                <section>
                                                    <h4 className="font-semibold text-foreground text-[13px] uppercase tracking-wide">1. Eligibility</h4>
                                                    <p className="mt-1.5">
                                                        VolunTrack Ontario is designed for students completing volunteer hours in Ontario. <strong className="font-semibold text-foreground">If you are under 18, you confirm that your parent or guardian is aware</strong> that you are creating this account and using the platform.
                                                    </p>
                                                </section>
                                                <section>
                                                    <h4 className="font-semibold text-foreground text-[13px] uppercase tracking-wide">2. Purpose of the Platform</h4>
                                                    <p className="mt-1.5">VolunTrack Ontario helps students:</p>
                                                    <ul className="list-[disc] pl-5 space-y-1.5 mt-1.5 [&>li]:pl-1">
                                                        <li>Discover volunteer opportunities</li>
                                                        <li>Track completed volunteer hours</li>
                                                        <li>Manage their volunteering activities</li>
                                                    </ul>
                                                    <p className="mt-2">
                                                        The platform does not guarantee placement. Volunteer organizations are responsible for their own opportunities and selection of participants.
                                                    </p>
                                                </section>
                                                <section>
                                                    <h4 className="font-semibold text-foreground text-[13px] uppercase tracking-wide">3. Account Information</h4>
                                                    <ul className="list-[disc] pl-5 space-y-1.5 mt-1.5 [&>li]:pl-1">
                                                        <li>You agree to provide accurate information when creating your account.</li>
                                                        <li>You are responsible for keeping your login information secure.</li>
                                                    </ul>
                                                </section>
                                                <section>
                                                    <h4 className="font-semibold text-foreground text-[13px] uppercase tracking-wide">4. Volunteer Opportunities</h4>
                                                    <p className="mt-1.5">
                                                        Opportunities are posted by external organizations. VolunTrack Ontario does not supervise or control these organizations. Students and guardians should ensure opportunities are appropriate before participating.
                                                    </p>
                                                </section>
                                                <section>
                                                    <h4 className="font-semibold text-foreground text-[13px] uppercase tracking-wide">5. Tracking Volunteer Hours</h4>
                                                    <p className="mt-1.5">
                                                        The platform allows you to record and track volunteer hours. Schools or organizations may require their own official verification for community service hours.
                                                    </p>
                                                </section>
                                                <section>
                                                    <h4 className="font-semibold text-foreground text-[13px] uppercase tracking-wide">6. Privacy</h4>
                                                    <ul className="list-[disc] pl-5 space-y-1.5 mt-1.5 [&>li]:pl-1">
                                                        <li>Your personal information will only be used to operate and improve the platform.</li>
                                                        <li>We do not sell personal information to third parties.</li>
                                                    </ul>
                                                </section>
                                                <section>
                                                    <h4 className="font-semibold text-foreground text-[13px] uppercase tracking-wide">7. Acceptable Use</h4>
                                                    <p className="mt-1.5">Users agree not to:</p>
                                                    <ul className="list-[disc] pl-5 space-y-1.5 mt-1.5 [&>li]:pl-1">
                                                        <li>Provide false volunteer records</li>
                                                        <li>Misuse the platform</li>
                                                        <li>Harass or harm other users or organizations</li>
                                                    </ul>
                                                    <p className="mt-2">Accounts violating these rules may be removed.</p>
                                                </section>
                                                <section>
                                                    <h4 className="font-semibold text-foreground text-[13px] uppercase tracking-wide">8. Changes</h4>
                                                    <p className="mt-1.5">
                                                        VolunTrack Ontario may update features or policies as the platform evolves.
                                                    </p>
                                                </section>
                                                <section>
                                                    <h4 className="font-semibold text-foreground text-[13px] uppercase tracking-wide">9. Agreement</h4>
                                                    <p className="mt-1.5">
                                                        By creating an account and selecting &quot;I Agree&quot;, you confirm that you understand and agree to these Terms & Conditions.
                                                    </p>
                                                </section>
                                            </div>
                                        </div>
                                        <div className="shrink-0 px-6 pt-6 pb-4 mt-5 border-t border-gray-200 bg-white">
                                            <DialogClose asChild>
                                                <Button variant="secondary" className="w-full rounded-full hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors">
                                                    I Understand
                                                </Button>
                                            </DialogClose>
                                        </div>
                                    </DialogContent>
                                        </Dialog>
                                        .
                                    </Label>
                                </div>
                                {errors.terms && <p className="text-sm text-red-500 font-medium">{errors.terms}</p>}
                            </div>
                            <ul className="grid gap-1 text-xs font-serif">
                                {requirements.map((req, index) => (
                                    <li
                                        key={index}
                                        className={req.met ? "text-green-600" : "text-red-600"}
                                    >
                                        • {req.label}
                                    </li>
                                ))}
                            </ul>
                            <Button type="submit" className="w-full h-9 rounded-xl" disabled={isLoading || !termsAgreed}>
                                {isLoading ? "Creating account..." : "Sign Up"}
                            </Button>
                            <div className="text-center text-sm font-serif">
                                Already have an account?{" "}
                                <Link href="/login" className="underline underline-offset-4">
                                    Log in
                                </Link>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
