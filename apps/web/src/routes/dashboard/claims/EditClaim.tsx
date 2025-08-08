import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ClaimForm from '@/components/claims/ClaimForm';
import { claimService } from '@/lib/services/claimService';
import LoadingState from '@/components/LoadingState';

export default function EditClaimPage() {
    const { id } = useParams<{ id: string }>();

    const { data: claim, isLoading } = useQuery({
        queryKey: ['claim', id],
        queryFn: () => claimService.getById(id!),
        enabled: !!id,
    });

    if (isLoading) {
        return <LoadingState />;
    }

    if (!claim || !id) {
        return (
            <div className="py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-gray-900">Claim Not Found</h1>
                    <p className="mt-2 text-gray-600">
                        The claim you're looking for doesn't exist or you don't have permission to view it.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900">Edit Claim</h1>
                <p className="mt-2 text-gray-600">
                    Update claim information
                </p>
                <div className="mt-8">
                    <ClaimForm initialData={claim} />
                </div>
            </div>
        </div>
    );
}
