import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import PolicyList from '@/components/policies/PolicyList'
import PolicyFiltersBar from '@/components/policies/PolicyFiltersBar'
import { policyService } from '@/lib/services/policyService'
import { Button } from '@/components/ui/button'
import type { PolicyFilters } from '@/types/policy'

export default function PoliciesPage() {
    const { user } = useAuthContext()
    const [currentPage, setCurrentPage] = useState(1)
    const [filters, setFilters] = useState<PolicyFilters>({})
    const queryClient = useQueryClient()

    const { data, isLoading } = useQuery({
        queryKey: ['policies', user?.uid, currentPage, filters],
        queryFn: () => policyService.list({ ...filters, userId: user?.uid }),
        enabled: !!user?.uid,
    })

    const policies = data?.policies ?? []
    const totalPages = Math.ceil((data?.total ?? 0) / 10)

    const handlePolicyDelete = async (policyId: string) => {
        try {
            await policyService.delete(policyId)
            // Invalidate and refetch policies to update the list
            await queryClient.invalidateQueries({ queryKey: ['policies'] })
        } catch (error) {
            console.error('Error deleting policy:', error)
            throw error // Re-throw to let the PolicyList component handle the error
        }
    }

    return (
        <div className="py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">Policies</h1>
                    <Button asChild>
                        <Link to="/policies/new">Create New Policy</Link>
                    </Button>
                </div>
                <div className="mt-4">
                    <PolicyFiltersBar
                        filters={filters}
                        onFilterChange={setFilters}
                    />
                    <div className="mt-4">
                        <PolicyList
                            policies={policies}
                            isLoading={isLoading}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            onPolicyDelete={handlePolicyDelete}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
} 