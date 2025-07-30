

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
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
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    isSupported().then(yes => yes && (analytics = getAnalytics(app)));
}

// Connect to emulators in development
if (process.env.NODE_ENV === 'development') {
    console.log('Using Firebase Emulators');
    connectAuthEmulator(auth, 'http://localhost:9098');
    connectFirestoreEmulator(db, 'localhost', 8081);
    connectStorageEmulator(storage, 'localhost', 9198);
    connectFunctionsEmulator(functions, 'localhost', 5001);
}

export { app, auth, db, storage, functions, analytics }; 

