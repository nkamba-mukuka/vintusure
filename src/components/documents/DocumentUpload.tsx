
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { documentService } from '@/lib/services/documentService';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FileIcon, UploadIcon, XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocumentUploadProps {
    entityType: 'policy' | 'claim';
    entityId: string;
    documentType: string;
    onUploadComplete: (document: { url: string; path: string }) => void;
    onUploadError?: (error: Error) => void;
}

interface UploadingFile {
    file: File;
    progress: number;
    error?: string;
}

export default function DocumentUpload({
    entityType,
    entityId,
    documentType,
    onUploadComplete,
    onUploadError,
}: DocumentUploadProps) {
    const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

    const onDrop = useCallback(
        async (acceptedFiles: File[]) => {
            const newFiles = acceptedFiles.map((file) => ({
                file,
                progress: 0,
            }));

            setUploadingFiles((prev) => [...prev, ...newFiles]);

            for (const { file } of newFiles) {
                try {
                    const document = await documentService.uploadDocument({
                        file,
                        entityType,
                        entityId,
                        documentType,
                        onProgress: (progress) => {
                            setUploadingFiles((prev) =>
                                prev.map((f) =>
                                    f.file === file ? { ...f, progress } : f
                                )
                            );
                        },
                    });

                    onUploadComplete(document);

                    // Remove the file from the list after successful upload
                    setUploadingFiles((prev) =>
                        prev.filter((f) => f.file !== file)
                    );
                } catch (error) {
                    console.error('Error uploading file:', error);

                    // Update the file status to show error
                    setUploadingFiles((prev) =>
                        prev.map((f) =>
                            f.file === file
                                ? { ...f, error: 'Upload failed. Please try again.' }
                                : f
                        )
                    );

                    if (onUploadError && error instanceof Error) {
                        onUploadError(error);
                    }
                }
            }
        },
        [entityType, entityId, documentType, onUploadComplete, onUploadError]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
        },
        maxSize: 5 * 1024 * 1024, // 5MB
    });

    const removeFile = (file: File) => {
        setUploadingFiles((prev) =>
            prev.filter((f) => f.file !== file)
        );
    };

    return (
        <div className="space-y-4">
            <div
                {...getRootProps()}
                className={cn(
                    'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                    isDragActive
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-primary'
                )}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-2">
                    <UploadIcon className="h-8 w-8 text-gray-400" />
                    <p className="text-sm text-gray-600">
                        {isDragActive
                            ? 'Drop the files here...'
                            : 'Drag & drop files here, or click to select files'}
                    </p>
                    <p className="text-xs text-gray-500">
                        Supported formats: PDF, JPG, PNG (max 5MB)
                    </p>
                </div>
            </div>

            {uploadingFiles.length > 0 && (
                <div className="space-y-2">
                    {uploadingFiles.map(({ file, progress, error }) => (
                        <div
                            key={file.name}
                            className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                        >
                            <FileIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{file.name}</p>
                                {error ? (
                                    <p className="text-xs text-red-500">{error}</p>
                                ) : (
                                    <Progress value={progress} className="h-1" />
                                )}
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(file)}
                            >
                                <XIcon className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
} 