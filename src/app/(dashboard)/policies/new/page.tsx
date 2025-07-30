'use client';

import PolicyForm from '@/components/policies/PolicyForm';

export default function NewPolicyPage() {
    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-semibold text-gray-900">Issue New Policy</h1>
            <PolicyForm />
        </div>
    );
} 