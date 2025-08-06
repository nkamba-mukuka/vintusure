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
import { EditIcon, TrashIcon, PlusIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useCustomerCRUD } from './customer';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface CustomerListProps {
    customers: Customer[];
    isLoading: boolean;
    onPageChange: (page: number) => void;
    currentPage: number;
    totalPages: number;
    onCustomerUpdate?: () => void; // Callback to refresh the list
}

export default function CustomerList({
    customers = [], // Add a default value here
    isLoading,
    onPageChange,
    currentPage,
    totalPages,
    onCustomerUpdate,
}: CustomerListProps) {
    const { deleteCustomer, isLoading: isDeleting } = useCustomerCRUD();
    const { toast } = useToast();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDeleteCustomer = async (customerId: string, customerName: string) => {
        if (!confirm(`Are you sure you want to delete ${customerName}?`)) {
            return;
        }

        setDeletingId(customerId);
        
        try {
            const success = await deleteCustomer(customerId);
            if (success) {
                toast({
                    title: "Customer deleted",
                    description: `${customerName} has been deleted successfully.`,
                });
                onCustomerUpdate?.(); // Refresh the list
            } else {
                toast({
                    title: "Error",
                    description: "Failed to delete customer. Please try again.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "An unexpected error occurred while deleting the customer.",
                variant: "destructive",
            });
        } finally {
            setDeletingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="w-full h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header with Create Button */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Customers</h2>
                <Link to="/dashboard/customers/new">
                    <Button className="flex items-center gap-2">
                        <PlusIcon className="h-4 w-4" />
                        Create Customer
                    </Button>
                </Link>
            </div>

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
                                <Link to={`/dashboard/customers/${customer.id}/edit`}>
                                    <Button variant="outline" size="sm">
                                        <EditIcon className="h-4 w-4" />
                                    </Button>
                                </Link>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-red-600 hover:text-red-700"
                                    onClick={() => handleDeleteCustomer(
                                        customer.id, 
                                        `${customer.firstName} ${customer.lastName}`
                                    )}
                                    disabled={isDeleting && deletingId === customer.id}
                                >
                                    {isDeleting && deletingId === customer.id ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600" />
                                    ) : (
                                        <TrashIcon className="h-4 w-4" />
                                    )}
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