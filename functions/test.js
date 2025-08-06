const { initializeApp } = require('firebase/app');
const { getFunctions, httpsCallable } = require('firebase/functions');

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCkFg0GA7yOpplOpOSQ1iDueN1sLuKG5fs",
    authDomain: "vintusure.firebaseapp.com",
    projectId: "vintusure",
    storageBucket: "vintusure.firebasestorage.app",
    messagingSenderId: "772944178213",
    appId: "1:772944178213:web:2f849891b37b012a7023cc",
    measurementId: "G-MF40L2SQJ6"
};

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app, 'us-central1');

// Get the functions
const askQuestion = httpsCallable(functions, 'askQuestion');
const healthCheck = httpsCallable(functions, 'healthCheck');

// Test health check
async function testHealthCheck() {
    try {
        const result = await healthCheck();
        console.log('Health Check Result:', result.data);
    } catch (error) {
        console.error('Health Check Error:', error);
    }
}

// Test ask question
async function testAskQuestion() {
    try {
        const result = await askQuestion({ query: 'What types of car insurance do you offer?' });
        console.log('Ask Question Result:', result.data);
    } catch (error) {
        console.error('Ask Question Error:', error);
    }
}

// Run tests
testHealthCheck();
testAskQuestion(); 