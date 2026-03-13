"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { getUserApplications, UserApplication } from "@/lib/firebase/dashboard"

export interface NotificationItem {
    id: string
    type: "reflection_due"
    applicationId: string
    opportunityId: string
    title: string
    organization: string
    date: string
    hours: number
    category: string
    image: string
}

/**
 * Hook that computes client-side notifications from the user's applications.
 * Currently checks for approved opportunities past their date that lack a reflection.
 * 
 * Designed with a stable interface so the implementation can be swapped to a
 * Firestore `notifications` collection or Cloud Functions later.
 */
export function useNotifications() {
    const { user } = useAuth()
    const [notifications, setNotifications] = useState<NotificationItem[]>([])
    const [loading, setLoading] = useState(true)

    const refresh = useCallback(async () => {
        if (!user?.uid) {
            setNotifications([])
            setLoading(false)
            return
        }

        setLoading(true)
        try {
            const applications = await getUserApplications(user.uid)
            const today = new Date().toISOString().split("T")[0]

            const reflectionDue = applications.filter((app: UserApplication) => {
                // Must be approved (accepted but not yet marked complete)
                // OR completed — both should prompt for reflection after the date
                const isEligibleStatus = app.status === "approved" || app.status === "completed"
                // Opportunity date must have passed
                const isPastDate = app.dateISO < today
                // Must not already have a reflection
                const hasNoReflection = !app.reflection
                // External opportunities already require reflection at submission
                const isNotExternal = !app.isExternal

                return isEligibleStatus && isPastDate && hasNoReflection && isNotExternal
            })

            setNotifications(
                reflectionDue.map((app) => ({
                    id: `reflection_${app.id}`,
                    type: "reflection_due" as const,
                    applicationId: app.id,
                    opportunityId: app.opportunityId,
                    title: app.title,
                    organization: app.organization,
                    date: app.date,
                    hours: app.hours,
                    category: app.category,
                    image: app.image,
                }))
            )
        } catch (error) {
            console.error("Error computing notifications:", error)
            setNotifications([])
        } finally {
            setLoading(false)
        }
    }, [user?.uid])

    useEffect(() => {
        refresh()
    }, [refresh])

    return { notifications, count: notifications.length, loading, refresh }
}
