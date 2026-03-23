"use client"

import React from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuth } from "@/contexts/AuthContext"
import { submitReport } from "@/lib/firebase/reports"
import { hideOpportunity } from "@/lib/firebase/hidden-opportunities"
import { containsInappropriateContent } from "@/lib/opportunityValidation"
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

const REPORT_REASONS = [
  "Household chores",
  "Normally-paid work (babysitting, lawn mowing, etc.)",
  "Court-ordered community service",
  "Requires vehicle operation or power tools",
  "Not a legitimate volunteer opportunity",
  "Other",
] as const

const formSchema = z
  .object({
    reason: z.string().min(1, "Please select a reason."),
    text: z
      .string()
      .max(1000, "Message cannot exceed 1000 characters.")
      .refine((v) => !containsInappropriateContent(v), "This field contains inappropriate content."),
  })
  .refine(
    (data) => data.reason !== "Other" || data.text.length >= 20,
    {
      message: "Please provide at least 20 characters explaining your concern.",
      path: ["text"],
    }
  )

type ReportFormValues = z.infer<typeof formSchema>

interface ReportOpportunityModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  opportunityId: string
  opportunityTitle: string
  onReportSubmitted: () => void
}

export function ReportOpportunityModal({
  open,
  onOpenChange,
  opportunityId,
  opportunityTitle,
  onReportSubmitted,
}: ReportOpportunityModalProps) {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { reason: "", text: "" },
  })

  const selectedReason = form.watch("reason")
  const textValue = form.watch("text")

  async function onSubmit(values: ReportFormValues) {
    if (!user?.uid) {
      toast.error("You must be logged in.")
      return
    }

    setIsSubmitting(true)
    try {
      await submitReport(user.uid, opportunityId, values.reason, values.text)
      await hideOpportunity(user.uid, opportunityId)
      toast.success("Report submitted. This opportunity has been hidden from your view.")
      form.reset()
      onOpenChange(false)
      onReportSubmitted()
    } catch (error) {
      console.error("Error submitting report:", error)
      toast.error("Failed to submit report. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) form.reset(); onOpenChange(o) }}>
      <DialogContent className="sm:max-w-[480px] max-h-[85vh] overflow-y-auto rounded-2xl border-slate-200 shadow-xl fixed top-[110px] sm:top-[120px] translate-y-0">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-800">Report Opportunity</DialogTitle>
          <DialogDescription>
            Why are you reporting <span className="font-medium text-slate-700">{opportunityTitle}</span>? This opportunity will be hidden from your view and flagged for admin review.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700">Reason *</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      {REPORT_REASONS.map((reason) => (
                        <label
                          key={reason}
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                            field.value === reason
                              ? "border-red-300 bg-red-50"
                              : "border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <input
                            type="radio"
                            value={reason}
                            checked={field.value === reason}
                            onChange={() => {
                              field.onChange(reason)
                              if (reason !== "Other") form.setValue("text", "")
                            }}
                            className="accent-red-500"
                          />
                          <span className="text-sm text-slate-700">{reason}</span>
                        </label>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedReason === "Other" && (
              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700">
                      Please explain <span className="text-slate-400 font-normal">(min 20 characters)</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your concern..."
                        className="resize-none rounded-xl border-slate-200 focus-visible:ring-red-400 min-h-[100px]"
                        maxLength={1000}
                        {...field}
                      />
                    </FormControl>
                    <p className="text-xs text-slate-400 text-right">{textValue.length} / 1000</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => { form.reset(); onOpenChange(false) }}
                className="rounded-full px-6 border-slate-500 text-slate-900 font-semibold hover:bg-slate-300 hover:text-black hover:border-slate-600"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full px-6 bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-100 transition-all hover:scale-[1.02]"
              >
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
