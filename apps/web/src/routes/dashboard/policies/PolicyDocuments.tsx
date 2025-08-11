import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { policyService } from '@/lib/services/policyService'
import LoadingState from '@/components/LoadingState'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText } from 'lucide-react'

export default function PolicyDocumentsPage() {
    const { id } = useParams<{ id: string }>()

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

    return (
        <div className="py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900">Policy Documents</h1>
                <div className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Document Upload Disabled
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600">
                                Document upload functionality has been removed. 
                                Contact your administrator to upload policy documents.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
} 