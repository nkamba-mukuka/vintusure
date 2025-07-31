import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import DocumentUpload from '@/components/documents/DocumentUpload'
import { policyService } from '@/lib/services/policyService'
import LoadingState from '@/components/LoadingState'
import { useToast } from '@/components/ui/use-toast'

export default function PolicyDocumentsPage() {
    const { id } = useParams<{ id: string }>()
    const { toast } = useToast()

    const { data: policy, isLoading } = useQuery({
        queryKey: ['policy', id],
        queryFn: () => policyService.getById(id!),
        enabled: !!id,
    })

    if (isLoading) {
        return <LoadingState />
    }

    if (!policy || !id) {
        return (
            <div className="py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-gray-900">Policy Not Found</h1>
                    <p className="mt-2 text-gray-600">
                        The policy you're looking for doesn't exist or you don't have permission to view it.
                    </p>
                </div>
            </div>
        )
    }

    const handleUploadComplete = async (document: { url: string }) => {
        try {
            await policyService.addDocument(id, {
                id: crypto.randomUUID(),
                type: 'policy_document',
                url: document.url,
                uploadedAt: new Date(),
            })
            toast({
                title: 'Document Uploaded',
                description: 'The document has been uploaded successfully.',
            })
        } catch (error) {
            console.error('Error uploading document:', error)
            toast({
                title: 'Upload Error',
                description: error instanceof Error ? error.message : 'Failed to upload document',
                variant: 'destructive',
            })
        }
    }

    const handleUploadError = (error: Error) => {
        console.error('Error uploading document:', error)
        toast({
            title: 'Upload Error',
            description: error.message,
            variant: 'destructive',
        })
    }

    return (
        <div className="py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900">Policy Documents</h1>
                <div className="mt-4">
                    <DocumentUpload
                        entityType="policy"
                        entityId={id}
                        documentType="policy_document"
                        onUploadComplete={handleUploadComplete}
                        onUploadError={handleUploadError}
                    />
                </div>
            </div>
        </div>
    )
} 