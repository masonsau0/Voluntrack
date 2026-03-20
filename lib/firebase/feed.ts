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
 * Fetch external completed opportunities that have lat/lng for map display.
 * External opportunities are stored in user_applications (not in opportunities),
 * so getOpportunitiesForMap() misses them.
 */
export async function getCompletedExternalLocations(): Promise<Opportunity[]> {
    try {
        const q = query(
            collection(db, "user_applications"),
            where("status", "==", "completed"),
            where("isExternal", "==", true)
        );
        const snapshot = await getDocs(q);
        const seen = new Set<string>();
        const results: Opportunity[] = [];
        snapshot.docs.forEach(doc => {
            const d = doc.data();
            if (d.lat == null || d.lng == null) return;
            if (seen.has(d.opportunityId)) return;
            seen.add(d.opportunityId);
            results.push({
                id: d.opportunityId,
                title: d.title,
                organization: d.organization,
                description: "",
                date: d.date || "",
                dateISO: d.dateISO || "",
                time: "",
                location: d.location || "",
                hours: d.hours || 0,
                spotsLeft: 0,
                totalSpots: 0,
                category: d.category || "",
                commitment: "",
                skills: [],
                featured: false,
                image: "/icon.svg",
                lat: d.lat,
                lng: d.lng,
            } as Opportunity);
        });
        return results;
    } catch (error) {
        console.error("Error fetching completed external locations:", error);
        return [];
    }
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
/**
 * Fetch global community stats for the feed header
 */
export async function getFeedGlobalStats(): Promise<{ 
    studentVolunteers: number, 
    activeOpportunities: number, 
    totalImpactHours: number, 
    completedHours: number 
}> {
    try {
        const [studentsSnap, oppsSnap, appsSnap] = await Promise.all([
            getDocs(collection(db, "student_profiles")),
            getDocs(collection(db, "opportunities")),
            getDocs(query(collection(db, "user_applications"), where("status", "==", "completed")))
        ]);

        const studentVolunteers = studentsSnap.size;
        const activeOpportunities = oppsSnap.size;
        
        let totalImpactHours = 0;
        oppsSnap.docs.forEach(doc => {
            totalImpactHours += (doc.data().hours || 0);
        });

        let completedHours = 0;
        appsSnap.docs.forEach(doc => {
            completedHours += (doc.data().hours || 0);
        });

        return {
            studentVolunteers,
            activeOpportunities,
            totalImpactHours,
            completedHours
        };
    } catch (error) {
        console.error("Error fetching global feed stats:", error);
        return { studentVolunteers: 0, activeOpportunities: 0, totalImpactHours: 0, completedHours: 0 };
    }
}
