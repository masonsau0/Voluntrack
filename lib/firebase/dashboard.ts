import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    updateDoc,
    query,
    where,
    orderBy,
    deleteDoc,
    serverTimestamp,
    increment,
    addDoc,
    onSnapshot,
    limit,
    Timestamp
} from "firebase/firestore";
import { db } from "./config";
import { Opportunity } from "./opportunities";

export const BADGE_MILESTONES = [
    { id: "first-steps", hours: 1, name: "First Steps" },
    { id: "helping-hand", hours: 10, name: "Helping Hand" },
    { id: "goal-setter", hours: 40, name: "Goal Setter" },
];

export interface StructuredReflection {
    orgDescription: string;   // "What does the organization do?"
    howHelped: string;         // "How did you help?"
    whatLearned: string;       // "What did you learn?"
}

export interface FeedEvent {
    id: string;
    type: "badge_earned" | "application" | "completion";
    badgeId?: string;
    badgeName?: string;
    opportunityTitle: string;
    opportunityId?: string;
    createdAt: Timestamp;
}

export interface UserApplication {
    id: string;
    userId: string;
    opportunityId: string;
    status: "pending" | "approved" | "completed" | "denied" | "saved";
    appliedDate: string; // ISO
    // Snapshot of opportunity details at time of application for fast rendering
    title: string;
    organization: string;
    location: string;
    date: string;       // Display date from opportunity
    dateISO: string;    // Date for sorting/calendar
    hours: number;      // Numeric hours
    category: string;
    image: string;
    // Extra fields for detail popups
    description?: string;
    skills?: string[];
    commitment?: string;
    spotsLeft?: number;
    totalSpots?: number;
    updatedAt: any;
    lat?: number;
    lng?: number;
    // External Opportunity Fields
    isExternal?: boolean;
    reflection?: StructuredReflection | string;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
    // Decision metadata (written by org on approve/deny)
    decisionMessage?: string;
    orgContactName?: string;
    orgContactEmail?: string;
    orgContactPhone?: string;
}

export interface FirestoreNotification {
    id: string;
    recipientId: string;
    type: "decision";
    unread: boolean;
    message: string;
    timestamp: any;           // Firestore Timestamp
    opportunityTitle: string; // Snapshot to avoid re-querying
    status: "approved" | "denied";
}

export interface SavedOpportunity {
    userId: string;
    opportunityId: string;
    savedAt: any;
    // Snapshot of opportunity details
    title: string;
    organization: string;
    location: string;
    date: string;
    hours: number;
    category: string;
    image: string;
    // Extra fields for detail popups
    description?: string;
    skills?: string[];
    commitment?: string;
    spotsLeft?: number;
    totalSpots?: number;
    fullDate?: string;
}

/**
 * Fetch all applications for a specific user
 */
export async function getUserApplications(userId: string): Promise<UserApplication[]> {
    try {
        const appsRef = collection(db, "user_applications");
        const q = query(appsRef, where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        const allApps = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserApplication));
        // Filter out "saved" status in memory to avoid needing a composite index
        return allApps.filter(app => app.status !== "saved");
    } catch (error) {
        console.error("Error fetching user applications:", error);
        throw error;
    }
}

/**
 * Fetch all saved opportunities for a specific user
 */
export async function getUserSaved(userId: string): Promise<UserApplication[]> {
    try {
        const appsRef = collection(db, "user_applications");
        const q = query(appsRef, where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        const allApps = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserApplication));
        // Filter for "saved" status in memory to avoid needing a composite index
        return allApps.filter(app => app.status === "saved");
    } catch (error) {
        console.error("Error fetching saved opportunities:", error);
        throw error;
    }
}

/**
 * Toggle save status of an opportunity
 */
export async function toggleSaveOpportunity(userId: string, opportunity: Opportunity): Promise<boolean> {
    try {
        const docRef = doc(db, "user_applications", `${userId}_${opportunity.id}`);
        const existingDoc = await getDoc(docRef);

        if (existingDoc.exists()) {
            const data = existingDoc.data();
            if (data.status === "saved") {
                await deleteDoc(docRef);
                return false; // Removed from saved
            }
            throw new Error("You have already applied to this opportunity.");
        } else {
            const savedData: Omit<UserApplication, "id"> = {
                userId,
                opportunityId: opportunity.id,
                status: "saved",
                appliedDate: new Date().toISOString(),
                title: opportunity.title,
                organization: opportunity.organization,
                location: opportunity.location,
                date: opportunity.date,
                dateISO: opportunity.dateISO,
                hours: opportunity.hours,
                category: opportunity.category,
                image: opportunity.image,
                description: opportunity.description,
                skills: opportunity.skills,
                commitment: opportunity.commitment,
                spotsLeft: opportunity.spotsLeft,
                totalSpots: opportunity.totalSpots,
                updatedAt: serverTimestamp()
            };
            await setDoc(docRef, savedData);
            return true; // Added
        }
    } catch (error) {
        console.error("Error toggling saved opportunity:", error);
        throw error;
    }
}

/**
 * Check if an opportunity is saved by the user
 */
export async function isOpportunitySaved(userId: string, opportunityId: string): Promise<boolean> {
    try {
        const docRef = doc(db, "user_applications", `${userId}_${opportunityId}`);
        const existingDoc = await getDoc(docRef);
        return existingDoc.exists() && existingDoc.data()?.status === "saved";
    } catch (error) {
        console.error("Error checking saved status:", error);
        return false;
    }
}

/**
 * Apply to an opportunity
 */
export async function applyToOpportunity(userId: string, opportunity: Opportunity): Promise<void> {
    try {
        const appRef = doc(db, "user_applications", `${userId}_${opportunity.id}`);
        const appDoc = await getDoc(appRef);

        if (appDoc.exists()) {
            const status = appDoc.data()?.status;
            if (status !== "saved") {
                throw new Error("You have already applied to this opportunity.");
            }
            // If it was saved, we'll proceed to update it to pending below
        }

        const appData: Omit<UserApplication, "id"> = {
            userId,
            opportunityId: opportunity.id,
            status: "pending",
            appliedDate: new Date().toISOString(),
            title: opportunity.title,
            organization: opportunity.organization,
            location: opportunity.location,
            date: opportunity.date,
            dateISO: opportunity.dateISO,
            hours: opportunity.hours,
            category: opportunity.category,
            image: opportunity.image,
            description: opportunity.description,
            skills: opportunity.skills,
            commitment: opportunity.commitment,
            spotsLeft: opportunity.spotsLeft,
            totalSpots: opportunity.totalSpots,
            updatedAt: serverTimestamp()
        };

        await setDoc(appRef, appData);

        // Write feed event for application
        await writeFeedEvent("application", { opportunityTitle: opportunity.title, opportunityId: opportunity.id });

        // Check if user has applied to 5 opportunities to award 'active-applicant' badge
        const appsRef = collection(db, "user_applications");
        const q = query(appsRef, where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        
        // Count non-saved apps
        const applicationCount = querySnapshot.docs.filter(d => d.data().status !== "saved").length;
        
        // If exactly 5, award badge (or if >= 5 and they don't have it)
        if (applicationCount >= 5) {
            const profileRef = doc(db, "student_profiles", userId);
            const profileDoc = await getDoc(profileRef);
            if (profileDoc.exists()) {
                const currentBadges = profileDoc.data()?.badges || [];
                if (!currentBadges.includes("active-applicant")) {
                    await updateDoc(profileRef, {
                        badges: [...currentBadges, "active-applicant"],
                        updatedAt: serverTimestamp()
                    });
                }
            }
        }
    } catch (error) {
        console.error("Error applying to opportunity:", error);
        throw error;
    }
}

async function writeFeedEvent(
    type: FeedEvent["type"],
    payload: { opportunityTitle: string; opportunityId?: string; badgeId?: string; badgeName?: string }
): Promise<void> {
    try {
        await addDoc(collection(db, "feed_events"), {
            type,
            opportunityTitle: payload.opportunityTitle,
            ...(payload.opportunityId != null && { opportunityId: payload.opportunityId }),
            ...(payload.badgeId != null && { badgeId: payload.badgeId }),
            ...(payload.badgeName != null && { badgeName: payload.badgeName }),
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error writing feed event:", error);
        // Does not rethrow — feed event failure must not surface as an error to the caller
    }
}

async function writeDecisionNotification(
    recipientId: string,
    opportunityTitle: string,
    decisionStatus: "approved" | "denied"
): Promise<void> {
    try {
        await addDoc(collection(db, "notifications"), {
            recipientId,
            type: "decision",
            unread: true,
            message: `Your application to ${opportunityTitle} has been ${decisionStatus}.`,
            timestamp: serverTimestamp(),
            opportunityTitle,
            status: decisionStatus,
        });
    } catch (error) {
        console.error("Error writing decision notification:", error);
        // Does not rethrow — notification failure must not surface as an error to the org user
    }
}

/**
 * Update application status (Mock for demo/internal use)
 * In a real app, this would be triggered by an admin or organization.
 */
export async function updateApplicationStatus(
    userId: string,
    opportunityId: string,
    status: "approved" | "completed" | "denied",
    options?: {
        decisionMessage?: string;
        orgContactName?: string;
        orgContactEmail?: string;
        orgContactPhone?: string;
    }
): Promise<void> {
    try {
        const appRef = doc(db, "user_applications", `${userId}_${opportunityId}`);
        const appDoc = await getDoc(appRef);

        if (!appDoc.exists()) throw new Error("Application not found.");

        const oldStatus = appDoc.data().status;
        const updateData: Record<string, any> = { status, updatedAt: serverTimestamp() };
        if (options?.decisionMessage)  updateData.decisionMessage  = options.decisionMessage;
        if (options?.orgContactName)   updateData.orgContactName   = options.orgContactName;
        if (options?.orgContactEmail)  updateData.orgContactEmail  = options.orgContactEmail;
        if (options?.orgContactPhone)  updateData.orgContactPhone  = options.orgContactPhone;
        await updateDoc(appRef, updateData);

        if (status === "approved" || status === "denied") {
            const title = appDoc.data().title as string;
            await writeDecisionNotification(userId, title, status);
        }

        // If completed, increment student hours and check for badges in student_profiles
        if (status === "completed" && oldStatus !== "completed") {
            const opportunityTitle = appDoc.data().title as string;
            const opportunityId = appDoc.data().opportunityId as string;

            await writeFeedEvent("completion", { opportunityTitle, opportunityId });

            const profileRef = doc(db, "student_profiles", userId);
            const profileDoc = await getDoc(profileRef);
            const currentHours = profileDoc.data()?.hoursCompleted || 0;
            const currentBadges = profileDoc.data()?.badges || [];
            const hoursToAdd = appDoc.data().hours || 0;
            const newTotalHours = currentHours + hoursToAdd;

            const newBadges = [...currentBadges];
            const earnedBadges: { id: string; name: string }[] = [];
            BADGE_MILESTONES.forEach(milestone => {
                if (newTotalHours >= milestone.hours && !newBadges.includes(milestone.id)) {
                    newBadges.push(milestone.id);
                    earnedBadges.push({ id: milestone.id, name: milestone.name });
                }
            });

            await updateDoc(profileRef, {
                hoursCompleted: newTotalHours,
                badges: newBadges,
                updatedAt: serverTimestamp()
            });

            for (const badge of earnedBadges) {
                await writeFeedEvent("badge_earned", { opportunityTitle, opportunityId, badgeId: badge.id, badgeName: badge.name });
            }
        }
    } catch (error) {
        console.error("Error updating application status:", error);
        throw error;
    }
}

/**
 * Submit an external opportunity
 */
export async function submitExternalOpportunity(
    userId: string,
    data: {
        title: string;
        organization: string;
        date: string;
        hours: number;
        category: string;
        reflection: string;
        contactName: string;
        contactEmail: string;
        contactPhone?: string;
        location?: string;
        lat?: number;
        lng?: number;
    }
): Promise<void> {
    try {
        const opportunityId = `ext_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const appRef = doc(db, "user_applications", `${userId}_${opportunityId}`);

        // Parse date for display and sorting
        const parsedDate = new Date(data.date);
        const dateStr = parsedDate.toLocaleDateString("en-US", { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
        const dateISO = parsedDate.toISOString().split('T')[0];

        const appData: Omit<UserApplication, "id"> = {
            userId,
            opportunityId,
            status: "completed", // Auto-complete external opportunities
            appliedDate: new Date().toISOString(),
            title: data.title,
            organization: data.organization,
            location: data.location || "External",
            date: dateStr,
            dateISO,
            hours: data.hours,
            category: data.category,
            image: "/icon.svg", // Default image
            updatedAt: serverTimestamp(),
            // External specific fields
            isExternal: true,
            reflection: data.reflection,
            contactName: data.contactName,
            contactEmail: data.contactEmail,
            contactPhone: data.contactPhone,
            ...(data.lat != null && { lat: data.lat }),
            ...(data.lng != null && { lng: data.lng }),
        };

        await setDoc(appRef, appData);

        await writeFeedEvent("completion", { opportunityTitle: data.title, opportunityId });

        // Immediately increment hours and process badges
        const profileRef = doc(db, "student_profiles", userId);
        const profileDoc = await getDoc(profileRef);

        if (profileDoc.exists()) {
            const currentHours = profileDoc.data()?.hoursCompleted || 0;
            const currentBadges = profileDoc.data()?.badges || [];
            const hoursToAdd = data.hours || 0;
            const newTotalHours = currentHours + hoursToAdd;

            const newBadges = [...currentBadges];
            const earnedBadges: { id: string; name: string }[] = [];
            BADGE_MILESTONES.forEach(milestone => {
                if (newTotalHours >= milestone.hours && !newBadges.includes(milestone.id)) {
                    newBadges.push(milestone.id);
                    earnedBadges.push({ id: milestone.id, name: milestone.name });
                }
            });

            await updateDoc(profileRef, {
                hoursCompleted: newTotalHours,
                badges: newBadges,
                updatedAt: serverTimestamp()
            });

            for (const badge of earnedBadges) {
                await writeFeedEvent("badge_earned", { opportunityTitle: data.title, opportunityId, badgeId: badge.id, badgeName: badge.name });
            }
        }

    } catch (error) {
        console.error("Error submitting external opportunity:", error);
        throw error;
    }
}

/**
 * Subscribe to real-time decision notifications for a user
 */
export function subscribeToDecisionNotifications(
    userId: string,
    onUpdate: (notifications: FirestoreNotification[]) => void,
    onError?: (error: Error) => void
): () => void {
    const q = query(
        collection(db, "notifications"),
        where("recipientId", "==", userId),
        orderBy("timestamp", "desc")
    );
    return onSnapshot(
        q,
        (snapshot) => {
            const notifications = snapshot.docs.map(
                (doc) => ({ id: doc.id, ...doc.data() } as FirestoreNotification)
            );
            onUpdate(notifications);
        },
        (error) => {
            if (onError) onError(error);
        }
    );
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
    try {
        await updateDoc(doc(db, "notifications", notificationId), { unread: false });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        throw error;
    }
}

/**
 * Fetch the most recent N feed events ordered by createdAt DESC
 */
export async function getFeedEvents(limitN: number): Promise<FeedEvent[]> {
    try {
        const q = query(
            collection(db, "feed_events"),
            orderBy("createdAt", "desc"),
            limit(limitN)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeedEvent));
    } catch (error) {
        console.error("Error fetching feed events:", error);
        return [];
    }
}

/**
 * Submit a structured reflection for a completed/approved opportunity
 */
export async function submitReflection(
    userId: string,
    opportunityId: string,
    reflection: StructuredReflection
): Promise<void> {
    try {
        const appRef = doc(db, "user_applications", `${userId}_${opportunityId}`);
        const appDoc = await getDoc(appRef);

        if (!appDoc.exists()) throw new Error("Application not found.");

        await updateDoc(appRef, {
            reflection,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error submitting reflection:", error);
        throw error;
    }
}
