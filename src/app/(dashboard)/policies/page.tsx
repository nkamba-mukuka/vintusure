'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { policyService } from '@/lib/services/policyService';
import { PolicyFilters } from '@/types/policy';
import PolicyList from '@/components/policies/PolicyList';
import PolicyFiltersBar from '@/components/policies/PolicyFiltersBar';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import Link from 'next/link';

export default function PoliciesPage() {
    const [filters, setFilters] = useState<PolicyFilters>({});
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const { data, isLoading, error } = useQuery({
        queryKey: ['policies', filters, currentPage],
        queryFn: () => policyService.list(filters, pageSize),
    });

    const handleFilterChange = (newFilters: PolicyFilters) => {
        setFilters(newFilters);
        setCurrentPage(1);
    };

    if (error) {
        return (
            <div className="p-4 text-red-500">
                Error loading policies. Please try again later.
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-900">Policies</h1>
                <Link href="/policies/new">
                    <Button>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        New Policy
                    </Button>
                </Link>
            </div>

            <PolicyFiltersBar
                filters={filters}
                onFilterChange={handleFilterChange}
            />

            <PolicyList
                policies={data?.policies || []}
                isLoading={isLoading}
                onPageChange={setCurrentPage}
                currentPage={currentPage}
                totalPages={Math.ceil((data?.total || 0) / pageSize)}
            />
        </div>
    );
} 