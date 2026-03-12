"use client"

import React, { useState } from "react"
import { Bell, PenLine, Calendar, Building2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ReflectionModal } from "@/components/reflection-modal"
import { NotificationItem } from "@/hooks/use-notifications"

interface NotificationDropdownProps {
  notifications: NotificationItem[]
  count: number
  onReflectionSubmitted: () => void
}

export function NotificationDropdown({
  notifications,
  count,
  onReflectionSubmitted,
}: NotificationDropdownProps) {
  const [reflectionTarget, setReflectionTarget] = useState<NotificationItem | null>(null)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative hidden sm:flex" id="notification-bell">
            <Bell className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center animate-in fade-in zoom-in">
                {count}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 p-0 rounded-xl shadow-xl border-slate-200">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100">
            <h3 className="font-semibold text-sm text-slate-800">Notifications</h3>
            {count > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {count} reflection{count !== 1 ? "s" : ""} pending
              </p>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-[320px] overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
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
              ))
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
