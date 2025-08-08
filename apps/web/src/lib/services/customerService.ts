import { db } from '@/lib/firebase/config';
import {
    collection,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    getDocs,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    getCountFromServer,
    addDoc,
    Timestamp,
} from 'firebase/firestore';
import type { Customer, CustomerFormData, CustomerFilters } from '@/types/customer';

const COLLECTION_NAME = 'customers';
const PAGE_SIZE = 10;

function convertTimestampsToDate(data: any): any {
    if (data instanceof Timestamp) {
        return data.toDate();
    }
    if (Array.isArray(data)) {
        return data.map(convertTimestampsToDate);
    }
    if (data && typeof data === 'object') {
        return Object.keys(data).reduce((result, key) => {
            result[key] = convertTimestampsToDate(data[key]);
            return result;
        }, {} as any);
    }
    return data;
}

export const customerService = {
    async list(filters: CustomerFilters = {}) {
        const { searchTerm, sortBy = 'firstName', sortOrder = 'asc', userId } = filters;
        const customersRef = collection(db, COLLECTION_NAME);

        let q = query(customersRef, orderBy(sortBy, sortOrder), limit(PAGE_SIZE));

        // Always filter by user for user-specific data access
        if (userId) {
            q = query(q, where('createdBy', '==', userId));
        }

        if (searchTerm) {
            q = query(q, where('searchableText', '>=', searchTerm.toLowerCase()));
        }

        const [snapshot, countSnapshot] = await Promise.all([
            getDocs(q),
            getCountFromServer(customersRef)
        ]);

        const customers = snapshot.docs.map(doc => {
            const data = convertTimestampsToDate(doc.data());
            return {
                id: doc.id,
                ...data,
            } as Customer;
        });

        return {
            customers,
            total: countSnapshot.data().count,
            lastDoc: snapshot.docs[snapshot.docs.length - 1]
        };
    },

    async create(data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'agent_id'>, userId: string): Promise<Customer> {
        const customerData = {
            ...data,
            createdBy: userId, // Add the authenticated user's ID
            agent_id: userId, // Add agent_id field for tracking which agent created the customer
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, COLLECTION_NAME), customerData);

        return {
            ...customerData,
            id: docRef.id,
            createdAt: new Date(),
            updatedAt: new Date(),
        } as Customer;
    },

    async update(id: string, data: Partial<CustomerFormData>): Promise<void> {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp(),
        });
    },

    async delete(id: string): Promise<void> {
        const docRef = doc(db, COLLECTION_NAME, id);
        await deleteDoc(docRef);
    },

    async getById(id: string): Promise<Customer | null> {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return null;
        }

        return {
            id: docSnap.id,
            ...convertTimestampsToDate(docSnap.data()),
        } as Customer;
    },

    async setStatus(id: string, status: Customer['status']): Promise<void> {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, {
            status,
            updatedAt: serverTimestamp(),
        });
    },
}; 