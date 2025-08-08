import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { policyService } from '@/lib/services/policyService'
import LoadingState from '@/components/LoadingState'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { Timestamp } from 'firebase/firestore'

export default function PolicyDetailsPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { toast } = useToast()

    const { data: policy, isLoading } = useQuery({
        queryKey: ['policy', id],
        queryFn: () => policyService.getById(id!),
        enabled: !!id,
    })

    const handleDelete = async () => {
        if (!policy || !id) return

        if (!window.confirm(`Are you sure you want to delete policy ${policy.policyNumber}? This action cannot be undone.`)) {
            return
        }

        try {
            await policyService.delete(id)
            toast({
                title: 'Policy deleted',
                description: `Policy ${policy.policyNumber} has been deleted successfully.`,
            })
            navigate('/policies')
        } catch (error) {
            console.error('Error deleting policy:', error)
            toast({
                title: 'Error',
                description: 'Failed to delete policy. Please try again.',
                variant: 'destructive',
            })
        }
    }

    if (isLoading) {
        return <LoadingState />
    }

    if (!policy || !id) {
        return (
            <div className="py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-gray-900">Policy Not Found</h1>
                </div>
            </div>
        )
    }

    const formatDate = (date: Date | Timestamp) => {
        if (date instanceof Timestamp) {
            return format(date.toDate(), 'PPP')
        }
        return format(date, 'PPP')
    }

    return (
        <div className="py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">Policy Details</h1>
                    <div className="space-x-4">
                        <Button asChild variant="outline">
                            <Link to={`/policies/${id}/documents`}>View Documents</Link>
                        </Button>
                        <Button asChild>
                            <Link to={`/policies/${id}/edit`}>Edit Policy</Link>
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={handleDelete}
                            className="flex items-center gap-2"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete Policy
                        </Button>
                    </div>
                </div>
                <div className="mt-6 bg-white shadow rounded-lg p-6">
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Policy Number</dt>
                            <dd className="mt-1 text-sm text-gray-900">{policy.policyNumber}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Status</dt>
                            <dd className="mt-1 text-sm text-gray-900">{policy.status}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Type</dt>
                            <dd className="mt-1 text-sm text-gray-900">{policy.type}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                            <dd className="mt-1 text-sm text-gray-900">{formatDate(policy.startDate)}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">End Date</dt>
                            <dd className="mt-1 text-sm text-gray-900">{formatDate(policy.endDate)}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Premium Amount</dt>
                            <dd className="mt-1 text-sm text-gray-900">{policy.premium.amount} {policy.premium.currency}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Payment Status</dt>
                            <dd className="mt-1 text-sm text-gray-900">{policy.premium.paymentStatus}</dd>
                        </div>
                    </dl>
                    <div className="mt-8">
                        <h3 className="text-lg font-medium text-gray-900">Vehicle Details</h3>
                        <dl className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Registration Number</dt>
                                <dd className="mt-1 text-sm text-gray-900">{policy.vehicle.registrationNumber}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Make</dt>
                                <dd className="mt-1 text-sm text-gray-900">{policy.vehicle.make}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Model</dt>
                                <dd className="mt-1 text-sm text-gray-900">{policy.vehicle.model}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Year</dt>
                                <dd className="mt-1 text-sm text-gray-900">{policy.vehicle.year}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Engine Number</dt>
                                <dd className="mt-1 text-sm text-gray-900">{policy.vehicle.engineNumber}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Chassis Number</dt>
                                <dd className="mt-1 text-sm text-gray-900">{policy.vehicle.chassisNumber}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Value</dt>
                                <dd className="mt-1 text-sm text-gray-900">{policy.vehicle.value} {policy.premium.currency}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Usage</dt>
                                <dd className="mt-1 text-sm text-gray-900">{policy.vehicle.usage}</dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    )
} 