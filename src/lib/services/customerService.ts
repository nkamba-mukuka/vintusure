import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    serverTimestamp,
    QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Customer, CustomerFormData, CustomerFilters } from '@/types/customer';

const COLLECTION_NAME = 'customers';

export const customerService = {
    async create(data: CustomerFormData, userId: string): Promise<Customer> {
        const customerData = {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdBy: userId,
            status: 'active',
        };

        const docRef = await addDoc(collection(db, COLLECTION_NAME), customerData);
        return {
            ...customerData,
            id: docRef.id,
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
            ...docSnap.data(),
        } as Customer;
    },

    async list(filters?: CustomerFilters, pageSize: number = 10, lastDoc?: any): Promise<{ customers: Customer[]; lastDoc: any }> {
        const constraints: QueryConstraint[] = [];

        if (filters?.status) {
            constraints.push(where('status', '==', filters.status));
        }

        if (filters?.searchTerm) {
            const searchLower = filters.searchTerm.toLowerCase();
            constraints.push(
                where('searchableFields', 'array-contains', searchLower)
            );
        }

        if (filters?.sortBy) {
            constraints.push(
                orderBy(filters.sortBy, filters.sortOrder || 'asc')
            );
        } else {
            constraints.push(orderBy('createdAt', 'desc'));
        }

        constraints.push(limit(pageSize));

        if (lastDoc) {
            constraints.push(startAfter(lastDoc));
        }

        const q = query(collection(db, COLLECTION_NAME), ...constraints);
        const querySnapshot = await getDocs(q);

        const customers = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as Customer[];

        return {
            customers,
            lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
        };
    },

    async setStatus(id: string, status: Customer['status']): Promise<void> {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, {
            status,
            updatedAt: serverTimestamp(),
        });
    },
}; 