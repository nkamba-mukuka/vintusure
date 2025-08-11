import { customerService } from '@/lib/services/customerService';
import { Customer, CustomerFormData } from '@/types/customer';
import { useAuthContext } from '@/contexts/AuthContext';
import { useState } from 'react';

export const useCustomerCRUD = () => {
    const { user } = useAuthContext();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createCustomer = async (customerData: CustomerFormData): Promise<Customer | null> => {
        if (!user?.uid) {
            setError('User not authenticated');
            return null;
        }

        setIsLoading(true);
        setError(null);

        try {
            const newCustomer = await customerService.create(customerData, user.uid);
            return newCustomer;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create customer';
            setError(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const updateCustomer = async (id: string, customerData: Partial<CustomerFormData>): Promise<boolean> => {
        if (!user?.uid) {
            setError('User not authenticated');
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            await customerService.update(id, customerData);
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update customer';
            setError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteCustomer = async (id: string): Promise<boolean> => {
        if (!user?.uid) {
            setError('User not authenticated');
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            await customerService.delete(id);
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete customer';
            setError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const getCustomer = async (id: string): Promise<Customer | null> => {
        setIsLoading(true);
        setError(null);

        try {
            const customer = await customerService.getById(id);
            return customer;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch customer';
            setError(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        createCustomer,
        updateCustomer,
        deleteCustomer,
        getCustomer,
        isLoading,
        error,
        clearError: () => setError(null),
    };
}; 