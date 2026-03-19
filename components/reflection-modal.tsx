"use client"

import React from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuth } from "@/contexts/AuthContext"
import { submitReflection } from "@/lib/firebase/dashboard"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Lightbulb, Heart, BookOpen } from "lucide-react"

const reflectionSchema = z.object({
  orgDescription: z.string().min(10, "Please write at least 10 characters"),
  howHelped: z.string().min(10, "Please write at least 10 characters"),
  whatLearned: z.string().min(10, "Please write at least 10 characters"),
})

type ReflectionFormValues = z.infer<typeof reflectionSchema>

interface ReflectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  opportunityId: string
  opportunityTitle: string
  organizationName: string
  onSuccess?: () => void
}

export function ReflectionModal({
  open,
  onOpenChange,
  opportunityId,
  opportunityTitle,
  organizationName,
  onSuccess,
}: ReflectionModalProps) {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<ReflectionFormValues>({
    resolver: zodResolver(reflectionSchema),
    defaultValues: {
      orgDescription: "",
      howHelped: "",
      whatLearned: "",
    },
  })

  async function onSubmit(values: ReflectionFormValues) {
    if (!user?.uid) {
      toast.error("You must be logged in.")
      return
    }

    setIsSubmitting(true)
    try {
      await submitReflection(user.uid, opportunityId, values)
      toast.success("Reflection submitted! Thank you for sharing your experience.")
      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Error submitting reflection:", error)
      toast.error("Failed to submit reflection. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto rounded-2xl border-slate-200 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-800">
            Reflect on Your Experience
          </DialogTitle>
          <DialogDescription>
            Share your thoughts on <strong>{opportunityTitle}</strong> with{" "}
            <strong>{organizationName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="orgDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    What does this organization do? *
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the organization's mission and the work they do in the community..."
                      className="resize-none rounded-xl border-slate-200 focus-visible:ring-sky-500 min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="howHelped"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-500" />
                    How did you help? *
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What tasks did you do? What impact did your contribution have?"
                      className="resize-none rounded-xl border-slate-200 focus-visible:ring-sky-500 min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="whatLearned"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-sky-500" />
                    What did you learn? *
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What new skills, perspectives, or insights did you gain from this experience?"
                      className="resize-none rounded-xl border-slate-200 focus-visible:ring-sky-500 min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-3 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="rounded-full px-6 border-slate-500 text-slate-900 font-semibold hover:bg-slate-300 hover:text-black hover:border-slate-600"
              >
                Later
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full px-6 bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-200 transition-all hover:scale-[1.02]"
              >
                {isSubmitting ? "Submitting..." : "Submit Reflection"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
