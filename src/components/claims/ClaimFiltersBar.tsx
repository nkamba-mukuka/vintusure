'use client';

import { useState, useEffect } from 'react';
import { ClaimStatus, DamageType } from '@/types/policy';
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

interface ClaimFilters {
    searchTerm?: string;
    status?: ClaimStatus;
    damageType?: DamageType;
    startDate?: Date;
    endDate?: Date;
}

interface ClaimFiltersBarProps {
    filters: ClaimFilters;
    onFilterChange: (filters: ClaimFilters) => void;
}

const claimStatuses: ClaimStatus[] = ['Submitted', 'UnderReview', 'Approved', 'Rejected'];
const damageTypes: DamageType[] = ['Vehicle', 'Property', 'Personal'];

export default function ClaimFiltersBar({
    filters,
    onFilterChange,
}: ClaimFiltersBarProps) {
    const [searchTerm, setSearchTerm] = useState(filters.searchTerm || '');
    const [status, setStatus] = useState<ClaimStatus | ''>(filters.status || '');
    const [damageType, setDamageType] = useState<DamageType | ''>(filters.damageType || '');
    const [startDate, setStartDate] = useState<Date | undefined>(filters.startDate);
    const [endDate, setEndDate] = useState<Date | undefined>(filters.endDate);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            onFilterChange({
                ...filters,
                searchTerm,
                status: status || undefined,
                damageType: damageType || undefined,
                startDate,
                endDate,
            });
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, status, damageType, startDate, endDate]);

    const handleReset = () => {
        setSearchTerm('');
        setStatus('');
        setDamageType('');
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
                        placeholder="Search claims..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>
            <div className="w-[150px]">
                <Select
                    value={status}
                    onValueChange={(value) => setStatus(value as ClaimStatus)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All Status</SelectItem>
                        {claimStatuses.map((status) => (
                            <SelectItem key={status} value={status}>
                                {status}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="w-[150px]">
                <Select
                    value={damageType}
                    onValueChange={(value) => setDamageType(value as DamageType)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Damage Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All Types</SelectItem>
                        {damageTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                                {type}
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
            {(searchTerm || status || damageType || startDate || endDate) && (
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