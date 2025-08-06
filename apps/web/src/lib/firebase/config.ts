

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getFunctions } from 'firebase/functions'
import { getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
    apiKey: "AIzaSyCkFg0GA7yOpplOpOSQ1iDueN1sLuKG5fs",
    authDomain: "vintusure.firebaseapp.com",
    projectId: "vintusure",
    storageBucket: "vintusure.appspot.com",
    messagingSenderId: "772944178213",
    appId: "1:772944178213:web:2f849891b37b012a7023cc",
    measurementId: "G-MF40L2SQJ6"
};

const app = initializeApp(firebaseConfig)

// Initialize services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
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

