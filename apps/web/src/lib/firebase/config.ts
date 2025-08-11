

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

import { getFunctions } from 'firebase/functions'
import { getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
    apiKey: process.env.VITE_VINTUSURE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_VINTUSURE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_VINTUSURE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_VINTUSURE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_VINTUSURE_FIREBASE_MESSAGING_SENDER_Id,
    appId: process.env.VITE_VINTUSURE_FIREBASE_APP_ID,
    measurementId: process.env.VITE_VINTUSURE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig)

// Initialize services
export const auth = getAuth(app)
export const db = getFirestore(app)

export const functions = getFunctions(app, 'us-central1')

// Initialize analytics in production
let analytics = null
if (typeof window !== 'undefined' && !window.location.host.includes('localhost')) {
    try {
        analytics = getAnalytics(app)
    } catch (error) {
        console.warn('Analytics initialization failed:', error)
    }
}
export { analytics }

