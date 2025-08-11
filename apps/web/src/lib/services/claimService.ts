import { db } from '@/lib/firebase/config';
import { doc, collection, addDoc, updateDoc, deleteDoc, getDoc, getDocs, query, where, orderBy, limit, startAfter, DocumentSnapshot, arrayUnion, arrayRemove } from 'firebase/firestore';
import { Claim } from '@/types/claim';

export const claimService = {
    async create(data: Omit<Claim, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'createdBy' | 'agent_id'>, userId: string): Promise<Claim> {
        const claimData = {
            ...data,
            status: 'Submitted',
            createdAt: new Date(),
            updatedAt: new Date(),
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
            incidentDate: docSnap.data().incidentDate.toDate(),
            createdAt: docSnap.data().createdAt.toDate(),
            updatedAt: docSnap.data().updatedAt.toDate(),
        } as Claim;
    },

    async getById(id: string): Promise<Claim> {
        return this.get(id);
    },

    async update(id: string, data: Partial<Claim>): Promise<void> {
        const docRef = doc(db, 'claims', id);
        await updateDoc(docRef, {
            ...data,
            updatedAt: new Date(),
        });
    },

    async delete(id: string): Promise<void> {
        const docRef = doc(db, 'claims', id);
        await deleteDoc(docRef);
    },

    async list(params: { userId: string; lastDoc?: DocumentSnapshot; limit?: number } = { userId: '', limit: 10 }): Promise<{ claims: Claim[]; total: number; lastDoc: DocumentSnapshot }> {
        const claimsRef = collection(db, 'claims');
        let q = query(
            claimsRef,
            where('createdBy', '==', params.userId),
            orderBy('createdAt', 'desc'),
            limit(params.limit || 10)
        );

        if (params.lastDoc) {
            q = query(q, startAfter(params.lastDoc));
        }

        const snapshot = await getDocs(q);
        const claims = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
            incidentDate: doc.data().incidentDate.toDate(),
            createdAt: doc.data().createdAt.toDate(),
            updatedAt: doc.data().updatedAt.toDate(),
        })) as Claim[];

        const totalSnapshot = await getDocs(query(claimsRef, where('createdBy', '==', params.userId)));

        return {
            claims,
            total: totalSnapshot.size,
            lastDoc: snapshot.docs[snapshot.docs.length - 1],
        };
    },

    async updateStatus(id: string, status: Claim['status'], reviewNotes?: string): Promise<void> {
        const docRef = doc(db, 'claims', id);
        await updateDoc(docRef, {
            status,
            reviewNotes,
            updatedAt: new Date(),
        });
    },

    async approveAmount(id: string, approvedAmount: number, reviewNotes: string): Promise<void> {
        const docRef = doc(db, 'claims', id);
        await updateDoc(docRef, {
            status: 'Approved',
            approvedAmount,
            reviewNotes,
            updatedAt: new Date(),
        });
    },

    async addDocument(claimId: string, documentUrl: string): Promise<void> {
        const docRef = doc(db, 'claims', claimId);
        await updateDoc(docRef, {
            documents: arrayUnion(documentUrl),
            updatedAt: new Date(),
        });
    },

    async removeDocument(claimId: string, documentUrl: string): Promise<void> {
        const docRef = doc(db, 'claims', claimId);
        await updateDoc(docRef, {
            documents: arrayRemove(documentUrl),
            updatedAt: new Date(),
        });
    },
}; 