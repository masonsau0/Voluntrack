import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Note: Requires node --env-file=.env.local

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

async function uploadSchools() {
    const rawData = fs.readFileSync('/Users/shauryaguleria/Code/School Scraping/ontario_schools_enriched.json', 'utf-8');
    const schools = JSON.parse(rawData);

    const schoolsCol = collection(db, "schools");
    let count = 0;
    
    // Process in batches or one by one
    for (const school of schools) {
        try {
            await addDoc(schoolsCol, {
                name: school.name,
                address: school.address || "",
                createdAt: new Date().toISOString()
            });
            count++;
            if (count % 100 === 0) {
                console.log(`Uploaded ${count} schools...`);
            }
        } catch (error) {
            console.error(`Error uploading school ${school.name}:`, error);
        }
    }
    console.log(`Finished uploading ${count} schools.`);
    process.exit(0);
}

uploadSchools().catch(console.error);
