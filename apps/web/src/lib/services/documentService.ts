import {
    ref,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject,
} from 'firebase/storage';
import { storage } from '@/lib/firebase/config';
import { v4 as uuidv4 } from 'uuid';

export interface UploadProgressCallback {
    (progress: number): void;
}

interface UploadDocumentParams {
    file: File;
    entityType: 'policy' | 'claim';
    entityId: string;
    documentType: string;
    onProgress?: UploadProgressCallback;
}

export const documentService = {
    async uploadDocument({
        file,
        entityType,
        entityId,
        documentType,
        onProgress,
    }: UploadDocumentParams): Promise<{ url: string; path: string }> {
        const fileExtension = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExtension}`;
        const filePath = `${entityType}s/${entityId}/documents/${fileName}`;
        const storageRef = ref(storage, filePath);

        const uploadTask = uploadBytesResumable(storageRef, file);

        return new Promise((resolve, reject) => {
            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress =
                        (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    if (onProgress) {
                        onProgress(progress);
                    }
                },
                (error) => {
                    console.error('Upload error:', error);
                    reject(error);
                },
                async () => {
                    try {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        resolve({
                            url: downloadURL,
                            path: filePath,
                        });
                    } catch (error) {
                        console.error('Download URL error:', error);
                        reject(error);
                    }
                }
            );
        });
    },

    async deleteDocument(path: string): Promise<void> {
        try {
            const storageRef = ref(storage, path);
            await deleteObject(storageRef);
        } catch (error) {
            console.error('Delete error:', error);
            throw error;
        }
    },
}; 