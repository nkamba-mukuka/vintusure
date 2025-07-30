'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { policyService } from '@/lib/services/policyService';
import { documentService } from '@/lib/services/documentService';
import DocumentUpload from '@/components/documents/DocumentUpload';
import { Button } from '@/components/ui/button';
import { FileIcon, TrashIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';

export default function PolicyDocumentsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const policyId = Array.isArray(id) ? id[0] : id;

    const { data: policy, isLoading, error } = useQuery({
        queryKey: ['policy', policyId],
        queryFn: () => policyService.getById(policyId),
    });

    const handleUploadComplete = async (document: { url: string; path: string }) => {
        try {
            await policyService.addDocument(policyId, {
                id: document.path, // Use the storage path as the document ID
                type: 'Policy Document',
                url: document.url,
                uploadedAt: new Date(),
            });

            toast({
                title: 'Document uploaded',
                description: 'The document has been uploaded successfully.',
            });

            // Refresh the policy data
            router.refresh();
        } catch (error) {
            console.error('Error updating policy:', error);
            toast({
                title: 'Error',
                description: 'There was an error saving the document. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleDeleteDocument = async (documentId: string) => {
        try {
            await policyService.removeDocument(policyId, documentId);
            toast({
                title: 'Document deleted',
                description: 'The document has been deleted successfully.',
            });
            router.refresh();
        } catch (error) {
            console.error('Error deleting document:', error);
            toast({
                title: 'Error',
                description: 'There was an error deleting the document. Please try again.',
                variant: 'destructive',
            });
        }
    };

    if (isLoading) {
        return (
            <div className="p-6 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
        );
    }

    if (error || !policy) {
        return (
            <div className="p-6 text-red-500">
                Error loading policy. Please try again later.
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-900">
                    Policy Documents - {policy.policyNumber}
                </h1>
                <Button variant="outline" onClick={() => router.back()}>
                    Back to Policy
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Upload Section */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-medium mb-4">Upload Documents</h2>
                    <DocumentUpload
                        entityType="policy"
                        entityId={policyId}
                        documentType="Policy Document"
                        onUploadComplete={handleUploadComplete}
                        onUploadError={(error) => {
                            toast({
                                title: 'Upload failed',
                                description: error.message,
                                variant: 'destructive',
                            });
                        }}
                    />
                </div>

                {/* Documents List */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-medium mb-4">Uploaded Documents</h2>
                    {policy.documents.length > 0 ? (
                        <ul className="space-y-2">
                            {policy.documents.map((doc) => (
                                <li
                                    key={doc.id}
                                    className="flex items-center justify-between py-2 border-b"
                                >
                                    <a
                                        href={doc.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center text-indigo-600 hover:text-indigo-900"
                                    >
                                        <FileIcon className="h-4 w-4 mr-2" />
                                        <span>{doc.type}</span>
                                    </a>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm text-gray-500">
                                            {format(new Date(doc.uploadedAt), 'PP')}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteDocument(doc.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">No documents uploaded yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
} 