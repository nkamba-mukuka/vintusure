
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { EyeIcon, EditIcon, FileIcon, Trash2Icon, PlusIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Claim } from '@/types/policy';
import ClaimModalForm from './ClaimModalForm';

interface ClaimListProps {
    claims: Claim[];
    isLoading: boolean;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onClaimDelete?: (claimId: string) => Promise<void>;
    onClaimUpdate?: () => void;
}

export default function ClaimList({
    claims,
    isLoading,
    onPageChange,
    currentPage,
    totalPages,
    onClaimDelete,
    onClaimUpdate,
}: ClaimListProps) {
    const { toast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClaim, setEditingClaim] = useState<Claim | undefined>(undefined);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

    const handleDelete = async (claimId: string, claimNumber?: string) => {
        if (!window.confirm(`Are you sure you want to delete this claim? This action cannot be undone.`)) {
            return;
        }

        try {
            await onClaimDelete?.(claimId);
            toast({
                title: 'Claim deleted',
                description: `Claim has been deleted successfully.`,
            });
        } catch (error) {
            console.error('Error deleting claim:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete claim. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleCreateClaim = () => {
        setModalMode('create');
        setEditingClaim(undefined);
        setIsModalOpen(true);
    };

    const handleEditClaim = (claim: Claim) => {
        setModalMode('edit');
        setEditingClaim(claim);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingClaim(undefined);
    };

    const handleModalSuccess = () => {
        onClaimUpdate?.(); // Refresh the list
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
        return (
            <div className="flex items-center justify-center py-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading claims...</p>
                </div>
            </div>
        );
    }

    if (claims.length === 0) {
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">Claims</h2>
                    <Button onClick={handleCreateClaim} className="flex items-center gap-2">
                        <PlusIcon className="h-4 w-4" />
                        Create Claim
                    </Button>
                </div>
                <div className="text-center py-8">
                    <p className="text-gray-500">No claims found.</p>
                </div>
                <ClaimModalForm
                    isOpen={isModalOpen}
                    onClose={handleModalClose}
                    initialData={editingClaim}
                    onSuccess={handleModalSuccess}
                />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Claims</h2>
                <Button onClick={handleCreateClaim} className="flex items-center gap-2">
                    <PlusIcon className="h-4 w-4" />
                    Create Claim
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-16">#</TableHead>
                            <TableHead>Claim ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Policy</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Damage Type</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Incident Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {claims.map((claim, index) => (
                            <TableRow key={claim.id}>
                                <TableCell className="font-medium text-gray-500">
                                    {index + 1}
                                </TableCell>
                                <TableCell className="font-medium">{claim.id}</TableCell>
                                <TableCell>{claim.customerId}</TableCell>
                                <TableCell>{claim.policyId}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusBadgeVariant(claim.status)}>
                                        {claim.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>{claim.damageType}</TableCell>
                                <TableCell>
                                    {(claim.amount || 0).toLocaleString('en-ZM', {
                                        style: 'currency',
                                        currency: 'ZMW',
                                    })}
                                    {claim.approvedAmount && (
                                        <div className="text-sm text-gray-500">
                                            Approved: {(claim.approvedAmount || 0).toLocaleString('en-ZM', {
                                                style: 'currency',
                                                currency: 'ZMW',
                                            })}
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {claim.incidentDate ? new Date(claim.incidentDate).toLocaleDateString() : 'N/A'}
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Link to={`/claims/${claim.id}`}>
                                        <Button variant="outline" size="sm">
                                            <EyeIcon className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    {claim.status === 'Submitted' && (
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => handleEditClaim(claim)}
                                        >
                                            <EditIcon className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <Link to={`/claims/${claim.id}/documents`}>
                                        <Button variant="outline" size="sm">
                                            <FileIcon className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    {onClaimDelete && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(claim.id)}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2Icon className="h-4 w-4" />
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                        Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            {/* Claim Modal Form */}
            <ClaimModalForm
                isOpen={isModalOpen}
                onClose={handleModalClose}
                initialData={editingClaim}
                onSuccess={handleModalSuccess}
            />
        </div>
    );
} 