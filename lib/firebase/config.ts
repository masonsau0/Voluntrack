import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Firebase configuration
// These should be set in your .env.local file
const firebaseConfig = {
    apiKey: "AIzaSyCEbLFkW7I0l225oerXByjER8ugXYGgkhM",
    authDomain: "voluntrack-d38ac.firebaseapp.com",
    projectId: "voluntrack-d38ac",
    storageBucket: "voluntrack-d38ac.firebasestorage.app",
    messagingSenderId: "264097883289",
    appId: "1:264097883289:web:5f5bae50a1c6b78f2e4408",
    measurementId: "G-T25CJGNYDN"
  };

// Initialize Firebase
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase services
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

export default app;
