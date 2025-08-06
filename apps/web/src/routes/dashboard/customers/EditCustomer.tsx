import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCustomerCRUD } from './customer';
import CustomerForm from './CustomerForm';
import { Customer } from '@/types/customer';
import { useToast } from '@/hooks/use-toast';

export default function EditCustomerPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getCustomer, isLoading, error } = useCustomerCRUD();
    const { toast } = useToast();
    const [customer, setCustomer] = useState<Customer | null>(null);

    useEffect(() => {
        const fetchCustomer = async () => {
            if (!id) {
                toast({
                    title: "Error",
                    description: "Customer ID is required.",
                    variant: "destructive",
                });
                navigate('/dashboard/customers');
                return;
            }

            const customerData = await getCustomer(id);
            if (customerData) {
                setCustomer(customerData);
            } else {
                toast({
                    title: "Error",
                    description: "Customer not found.",
                    variant: "destructive",
                });
                navigate('/dashboard/customers');
            }
        };

        fetchCustomer();
    }, [id, getCustomer, navigate, toast]);

    if (isLoading) {
        return (
            <div className="p-8">
                <div className="w-full h-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <div className="text-center py-8 text-red-600">
                    Error: {error}
                </div>
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="p-8">
                <div className="text-center py-8 text-gray-500">
                    Customer not found.
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <CustomerForm customer={customer} mode="edit" />
        </div>
    );
} 