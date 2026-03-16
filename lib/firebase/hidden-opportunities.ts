import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "./config"

export interface HiddenOpportunity {
  userId: string
  opportunityId: string
  hiddenAt: any
}

/**
 * Hide an opportunity for a user after they report it.
 * Doc ID mirrors the user_saved_opportunities pattern.
 */
export async function hideOpportunity(
  userId: string,
  opportunityId: string
): Promise<void> {
  const docId = `${userId}_${opportunityId}`
  await setDoc(doc(db, "user_hidden_opportunities", docId), {
    userId,
    opportunityId,
    hiddenAt: serverTimestamp(),
  })
}

/**
 * Returns the set of opportunity IDs that the user has hidden (reported).
 * Used on the opportunities page to filter out reported opportunities.
 */
export async function getHiddenOpportunityIds(
  userId: string
): Promise<Set<string>> {
  const q = query(
    collection(db, "user_hidden_opportunities"),
    where("userId", "==", userId)
  )
  const snap = await getDocs(q)
  const ids = new Set<string>()
  snap.forEach((d) => ids.add(d.data().opportunityId))
  return ids
}
