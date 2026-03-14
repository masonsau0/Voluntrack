import {
    collection,
    doc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";
import { Opportunity } from "./opportunities";
import { UserApplication } from "./dashboard";
import { getUserProfile } from "./auth";

export interface OrgApplicant extends UserApplication {
    userName: string;
    userEmail: string;
    userPhone?: string;
    message?: string;
}

/**
 * Fetch all opportunities created by a specific organization
 */
export async function getOrgOpportunities(orgId: string): Promise<Opportunity[]> {
    try {
        const oppsRef = collection(db, "opportunities");
        const q = query(oppsRef, where("orgId", "==", orgId), orderBy("dateISO", "asc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Opportunity));
    } catch (error) {
        console.error("Error fetching org opportunities:", error);
        throw new Error("Failed to fetch opportunities.");
    }
}

/**
 * Create a new opportunity
 */
export async function createOpportunity(orgId: string, data: Omit<Opportunity, "id">): Promise<string> {
    try {
        const oppsRef = collection(db, "opportunities");
        const docRef = await addDoc(oppsRef, {
            ...data,
            orgId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error("Error creating opportunity:", error);
        throw new Error("Failed to create opportunity.");
    }
}

/**
 * Update an existing opportunity
 */
export async function updateOpportunity(id: string, data: Partial<Opportunity>): Promise<void> {
    try {
        const docRef = doc(db, "opportunities", id);
        await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
    } catch (error) {
        console.error("Error updating opportunity:", error);
        throw new Error("Failed to update opportunity.");
    }
}

/**
 * Delete an opportunity
 */
export async function deleteOpportunity(id: string): Promise<void> {
    try {
        const docRef = doc(db, "opportunities", id);
        await deleteDoc(docRef);
    } catch (error) {
        console.error("Error deleting opportunity:", error);
        throw new Error("Failed to delete opportunity.");
    }
}

/**
 * Fetch all user applications for a specific organization's opportunities
 */
export async function getOrgApplicants(orgId: string): Promise<OrgApplicant[]> {
    try {
        const opportunities = await getOrgOpportunities(orgId);
        const opportunityIds = opportunities.map(opp => opp.id);

        if (opportunityIds.length === 0) return [];

        const appsRef = collection(db, "user_applications");
        const apps: OrgApplicant[] = [];

        // Firestore 'in' queries are limited to 10 items, so chunk the IDs
        for (let i = 0; i < opportunityIds.length; i += 10) {
            const chunk = opportunityIds.slice(i, i + 10);
            const q = query(appsRef, where("opportunityId", "in", chunk));
            const querySnapshot = await getDocs(q);
            
            const profilesPromises = querySnapshot.docs.map(async (doc) => {
                const data = doc.data() as UserApplication;
                let userName = "Unknown User";
                let userEmail = "No email provided";
                try {
                    const profile = await getUserProfile(data.userId);
                    if (profile) {
                         userName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Unknown User';
                         userEmail = profile.email;
                    }
                } catch (e) {
                    console.error("Failed to fetch profile for user", data.userId, e);
                }
                return {
                    ...data,
                    id: doc.id, // Explicitly override just to be safe, but place after ...data
                    userName,
                    userEmail,
                    message: (data as any).message ?? "",
                } as OrgApplicant;
            });
            
            const chunkApps = await Promise.all(profilesPromises);
            apps.push(...chunkApps);
        }
        
        // Sort by appliedDate descending
        return apps.sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime());
    } catch (error) {
        console.error("Error fetching org applicants:", error);
        throw new Error("Failed to fetch applicants.");
    }
}
