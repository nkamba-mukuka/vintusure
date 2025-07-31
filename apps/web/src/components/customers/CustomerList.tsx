
import { Customer } from '@/types/customer';
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
import { EditIcon, TrashIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

interface CustomerListProps {
    customers: Customer[];
    isLoading: boolean;
    onPageChange: (page: number) => void;
    currentPage: number;
    totalPages: number;
}

export default function CustomerList({
    customers,
    isLoading,
    onPageChange,
    currentPage,
    totalPages,
}: CustomerListProps) {
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
                        <TableHead>Name</TableHead>
                        <TableHead>NRC/Passport</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {customers.map((customer) => (
                        <TableRow key={customer.id}>
                            <TableCell>
                                {customer.firstName} {customer.lastName}
                            </TableCell>
                            <TableCell>{customer.nrcPassport}</TableCell>
                            <TableCell>
                                <div>{customer.email}</div>
                                <div className="text-sm text-gray-500">{customer.phone}</div>
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant={customer.status === 'active' ? 'success' : 'secondary'}
                                >
                                    {customer.status}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {format(new Date(customer.createdAt), 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                                <Link to={`/customers/${customer.id}/edit`}>
                                    <Button variant="outline" size="sm">
                                        <EditIcon className="h-4 w-4" />
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

            {customers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No customers found.
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