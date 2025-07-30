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
    Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Policy, PolicyFormData, PolicyFilters } from '@/types/policy';

const COLLECTION_NAME = 'policies';

// Helper function to convert Firestore timestamps to Dates
const convertTimestamps = (data: any): any => {
    if (data instanceof Timestamp) {
        return data.toDate();
    } else if (Array.isArray(data)) {
        return data.map(convertTimestamps);
    } else if (data && typeof data === 'object') {
        return Object.keys(data).reduce((result, key) => {
            result[key] = convertTimestamps(data[key]);
            return result;
        }, {} as any);
    }
    return data;
};

export const policyService = {
    async create(data: PolicyFormData, userId: string): Promise<Policy> {
        // Generate policy number (you might want to use a more sophisticated method)
        const policyNumber = `POL-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase();

        const policyData = {
            ...data,
            policyNumber,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdBy: userId,
            documents: [],
        };

        const docRef = await addDoc(collection(db, COLLECTION_NAME), policyData);
        return {
            ...policyData,
            id: docRef.id,
        } as Policy;
    },

    async update(id: string, data: Partial<PolicyFormData>): Promise<void> {
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

    async getById(id: string): Promise<Policy | null> {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return null;
        }

        const data = docSnap.data();
        return {
            id: docSnap.id,
            ...convertTimestamps(data),
        } as Policy;
    },

    async list(filters?: PolicyFilters, pageSize: number = 10, lastDoc?: any): Promise<{ policies: Policy[]; lastDoc: any }> {
        const constraints: QueryConstraint[] = [];

        if (filters?.status) {
            constraints.push(where('status', '==', filters.status));
        }

        if (filters?.type) {
            constraints.push(where('type', '==', filters.type));
        }

        if (filters?.customerId) {
            constraints.push(where('customerId', '==', filters.customerId));
        }

        if (filters?.startDate) {
            constraints.push(where('startDate', '>=', filters.startDate));
        }

        if (filters?.endDate) {
            constraints.push(where('endDate', '<=', filters.endDate));
        }

        if (filters?.searchTerm) {
            constraints.push(
                where('searchableFields', 'array-contains', filters.searchTerm.toLowerCase())
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

        const policies = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...convertTimestamps(doc.data()),
        })) as Policy[];

        return {
            policies,
            lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
        };
    },

    async setStatus(id: string, status: Policy['status']): Promise<void> {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, {
            status,
            updatedAt: serverTimestamp(),
        });
    },

    async addDocument(policyId: string, document: Policy['documents'][0]): Promise<void> {
        const docRef = doc(db, COLLECTION_NAME, policyId);
        const policyDoc = await getDoc(docRef);

        if (!policyDoc.exists()) {
            throw new Error('Policy not found');
        }

        const currentDocuments = policyDoc.data().documents || [];
        await updateDoc(docRef, {
            documents: [...currentDocuments, document],
            updatedAt: serverTimestamp(),
        });
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