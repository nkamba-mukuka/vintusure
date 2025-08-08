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

// Development version that uses local storage
export const documentServiceDev = {
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

        // Simulate upload progress
        if (onProgress) {
            onProgress(0);
            setTimeout(() => onProgress(25), 100);
            setTimeout(() => onProgress(50), 200);
            setTimeout(() => onProgress(75), 300);
            setTimeout(() => onProgress(100), 400);
        }

        // Create a local URL for the file
        const localUrl = URL.createObjectURL(file);

        // Store file info in localStorage for persistence
        const fileInfo = {
            url: localUrl,
            path: filePath,
            name: file.name,
            type: documentType,
            size: file.size,
            uploadedAt: new Date().toISOString(),
        };

        const storedFiles = JSON.parse(localStorage.getItem('dev_documents') || '[]');
        storedFiles.push(fileInfo);
        localStorage.setItem('dev_documents', JSON.stringify(storedFiles));

        return {
            url: localUrl,
            path: filePath,
        };
    },

    async deleteDocument(path: string): Promise<void> {
        // Remove from localStorage
        const storedFiles = JSON.parse(localStorage.getItem('dev_documents') || '[]');
        const updatedFiles = storedFiles.filter((file: any) => file.path !== path);
        localStorage.setItem('dev_documents', JSON.stringify(updatedFiles));
    },

    // Get all stored documents
    getStoredDocuments(): Array<{
        url: string;
        path: string;
        name: string;
        type: string;
        description?: string;
        uploadedAt: Date;
    }> {
        const storedFiles = JSON.parse(localStorage.getItem('dev_documents') || '[]');
        return storedFiles.map((file: any) => ({
            ...file,
            uploadedAt: new Date(file.uploadedAt),
            description: file.description || '',
        }));
    },
};
