import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';

// Run with: node --env-file=.env.local scripts/diagnose_badges.mjs

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

async function diagnose() {
    // 1. All feed_events (most recent 20)
    console.log("\n=== feed_events (most recent 20) ===");
    const eventsSnap = await getDocs(query(collection(db, "feed_events"), orderBy("createdAt", "desc"), limit(20)));
    if (eventsSnap.empty) {
        console.log("  [EMPTY — no documents in feed_events collection]");
    } else {
        eventsSnap.docs.forEach(d => {
            const data = d.data();
            console.log(`  [${d.id}]`, JSON.stringify({ ...data, createdAt: data.createdAt?.toDate?.()?.toISOString() ?? data.createdAt }));
        });
    }

    // 2. student_profiles that have badges
    console.log("\n=== student_profiles with badges ===");
    const profilesSnap = await getDocs(collection(db, "student_profiles"));
    let found = 0;
    profilesSnap.docs.forEach(d => {
        const data = d.data();
        if (data.badges && data.badges.length > 0) {
            found++;
            console.log(`  [${d.id}] badges:`, data.badges);
        }
    });
    if (found === 0) console.log("  [none found]");

    // 3. Most recent user_applications
    console.log("\n=== user_applications (most recent 10) ===");
    const appsSnap = await getDocs(query(collection(db, "user_applications"), orderBy("createdAt", "desc"), limit(10)));
    if (appsSnap.empty) {
        console.log("  [EMPTY]");
    } else {
        appsSnap.docs.forEach(d => {
            const data = d.data();
            console.log(`  [${d.id}]`, JSON.stringify({
                userId: data.userId,
                status: data.status,
                opportunityTitle: data.opportunityTitle,
                createdAt: data.createdAt?.toDate?.()?.toISOString() ?? data.createdAt,
            }));
        });
    }
}

diagnose().then(() => process.exit(0)).catch(e => { console.error("Error:", e); process.exit(1); });
