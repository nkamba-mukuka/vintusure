import { useNavigate } from 'react-router-dom';
import ClaimForm from '@/components/claims/ClaimForm';

export default function NewClaim() {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">New Claim</h2>
            <ClaimForm
                onCancel={() => navigate('/claims')}
                onSuccess={() => navigate('/claims')}
            />
        </div>
    );
}
