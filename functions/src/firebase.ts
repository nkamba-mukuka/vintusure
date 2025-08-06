import { initializeApp, getApps, App } from 'firebase-admin/app';

let firebaseApp: App | undefined;

export function getFirebaseApp(): App {
    if (!firebaseApp) {
        if (getApps().length === 0) {
            firebaseApp = initializeApp();
        } else {
            firebaseApp = getApps()[0];
        }
    }
    return firebaseApp;
} 