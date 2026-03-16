"use client"

import React, { useEffect, useState, useRef } from "react"
import { AdminReport } from "@/app/api/admin/reports/route"
import { ReportCard } from "@/components/admin/report-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { getAuth } from "firebase/auth"

export default function AdminReportsPage() {
  const [reports, setReports] = useState<AdminReport[]>([])
  const [loading, setLoading] = useState(true)
  const [editingReport, setEditingReport] = useState<AdminReport | null>(null)
  const [editForm, setEditForm] = useState({ title: "", description: "", location: "", hours: "", spotsLeft: "" })
  const [isActing, setIsActing] = useState(false)
  const hasFetched = useRef(false)

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true
    fetchReports()
  }, [])

  async function refreshSession(): Promise<boolean> {
    try {
      const auth = getAuth()
      const currentUser = auth.currentUser
      if (!currentUser) return false
      const freshToken = await currentUser.getIdToken(true)
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: freshToken }),
      })
      return res.ok
    } catch {
      return false
    }
  }

  async function fetchReports() {
    setLoading(true)
    try {
      let res = await fetch("/api/admin/reports")

      // Token expired — refresh once and retry
      if (res.status === 401) {
        const refreshed = await refreshSession()
        if (!refreshed) {
          toast.error("Session expired. Please log out and log back in.")
          return
        }
        res = await fetch("/api/admin/reports")
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? `HTTP ${res.status}`)
      }
      const data = await res.json()
      setReports(data.reports)
    } catch (err) {
      console.error('[admin/reports]', err)
      toast.error(`Failed to load reports: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  async function resolve(reportId: string, opportunityId: string, action: string, opportunityData?: Record<string, unknown>) {
    setIsActing(true)
    try {
      const body = JSON.stringify({ action, opportunityId, opportunityData })
      let res = await fetch(`/api/admin/reports/${reportId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      })
      if (res.status === 401) {
        await refreshSession()
        res = await fetch(`/api/admin/reports/${reportId}/resolve`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        })
      }
      if (!res.ok) throw new Error("Action failed")
      setReports((prev) => prev.filter((r) => r.id !== reportId))
      setEditingReport(null)
      toast.success(
        action === "remove"
          ? "Opportunity removed."
          : action === "edit"
          ? "Opportunity updated and report dismissed."
          : "Report dismissed."
      )
    } catch (err) {
      console.error(err)
      toast.error("Action failed. Please try again.")
    } finally {
      setIsActing(false)
    }
  }

  function handleEditClick(report: AdminReport) {
    setEditingReport(report)
    setEditForm({
      title: report.opportunityTitle,
      description: "",
      location: "",
      hours: "",
      spotsLeft: "",
    })
  }

  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingReport) return
    const opportunityData: Record<string, unknown> = {}
    if (editForm.title.trim()) opportunityData.title = editForm.title.trim()
    if (editForm.description.trim()) opportunityData.description = editForm.description.trim()
    if (editForm.location.trim()) opportunityData.location = editForm.location.trim()
    if (editForm.hours) opportunityData.hours = Number(editForm.hours)
    if (editForm.spotsLeft) opportunityData.spotsLeft = Number(editForm.spotsLeft)
    resolve(editingReport.id, editingReport.opportunityId, "edit", opportunityData)
  }

  if (loading) {
    return <p className="text-gray-500 text-sm">Loading reports...</p>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Flagged Opportunities</h1>
      <p className="text-gray-500 text-sm mb-6">
        Student-reported opportunities awaiting review. Remove, edit, or dismiss each report.
      </p>

      {reports.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium">No pending reports</p>
          <p className="text-sm mt-1">All flagged opportunities have been reviewed.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id}>
              <ReportCard
                report={report}
                onRemove={(id, oppId) => resolve(id, oppId, "remove")}
                onAllow={(id) => resolve(id, report.opportunityId, "allow")}
                onEditClick={handleEditClick}
              />

              {editingReport?.id === report.id && (
                <form
                  onSubmit={handleEditSubmit}
                  className="mt-2 p-4 border border-gray-200 rounded-xl bg-gray-50 space-y-3"
                >
                  <p className="text-sm font-semibold text-gray-700">Edit opportunity fields (leave blank to keep existing value)</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Title</label>
                      <Input
                        value={editForm.title}
                        onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                        placeholder="Opportunity title"
                        className="rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Location</label>
                      <Input
                        value={editForm.location}
                        onChange={(e) => setEditForm((f) => ({ ...f, location: e.target.value }))}
                        placeholder="Location"
                        className="rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Hours</label>
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        value={editForm.hours}
                        onChange={(e) => setEditForm((f) => ({ ...f, hours: e.target.value }))}
                        placeholder="Hours"
                        className="rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Spots Left</label>
                      <Input
                        type="number"
                        min="0"
                        value={editForm.spotsLeft}
                        onChange={(e) => setEditForm((f) => ({ ...f, spotsLeft: e.target.value }))}
                        placeholder="Spots left"
                        className="rounded-lg text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Description</label>
                    <Textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                      placeholder="Updated description..."
                      className="resize-none rounded-lg text-sm min-h-[80px]"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingReport(null)}
                      className="rounded-full"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={isActing}
                      className="rounded-full bg-gray-900 hover:bg-gray-800 text-white"
                    >
                      {isActing ? "Saving..." : "Save & Dismiss Report"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
