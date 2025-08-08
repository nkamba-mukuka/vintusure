import { db } from '@/lib/firebase/config';
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    serverTimestamp,
    Timestamp,
} from 'firebase/firestore';
import { User, CreateUserData } from '@/types/auth';

const COLLECTION_NAME = 'users';

export const userService = {
    async createUser(userData: CreateUserData): Promise<User> {
        const userDoc = {
            ...userData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        await setDoc(doc(db, COLLECTION_NAME, userData.uid), userDoc);

        return {
            ...userData,
            createdAt: new Date(),
            updatedAt: new Date(),
        } as User;
    },

    async getUserById(uid: string): Promise<User | null> {
        const docRef = doc(db, COLLECTION_NAME, uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return null;
        }

        const data = docSnap.data();
        return {
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
        } as User;
    },

    async updateUser(uid: string, userData: Partial<User>): Promise<void> {
        const docRef = doc(db, COLLECTION_NAME, uid);
        await updateDoc(docRef, {
            ...userData,
            updatedAt: serverTimestamp(),
        });
    },

    async createDefaultUser(uid: string, email: string): Promise<User> {
        const defaultUserData: CreateUserData = {
            uid,
            email,
            role: 'agent',
            profileCompleted: false,
        };

        return this.createUser(defaultUserData);
    },
};
