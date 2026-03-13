"use client"

import { GalleryVerticalEnd, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"
import { resetPassword } from "@/lib/firebase/auth"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return

        setIsLoading(true)
        setError("")
        try {
            await resetPassword(email)
            setIsSubmitted(true)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to send reset email.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <Card>
                    <CardHeader className="flex flex-col items-center text-center">
                        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-10 w-10 text-primary"
                            >
                                <path d="M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5C2 7 4 5 5.5 5h13C20 5 22 7 22 9.5V17Z" />
                                <path d="M2 9.5h20" />
                                <path d="M7 15l5 3 5-3" />
                            </svg>
                        </div>
                        <CardTitle className="text-2xl">
                            {isSubmitted ? "Check your inbox" : "Reset password"}
                        </CardTitle>
                        <CardDescription>
                            {isSubmitted
                                ? `We've sent a password reset link to ${email}.`
                                : "Please enter the email address you used to sign up for your account."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!isSubmitted ? (
                            <form onSubmit={handleSubmit} className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="m@example.com"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        "Send Reset Link"
                                    )}
                                </Button>
                                {error && <p className="text-sm text-destructive text-center">{error}</p>}
                                <div className="mt-4 text-center text-sm">
                                    Remember your password?{" "}
                                    <Link href="/login" className="underline underline-offset-4">
                                        Log in
                                    </Link>
                                </div>
                            </form>
                        ) : (
                            <div className="grid gap-4">
                                <Button asChild className="w-full">
                                    <Link href="/login">Return to Login</Link>
                                </Button>
                                <div className="text-center text-sm text-muted-foreground">
                                    Didn't receive the email?{" "}
                                    <button
                                        onClick={() => setIsSubmitted(false)}
                                        className="underline underline-offset-4 hover:text-primary"
                                    >
                                        Click to retry
                                    </button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
