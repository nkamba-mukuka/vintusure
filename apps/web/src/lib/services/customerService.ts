import { db } from '@/lib/firebase/config';
import { doc, collection, addDoc, updateDoc, deleteDoc, getDoc, getDocs, query, where, orderBy, limit, startAfter, DocumentSnapshot } from 'firebase/firestore';
import { Customer } from '@/types/customer';

export const customerService = {
    async create(data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'agent_id'>, userId: string): Promise<Customer> {
        const customerData = {
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: userId,
            agent_id: userId,
        };

        const docRef = await addDoc(collection(db, 'customers'), customerData);
        return {
            ...customerData,
            id: docRef.id,
        } as Customer;
    },

    async get(id: string): Promise<Customer> {
        const docRef = doc(db, 'customers', id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            throw new Error('Customer not found');
        }

        return {
            ...docSnap.data(),
            id: docSnap.id,
        } as Customer;
    },

    // Alias for get to maintain compatibility
    async getById(id: string): Promise<Customer> {
        return this.get(id);
    },

    async list(params?: {
        userId?: string;
        lastDoc?: DocumentSnapshot;
        limit?: number;
    }): Promise<{ customers: Customer[]; total: number; lastDoc?: DocumentSnapshot }> {
        const queryConstraints = [];

        if (params?.userId) {
            queryConstraints.push(where('agent_id', '==', params.userId));
        }

        queryConstraints.push(orderBy('createdAt', 'desc'));

        if (params?.limit) {
            queryConstraints.push(limit(params.limit));
        }

        if (params?.lastDoc) {
            queryConstraints.push(startAfter(params.lastDoc));
        }

        const q = query(collection(db, 'customers'), ...queryConstraints);
        const querySnapshot = await getDocs(q);

        // Get total count
        const totalQuery = query(collection(db, 'customers'),
            params?.userId ? where('agent_id', '==', params.userId) : where('agent_id', '!=', null)
        );
        const totalSnapshot = await getDocs(totalQuery);

        const customers = querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
        })) as Customer[];

        return {
            customers,
            total: totalSnapshot.size,
            lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
        };
    },

    async update(id: string, data: Partial<Customer>): Promise<Customer> {
        const docRef = doc(db, 'customers', id);
        const updateData = {
            ...data,
            updatedAt: new Date().toISOString(),
        };

        await updateDoc(docRef, updateData);

        const updatedDoc = await getDoc(docRef);
        return {
            ...updatedDoc.data(),
            id: updatedDoc.id,
        } as Customer;
    },

    async delete(id: string): Promise<void> {
        const docRef = doc(db, 'customers', id);
        await deleteDoc(docRef);
    },
}; 