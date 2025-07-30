'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { policyService } from '@/lib/services/policyService';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { EditIcon, FileIcon } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

const statusColors = {
    active: 'default',
    expired: 'destructive',
    cancelled: 'secondary',
    pending: 'outline',
} as const;

export default function PolicyDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
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
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-900">
                    Policy Details - {policy.policyNumber}
                </h1>
                <div className="space-x-4">
                    <Link href={`/policies/${policy.id}/edit`}>
                        <Button variant="outline">
                            <EditIcon className="h-4 w-4 mr-2" />
                            Edit Policy
                        </Button>
                    </Link>
                    <Link href={`/policies/${policy.id}/documents`}>
                        <Button variant="outline">
                            <FileIcon className="h-4 w-4 mr-2" />
                            Documents
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Policy Information */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-medium mb-4">Policy Information</h2>
                    <dl className="grid grid-cols-2 gap-4">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Status</dt>
                            <dd>
                                <Badge variant={statusColors[policy.status]}>
                                    {policy.status}
                                </Badge>
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Type</dt>
                            <dd className="capitalize">{policy.type.replace('_', ' ')}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                            <dd>{format(new Date(policy.startDate), 'PPP')}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">End Date</dt>
                            <dd>{format(new Date(policy.endDate), 'PPP')}</dd>
                        </div>
                    </dl>
                </div>

                {/* Vehicle Information */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-medium mb-4">Vehicle Information</h2>
                    <dl className="grid grid-cols-2 gap-4">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Registration</dt>
                            <dd>{policy.vehicle.registrationNumber}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Make & Model</dt>
                            <dd>
                                {policy.vehicle.make} {policy.vehicle.model}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Year</dt>
                            <dd>{policy.vehicle.year}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Usage</dt>
                            <dd className="capitalize">{policy.vehicle.usage}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Engine Number</dt>
                            <dd>{policy.vehicle.engineNumber}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Chassis Number</dt>
                            <dd>{policy.vehicle.chassisNumber}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Value</dt>
                            <dd>
                                {policy.vehicle.value.toLocaleString('en-ZM', {
                                    style: 'currency',
                                    currency: policy.premium.currency,
                                })}
                            </dd>
                        </div>
                    </dl>
                </div>

                {/* Premium Information */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-medium mb-4">Premium Information</h2>
                    <dl className="grid grid-cols-2 gap-4">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Amount</dt>
                            <dd>
                                {policy.premium.amount.toLocaleString('en-ZM', {
                                    style: 'currency',
                                    currency: policy.premium.currency,
                                })}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Payment Status</dt>
                            <dd className="capitalize">{policy.premium.paymentStatus}</dd>
                        </div>
                        {policy.premium.paymentMethod && (
                            <div>
                                <dt className="text-sm font-medium text-gray-500">
                                    Payment Method
                                </dt>
                                <dd>{policy.premium.paymentMethod}</dd>
                            </div>
                        )}
                    </dl>
                </div>

                {/* Documents */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-medium mb-4">Documents</h2>
                    {policy.documents.length > 0 ? (
                        <ul className="space-y-2">
                            {policy.documents.map((doc) => (
                                <li
                                    key={doc.id}
                                    className="flex items-center justify-between py-2 border-b"
                                >
                                    <span className="flex items-center">
                                        <FileIcon className="h-4 w-4 mr-2" />
                                        {doc.type}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        {format(new Date(doc.uploadedAt), 'PP')}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">No documents uploaded yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
} 