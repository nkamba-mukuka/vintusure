

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

// Initialize Analytics only in browser environment and production
let analytics = null;
if (typeof window !== 'undefined' && import.meta.env.PROD) {
    isSupported().then(yes => yes && (analytics = getAnalytics(app)));
}

// Connect to emulators in development
if (import.meta.env.DEV) {
    console.log('Using Firebase Emulators');
    connectAuthEmulator(auth, 'http://localhost:9098');
    connectFirestoreEmulator(db, 'localhost', 8081);
    connectStorageEmulator(storage, 'localhost', 9198);
    connectFunctionsEmulator(functions, 'localhost', 5001);
}

export { app, auth, db, storage, functions, analytics };

