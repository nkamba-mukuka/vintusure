'use client';

import ClaimForm from '@/components/claims/ClaimForm';

export default function NewClaimPage() {
    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-semibold text-gray-900">Submit New Claim</h1>
            <ClaimForm />
        </div>
    );
} 