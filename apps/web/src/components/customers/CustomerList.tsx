
import React from 'react';
import { format, parseISO } from 'date-fns';
import { Customer } from '../../types/customer';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

interface CustomerListProps {
    customers: Customer[];
    onEdit: (customer: Customer) => void;
    onView: (customer: Customer) => void;
}

export default function CustomerList({ customers, onEdit, onView }: CustomerListProps) {
    const formatDate = (dateStr: string | undefined) => {
        if (!dateStr) return 'N/A';
        try {
            return format(parseISO(dateStr), 'MMM d, yyyy');
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid Date';
        }
    };

    return (
        <div className="space-y-4">
            {customers.map((customer) => (
                <Card key={customer.id} className="p-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-semibold">
                                {customer.firstName} {customer.lastName}
                            </h3>
                            <p className="text-sm text-gray-600">{customer.email}</p>
                            <p className="text-sm text-gray-600">{customer.phone}</p>
                            <p className="text-sm text-gray-600">
                                Created: {formatDate(customer.createdAt)}
                            </p>
                        </div>
                        <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => onView(customer)}>
                                View
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => onEdit(customer)}>
                                Edit
                            </Button>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
} 