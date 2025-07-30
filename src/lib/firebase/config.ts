'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCkFg0GA7yOpplOpOSQ1iDueN1sLuKG5fs",
    authDomain: "vintusure.firebaseapp.com",
    projectId: "vintusure",
    storageBucket: "vintusure.firebasestorage.app",
    messagingSenderId: "772944178213",
    appId: "1:772944178213:web:2f849891b37b012a7023cc",
    measurementId: "G-MF40L2SQJ6"
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
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
    connectFunctionsEmulator(functions, 'localhost', 5001);
}

export { app, auth, db, storage, functions, analytics }; 