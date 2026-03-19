import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./config";
import { getAllOpportunities, type Opportunity } from "./opportunities";
export { getFeedEvents, type FeedEvent } from "./dashboard";

/**
 * Fetch opportunities that have valid lat/lng for map display
 */
export async function getOpportunitiesForMap(): Promise<Opportunity[]> {
    const all = await getAllOpportunities();
    return all.filter(opp => opp.lat != null && opp.lng != null);
}

/**
 * Count completed applications grouped by organization name
 */
export async function getOrgCompletedCounts(): Promise<Record<string, number>> {
    try {
        const q = query(
            collection(db, "user_applications"),
            where("status", "==", "completed")
        );
        const snapshot = await getDocs(q);
        const counts: Record<string, number> = {};
        snapshot.docs.forEach(doc => {
            const org = doc.data().organization as string | undefined;
            if (org) {
                counts[org] = (counts[org] ?? 0) + 1;
            }
        });
        return counts;
    } catch (error) {
        console.error("Error fetching org completed counts:", error);
        return {};
    }
}
