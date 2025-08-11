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
    serverTimestamp,
    QueryConstraint,
    Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

const COLLECTION_NAME = 'documents';

export interface Document {
    id: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    fileUrl: string;
    description?: string;
    category: 'policy' | 'claim' | 'invoice' | 'contract' | 'certificate' | 'other';
    tags: string[];
    uploadedBy: string;
    uploadedAt: Timestamp;
    updatedAt: Timestamp;
    vectorIndexed?: boolean;
    vectorIndexedAt?: Timestamp;
    vectorIndexError?: string;
    embeddingText?: string;
    extractedText?: string;
    metadata?: {
        pageCount?: number;
        author?: string;
        subject?: string;
        keywords?: string[];
        language?: string;
    };
}

export interface DocumentFilters {
    category?: Document['category'];
    uploadedBy?: string;
    startDate?: Date;
    endDate?: Date;
    searchTerm?: string;
    tags?: string[];
    fileType?: string;
}

export interface DocumentListResponse {
    documents: Document[];
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

export const documentService = {
    async create(data: Omit<Document, 'id' | 'uploadedAt' | 'updatedAt' | 'vectorIndexed'>, userId: string): Promise<Document> {
        const documentData = {
            ...data,
            uploadedBy: userId,
            uploadedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            vectorIndexed: false,
        };

        const docRef = await addDoc(collection(db, COLLECTION_NAME), documentData);

        return {
            ...documentData,
            id: docRef.id,
            uploadedAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        } as Document;
    },

    async update(id: string, data: Partial<Document>): Promise<void> {
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

    async getById(id: string): Promise<Document | null> {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return null;
        }

        const data = docSnap.data();
        return {
            id: docSnap.id,
            ...convertTimestamps(data),
        } as Document;
    },

    async list(filters?: DocumentFilters, pageSize: number = 10, lastDoc?: any): Promise<DocumentListResponse> {
        const constraints: QueryConstraint[] = [];

        // Filter by user if provided (for user-specific data access)
        if (filters?.uploadedBy) {
            constraints.push(where('uploadedBy', '==', filters.uploadedBy));
        }

        if (filters?.category) {
            constraints.push(where('category', '==', filters.category));
        }

        if (filters?.fileType) {
            constraints.push(where('fileType', '==', filters.fileType));
        }

        if (filters?.startDate) {
            constraints.push(where('uploadedAt', '>=', Timestamp.fromDate(filters.startDate)));
        }

        if (filters?.endDate) {
            constraints.push(where('uploadedAt', '<=', Timestamp.fromDate(filters.endDate)));
        }

        if (filters?.tags && filters.tags.length > 0) {
            constraints.push(where('tags', 'array-contains-any', filters.tags));
        }

        if (filters?.searchTerm) {
            constraints.push(
                where('searchableFields', 'array-contains', filters.searchTerm.toLowerCase())
            );
        }

        // Always sort by uploadedAt in descending order (newest first)
        constraints.push(orderBy('uploadedAt', 'desc'));

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

        const documents = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...convertTimestamps(doc.data()),
        })) as Document[];

        return {
            documents,
            lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
            total,
        };
    },

    async updateVectorIndexStatus(id: string, indexed: boolean, error?: string, embeddingText?: string): Promise<void> {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, {
            vectorIndexed: indexed,
            vectorIndexedAt: serverTimestamp(),
            vectorIndexError: error || null,
            embeddingText: embeddingText || null,
        });
    },

    async updateExtractedText(id: string, extractedText: string, metadata?: Document['metadata']): Promise<void> {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, {
            extractedText,
            metadata,
            updatedAt: serverTimestamp(),
        });
    },

    async addTags(id: string, tags: string[]): Promise<void> {
        const docRef = doc(db, COLLECTION_NAME, id);
        const document = await getDoc(docRef);

        if (!document.exists()) {
            throw new Error('Document not found');
        }

        const currentTags = document.data().tags || [];
        const newTags = [...new Set([...currentTags, ...tags])]; // Remove duplicates

        await updateDoc(docRef, {
            tags: newTags,
            updatedAt: serverTimestamp(),
        });
    },

    async removeTags(id: string, tags: string[]): Promise<void> {
        const docRef = doc(db, COLLECTION_NAME, id);
        const document = await getDoc(docRef);

        if (!document.exists()) {
            throw new Error('Document not found');
        }

        const currentTags = document.data().tags || [];
        const newTags = currentTags.filter((tag: string) => !tags.includes(tag));

        await updateDoc(docRef, {
            tags: newTags,
            updatedAt: serverTimestamp(),
        });
    },

    async getDocumentsByCategory(category: Document['category'], userId?: string): Promise<Document[]> {
        const constraints: QueryConstraint[] = [
            where('category', '==', category),
            orderBy('uploadedAt', 'desc')
        ];

        if (userId) {
            constraints.unshift(where('uploadedBy', '==', userId));
        }

        const q = query(collection(db, COLLECTION_NAME), ...constraints);
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...convertTimestamps(doc.data()),
        })) as Document[];
    },

    async getDocumentsByFileType(fileType: string, userId?: string): Promise<Document[]> {
        const constraints: QueryConstraint[] = [
            where('fileType', '==', fileType),
            orderBy('uploadedAt', 'desc')
        ];

        if (userId) {
            constraints.unshift(where('uploadedBy', '==', userId));
        }

        const q = query(collection(db, COLLECTION_NAME), ...constraints);
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...convertTimestamps(doc.data()),
        })) as Document[];
    },

    async getDocumentsByTags(tags: string[], userId?: string): Promise<Document[]> {
        const constraints: QueryConstraint[] = [
            where('tags', 'array-contains-any', tags),
            orderBy('uploadedAt', 'desc')
        ];

        if (userId) {
            constraints.unshift(where('uploadedBy', '==', userId));
        }

        const q = query(collection(db, COLLECTION_NAME), ...constraints);
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...convertTimestamps(doc.data()),
        })) as Document[];
    },

    async getVectorIndexedDocuments(userId?: string): Promise<Document[]> {
        const constraints: QueryConstraint[] = [
            where('vectorIndexed', '==', true),
            orderBy('uploadedAt', 'desc')
        ];

        if (userId) {
            constraints.unshift(where('uploadedBy', '==', userId));
        }

        const q = query(collection(db, COLLECTION_NAME), ...constraints);
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...convertTimestamps(doc.data()),
        })) as Document[];
    },

    async getDocumentsNeedingIndexing(userId?: string): Promise<Document[]> {
        const constraints: QueryConstraint[] = [
            where('vectorIndexed', '==', false),
            orderBy('uploadedAt', 'desc')
        ];

        if (userId) {
            constraints.unshift(where('uploadedBy', '==', userId));
        }

        const q = query(collection(db, COLLECTION_NAME), ...constraints);
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...convertTimestamps(doc.data()),
        })) as Document[];
    },
};
