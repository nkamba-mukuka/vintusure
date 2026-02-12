import { db } from '@/lib/firebase/config';
import { doc, collection, addDoc, updateDoc, deleteDoc, getDoc, getDocs, query, where, orderBy, limit, startAfter, DocumentSnapshot } from 'firebase/firestore';
import { Claim } from '@/types/claim';

export const claimService = {
    async create(data: Omit<Claim, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'agent_id' | 'status'>, userId: string): Promise<Claim> {
        const claimData = {
            ...data,
            status: 'Submitted',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: userId,
            agent_id: userId,
        };

        const docRef = await addDoc(collection(db, 'claims'), claimData);
        return {
            ...claimData,
            id: docRef.id,
        } as Claim;
    },

    async get(id: string): Promise<Claim> {
        const docRef = doc(db, 'claims', id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            throw new Error('Claim not found');
        }

        return {
            ...docSnap.data(),
            id: docSnap.id,
        } as Claim;
    },

    // Alias for get to maintain compatibility
    async getById(id: string): Promise<Claim> {
        return this.get(id);
    },

    async list(params?: {
        userId?: string;
        lastDoc?: DocumentSnapshot;
        limit?: number;
    }): Promise<{ claims: Claim[]; total: number; lastDoc?: DocumentSnapshot }> {
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

        const q = query(collection(db, 'claims'), ...queryConstraints);
        const querySnapshot = await getDocs(q);

        // Get total count
        const totalQuery = query(collection(db, 'claims'),
            params?.userId ? where('agent_id', '==', params.userId) : where('agent_id', '!=', null)
        );
        const totalSnapshot = await getDocs(totalQuery);

        const claims = querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
        })) as Claim[];

        return {
            claims,
            total: totalSnapshot.size,
            lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
        };
    },

    async update(id: string, data: Partial<Claim>): Promise<Claim> {
        const docRef = doc(db, 'claims', id);
        const updateData = {
            ...data,
            updatedAt: new Date().toISOString(),
        };

        await updateDoc(docRef, updateData);

        const updatedDoc = await getDoc(docRef);
        return {
            ...updatedDoc.data(),
            id: updatedDoc.id,
        } as Claim;
    },

    async updateStatus(id: string, status: Claim['status'], reviewNotes?: string): Promise<Claim> {
        const docRef = doc(db, 'claims', id);
        const updateData = {
            status,
            reviewNotes,
            updatedAt: new Date().toISOString(),
        };

        await updateDoc(docRef, updateData);

        const updatedDoc = await getDoc(docRef);
        return {
            ...updatedDoc.data(),
            id: updatedDoc.id,
        } as Claim;
    },

    async approveAmount(id: string, approvedAmount: number, reviewNotes: string): Promise<Claim> {
        const docRef = doc(db, 'claims', id);
        const updateData = {
            status: 'Approved',
            approvedAmount,
            reviewNotes,
            updatedAt: new Date().toISOString(),
        };

        await updateDoc(docRef, updateData);

        const updatedDoc = await getDoc(docRef);
        return {
            ...updatedDoc.data(),
            id: updatedDoc.id,
        } as Claim;
    },

    async delete(id: string): Promise<void> {
        const docRef = doc(db, 'claims', id);
        await deleteDoc(docRef);
    },
}; 