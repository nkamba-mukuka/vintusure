'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { claimService } from '@/lib/services/claimService';
import ClaimReview from '@/components/claims/ClaimReview';
import { Button } from '@/components/ui/button';

export default function ClaimDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const claimId = Array.isArray(id) ? id[0] : id;

    const { data: claim, isLoading, error, refetch } = useQuery({
        queryKey: ['claim', claimId],
        queryFn: () => claimService.getById(claimId),
    });

    if (isLoading) {
        return (
            <div className="p-6 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
        );
    }

    if (error || !claim) {
        return (
            <div className="p-6 text-red-500">
                Error loading claim. Please try again later.
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-900">
                    Claim Details
                </h1>
                <Button variant="outline" onClick={() => router.back()}>
                    Back to Claims
                </Button>
            </div>

            <ClaimReview claim={claim} onUpdate={refetch} />
        </div>
    );
} 