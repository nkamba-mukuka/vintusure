
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Trash2, Edit, Plus } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import type { PolicyFormData } from '@/lib/validations/policy'
import LoadingState from '@/components/LoadingState'
import { useState } from 'react'
import PolicyModalForm from './PolicyModalForm'

interface PolicyListProps {
    policies: (PolicyFormData & { id: string })[]
    isLoading: boolean
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    onPolicyDelete?: (policyId: string) => Promise<void>
    onPolicyUpdate?: () => void
}

export default function PolicyList({ 
    policies, 
    isLoading, 
    currentPage, 
    totalPages, 
    onPageChange,
    onPolicyDelete,
    onPolicyUpdate
}: PolicyListProps) {
    const { toast } = useToast()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingPolicy, setEditingPolicy] = useState<(PolicyFormData & { id: string }) | undefined>(undefined)
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')

    const handleDelete = async (policyId: string, policyNumber: string) => {
        if (!window.confirm(`Are you sure you want to delete policy ${policyNumber}? This action cannot be undone.`)) {
            return
        }

        try {
            await onPolicyDelete?.(policyId)
            toast({
                title: 'Policy deleted',
                description: `Policy ${policyNumber} has been deleted successfully.`,
            })
        } catch (error) {
            console.error('Error deleting policy:', error)
            toast({
                title: 'Error',
                description: 'Failed to delete policy. Please try again.',
                variant: 'destructive',
            })
        }
    }

    const handleCreatePolicy = () => {
        setModalMode('create')
        setEditingPolicy(undefined)
        setIsModalOpen(true)
    }

    const handleEditPolicy = (policy: PolicyFormData & { id: string }) => {
        setModalMode('edit')
        setEditingPolicy(policy)
        setIsModalOpen(true)
    }

    const handleModalClose = () => {
        setIsModalOpen(false)
        setEditingPolicy(undefined)
    }

    const handleModalSuccess = () => {
        onPolicyUpdate?.() // Refresh the list
    }

    if (isLoading) {
        return <LoadingState />
    }

    if (policies.length === 0) {
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">Policies</h2>
                    <Button onClick={handleCreatePolicy} className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Create Policy
                    </Button>
                </div>
                <div className="text-center py-8">
                    <p className="text-gray-500">No policies found</p>
                </div>
                <PolicyModalForm
                    isOpen={isModalOpen}
                    onClose={handleModalClose}
                    initialData={editingPolicy}
                    onSuccess={handleModalSuccess}
                />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Policies</h2>
                <Button onClick={handleCreatePolicy} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create Policy
                </Button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                                #
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Policy Number
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Start Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                End Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Premium
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {policies.map((policy, index) => (
                            <tr key={policy.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                                    {index + 1}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {policy.policyNumber}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {policy.type}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {policy.status}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {format(policy.startDate, 'PPP')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {format(policy.endDate, 'PPP')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {policy.premium.amount} {policy.premium.currency}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <Button asChild variant="ghost" size="sm">
                                        <Link to={`/policies/${policy.id}`}>View</Link>
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => handleEditPolicy(policy)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    {onPolicyDelete && (
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            onClick={() => handleDelete(policy.id, policy.policyNumber || 'Unknown')}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && (
                <div className="flex justify-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </Button>
                </div>
            )}

            {/* Policy Modal Form */}
            <PolicyModalForm
                isOpen={isModalOpen}
                onClose={handleModalClose}
                initialData={editingPolicy}
                onSuccess={handleModalSuccess}
            />
        </div>
    )
} 