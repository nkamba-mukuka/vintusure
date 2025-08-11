import { db } from '@/lib/firebase/config';
import { doc, collection, addDoc, updateDoc, deleteDoc, getDoc, getDocs, query, where, orderBy, limit, startAfter, DocumentSnapshot } from 'firebase/firestore';
import { Policy } from '@/types/policy';

export const policyService = {
    async create(data: Omit<Policy, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'agent_id'>, userId: string): Promise<Policy> {
        const policyData = {
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: userId,
            agent_id: userId,
        };

        const docRef = await addDoc(collection(db, 'policies'), policyData);
        return {
            ...policyData,
            id: docRef.id,
        } as Policy;
    },

    async get(id: string): Promise<Policy> {
        const docRef = doc(db, 'policies', id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            throw new Error('Policy not found');
        }

        return {
            ...docSnap.data(),
            id: docSnap.id,
        } as Policy;
    },

    // Alias for get to maintain compatibility
    async getById(id: string): Promise<Policy> {
        return this.get(id);
    },

    async list(params?: {
        userId?: string;
        lastDoc?: DocumentSnapshot;
        limit?: number;
    }): Promise<{ policies: Policy[]; total: number; lastDoc?: DocumentSnapshot }> {
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

        const q = query(collection(db, 'policies'), ...queryConstraints);
        const querySnapshot = await getDocs(q);

        // Get total count
        const totalQuery = query(collection(db, 'policies'),
            params?.userId ? where('agent_id', '==', params.userId) : where('agent_id', '!=', null)
        );
        const totalSnapshot = await getDocs(totalQuery);

        const policies = querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
        })) as Policy[];

        return {
            policies,
            total: totalSnapshot.size,
            lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
        };
    },

    async update(id: string, data: Partial<Policy>): Promise<Policy> {
        const docRef = doc(db, 'policies', id);
        const updateData = {
            ...data,
            updatedAt: new Date().toISOString(),
        };

        await updateDoc(docRef, updateData);

        const updatedDoc = await getDoc(docRef);
        return {
            ...updatedDoc.data(),
            id: updatedDoc.id,
        } as Policy;
    },

    async delete(id: string): Promise<void> {
        const docRef = doc(db, 'policies', id);
        await deleteDoc(docRef);
    },
}; 