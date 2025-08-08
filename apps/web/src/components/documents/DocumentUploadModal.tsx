import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { documentService } from '@/lib/services/documentService';
import { googleCloudStorageService } from '@/lib/services/googleCloudStorageService';
import { useAuthContext } from '@/contexts/AuthContext';

// Import the validateFile function
const validateFile = (file: File): { isValid: boolean; error?: string } => {
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
};

interface DocumentUploadModalProps {
    onUploadComplete: (document: { url: string; path: string; name: string; type: string; description: string }) => void;
}

export default function DocumentUploadModal({ onUploadComplete }: DocumentUploadModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [documentName, setDocumentName] = useState('');
    const [documentType, setDocumentType] = useState('');
    const [description, setDescription] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();
    const { user } = useAuthContext();

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file before setting it
            const validation = validateFile(file);
            if (!validation.isValid) {
                toast({
                    title: 'Invalid File',
                    description: validation.error,
                    variant: 'destructive',
                });
                return;
            }
            
            setSelectedFile(file);
            if (!documentName) {
                setDocumentName(file.name);
            }
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !documentName || !documentType) {
            toast({
                title: 'Error',
                description: 'Please fill in all required fields and select a file',
                variant: 'destructive',
            });
            return;
        }

        if (!user?.uid) {
            toast({
                title: 'Error',
                description: 'User not authenticated',
                variant: 'destructive',
            });
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        try {
            // Use Google Cloud Storage service (removed DEV mode check)
            const document = await googleCloudStorageService.uploadDocument({
                file: selectedFile,
                entityType: 'policy', // Default to policy, can be made configurable
                entityId: user.uid,
                documentType,
                userId: user.uid,
                onProgress: (progress) => {
                    setUploadProgress(progress);
                },
            });

            const uploadedDocument = {
                ...document,
                name: documentName,
                type: documentType,
                description,
            };

            onUploadComplete(uploadedDocument);
            
            toast({
                title: 'Success',
                description: 'Document uploaded successfully to Google Cloud Storage',
            });

            // Reset form
            setSelectedFile(null);
            setDocumentName('');
            setDocumentType('');
            setDescription('');
            setUploadProgress(0);
            setIsOpen(false);
        } catch (error) {
            console.error('Upload error:', error);
            toast({
                title: 'Error',
                description: 'Failed to upload document. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsUploading(false);
        }
    };

    const removeFile = () => {
        setSelectedFile(null);
        setDocumentName('');
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="flex items-center gap-2" data-upload-trigger>
                    <Upload className="h-4 w-4" />
                    Upload Document
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Upload New Document</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                    {/* File Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="file">Select File</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="file"
                                type="file"
                                onChange={handleFileSelect}
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
                                disabled={isUploading}
                            />
                            {selectedFile && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={removeFile}
                                    disabled={isUploading}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                        {selectedFile && (
                            <p className="text-sm text-gray-600">
                                Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                            </p>
                        )}
                        <p className="text-xs text-gray-500">
                            Allowed file types: PDF, JPG, PNG, DOC, DOCX, TXT (Max size: 10MB)
                        </p>
                    </div>

                    {/* Document Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Document Name *</Label>
                        <Input
                            id="name"
                            value={documentName}
                            onChange={(e) => setDocumentName(e.target.value)}
                            placeholder="Enter document name"
                            disabled={isUploading}
                        />
                    </div>

                    {/* Document Type */}
                    <div className="space-y-2">
                        <Label htmlFor="type">Document Type *</Label>
                        <Select value={documentType} onValueChange={setDocumentType} disabled={isUploading}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select document type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="policy">Policy Document</SelectItem>
                                <SelectItem value="claim">Claim Document</SelectItem>
                                <SelectItem value="invoice">Invoice</SelectItem>
                                <SelectItem value="contract">Contract</SelectItem>
                                <SelectItem value="certificate">Certificate</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter document description (optional)"
                            disabled={isUploading}
                        />
                    </div>

                    {/* Upload Progress */}
                    {isUploading && (
                        <div className="space-y-2">
                            <Label>Upload Progress</Label>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                            <p className="text-sm text-gray-600">{Math.round(uploadProgress)}% complete</p>
                            <p className="text-sm text-blue-600">
                                Uploading to Google Cloud Storage...
                            </p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            disabled={isUploading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpload}
                            disabled={!selectedFile || !documentName || !documentType || isUploading}
                        >
                            {isUploading ? 'Uploading...' : 'Upload Document'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
