
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { policyService } from '@/lib/services/policyService';
import { customerService } from '@/lib/services/customerService';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Policy } from '@/types/policy';
import { Customer } from '@/types/customer';

interface PolicyWithCustomer extends Omit<Policy, 'createdAt' | 'updatedAt' | 'createdBy' | 'agent_id'> {
    customerName?: string;
    createdAt?: Date;
    updatedAt?: Date;
    createdBy?: string;
    agent_id?: string;
}

export default function PolicyList() {
    const navigate = useNavigate();
    const { user } = useAuthContext();
    const { toast } = useToast();
    const [policies, setPolicies] = useState<PolicyWithCustomer[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [policyToDelete, setPolicyToDelete] = useState<{ id: string; number?: string } | null>(null);

    useEffect(() => {
        const loadData = async () => {
            if (!user) return;

            try {
                setIsLoading(true);
                const policiesData = await policyService.list({ userId: user.uid });
                const customersData = await customerService.list({ userId: user.uid });

                const policiesWithCustomers: PolicyWithCustomer[] = policiesData.policies.map(policy => {
                    const customer = customersData.customers.find(c => c.id === policy.customerId);
                    return {
                        ...policy,
                        customerName: customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown Customer',
                    };
                });

                setPolicies(policiesWithCustomers);
                setCustomers(customersData.customers);
            } catch (error) {
                console.error('Error loading policies:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to load policies',
                    variant: 'destructive',
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [user, toast]);

    const handleDelete = (id: string, policyNumber?: string) => {
        setPolicyToDelete({ id, number: policyNumber });
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!policyToDelete) return;

        try {
            await policyService.delete(policyToDelete.id);
            setPolicies(prev => prev.filter(policy => policy.id !== policyToDelete.id));
            toast({
                title: 'Success',
                description: `Policy ${policyToDelete.number || ''} deleted successfully`,
            });
        } catch (error) {
            console.error('Error deleting policy:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete policy',
                variant: 'destructive',
            });
        } finally {
            setShowDeleteConfirm(false);
            setPolicyToDelete(null);
        }
    };

    const getStatusColor = (status: Policy['status']) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'expired':
                return 'bg-red-100 text-red-800';
            case 'cancelled':
                return 'bg-gray-100 text-gray-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Policies</CardTitle>
                            <CardDescription>Manage insurance policies</CardDescription>
                        </div>
                        <Button onClick={() => navigate('/policies/new')}>New Policy</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Policy Number</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Premium</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {policies.map(policy => (
                                <TableRow key={policy.id}>
                                    <TableCell>{policy.policyNumber || 'N/A'}</TableCell>
                                    <TableCell>{policy.customerName || 'Unknown Customer'}</TableCell>
                                    <TableCell className="capitalize">{policy.type}</TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(policy.status)}>
                                            {policy.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {new Intl.NumberFormat('en-ZM', {
                                            style: 'currency',
                                            currency: policy.premium.currency,
                                        }).format(policy.premium.amount)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => navigate(`/policies/${policy.id}`)}
                                            >
                                                View
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => navigate(`/policies/${policy.id}/edit`)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDelete(policy.id, policy.policyNumber)}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-2">Are you sure?</h3>
                        <p className="text-gray-600 mb-4">
                            This will permanently delete policy{' '}
                            {policyToDelete?.number ? `#${policyToDelete.number}` : ''}.
                            This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={confirmDelete}>
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 