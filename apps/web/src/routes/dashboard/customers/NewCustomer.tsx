import React from 'react';
import CustomerForm from './CustomerForm';

export default function NewCustomerPage() {
    console.log('NewCustomerPage component loaded');
    
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Create New Customer</h1>
            <CustomerForm mode="create" />
        </div>
    );
} 