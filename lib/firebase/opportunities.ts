import { 
  collection, 
  getDocs, 
  query, 
  limit, 
  startAfter, 
  orderBy, 
  QueryDocumentSnapshot,
  DocumentData,
  Timestamp
} from "firebase/firestore";
import { db } from "./config";

export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  description: string;
  date: string;       // Display date string, e.g., "Saturday, Jan 25, 2026"
  dateISO: string;    // ISO date string, e.g., "2026-01-25"
  time: string;
  location: string;
  hours: number;
  spotsLeft: number;
  totalSpots: number;
  category: string;
  commitment: string;
  skills: string[];
  featured: boolean;
  image: string;
}

export const ITEMS_PER_PAGE = 9; // Number of items to fetch per chunk

export async function getOpportunities(
  lastVisible: QueryDocumentSnapshot<DocumentData> | null = null
): Promise<{ opportunities: Opportunity[]; lastVisible: QueryDocumentSnapshot<DocumentData> | null }> {
  try {
    const opportunitiesRef = collection(db, "opportunities");
    
    // Base query with ordering by createdAt (most recent first)
    // We use createdAt because the current data has it, whereas dateISO might be missing on some test data.
    let q = query(
      opportunitiesRef, 
      orderBy("createdAt", "desc"), 
      limit(ITEMS_PER_PAGE)
    );

    if (lastVisible) {
      q = query(
        opportunitiesRef, 
        orderBy("dateISO", "asc"), 
        startAfter(lastVisible), 
        limit(ITEMS_PER_PAGE)
      );
    }

    const querySnapshot = await getDocs(q);
    
    const opportunities: Opportunity[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Map Firestore data to Opportunity interface with safe defaults
      // The current test data has: createdAt, description, status, startTime, endTime
      
      const startTime = data.startTime?.toDate ? data.startTime.toDate() : new Date();
      const dateISO = startTime.toISOString().split('T')[0];
      const dateStr = startTime.toLocaleDateString("en-US", { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
      const timeStr = startTime.toLocaleTimeString("en-US", { hour: 'numeric', minute: '2-digit' });

      opportunities.push({
        id: doc.id,
        title: data.title || "Untitled Opportunity",
        organization: data.organization || "Volunteer Organization",
        description: data.description || "No description provided.",
        date: data.date || dateStr,
        dateISO: data.dateISO || dateISO,
        time: data.time || timeStr,
        location: data.location || "Location TBD",
        hours: data.hours || 0,
        spotsLeft: data.spotsLeft || 0,
        totalSpots: data.totalSpots || 0,
        category: data.category || "Community Outreach",
        commitment: data.commitment || "One-time",
        skills: data.skills || [],
        featured: data.featured || false,
        image: data.image || "/placeholder.jpg", // Ensure you have a placeholder or handle missing image in UI
      } as Opportunity);
    });

    const newLastVisible = querySnapshot.docs.length > 0 
      ? querySnapshot.docs[querySnapshot.docs.length - 1] 
      : null;

    return { 
      opportunities, 
      lastVisible: newLastVisible 
    };
  } catch (error) {
    console.error("Error fetching opportunities:", error);
    throw error;
  }
}
