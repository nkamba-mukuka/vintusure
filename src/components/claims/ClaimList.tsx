'use client';

import { Claim, ClaimStatus } from '@/types/policy';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EditIcon, FileIcon, EyeIcon } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface ClaimListProps {
    claims: Claim[];
    isLoading: boolean;
    onPageChange: (page: number) => void;
    currentPage: number;
    totalPages: number;
}

const statusColors: Record<ClaimStatus, string> = {
    'Submitted': 'default',
    'UnderReview': 'secondary',
    'Approved': 'outline',
    'Rejected': 'destructive',
};

const damageTypeLabels = {
    'Vehicle': 'Vehicle Damage',
    'Property': 'Property Damage',
    'Personal': 'Personal Injury',
};

export default function ClaimList({
    claims,
    isLoading,
    onPageChange,
    currentPage,
    totalPages,
}: ClaimListProps) {
    if (isLoading) {
        return (
            <div className="w-full h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Claim ID</TableHead>
                        <TableHead>Policy</TableHead>
                        <TableHead>Incident Date</TableHead>
                        <TableHead>Damage Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {claims.map((claim) => (
                        <TableRow key={claim.id}>
                            <TableCell>
                                <Link
                                    href={`/claims/${claim.id}`}
                                    className="text-indigo-600 hover:text-indigo-900"
                                >
                                    {claim.id.slice(0, 8).toUpperCase()}
                                </Link>
                            </TableCell>
                            <TableCell>
                                <Link
                                    href={`/policies/${claim.policyId}`}
                                    className="text-indigo-600 hover:text-indigo-900"
                                >
                                    View Policy
                                </Link>
                            </TableCell>
                            <TableCell>
                                {format(new Date(claim.incidentDate), 'PP')}
                            </TableCell>
                            <TableCell>
                                {damageTypeLabels[claim.damageType]}
                            </TableCell>
                            <TableCell>
                                <Badge variant={statusColors[claim.status]}>
                                    {claim.status}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {claim.amount.toLocaleString('en-ZM', {
                                    style: 'currency',
                                    currency: 'ZMW',
                                })}
                                {claim.approvedAmount && (
                                    <div className="text-sm text-gray-500">
                                        Approved: {claim.approvedAmount.toLocaleString('en-ZM', {
                                            style: 'currency',
                                            currency: 'ZMW',
                                        })}
                                    </div>
                                )}
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                                <Link href={`/claims/${claim.id}`}>
                                    <Button variant="outline" size="sm">
                                        <EyeIcon className="h-4 w-4" />
                                    </Button>
                                </Link>
                                {claim.status === 'Submitted' && (
                                    <Link href={`/claims/${claim.id}/edit`}>
                                        <Button variant="outline" size="sm">
                                            <EditIcon className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                )}
                                <Link href={`/claims/${claim.id}/documents`}>
                                    <Button variant="outline" size="sm">
                                        <FileIcon className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {claims.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No claims found.
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex justify-center space-x-2 mt-4">
                    <Button
                        variant="outline"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
} 