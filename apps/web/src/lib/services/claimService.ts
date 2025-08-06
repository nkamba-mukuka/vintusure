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
import { Claim, ClaimStatus, DamageType } from '@/types/policy';

const COLLECTION_NAME = 'claims';

interface ClaimFilters {
    status?: ClaimStatus;
    damageType?: DamageType;
    policyId?: string;
    customerId?: string;
    startDate?: Date;
    endDate?: Date;
    searchTerm?: string;
    userId?: string;
}

interface ClaimListResponse {
    claims: Claim[];
    lastDoc: any;
    total: number;
}

// Helper function to convert Firestore timestamps to string dates
const convertTimestamps = (data: any): any => {
    if (data instanceof Timestamp) {
        return data.toDate().toISOString();
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

export const claimService = {
    async create(data: Omit<Claim, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Claim> {
        const claimData = {
            ...data,
            status: 'Submitted' as const,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, COLLECTION_NAME), claimData);

        return {
            ...claimData,
            id: docRef.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        } as Claim;
    },

    async update(id: string, data: Partial<Claim>): Promise<void> {
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

    async getById(id: string): Promise<Claim | null> {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return null;
        }

        const data = docSnap.data();
        return {
            id: docSnap.id,
            ...convertTimestamps(data),
        } as Claim;
    },

    async list(filters?: ClaimFilters, pageSize: number = 10, lastDoc?: any): Promise<ClaimListResponse> {
        const constraints: QueryConstraint[] = [];

        // Filter by user if provided (for user-specific data access)
        if (filters?.userId) {
            constraints.push(where('createdBy', '==', filters.userId));
        }

        if (filters?.status) {
            constraints.push(where('status', '==', filters.status));
        }

        if (filters?.damageType) {
            constraints.push(where('damageType', '==', filters.damageType));
        }

        if (filters?.policyId) {
            constraints.push(where('policyId', '==', filters.policyId));
        }

        if (filters?.customerId) {
            constraints.push(where('customerId', '==', filters.customerId));
        }

        if (filters?.startDate) {
            constraints.push(where('incidentDate', '>=', filters.startDate.toISOString()));
        }

        if (filters?.endDate) {
            constraints.push(where('incidentDate', '<=', filters.endDate.toISOString()));
        }

        if (filters?.searchTerm) {
            constraints.push(
                where('searchableFields', 'array-contains', filters.searchTerm.toLowerCase())
            );
        }

        // Always sort by createdAt in descending order (newest first)
        constraints.push(orderBy('createdAt', 'desc'));

        // First, get total count without pagination
        const countQuery = query(collection(db, COLLECTION_NAME), ...constraints);
        const countSnapshot = await getDocs(countQuery);
        const total = countSnapshot.size;

        // Then get paginated results
        constraints.push(limit(pageSize));
        if (lastDoc) {
            constraints.push(startAfter(lastDoc));
        }

        const q = query(collection(db, COLLECTION_NAME), ...constraints);
        const querySnapshot = await getDocs(q);

        const claims = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...convertTimestamps(doc.data()),
        })) as Claim[];

        return {
            claims,
            lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
            total,
        };
    },

    async updateStatus(id: string, status: ClaimStatus, reviewNotes?: string): Promise<void> {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, {
            status,
            reviewNotes,
            updatedAt: serverTimestamp(),
        });
    },

    async approveAmount(id: string, approvedAmount: number, reviewNotes: string): Promise<void> {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, {
            status: 'Approved' as const,
            approvedAmount,
            reviewNotes,
            updatedAt: serverTimestamp(),
        });
    },

    async addDocument(claimId: string, documentUrl: string): Promise<void> {
        const docRef = doc(db, COLLECTION_NAME, claimId);
        const claimDoc = await getDoc(docRef);

        if (!claimDoc.exists()) {
            throw new Error('Claim not found');
        }

        const currentDocuments = claimDoc.data().documents || [];
        await updateDoc(docRef, {
            documents: [...currentDocuments, documentUrl],
            updatedAt: serverTimestamp(),
        });
    },

    async removeDocument(claimId: string, documentUrl: string): Promise<void> {
        const docRef = doc(db, COLLECTION_NAME, claimId);
        const claimDoc = await getDoc(docRef);

        if (!claimDoc.exists()) {
            throw new Error('Claim not found');
        }

        const currentDocuments = claimDoc.data().documents || [];
        await updateDoc(docRef, {
            documents: currentDocuments.filter((url: string) => url !== documentUrl),
            updatedAt: serverTimestamp(),
        });
    },
}; 