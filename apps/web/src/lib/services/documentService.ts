import { db } from '@/lib/firebase/config';
import { doc, collection, addDoc, updateDoc, deleteDoc, getDoc, getDocs, query, where, orderBy, limit, startAfter, DocumentSnapshot, QueryConstraint } from 'firebase/firestore';

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
    createdAt?: Date;
    updatedAt?: Date;
}

export const documentService = {
    async create(data: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<Document> {
        const documentData = {
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
            uploadedBy: userId,
        };

        const docRef = await addDoc(collection(db, 'documents'), documentData);
        return {
            ...documentData,
            id: docRef.id,
        } as Document;
    },

    async get(id: string): Promise<Document> {
        const docRef = doc(db, 'documents', id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            throw new Error('Document not found');
        }

        return {
            ...docSnap.data(),
            id: docSnap.id,
            createdAt: docSnap.data().createdAt.toDate(),
            updatedAt: docSnap.data().updatedAt.toDate(),
        } as Document;
    },

    async update(id: string, data: Partial<Document>): Promise<void> {
        const docRef = doc(db, 'documents', id);
        await updateDoc(docRef, {
            ...data,
            updatedAt: new Date(),
        });
    },

    async delete(id: string): Promise<void> {
        const docRef = doc(db, 'documents', id);
        await deleteDoc(docRef);
    },

    async list(params: { userId: string; category?: Document['category']; lastDoc?: DocumentSnapshot; limit?: number } = { userId: '', limit: 10 }): Promise<{ documents: Document[]; total: number; lastDoc: DocumentSnapshot }> {
        const documentsRef = collection(db, 'documents');
        const constraints: QueryConstraint[] = [
            where('uploadedBy', '==', params.userId),
            orderBy('createdAt', 'desc'),
            limit(params.limit || 10),
        ];

        if (params.category) {
            constraints.push(where('category', '==', params.category));
        }

        let q = query(documentsRef, ...constraints);

        if (params.lastDoc) {
            q = query(q, startAfter(params.lastDoc));
        }

        const snapshot = await getDocs(q);
        const documents = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
            createdAt: doc.data().createdAt.toDate(),
            updatedAt: doc.data().updatedAt.toDate(),
        })) as Document[];

        const totalSnapshot = await getDocs(query(documentsRef, where('uploadedBy', '==', params.userId)));

        return {
            documents,
            total: totalSnapshot.size,
            lastDoc: snapshot.docs[snapshot.docs.length - 1],
        };
    },
};
