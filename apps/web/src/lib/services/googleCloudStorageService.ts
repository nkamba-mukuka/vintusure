import { functions } from '@/lib/firebase/config';
import { httpsCallable } from 'firebase/functions';
import { v4 as uuidv4 } from 'uuid';

/**
 * Interface for the upload progress callback function.
 * @param {number} progress - The upload progress percentage (0-100).
 */
export interface UploadProgressCallback {
    (progress: number): void;
}

/**
 * Interface for the parameters required by the uploadDocument function.
 */
interface UploadDocumentParams {
    file: File;
    entityType: 'policy' | 'claim';
    entityId: string;
    documentType: string;
    userId: string;
    onProgress?: UploadProgressCallback;
}

/**
 * Validates file before upload based on size and extension.
 * @param {File} file - The file to validate.
 * @returns {{isValid: boolean; error?: string}} An object indicating validity and an error message if invalid.
 */
function validateFile(file: File): { isValid: boolean; error?: string } {
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.txt'];
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
        return {
            isValid: false,
            error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        };
    }
    
    // Check file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !ALLOWED_EXTENSIONS.includes(`.${fileExtension}`)) {
        return {
            isValid: false,
            error: `File type not allowed. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`,
        };
    }
    
    return { isValid: true };
}

export const googleCloudStorageService = {
    /**
     * Uploads a document to Google Cloud Storage.
     * This function implements a secure two-step process:
     * 1. Calls a Cloud Function to get a pre-signed URL for a direct upload.
     * 2. Uses XMLHttpRequest to upload the file's binary data to that URL, with progress tracking.
     * 3. Calls another Cloud Function to get a pre-signed download URL for the newly uploaded file.
     * @param {UploadDocumentParams} params - The upload parameters.
     * @returns {Promise<{ url: string; path: string }>} A promise that resolves with the document's URL and path.
     */
    async uploadDocument({
        file,
        entityType,
        entityId,
        documentType,
        userId,
        onProgress,
    }: UploadDocumentParams): Promise<{ url: string; path: string }> {
        try {
            // Validate file before upload
            const validation = validateFile(file);
            if (!validation.isValid) {
                throw new Error(validation.error);
            }

            // Generate unique filename and destination path
            const fileExtension = file.name.split('.').pop();
            const fileName = `${uuidv4()}.${fileExtension}`;
            const destination = `agent documents/${entityType}s/${entityId}/${fileName}`;
            const contentType = file.type || 'application/octet-stream';

            // Step 1: Get signed upload URL from Cloud Function
            const getSignedUploadUrlFunction = httpsCallable(functions, 'getSignedUploadUrl');
            const signedUrlResult = await getSignedUploadUrlFunction({
                fileName: destination,
                contentType: contentType,
            });

            const signedUrlResponse = signedUrlResult.data as { success: boolean; url: string };
            
            if (!signedUrlResponse || !signedUrlResponse.success) {
                throw new Error('Failed to get signed upload URL');
            }

            // Step 2: Upload file directly to GCS using the signed URL via XMLHttpRequest for progress tracking
            console.log('Uploading file directly to GCS using signed URL...');
            const uploadPromise = new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('PUT', signedUrlResponse.url, true);

                // Set content type to match the file, this is crucial for the upload to work.
                xhr.setRequestHeader('Content-Type', contentType);
                
                // Handle progress updates using the XMLHttpRequest's upload object
                if (onProgress) {
                    xhr.upload.addEventListener('progress', (e) => {
                        if (e.lengthComputable) {
                            const percent = Math.round((e.loaded / e.total) * 100);
                            onProgress(percent);
                        }
                    });
                }
                
                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        console.log('Direct upload complete.');
                        resolve(xhr.status);
                    } else {
                        reject(new Error(`Upload failed with status: ${xhr.status}`));
                    }
                };

                xhr.onerror = () => {
                    reject(new Error('Network error during file upload.'));
                };

                xhr.send(file);
            });

            await uploadPromise;

            // Step 3: Get signed download URL from Cloud Function after successful upload
            const getSignedDownloadUrlFunction = httpsCallable(functions, 'getSignedDownloadUrl');
            const downloadUrlResult = await getSignedDownloadUrlFunction({
                fileName: destination,
            });

            const downloadUrlResponse = downloadUrlResult.data as { success: boolean; url: string };
            
            if (!downloadUrlResponse || !downloadUrlResponse.success) {
                throw new Error('Failed to get download URL');
            }

            console.log(`File uploaded successfully to Google Cloud Storage: ${destination}`);
            
            return {
                url: downloadUrlResponse.url,
                path: destination,
            };
        } catch (error) {
            console.error('Error during file upload to Google Cloud Storage:', error);
            throw error;
        }
    },

    /**
     * Placeholder function to delete a document from GCS.
     * @param {string} path - The path to the file to be deleted.
     */
    async deleteDocument(path: string): Promise<void> {
        try {
            console.log(`Delete request for: ${path}`);
            throw new Error('Delete functionality not yet implemented');
        } catch (error) {
            console.error('Error deleting file from Google Cloud Storage:', error);
            throw error;
        }
    },

    /**
     * Placeholder function to list documents for a specific user.
     * @param {string} userId - The ID of the user.
     * @returns {Promise<Array<{ name: string; url: string; metadata: any }>>} A promise resolving to an array of document metadata.
     */
    async listUserDocuments(userId: string): Promise<Array<{ name: string; url: string; metadata: any }>> {
        try {
            console.log(`List request for user: ${userId}`);
            return [];
        } catch (error) {
            console.error('Error listing user documents:', error);
            throw error;
        }
    },

    /**
     * Placeholder function to get a file's metadata.
     * @param {string} path - The path to the file.
     * @returns {Promise<any>} A promise resolving to the file's metadata.
     */
    async getFileMetadata(path: string): Promise<any> {
        try {
            console.log(`Metadata request for: ${path}`);
            return {};
        } catch (error) {
            console.error('Error getting file metadata:', error);
            throw error;
        }
    },
};
