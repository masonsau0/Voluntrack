"use client"

import React, { useState } from "react"
import { Bell, PenLine, Calendar, Building2, Sparkles, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ReflectionModal } from "@/components/reflection-modal"
import { NotificationItem, ReflectionDueNotification, DecisionNotification } from "@/hooks/use-notifications"

interface NotificationDropdownProps {
  notifications: NotificationItem[]
  count: number
  onReflectionSubmitted: () => void
  onMarkRead: (notificationId: string) => void
}

function formatTimestamp(timestamp: any): string {
  if (!timestamp?.toDate) return ""
  const date = timestamp.toDate() as Date
  const diffMins = Math.floor((Date.now() - date.getTime()) / 60000)
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function NotificationDropdown({
  notifications,
  count,
  onReflectionSubmitted,
  onMarkRead,
}: NotificationDropdownProps) {
  const [reflectionTarget, setReflectionTarget] = useState<ReflectionDueNotification | null>(null)

  const decisionItems = notifications.filter((n): n is DecisionNotification => n.type === "decision")
  const reflectionItems = notifications.filter((n): n is ReflectionDueNotification => n.type === "reflection_due")
  const unreadCount = decisionItems.filter(n => n.unread).length
  const reflectionCount = reflectionItems.length

  const subtitle = [
    unreadCount > 0 && `${unreadCount} new decision${unreadCount !== 1 ? "s" : ""}`,
    reflectionCount > 0 && `${reflectionCount} reflection${reflectionCount !== 1 ? "s" : ""} due`
  ].filter(Boolean).join(" · ")

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative hidden sm:flex rounded-full" id="notification-bell">
            <Bell className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center animate-in fade-in zoom-in">
                {count}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 p-0 rounded-xl shadow-xl border-slate-200 z-[200]">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100">
            <h3 className="font-semibold text-sm text-slate-800">Notifications</h3>
            {count > 0 && subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {subtitle}
              </p>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-[320px] overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => {
                if (notification.type === "reflection_due") {
                  return (
                    <button
                      key={notification.id}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-b-0 flex items-start gap-3"
                      onClick={() => setReflectionTarget(notification)}
                    >
                      <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <PenLine className="w-4 h-4 text-sky-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3" />
                          {notification.organization}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {notification.date}
                        </p>
                        <p className="text-xs text-sky-600 font-medium mt-1">
                          Tell us about your experience →
                        </p>
                      </div>
                    </button>
                  )
                }

                if (notification.type === "decision") {
                  const isApproved = notification.status === "approved"
                  return (
                    <button
                      key={notification.id}
                      className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-b-0 flex items-start gap-3 ${notification.unread ? "bg-slate-50/70" : ""}`}
                      onClick={() => { if (notification.unread) onMarkRead(notification.notificationId) }}
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isApproved ? "bg-emerald-50" : "bg-red-50"}`}>
                        {isApproved
                          ? <CheckCircle className="w-4 h-4 text-emerald-500" />
                          : <XCircle className="w-4 h-4 text-red-500" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatTimestamp(notification.timestamp)}
                        </p>
                      </div>
                    </button>
                  )
                }

                return null
              })
            ) : (
              <div className="px-4 py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-green-500" />
                </div>
                <p className="text-sm font-medium text-slate-700">You&apos;re all caught up!</p>
                <p className="text-xs text-muted-foreground mt-1">
                  No pending reflections right now.
                </p>
              </div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Reflection Modal */}
      {reflectionTarget && (
        <ReflectionModal
          open={!!reflectionTarget}
          onOpenChange={(open) => {
            if (!open) setReflectionTarget(null)
          }}
          opportunityId={reflectionTarget.opportunityId}
          opportunityTitle={reflectionTarget.title}
          organizationName={reflectionTarget.organization}
          onSuccess={() => {
            setReflectionTarget(null)
            onReflectionSubmitted()
          }}
        />
      )}
    </>
  )
}
