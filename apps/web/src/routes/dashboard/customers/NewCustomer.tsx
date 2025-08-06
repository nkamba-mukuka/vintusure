import React from 'react';
import CustomerForm from './CustomerForm';

export default function NewCustomerPage() {
    return (
        <div className="p-8">
            <CustomerForm mode="create" />
        </div>
    );
} 