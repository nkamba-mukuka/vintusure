'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { claimService } from '@/lib/services/claimService';
import { ClaimStatus, DamageType } from '@/types/policy';
import ClaimList from '@/components/claims/ClaimList';
import ClaimFiltersBar from '@/components/claims/ClaimFiltersBar';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import Link from 'next/link';

interface ClaimFilters {
    searchTerm?: string;
    status?: ClaimStatus;
    damageType?: DamageType;
    startDate?: Date;
    endDate?: Date;
}

export default function ClaimsPage() {
    const [filters, setFilters] = useState<ClaimFilters>({});
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const { data, isLoading, error } = useQuery({
        queryKey: ['claims', filters, currentPage],
        queryFn: () => claimService.list(filters, pageSize),
    });

    const handleFilterChange = (newFilters: ClaimFilters) => {
        setFilters(newFilters);
        setCurrentPage(1);
    };

    if (error) {
        return (
            <div className="p-4 text-red-500">
                Error loading claims. Please try again later.
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-900">Claims</h1>
                <Link href="/claims/new">
                    <Button>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Submit New Claim
                    </Button>
                </Link>
            </div>

            <ClaimFiltersBar
                filters={filters}
                onFilterChange={handleFilterChange}
            />

            <ClaimList
                claims={data?.claims || []}
                isLoading={isLoading}
                onPageChange={setCurrentPage}
                currentPage={currentPage}
                totalPages={Math.ceil((data?.total || 0) / pageSize)}
            />
        </div>
    );
} 