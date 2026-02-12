import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDropzone } from 'react-dropzone';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/contexts/AuthContext';
import { documentService } from '@/lib/services/documentService';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase/config';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
    Upload, 
    FileText, 
    X, 
    Loader2, 
    CheckCircle,
    AlertCircle,
    File,
    FileImage,
    FileType
} from 'lucide-react';
import { cn } from '@/lib/utils';

const fileUploadSchema = z.object({
    fileName: z.string().optional(),
    description: z.string().optional(),
    category: z.enum(['policy', 'claim', 'invoice', 'contract', 'certificate', 'other']),
    tags: z.string().optional(),
});

type FileUploadFormData = z.infer<typeof fileUploadSchema>;

interface FileUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

interface UploadedFile {
    file: File;
    preview?: string;
    progress: number;
    status: 'uploading' | 'processing' | 'indexing' | 'completed' | 'error';
    error?: string;
}

export default function FileUploadModal({ isOpen, onClose, onSuccess }: FileUploadModalProps) {
    const { toast } = useToast();
    const { user } = useAuthContext();
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const form = useForm<FileUploadFormData>({
        resolver: zodResolver(fileUploadSchema),
        defaultValues: {
            fileName: '',
            description: '',
            category: 'other',
            tags: '',
        },
    });

    const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
        // Handle accepted files
        const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
            file,
            progress: 0,
            status: 'uploading',
            preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
        }));
        
        setUploadedFiles(prev => [...prev, ...newFiles]);
        
        // Handle rejected files and show error messages
        if (rejectedFiles.length > 0) {
            console.warn('Rejected files:', rejectedFiles);
            // You could add a toast notification here for rejected files
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'application/vnd.ms-excel': ['.xls'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-powerpoint': ['.ppt'],
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
            'image/gif': ['.gif'],
            'image/webp': ['.webp'],
            'text/plain': ['.txt'],
            'text/csv': ['.csv'],
            'application/rtf': ['.rtf'],
            'application/json': ['.json'],
            'application/xml': ['.xml'],
        },
        maxSize: 10 * 1024 * 1024, // 10MB
        multiple: true,
    });

    const removeFile = (index: number) => {
        setUploadedFiles(prev => {
            const newFiles = [...prev];
            const removedFile = newFiles[index];
            if (removedFile.preview) {
                URL.revokeObjectURL(removedFile.preview);
            }
            newFiles.splice(index, 1);
            return newFiles;
        });
    };

    const getFileIcon = (fileName: string) => {
        const extension = fileName.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'pdf':
                return <FileType className="h-8 w-8 text-red-500" />;
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'webp':
                return <FileImage className="h-8 w-8 text-green-500" />;
            case 'doc':
            case 'docx':
            case 'rtf':
                return <FileText className="h-8 w-8 text-blue-500" />;
            case 'xls':
            case 'xlsx':
                return <FileText className="h-8 w-8 text-green-600" />;
            case 'ppt':
            case 'pptx':
                return <FileText className="h-8 w-8 text-orange-500" />;
            case 'txt':
            case 'csv':
            case 'json':
            case 'xml':
                return <FileText className="h-8 w-8 text-gray-600" />;
            default:
                return <File className="h-8 w-8 text-gray-500" />;
        }
    };

    const getStatusIcon = (status: UploadedFile['status']) => {
        switch (status) {
            case 'uploading':
                return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
            case 'processing':
                return <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />;
            case 'indexing':
                return <Loader2 className="h-4 w-4 animate-spin text-purple-500" />;
            case 'completed':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'error':
                return <AlertCircle className="h-4 w-4 text-red-500" />;
            default:
                return null;
        }
    };

    const getStatusText = (status: UploadedFile['status']) => {
        switch (status) {
            case 'uploading':
                return 'Uploading...';
            case 'processing':
                return 'Processing...';
            case 'indexing':
                return 'Indexing for RAG...';
            case 'completed':
                return 'Completed';
            case 'error':
                return 'Error';
            default:
                return '';
        }
    };

    const onSubmit = async (data: FileUploadFormData) => {
        if (!user) {
            toast({
                title: 'Error',
                description: 'You must be logged in to upload files',
                variant: 'destructive',
            });
            return;
        }

        if (uploadedFiles.length === 0) {
            toast({
                title: 'Error',
                description: 'Please select at least one file to upload',
                variant: 'destructive',
            });
            return;
        }

        setIsUploading(true);

        try {
            const tags = data.tags ? data.tags.split(',').map(tag => tag.trim()) : [];

            for (let i = 0; i < uploadedFiles.length; i++) {
                const uploadedFile = uploadedFiles[i];
                
                // Update status to processing
                setUploadedFiles(prev => prev.map((file, index) => 
                    index === i ? { ...file, status: 'processing' as const } : file
                ));

                try {
                    // Upload file to Firebase Storage
                    const fileRef = ref(storage, `documents/${user.uid}/${Date.now()}_${uploadedFile.file.name}`);
                    
                    // Update progress to show upload starting
                    setUploadedFiles(prev => prev.map((file, index) => 
                        index === i ? { ...file, progress: 10 } : file
                    ));

                    const uploadResult = await uploadBytes(fileRef, uploadedFile.file);
                    const downloadURL = await getDownloadURL(uploadResult.ref);

                    // Update progress to show upload complete
                    setUploadedFiles(prev => prev.map((file, index) => 
                        index === i ? { ...file, progress: 40 } : file
                    ));

                    // Create document record
                    const documentData = {
                        fileName: data.fileName || uploadedFile.file.name,
                        fileType: uploadedFile.file.type,
                        fileSize: uploadedFile.file.size,
                        fileUrl: downloadURL,
                        description: data.description,
                        category: data.category,
                        tags: tags,
                        uploadedBy: user.uid,
                    };

                    const document = await documentService.create(documentData, user.uid);

                    // Update status to indexing
                    setUploadedFiles(prev => prev.map((file, index) => 
                        index === i ? { ...file, status: 'indexing' as const, progress: 70 } : file
                    ));

                    // Simulate indexing process (in real implementation, this would call your RAG indexing service)
                    await new Promise(resolve => setTimeout(resolve, 2000));

                    // Update status to completed
                    setUploadedFiles(prev => prev.map((file, index) => 
                        index === i ? { ...file, status: 'completed' as const, progress: 100 } : file
                    ));

                    // Update the document with vector indexing status
                    await documentService.updateVectorIndexStatus(document.id, true);

                } catch (error) {
                    console.error('Error uploading file:', error);
                    setUploadedFiles(prev => prev.map((file, index) => 
                        index === i ? { 
                            ...file, 
                            status: 'error' as const, 
                            error: error instanceof Error ? error.message : 'Upload failed' 
                        } : file
                    ));
                }
            }

            toast({
                title: 'Success',
                description: 'Files uploaded successfully! VintuSure AI can now help answer questions about your documents.',
            });

            onSuccess?.();
            handleClose();

        } catch (error) {
            console.error('Error in upload process:', error);
            toast({
                title: 'Error',
                description: 'Failed to upload files',
                variant: 'destructive',
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleClose = () => {
        // Clean up preview URLs
        uploadedFiles.forEach(file => {
            if (file.preview) {
                URL.revokeObjectURL(file.preview);
            }
        });
        
        setUploadedFiles([]);
        form.reset();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Upload Files to VintuSure</DialogTitle>
                                         <DialogDescription>
                         Upload your insurance documents to help VintuSure AI provide better answers. 
                         Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, PNG, GIF, WEBP, TXT, CSV, RTF, JSON, XML (max 10MB each).
                     </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* File Upload Area */}
                        <div className="space-y-4">
                            <div
                                {...getRootProps()}
                                className={cn(
                                    "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                                    isDragActive 
                                        ? "border-primary bg-primary/5" 
                                        : "border-gray-300 hover:border-primary/50"
                                )}
                            >
                                <input {...getInputProps()} />
                                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                {isDragActive ? (
                                    <p className="text-primary font-medium">Drop the files here...</p>
                                ) : (
                                    <div>
                                        <p className="text-gray-600 mb-2">
                                            Drag & drop files here, or click to select files
                                        </p>
                                                                                 <p className="text-sm text-gray-500">
                                             PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, PNG, GIF, WEBP, TXT, CSV, RTF, JSON, XML (max 10MB each)
                                         </p>
                                    </div>
                                )}
                            </div>

                            {/* Uploaded Files List */}
                            {uploadedFiles.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="font-medium">Selected Files ({uploadedFiles.length})</h4>
                                    {uploadedFiles.map((uploadedFile, index) => (
                                        <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                                            <div className="flex-shrink-0">
                                                {uploadedFile.preview ? (
                                                    <img 
                                                        src={uploadedFile.preview} 
                                                        alt="Preview" 
                                                        className="h-12 w-12 object-cover rounded"
                                                    />
                                                ) : (
                                                    getFileIcon(uploadedFile.file.name)
                                                )}
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="text-sm font-medium truncate">
                                                        {uploadedFile.file.name}
                                                    </p>
                                                    <Badge variant="secondary" className="text-xs">
                                                        {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                                                    </Badge>
                                                </div>
                                                
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(uploadedFile.status)}
                                                    <span className="text-xs text-gray-500">
                                                        {getStatusText(uploadedFile.status)}
                                                    </span>
                                                    {uploadedFile.error && (
                                                        <span className="text-xs text-red-500">
                                                            {uploadedFile.error}
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                {uploadedFile.status !== 'completed' && uploadedFile.status !== 'error' && (
                                                    <Progress value={uploadedFile.progress} className="mt-2" />
                                                )}
                                            </div>
                                            
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeFile(index)}
                                                disabled={uploadedFile.status === 'uploading' || uploadedFile.status === 'processing' || uploadedFile.status === 'indexing'}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Form Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="fileName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Document Name (Optional)</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="Enter document name or leave blank to use file name" 
                                                {...field} 
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="policy">Policy</SelectItem>
                                                <SelectItem value="claim">Claim</SelectItem>
                                                <SelectItem value="invoice">Invoice</SelectItem>
                                                <SelectItem value="contract">Contract</SelectItem>
                                                <SelectItem value="certificate">Certificate</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea 
                                            placeholder="Brief description of the document" 
                                            {...field} 
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="tags"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tags (Optional)</FormLabel>
                                    <FormControl>
                                        <Input 
                                            placeholder="Enter tags separated by commas" 
                                            {...field} 
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={handleClose}
                                disabled={isUploading}
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={isUploading || uploadedFiles.length === 0}
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Uploading...
                                    </>
                                ) : (
                                    'Upload Files'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
