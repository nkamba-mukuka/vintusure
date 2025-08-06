
import { useState, useEffect } from 'react';
import { CustomerFilters } from '@/types/customer';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { SearchIcon, XIcon } from 'lucide-react';

type CustomerStatus = 'active' | 'inactive' | 'all';

interface CustomerFiltersBarProps {
    filters: CustomerFilters;
    onFilterChange: (filters: CustomerFilters) => void;
}

export default function CustomerFiltersBar({
    filters,
    onFilterChange,
}: CustomerFiltersBarProps) {
    const [searchTerm, setSearchTerm] = useState(filters.searchTerm || '');
    const [status, setStatus] = useState<CustomerStatus>(filters.status || 'all');

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            onFilterChange({
                ...filters,
                searchTerm,
                status: status === 'all' ? undefined : status,
            });
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, status]);

    const handleReset = () => {
        setSearchTerm('');
        setStatus('all');
        onFilterChange({});
    };

    return (
        <div className="flex gap-4 items-end">
            <div className="flex-1">
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search customers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>
            <div className="w-48">
                <Select
                    value={status}
                    onValueChange={(value: CustomerStatus) => setStatus(value)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {(searchTerm || status !== 'all') && (
                <Button
                    variant="outline"
                    onClick={handleReset}
                    className="flex items-center gap-2"
                >
                    <XIcon className="h-4 w-4" />
                    Reset
                </Button>
            )}
        </div>
    );
} 