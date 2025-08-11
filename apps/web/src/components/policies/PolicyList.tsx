
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Trash2, Edit, Plus } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import type { PolicyFormData } from '@/lib/validations/policy'
import LoadingState from '@/components/LoadingState'
import { useState } from 'react'
import PolicyModalForm from './PolicyModalForm'
import { ResponsiveTable, MobileCardView, MobileCardItem, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Policies</h2>
                    <Button onClick={handleCreatePolicy} className="flex items-center gap-2 w-full sm:w-auto">
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Policies</h2>
                <Button onClick={handleCreatePolicy} className="flex items-center gap-2 w-full sm:w-auto">
                    <Plus className="h-4 w-4" />
                    Create Policy
                </Button>
            </div>

            {/* Mobile Card View */}
            <MobileCardView>
                {policies.map((policy) => (
                    <MobileCardItem key={policy.id}>
                        <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-sm truncate">{policy.policyNumber}</h3>
                                <p className="text-xs text-muted-foreground truncate">{policy.customerName}</p>
                            </div>
                            <Badge variant={policy.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                                {policy.status}
                            </Badge>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Type:</span>
                                <span>{policy.type}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Premium:</span>
                                <span>{policy.premium?.amount || 0} {policy.premium?.currency || 'ZMW'}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Start Date:</span>
                                <span>{policy.startDate ? format(new Date(policy.startDate), 'MMM dd, yyyy') : 'N/A'}</span>
                            </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditPolicy(policy)}
                                className="flex-1"
                            >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(policy.id, policy.policyNumber)}
                                className="flex-1 text-destructive hover:text-destructive"
                            >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                            </Button>
                        </div>
                    </MobileCardItem>
                ))}
            </MobileCardView>

            {/* Desktop Table View */}
            <ResponsiveTable className="hidden sm:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Policy Number</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Premium</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Start Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {policies.map((policy) => (
                            <TableRow key={policy.id}>
                                <TableCell className="font-medium">{policy.policyNumber}</TableCell>
                                <TableCell>{policy.customerName}</TableCell>
                                <TableCell>{policy.type}</TableCell>
                                <TableCell>{policy.premium?.amount || 0} {policy.premium?.currency || 'ZMW'}</TableCell>
                                <TableCell>
                                    <Badge variant={policy.status === 'active' ? 'default' : 'secondary'}>
                                        {policy.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {policy.startDate ? format(new Date(policy.startDate), 'MMM dd, yyyy') : 'N/A'}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEditPolicy(policy)}
                                        >
                                            <Edit className="h-3 w-3 mr-1" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(policy.id, policy.policyNumber)}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="h-3 w-3 mr-1" />
                                            Delete
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </ResponsiveTable>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                    </span>
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

            <PolicyModalForm
                isOpen={isModalOpen}
                onClose={handleModalClose}
                initialData={editingPolicy}
                onSuccess={handleModalSuccess}
            />
        </div>
    )
} 