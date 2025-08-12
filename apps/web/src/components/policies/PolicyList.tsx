
import React, { memo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Policy } from '../../types/policy';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { format } from 'date-fns';

interface PolicyRowProps {
    policy: Policy;
    onEdit: (policy: Policy) => void;
    onView: (policy: Policy) => void;
}

const PolicyRow = memo(({ policy, onEdit, onView }: PolicyRowProps) => {
    return (
        <Card className="p-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold">
                        {policy.vehicle.make} {policy.vehicle.model}
                    </h3>
                    <p className="text-sm text-gray-600">
                        Policy Number: {policy.policyNumber}
                    </p>
                    <p className="text-sm text-gray-600">
                        Registration: {policy.vehicle.registrationNumber}
                    </p>
                    <div className="mt-2">
                        <Badge
                            variant={policy.status === 'active' ? 'default' : 'secondary'}
                        >
                            {policy.status}
                        </Badge>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => onView(policy)}>
                        View
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onEdit(policy)}>
                        Edit
                    </Button>
                </div>
            </div>
        </Card>
    );
});

PolicyRow.displayName = 'PolicyRow';

interface PolicyListProps {
    policies: Policy[];
    isLoading?: boolean;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onPolicyDelete: (policyId: string) => Promise<void>;
}

export default function PolicyList({
    policies,
    isLoading,
    currentPage,
    totalPages,
    onPageChange,
    onPolicyDelete
}: PolicyListProps) {
    const parentRef = React.useRef<HTMLDivElement>(null);

    const handleEdit = (policy: Policy) => {
        // Navigate to edit page
        window.location.href = `/policies/${policy.id}/edit`;
    };

    const handleView = (policy: Policy) => {
        // Navigate to view page
        window.location.href = `/policies/${policy.id}`;
    };

    const virtualizer = useVirtualizer({
        count: policies.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 100,
        overscan: 5,
    });

    if (isLoading) {
        return <div>Loading policies...</div>;
    }

    return (
        <div>
            <div
                ref={parentRef}
                className="h-[600px] overflow-auto"
                role="listbox"
                aria-label="Policy list"
            >
                <div
                    style={{
                        height: `${virtualizer.getTotalSize()}px`,
                        width: '100%',
                        position: 'relative',
                    }}
                >
                    {virtualizer.getVirtualItems().map((virtualRow) => (
                        <div
                            key={virtualRow.index}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: `${virtualRow.size}px`,
                                transform: `translateY(${virtualRow.start}px)`,
                            }}
                        >
                            <PolicyRow
                                policy={policies[virtualRow.index]}
                                onEdit={handleEdit}
                                onView={handleView}
                            />
                        </div>
                    ))}
                </div>
            </div>
            {totalPages > 1 && (
                <div className="mt-4 flex justify-center space-x-2">
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