"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { containsInappropriateContent } from "@/lib/opportunityValidation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const noExplicit = (field: z.ZodString) =>
  field.refine((v) => !containsInappropriateContent(v), "This field contains inappropriate content.")

const formSchema = z.object({
  orgName: noExplicit(z.string().min(1, "Organization name is required")),
  firstName: noExplicit(z.string().min(1, "First name is required")),
  lastName: noExplicit(z.string().min(1, "Last name is required")),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function CreateOrgPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successInfo, setSuccessInfo] = useState<{ uid: string; orgId: string; resetLink: string } | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  })

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/admin/create-org", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to create organization")
      }

      setSuccessInfo(data)
      toast.success("Organization account created! Password reset email sent.")
      reset()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-6">Create Organization Account</h1>

      {successInfo && (
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="pt-6 text-sm text-green-800 space-y-1">
            <p><strong>Organization created successfully!</strong></p>
            <p>UID: <code>{successInfo.uid}</code></p>
            <p>Org ID: <code>{successInfo.orgId}</code></p>
            <p className="break-all">
              Password reset link:{" "}
              <a href={successInfo.resetLink} className="underline" target="_blank" rel="noreferrer">
                {successInfo.resetLink}
              </a>
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>New Organization</CardTitle>
          <CardDescription>
            Creates a Firebase Auth user, Firestore documents, and sends a password reset email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orgName">Organization Name</Label>
              <Input id="orgName" {...register("orgName")} placeholder="Helping Hands Nonprofit" />
              {errors.orgName && <p className="text-sm text-red-500">{errors.orgName.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Contact First Name</Label>
                <Input id="firstName" {...register("firstName")} placeholder="Jane" />
                {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Contact Last Name</Label>
                <Input id="lastName" {...register("lastName")} placeholder="Smith" />
                {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} placeholder="contact@org.com" />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number (optional)</Label>
              <Input id="phoneNumber" type="tel" {...register("phoneNumber")} placeholder="+1 (555) 000-0000" />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Organization"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
