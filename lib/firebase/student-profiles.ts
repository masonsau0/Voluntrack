import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

export interface StudentProfile {
    userId: string;          // Same as Auth UID / document ID
    school?: string;
    interests: string[];     // e.g. ["environment", "education"] (pick 1-2)
    volunteerFormat: string; // "hybrid" | "in-person" | "remote" | "no-preference"
    availability: string;    // "weekends" | "weekdays" | "any-time"
    hoursCompleted: number;  // Hours logged so far
    updatedAt: any;
}

/**
 * Create a student profile document in the student_profiles collection.
 * The document ID matches the user's Auth UID.
 */
export async function createStudentProfile(
    uid: string,
    data: Pick<StudentProfile, "interests" | "volunteerFormat" | "availability"> & { school?: string }
): Promise<void> {
    const profile: Omit<StudentProfile, "userId"> = {
        ...(data.school ? { school: data.school } : {}),
        interests: data.interests,
        volunteerFormat: data.volunteerFormat,
        availability: data.availability,
        hoursCompleted: 0,
        updatedAt: serverTimestamp(),
    };
    await setDoc(doc(db, "student_profiles", uid), profile);
}

/**
 * Retrieve a student profile by UID. Returns null if not found.
 */
export async function getStudentProfile(uid: string): Promise<StudentProfile | null> {
    const snap = await getDoc(doc(db, "student_profiles", uid));
    if (!snap.exists()) return null;
    return { userId: snap.id, ...snap.data() } as StudentProfile;
}

/**
 * Update specific fields on a student profile.
 */
export async function updateStudentProfile(
    uid: string,
    data: Partial<Omit<StudentProfile, "userId" | "updatedAt">>
): Promise<void> {
    await updateDoc(doc(db, "student_profiles", uid), {
        ...data,
        updatedAt: serverTimestamp(),
    });
}
