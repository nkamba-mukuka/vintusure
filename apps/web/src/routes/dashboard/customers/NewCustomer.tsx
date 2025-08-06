import React from 'react';
import CustomerForm from './CustomerForm';

export default function NewCustomerPage() {
<<<<<<< HEAD
    console.log('NewCustomerPage component loaded');
    
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Create New Customer</h1>
=======
    return (
        <div className="p-8">
>>>>>>> 358bab339ae23ea56fcb881bd4beb96a58138f16
            <CustomerForm mode="create" />
        </div>
    );
} 