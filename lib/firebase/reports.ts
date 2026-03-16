import {
    collection,
    addDoc,
    getDoc,
    doc,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

export interface Report {
    id: string;
    reporterId: string;
    opportunityId: string;
    orgId: string;
    reason: string;
    text: string;
    createdAt: any;
}

const MAX_REPORT_LENGTH = 1000;

/**
 * Submit a report for an opportunity.
 *
 * Validates text length on the client side (Firestore rules enforce the same
 * constraints server-side).  Looks up the orgId from the opportunity document
 * so the caller only needs the opportunityId.
 */
export async function submitReport(
    reporterId: string,
    opportunityId: string,
    reason: string,
    text: string
): Promise<string> {
    try {
        if (!reason.trim()) {
            throw new Error("A report reason is required.");
        }

        const trimmedText = text.trim();
        if (trimmedText.length > MAX_REPORT_LENGTH) {
            throw new Error(
                `Report text cannot exceed ${MAX_REPORT_LENGTH} characters.`
            );
        }

        // Resolve orgId from the opportunity document
        const oppDoc = await getDoc(doc(db, "opportunities", opportunityId));
        if (!oppDoc.exists()) {
            throw new Error("Opportunity not found.");
        }
        const orgId: string = oppDoc.data().orgId ?? "";
        if (!orgId) {
            throw new Error("Organization ID not found for this opportunity.");
        }

        const reportData: Omit<Report, "id"> = {
            reporterId,
            opportunityId,
            orgId,
            reason: reason.trim(),
            text: trimmedText,
            createdAt: serverTimestamp(),
        };

        const reportsRef = collection(db, "reports");
        const docRef = await addDoc(reportsRef, reportData);
        return docRef.id;
    } catch (error) {
        console.error("Error submitting report:", error);
        throw error;
    }
}
