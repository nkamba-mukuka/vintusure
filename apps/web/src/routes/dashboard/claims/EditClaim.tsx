import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { claimService } from '@/lib/services/claimService';
import ClaimForm from '@/components/claims/ClaimForm';
import { Claim } from '@/types/claim';

export default function EditClaim() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [claim, setClaim] = useState<Claim | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadClaim = async () => {
            if (!id) return;

            try {
                const claimData = await claimService.get(id);
                setClaim(claimData);
            } catch (error) {
                console.error('Error loading claim:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to load claim',
                    variant: 'destructive',
                });
                navigate('/claims');
            } finally {
                setIsLoading(false);
            }
        };

        loadClaim();
    }, [id, navigate, toast]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!claim) {
        return <div>Claim not found</div>;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Edit Claim</h2>
            <ClaimForm
                initialData={claim}
                onCancel={() => navigate('/claims')}
                onSuccess={() => navigate('/claims')}
            />
        </div>
    );
}
