import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

export interface VolunteerOrgProfile {
    userId: string;    // Same as Auth UID / document ID
    orgId: string;     // Reference to the corresponding volunteer_orgs document
    phoneNumber: string;
    updatedAt: any;
}

/**
 * Create a volunteer org profile document in the volunteer_org_profiles collection.
 * The document ID matches the user's Auth UID.
 * Called by an admin/system when provisioning a new org account.
 */
export async function createVolunteerOrgProfile(
    uid: string,
    data: Pick<VolunteerOrgProfile, "orgId" | "phoneNumber">
): Promise<void> {
    const profile: Omit<VolunteerOrgProfile, "userId"> = {
        orgId: data.orgId,
        phoneNumber: data.phoneNumber,
        updatedAt: serverTimestamp(),
    };
    await setDoc(doc(db, "volunteer_org_profiles", uid), profile);
}

/**
 * Retrieve a volunteer org profile by UID. Returns null if not found.
 */
export async function getVolunteerOrgProfile(uid: string): Promise<VolunteerOrgProfile | null> {
    const snap = await getDoc(doc(db, "volunteer_org_profiles", uid));
    if (!snap.exists()) return null;
    return { userId: snap.id, ...snap.data() } as VolunteerOrgProfile;
}

/**
 * Update specific fields on a volunteer org profile.
 */
export async function updateVolunteerOrgProfile(
    uid: string,
    data: Partial<Pick<VolunteerOrgProfile, "orgId" | "phoneNumber">>
): Promise<void> {
    await updateDoc(doc(db, "volunteer_org_profiles", uid), {
        ...data,
        updatedAt: serverTimestamp(),
    });
}
