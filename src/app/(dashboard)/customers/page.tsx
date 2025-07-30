'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { customerService } from '@/lib/services/customerService';
import { CustomerFilters } from '@/types/customer';
import CustomerList from '@/components/customers/CustomerList';
import CustomerFiltersBar from '@/components/customers/CustomerFiltersBar';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import Link from 'next/link';

export default function CustomersPage() {
    const [filters, setFilters] = useState<CustomerFilters>({});
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const { data, isLoading, error } = useQuery({
        queryKey: ['customers', filters, currentPage],
        queryFn: () => customerService.list(filters, pageSize),
    });

    const handleFilterChange = (newFilters: CustomerFilters) => {
        setFilters(newFilters);
        setCurrentPage(1);
    };

    if (error) {
        return (
            <div className="p-4 text-red-500">
                Error loading customers. Please try again later.
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
                <Link href="/customers/new">
                    <Button>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Customer
                    </Button>
                </Link>
            </div>

            <CustomerFiltersBar
                filters={filters}
                onFilterChange={handleFilterChange}
            />

            <CustomerList
                customers={data?.customers || []}
                isLoading={isLoading}
                onPageChange={setCurrentPage}
                currentPage={currentPage}
                totalPages={Math.ceil((data?.total || 0) / pageSize)}
            />
        </div>
    );
} 