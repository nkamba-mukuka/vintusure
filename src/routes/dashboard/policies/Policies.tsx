import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import PolicyList from '@/components/policies/PolicyList'
import PolicyFiltersBar from '@/components/policies/PolicyFiltersBar'
import { policyService } from '@/lib/services/policyService'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import type { PolicyFilters } from '@/types/policy'

export default function PoliciesPage() {
    const [currentPage, setCurrentPage] = useState(1)
    const [filters, setFilters] = useState<PolicyFilters>({})
    const { toast } = useToast()

    const { data, isLoading } = useQuery({
        queryKey: ['policies', currentPage, filters],
        queryFn: () => policyService.list(filters),
    })

    const policies = data?.policies ?? []
    const totalPages = Math.ceil((data?.total ?? 0) / 10)

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
                        />
                    </div>
                </div>
            </div>
        </div>
    )
} 