import { db } from '@/lib/firebase/config'
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
    Timestamp,
    getCountFromServer,
} from 'firebase/firestore'
import type { PolicyFormData, PolicyData } from '@/lib/validations/policy'
import type { Policy } from '@/types/policy'

const COLLECTION_NAME = 'policies'

function convertDatesToTimestamps(data: PolicyFormData): Omit<PolicyData, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'> {
    return {
        ...data,
        startDate: Timestamp.fromDate(data.startDate),
        endDate: Timestamp.fromDate(data.endDate),
    }
}

function convertTimestampsToDate(data: PolicyData): PolicyFormData {
    const { createdAt, updatedAt, createdBy, ...rest } = data
    return {
        ...rest,
        startDate: data.startDate.toDate(),
        endDate: data.endDate.toDate(),
    }
}

export const policyService = {
    async create(data: Omit<PolicyFormData, 'createdBy' | 'agent_id'>, userId: string): Promise<Policy> {
        const policyData = {
            ...convertDatesToTimestamps(data),
            createdBy: userId, // Add the authenticated user's ID
            agent_id: userId, // Add agent_id field for tracking which agent created the policy
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, COLLECTION_NAME), policyData);

        return {
            ...policyData,
            id: docRef.id,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        } as Policy;
    },

    async update(id: string, data: Partial<PolicyFormData>) {
        const docRef = doc(db, COLLECTION_NAME, id)
        const updateData = {
            ...data,
            ...(data.startDate && { startDate: Timestamp.fromDate(data.startDate) }),
            ...(data.endDate && { endDate: Timestamp.fromDate(data.endDate) }),
            updatedAt: serverTimestamp(),
        }
        await updateDoc(docRef, updateData)
        return { id, ...updateData }
    },

    async delete(id: string): Promise<void> {
        const docRef = doc(db, COLLECTION_NAME, id)
        await deleteDoc(docRef)
    },

    async getById(id: string): Promise<(PolicyFormData & { id: string }) | null> {
        const docRef = doc(db, COLLECTION_NAME, id)
        const docSnap = await getDoc(docRef)

        if (!docSnap.exists()) {
            return null
        }

        const data = docSnap.data() as PolicyData
        return { ...convertTimestampsToDate(data), id: docSnap.id }
    },

    async list(filters: any = {}) {
        const { searchTerm, status, type, userId } = filters
        const policiesRef = collection(db, COLLECTION_NAME)

        let q = query(policiesRef, orderBy('createdAt', 'desc'), limit(10))

        // Always filter by user for user-specific data access
        if (userId) {
            q = query(q, where('createdBy', '==', userId))
        }

        if (status) {
            q = query(q, where('status', '==', status))
        }

        if (type) {
            q = query(q, where('type', '==', type))
        }

        if (searchTerm) {
            q = query(q, where('searchableText', '>=', searchTerm.toLowerCase()))
        }

        const [snapshot, countSnapshot] = await Promise.all([
            getDocs(q),
            getCountFromServer(policiesRef)
        ])

        const policies = snapshot.docs.map(doc => {
            const data = doc.data() as PolicyData
            return { ...convertTimestampsToDate(data), id: doc.id }
        })

        return {
            policies,
            total: countSnapshot.data().count,
            lastDoc: snapshot.docs[snapshot.docs.length - 1]
        }
    },

    async setStatus(id: string, status: PolicyData['status']): Promise<void> {
        const docRef = doc(db, COLLECTION_NAME, id)
        await updateDoc(docRef, {
            status,
            updatedAt: serverTimestamp(),
        })
    },

    async addDocument(policyId: string, document: { id: string; type: string; url: string; uploadedAt: Date }): Promise<void> {
        const docRef = doc(db, COLLECTION_NAME, policyId)
        const policyDoc = await getDoc(docRef)

        if (!policyDoc.exists()) {
            throw new Error('Policy not found')
        }

        await updateDoc(docRef, {
            documents: [...(policyDoc.data().documents || []), {
                ...document,
                uploadedAt: Timestamp.fromDate(document.uploadedAt)
            }],
            updatedAt: serverTimestamp(),
        })
    },

    async removeDocument(policyId: string, documentId: string): Promise<void> {
        const docRef = doc(db, COLLECTION_NAME, policyId);
        const policyDoc = await getDoc(docRef);

        if (!policyDoc.exists()) {
            throw new Error('Policy not found');
        }

        const currentDocuments = policyDoc.data().documents || [];
        await updateDoc(docRef, {
            documents: currentDocuments.filter((doc: any) => doc.id !== documentId),
            updatedAt: serverTimestamp(),
        });
    },
}; 