
import { useState } from 'react';
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
    onFiltersChange: (filters: CustomerFilters) => void;
}

export default function CustomerFiltersBar({
    filters,
    onFiltersChange,
}: CustomerFiltersBarProps) {
    const [searchTerm, setSearchTerm] = useState(filters.searchTerm || '');
    const [status, setStatus] = useState<CustomerStatus>(filters.status || 'all');

    const handleApplyFilters = () => {
        onFiltersChange({
            ...filters,
            searchTerm,
            status: status === 'all' ? undefined : status,
        });
    };

    const handleStatusChange = (value: CustomerStatus) => {
        setStatus(value);
        onFiltersChange({
            ...filters,
            searchTerm,
            status: value === 'all' ? undefined : value,
        });
    };

    const handleReset = () => {
        setSearchTerm('');
        setStatus('all');
        onFiltersChange({});
    };

    return (
        <div className="flex gap-4 items-end mb-6">
            <div className="flex-1">
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search customers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleApplyFilters();
                            }
                        }}
                        className="pl-9 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
            </div>
            <div className="w-48">
                <Select
                    value={status}
                    onValueChange={handleStatusChange}
                >
                    <SelectTrigger className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-300">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Button
                onClick={handleApplyFilters}
                className="flex items-center gap-2"
            >
                <SearchIcon className="h-4 w-4" />
                Search
            </Button>
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