import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { customerService } from '@/lib/services/customerService';
import { Customer, CustomerFilters } from '@/types/customer';
import CustomerList from './CustomerList';
import CustomerFiltersBar from '@/components/customers/CustomerFiltersBar';

export default function CustomersPage() {
    const { user } = useAuthContext();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState<CustomerFilters>({
        userId: user?.uid,
    });

    const fetchCustomers = async () => {
        if (!user?.uid) return;

        setIsLoading(true);
        try {
            const result = await customerService.list({
                ...filters,
                userId: user.uid,
            });
            
            setCustomers(result.customers);
            setTotalPages(Math.ceil(result.total / 10)); // Assuming 10 items per page
        } catch (error) {
            console.error('Failed to fetch customers:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, [user?.uid, filters]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleFiltersChange = (newFilters: CustomerFilters) => {
        setFilters(newFilters);
        setCurrentPage(1); // Reset to first page when filters change
    };

    const handleCustomerUpdate = () => {
        fetchCustomers(); // Refresh the list after CRUD operations
    };

    return (
        <div className="p-8">
            <CustomerFiltersBar 
                filters={filters} 
                onFiltersChange={handleFiltersChange} 
            />
            
            <CustomerList
                customers={customers}
                isLoading={isLoading}
                onPageChange={handlePageChange}
                currentPage={currentPage}
                totalPages={totalPages}
                onCustomerUpdate={handleCustomerUpdate}
            />
        </div>
    );
} 