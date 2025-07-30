'use client';

import { Policy } from '@/types/policy';
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
import { EditIcon, FileIcon, TrashIcon } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface PolicyListProps {
    policies: Policy[];
    isLoading: boolean;
    onPageChange: (page: number) => void;
    currentPage: number;
    totalPages: number;
}

const statusColors = {
    active: 'success',
    expired: 'destructive',
    cancelled: 'secondary',
    pending: 'warning',
} as const;

export default function PolicyList({
    policies,
    isLoading,
    onPageChange,
    currentPage,
    totalPages,
}: PolicyListProps) {
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
                        <TableHead>Policy Number</TableHead>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Premium</TableHead>
                        <TableHead>Valid Until</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {policies.map((policy) => (
                        <TableRow key={policy.id}>
                            <TableCell>
                                <Link
                                    href={`/policies/${policy.id}`}
                                    className="text-indigo-600 hover:text-indigo-900"
                                >
                                    {policy.policyNumber}
                                </Link>
                            </TableCell>
                            <TableCell>
                                <div>{policy.vehicle.registrationNumber}</div>
                                <div className="text-sm text-gray-500">
                                    {policy.vehicle.make} {policy.vehicle.model} ({policy.vehicle.year})
                                </div>
                            </TableCell>
                            <TableCell className="capitalize">
                                {policy.type.replace('_', ' ')}
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant={statusColors[policy.status]}
                                >
                                    {policy.status}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <div>{policy.premium.amount.toLocaleString('en-ZM', { style: 'currency', currency: policy.premium.currency })}</div>
                                <div className="text-sm text-gray-500 capitalize">
                                    {policy.premium.paymentStatus}
                                </div>
                            </TableCell>
                            <TableCell>
                                {format(new Date(policy.endDate), 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                                <Link href={`/policies/${policy.id}/edit`}>
                                    <Button variant="outline" size="sm">
                                        <EditIcon className="h-4 w-4" />
                                    </Button>
                                </Link>
                                <Link href={`/policies/${policy.id}/documents`}>
                                    <Button variant="outline" size="sm">
                                        <FileIcon className="h-4 w-4" />
                                    </Button>
                                </Link>
                                <Button variant="outline" size="sm" className="text-red-600">
                                    <TrashIcon className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {policies.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No policies found.
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