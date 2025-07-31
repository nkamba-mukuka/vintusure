
import { useState, useEffect } from 'react';
import { PolicyFilters, PolicyStatus, PolicyType } from '@/types/policy';
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
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

interface PolicyFiltersBarProps {
    filters: PolicyFilters;
    onFilterChange: (filters: PolicyFilters) => void;
}

const policyTypes: PolicyType[] = ['comprehensive', 'third_party'];
const policyStatuses: PolicyStatus[] = ['active', 'expired', 'cancelled', 'pending'];

export default function PolicyFiltersBar({
    filters,
    onFilterChange,
}: PolicyFiltersBarProps) {
    const [searchTerm, setSearchTerm] = useState(filters.searchTerm || '');
    const [status, setStatus] = useState(filters.status || '');
    const [type, setType] = useState(filters.type || '');
    const [startDate, setStartDate] = useState<Date | undefined>(filters.startDate);
    const [endDate, setEndDate] = useState<Date | undefined>(filters.endDate);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            onFilterChange({
                ...filters,
                searchTerm,
                status: status as PolicyStatus || undefined,
                type: type as PolicyType || undefined,
                startDate,
                endDate,
            });
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, status, type, startDate, endDate]);

    const handleReset = () => {
        setSearchTerm('');
        setStatus('');
        setType('');
        setStartDate(undefined);
        setEndDate(undefined);
        onFilterChange({});
    };

    return (
        <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search policies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>
            <div className="w-[150px]">
                <Select
                    value={status}
                    onValueChange={setStatus}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All Status</SelectItem>
                        {policyStatuses.map((status) => (
                            <SelectItem key={status} value={status} className="capitalize">
                                {status.replace('_', ' ')}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="w-[150px]">
                <Select
                    value={type}
                    onValueChange={setType}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All Types</SelectItem>
                        {policyTypes.map((type) => (
                            <SelectItem key={type} value={type} className="capitalize">
                                {type.replace('_', ' ')}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline">
                            {startDate ? format(startDate, 'MMM d, yyyy') : 'Start Date'}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={setStartDate}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>
            <div>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline">
                            {endDate ? format(endDate, 'MMM d, yyyy') : 'End Date'}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={setEndDate}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>
            {(searchTerm || status || type || startDate || endDate) && (
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