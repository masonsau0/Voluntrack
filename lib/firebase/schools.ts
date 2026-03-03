import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    serverTimestamp,
    writeBatch,
} from "firebase/firestore";
import { db } from "./config";

export interface School {
    schoolId: string;   // Document ID
    name: string;
    address: string;
    createdAt?: any;
}

/**
 * Get all schools, ordered by name
 */
export async function getSchools(): Promise<School[]> {
    const schoolsRef = collection(db, "schools");
    const q = query(schoolsRef, orderBy("name", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
        schoolId: doc.id,
        ...doc.data(),
    } as School));
}

/**
 * Get a single school by ID
 */
export async function getSchool(schoolId: string): Promise<School | null> {
    const snap = await getDoc(doc(db, "schools", schoolId));
    if (!snap.exists()) return null;
    return { schoolId: snap.id, ...snap.data() } as School;
}

/**
 * Create a new school
 */
export async function createSchool(data: Omit<School, "schoolId" | "createdAt">): Promise<string> {
    const schoolsRef = collection(db, "schools");
    const docRef = doc(schoolsRef);
    await setDoc(docRef, {
        name: data.name,
        address: data.address,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
}

/**
 * Update an existing school
 */
export async function updateSchool(
    schoolId: string,
    data: Partial<Pick<School, "name" | "address">>
): Promise<void> {
    await updateDoc(doc(db, "schools", schoolId), { ...data });
}

/**
 * Delete a school
 */
export async function deleteSchool(schoolId: string): Promise<void> {
    await deleteDoc(doc(db, "schools", schoolId));
}

/**
 * Bulk import schools from a JSON array.
 * Each item should have { name: string, address: string }.
 * Uses Firestore batched writes (max 500 per batch).
 */
export async function bulkImportSchools(
    schools: { name: string; address: string }[]
): Promise<number> {
    let count = 0;
    const BATCH_SIZE = 500;

    for (let i = 0; i < schools.length; i += BATCH_SIZE) {
        const batch = writeBatch(db);
        const chunk = schools.slice(i, i + BATCH_SIZE);

        for (const school of chunk) {
            const docRef = doc(collection(db, "schools"));
            batch.set(docRef, {
                name: school.name,
                address: school.address,
                createdAt: serverTimestamp(),
            });
            count++;
        }

        await batch.commit();
    }

    return count;
}
