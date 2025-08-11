import React from 'react';
import ClaimForm from '@/components/claims/ClaimForm';

export default function NewClaimPage() {
    return (
        <div className="py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900">New Claim</h1>
                <p className="mt-2 text-gray-600">
                    Submit a new insurance claim
                </p>
                <div className="mt-8">
                    <ClaimForm />
                </div>
            </div>
        </div>
    );
}
