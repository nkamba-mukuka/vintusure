import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { claimService } from '@/lib/services/claimService';
import { customerService } from '@/lib/services/customerService';
import { policyService } from '@/lib/services/policyService';
import LoadingState from '@/components/LoadingState';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Edit, ArrowLeft, Calendar, MapPin, DollarSign, FileText } from 'lucide-react';
import { format } from 'date-fns';

export default function ClaimDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: claim, isLoading } = useQuery({
        queryKey: ['claim', id],
        queryFn: () => claimService.getById(id!),
        enabled: !!id,
    });

    const { data: customer } = useQuery({
        queryKey: ['customer', claim?.customerId],
        queryFn: () => customerService.getById(claim!.customerId),
        enabled: !!claim?.customerId,
    });

    const { data: policy } = useQuery({
        queryKey: ['policy', claim?.policyId],
        queryFn: () => policyService.getById(claim!.policyId),
        enabled: !!claim?.policyId,
    });

    const handleDelete = async () => {
        if (!claim || !id) return;
        
        if (!window.confirm(`Are you sure you want to delete this claim? This action cannot be undone.`)) {
            return;
        }

        try {
            await claimService.delete(id);
            await queryClient.invalidateQueries({ queryKey: ['claims'] });
            toast({
                title: 'Claim deleted',
                description: 'The claim has been deleted successfully.',
            });
            navigate('/claims');
        } catch (error) {
            console.error('Error deleting claim:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete claim. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'Submitted':
                return 'secondary';
            case 'UnderReview':
                return 'destructive';
            case 'Approved':
                return 'default';
            case 'Rejected':
                return 'destructive';
            case 'Paid':
                return 'default';
            default:
                return 'secondary';
        }
    };

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
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="outline"
                            onClick={() => navigate('/claims')}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Claims
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Claim Details</h1>
                            <p className="text-gray-600 mt-2">View and manage claim information</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Button asChild>
                            <Link to={`/claims/${id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Claim
                            </Link>
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            className="flex items-center gap-2"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete Claim
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Claim Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Claim Information</span>
                                    <Badge variant={getStatusBadgeVariant(claim.status)}>
                                        {claim.status}
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Claim Amount</label>
                                        <p className="text-lg font-semibold">
                                            {(claim.amount || 0).toLocaleString('en-ZM', {
                                                style: 'currency',
                                                currency: 'ZMW',
                                            })}
                                        </p>
                                    </div>
                                    {claim.approvedAmount && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Approved Amount</label>
                                            <p className="text-lg font-semibold text-green-600">
                                                {(claim.approvedAmount || 0).toLocaleString('en-ZM', {
                                                    style: 'currency',
                                                    currency: 'ZMW',
                                                })}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-500">Damage Type</label>
                                    <p className="text-lg">{claim.damageType}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-500">Description</label>
                                    <p className="text-gray-700 mt-1">{claim.description}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-500">Incident Location</label>
                                    <p className="text-gray-700 mt-1 flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        {claim.location?.address || 'No address provided'}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-500">Incident Date</label>
                                    <p className="text-gray-700 mt-1 flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        {claim.incidentDate ? format(new Date(claim.incidentDate), 'PPP') : 'Not specified'}
                                    </p>
                                </div>

                                {claim.reviewNotes && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Review Notes</label>
                                        <p className="text-gray-700 mt-1">{claim.reviewNotes}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Documents */}
                        {claim.documents && claim.documents.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Documents
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {claim.documents.map((doc, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                                <span className="text-sm text-gray-600">Document {index + 1}</span>
                                                <Button variant="outline" size="sm">
                                                    View
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Customer Information */}
                        {customer && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Customer Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Name</label>
                                        <p className="font-medium">
                                            {customer.firstName} {customer.lastName}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Email</label>
                                        <p className="text-gray-700">{customer.email}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Phone</label>
                                        <p className="text-gray-700">{customer.phone}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Policy Information */}
                        {policy && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Policy Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Policy Number</label>
                                        <p className="font-medium">{policy.policyNumber}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Type</label>
                                        <p className="text-gray-700">{policy.type}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Status</label>
                                        <Badge variant="outline">{policy.status}</Badge>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Premium</label>
                                        <p className="text-gray-700">
                                            {(policy.premium?.amount || 0).toLocaleString('en-ZM', {
                                                style: 'currency',
                                                currency: 'ZMW',
                                            })}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Claim Timeline */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Claim Timeline</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Created</span>
                                    <span className="text-sm font-medium">
                                        {claim.createdAt ? format(new Date(claim.createdAt), 'MMM dd, yyyy') : 'Unknown'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Last Updated</span>
                                    <span className="text-sm font-medium">
                                        {claim.updatedAt ? format(new Date(claim.updatedAt), 'MMM dd, yyyy') : 'Unknown'}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
