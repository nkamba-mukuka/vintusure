import { db } from '@/lib/firebase/config';
import { doc, collection, addDoc, updateDoc, deleteDoc, getDoc, getDocs, query, where, orderBy, limit, startAfter, DocumentSnapshot } from 'firebase/firestore';
import { Policy } from '@/types/policy';

export const policyService = {
    async create(data: Omit<Policy, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'agent_id'>, userId: string): Promise<Policy> {
        const policyData = {
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
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

        const data = docSnap.data();
        return {
            ...data,
            id: docSnap.id,
            startDate: data.startDate.toDate(),
            endDate: data.endDate.toDate(),
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
        } as Policy;
    },

    async getById(id: string): Promise<Policy> {
        return this.get(id);
    },

    async update(id: string, data: Partial<Policy>): Promise<void> {
        const docRef = doc(db, 'policies', id);
        await updateDoc(docRef, {
            ...data,
            updatedAt: new Date(),
        });
    },

    async delete(id: string): Promise<void> {
        const docRef = doc(db, 'policies', id);
        await deleteDoc(docRef);
    },

    async list(params: { userId: string; lastDoc?: DocumentSnapshot; limit?: number } = { userId: '', limit: 10 }): Promise<{ policies: Policy[]; total: number; lastDoc: DocumentSnapshot }> {
        const policiesRef = collection(db, 'policies');
        let q = query(
            policiesRef,
            where('createdBy', '==', params.userId),
            orderBy('createdAt', 'desc'),
            limit(params.limit || 10)
        );

        if (params.lastDoc) {
            q = query(q, startAfter(params.lastDoc));
        }

        const snapshot = await getDocs(q);
        const policies = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                startDate: data.startDate.toDate(),
                endDate: data.endDate.toDate(),
                createdAt: data.createdAt.toDate(),
                updatedAt: data.updatedAt.toDate(),
            } as Policy;
        });

        const totalSnapshot = await getDocs(query(policiesRef, where('createdBy', '==', params.userId)));

        return {
            policies,
            total: totalSnapshot.size,
            lastDoc: snapshot.docs[snapshot.docs.length - 1],
        };
    },
}; 