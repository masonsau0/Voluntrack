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
    increment
} from "firebase/firestore";
import { db } from "./config";
import { Opportunity } from "./opportunities";

export const BADGE_MILESTONES = [
    { id: "first-steps", hours: 1, name: "First Steps" },
    { id: "helping-hand", hours: 10, name: "Helping Hand" },
    { id: "goal-setter", hours: 40, name: "Goal Setter" },
];

export interface UserApplication {
    id: string;
    userId: string;
    opportunityId: string;
    status: "pending" | "approved" | "completed" | "denied";
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
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserApplication));
    } catch (error) {
        console.error("Error fetching user applications:", error);
        throw error;
    }
}

/**
 * Fetch all saved opportunities for a specific user
 */
export async function getUserSaved(userId: string): Promise<SavedOpportunity[]> {
    try {
        const savedRef = collection(db, "user_saved_opportunities");
        const q = query(savedRef, where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data() as SavedOpportunity);
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
        const savedDocRef = doc(db, "user_saved_opportunities", `${userId}_${opportunity.id}`);
        const savedDoc = await getDoc(savedDocRef);

        if (savedDoc.exists()) {
            await deleteDoc(savedDocRef);
            return false; // Removed
        } else {
            const savedData: SavedOpportunity = {
                userId,
                opportunityId: opportunity.id,
                savedAt: serverTimestamp(),
                title: opportunity.title,
                organization: opportunity.organization,
                location: opportunity.location,
                date: opportunity.date,
                hours: opportunity.hours,
                category: opportunity.category,
                image: opportunity.image
            };
            await setDoc(savedDocRef, savedData);
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
        const savedDocRef = doc(db, "user_saved_opportunities", `${userId}_${opportunityId}`);
        const savedDoc = await getDoc(savedDocRef);
        return savedDoc.exists();
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
            throw new Error("You have already applied to this opportunity.");
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
            updatedAt: serverTimestamp()
        };

        await setDoc(appRef, appData);
    } catch (error) {
        console.error("Error applying to opportunity:", error);
        throw error;
    }
}

/**
 * Update application status (Mock for demo/internal use)
 * In a real app, this would be triggered by an admin or organization.
 */
export async function updateApplicationStatus(
    userId: string,
    opportunityId: string,
    status: "approved" | "completed" | "denied"
): Promise<void> {
    try {
        const appRef = doc(db, "user_applications", `${userId}_${opportunityId}`);
        const appDoc = await getDoc(appRef);

        if (!appDoc.exists()) throw new Error("Application not found.");

        const oldStatus = appDoc.data().status;
        await updateDoc(appRef, { status, updatedAt: serverTimestamp() });

        // If completed, increment user hours and check for badges
        if (status === "completed" && oldStatus !== "completed") {
            const userRef = doc(db, "users", userId);
            const userDoc = await getDoc(userRef);
            const currentHours = userDoc.data()?.totalHours || 0;
            const currentBadges = userDoc.data()?.badges || [];
            const hoursToAdd = appDoc.data().hours || 0;
            const newTotalHours = currentHours + hoursToAdd;

            const newBadges = [...currentBadges];
            BADGE_MILESTONES.forEach(milestone => {
                if (newTotalHours >= milestone.hours && !newBadges.includes(milestone.id)) {
                    newBadges.push(milestone.id);
                }
            });

            await updateDoc(userRef, {
                totalHours: newTotalHours,
                badges: newBadges,
                updatedAt: serverTimestamp()
            });
        }
    } catch (error) {
        console.error("Error updating application status:", error);
        throw error;
    }
}
