'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { policyService } from '@/lib/services/policyService';
import PolicyForm from '@/components/policies/PolicyForm';

export default function EditPolicyPage() {
    const { id } = useParams();
    const policyId = Array.isArray(id) ? id[0] : id;

    const { data: policy, isLoading, error } = useQuery({
        queryKey: ['policy', policyId],
        queryFn: () => policyService.getById(policyId),
    });

    if (isLoading) {
        return (
            <div className="p-6 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
        );
    }

    if (error || !policy) {
        return (
            <div className="p-6 text-red-500">
                Error loading policy. Please try again later.
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-semibold text-gray-900">
                Edit Policy - {policy.policyNumber}
            </h1>
            <PolicyForm initialData={policy} />
        </div>
    );
} 