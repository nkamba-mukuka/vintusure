

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getFunctions } from 'firebase/functions'
import { getAnalytics } from 'firebase/analytics'

// Check if Firebase environment variables are set
const requiredEnvVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
]

const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName])

if (missingVars.length > 0) {
    console.error('Missing Firebase environment variables:', missingVars)
    console.error('Please create a .env file in the apps/web directory with the following variables:')
    console.error('VITE_FIREBASE_API_KEY=your_api_key_here')
    console.error('VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com')
    console.error('VITE_FIREBASE_PROJECT_ID=your_project_id')
    console.error('VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com')
    console.error('VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id')
    console.error('VITE_FIREBASE_APP_ID=your_app_id')
    console.error('VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id')
    
    // Provide a fallback configuration for development
    if (import.meta.env.DEV) {
        console.warn('Using fallback Firebase configuration for development. Please set up proper Firebase credentials.')
    }
}

const firebaseConfig = {
  apiKey: "AIzaSyCkFg0GA7yOpplOpOSQ1iDueN1sLuKG5fs",
  authDomain: "vintusure.firebaseapp.com",
  projectId: "vintusure",
  storageBucket: "vintusure.firebasestorage.app",
  messagingSenderId: "772944178213",
  appId: "1:772944178213:web:2f849891b37b012a7023cc",
  measurementId: "G-MF40L2SQJ6"
};

const app = initializeApp(firebaseConfig)

// Initialize services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const functions = getFunctions(app)

// Only initialize analytics if measurementId is provided
let analytics = null
if (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) {
    try {
        analytics = getAnalytics(app)
    } catch (error) {
        console.warn('Analytics initialization failed:', error)
    }
}
export { analytics }

// Enable emulators in development
if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_EMULATORS === 'true') {
    console.log('Using Firebase Emulators')
    // Add emulator connections here when needed
}

