import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';

// Run with: node --env-file=.env.local scripts/backfill_active_applicant.mjs USER_ID
// USER_ID: the uid of the account that earned the badge (find it in Firestore > student_profiles)

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const userId = process.argv[2];
if (!userId) {
    console.error("Usage: node --env-file=.env.local scripts/backfill_active_applicant.mjs <USER_ID>");
    process.exit(1);
}

async function backfill() {
    // Find the 5th application for this user
    const q = query(collection(db, "user_applications"), where("userId", "==", userId));
    const snap = await getDocs(q);
    const apps = snap.docs.map(d => d.data()).filter(d => d.status !== "saved");

    if (apps.length < 5) {
        console.error(`Only found ${apps.length} non-saved applications for user ${userId}. Need at least 5.`);
        process.exit(1);
    }

    const fifth = apps[4];
    console.log(`Using opportunity: "${fifth.opportunityTitle}" (${fifth.opportunityId})`);

    const ref = await addDoc(collection(db, "feed_events"), {
        type: "badge_earned",
        badgeId: "active-applicant",
        badgeName: "Active Applicant",
        opportunityTitle: fifth.opportunityTitle,
        opportunityId: fifth.opportunityId,
        createdAt: Timestamp.now(),
    });

    console.log("✓ Created feed_event:", ref.id);
    console.log("Badge should now appear in the feed.");
}

backfill().then(() => process.exit(0)).catch(e => { console.error("Error:", e); process.exit(1); });
