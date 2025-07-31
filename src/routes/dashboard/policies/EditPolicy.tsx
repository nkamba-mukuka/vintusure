import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import PolicyForm from '@/components/policies/PolicyForm'
import { policyService } from '@/lib/services/policyService'
import LoadingState from '@/components/LoadingState'
import { useToast } from '@/components/ui/use-toast'

export default function EditPolicyPage() {
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

    return (
        <div className="py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900">Edit Policy</h1>
                <div className="mt-4">
                    <PolicyForm initialData={policy} />
                </div>
            </div>
        </div>
    )
} 