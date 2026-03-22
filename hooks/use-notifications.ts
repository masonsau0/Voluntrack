"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/AuthContext"
import {
    getUserApplications,
    UserApplication,
    subscribeToDecisionNotifications,
    markNotificationAsRead,
    FirestoreNotification,
} from "@/lib/firebase/dashboard"

export interface ReflectionDueNotification {
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

export interface DecisionNotification {
    id: string
    type: "decision"
    notificationId: string   // Firestore doc ID, used for markAsRead
    message: string
    unread: boolean
    timestamp: any
    status: "approved" | "denied"
    opportunityTitle: string
}

export interface NewApplicantNotification {
    id: string
    type: "new_applicant"
    notificationId: string   // Firestore doc ID, used for markAsRead
    message: string
    unread: boolean
    timestamp: any
    opportunityTitle: string
}

export type NotificationItem = ReflectionDueNotification | DecisionNotification | NewApplicantNotification

/**
 * Hook that computes client-side notifications from the user's applications
 * and subscribes to real-time Firestore decision notifications.
 */
export function useNotifications() {
    const { user } = useAuth()
    const [reflectionItems, setReflectionItems] = useState<ReflectionDueNotification[]>([])
    const [decisionItems, setDecisionItems] = useState<(DecisionNotification | NewApplicantNotification)[]>([])
    const [loading, setLoading] = useState(true)

    const refresh = useCallback(async () => {
        if (!user?.uid) {
            setReflectionItems([])
            setLoading(false)
            return
        }

        setLoading(true)
        try {
            const applications = await getUserApplications(user.uid)
            const today = new Date().toISOString().split("T")[0]

            const reflectionDue = applications.filter((app: UserApplication) => {
                const isEligibleStatus = app.status === "approved" || app.status === "completed"
                const isPastDate = app.dateISO < today
                const hasNoReflection = !app.reflection
                const isNotExternal = !app.isExternal
                return isEligibleStatus && isPastDate && hasNoReflection && isNotExternal
            })

            setReflectionItems(
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
            setReflectionItems([])
        } finally {
            setLoading(false)
        }
    }, [user?.uid])

    useEffect(() => {
        refresh()
    }, [refresh])

    // Firestore real-time subscription for decision and new_applicant notifications
    useEffect(() => {
        if (!user?.uid) { setDecisionItems([]); return }
        const unsubscribe = subscribeToDecisionNotifications(
            user.uid,
            (firestoreNotifs: FirestoreNotification[]) => {
                setDecisionItems(firestoreNotifs.map((n) => {
                    if (n.type === "new_applicant") {
                        return {
                            id: `new_applicant_${n.id}`,
                            type: "new_applicant" as const,
                            notificationId: n.id,
                            message: n.message,
                            unread: n.unread,
                            timestamp: n.timestamp,
                            opportunityTitle: n.opportunityTitle,
                        } satisfies NewApplicantNotification
                    }
                    return {
                        id: `decision_${n.id}`,
                        type: "decision" as const,
                        notificationId: n.id,
                        message: n.message,
                        unread: n.unread,
                        timestamp: n.timestamp,
                        status: n.status as "approved" | "denied",
                        opportunityTitle: n.opportunityTitle,
                    } satisfies DecisionNotification
                }))
            },
            (error) => { console.error("Notification subscription error:", error); setDecisionItems([]) }
        )
        return () => unsubscribe()
    }, [user?.uid])

    const notifications: NotificationItem[] = [...decisionItems, ...reflectionItems]
    const count = decisionItems.filter(n => n.unread).length + reflectionItems.length

    const markAsRead = useCallback(async (notificationId: string) => {
        try { await markNotificationAsRead(notificationId) }
        catch (error) { console.error("Failed to mark notification as read:", error) }
    }, [])

    return { notifications, count, loading, refresh, markAsRead }
}
