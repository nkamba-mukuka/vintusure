import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/components/ui/use-toast';
import { useAuthContext } from '@/contexts/AuthContext';
import { claimService } from '@/lib/services/claimService';
import { customerService } from '@/lib/services/customerService';
import { policyService } from '@/lib/services/policyService';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Loader2Icon } from 'lucide-react';
import { cn } from '@/lib/utils';

const claimFormSchema = z.object({
    customerId: z.string().min(1, 'Customer is required'),
    policyId: z.string().min(1, 'Policy is required'),
    incidentDate: z.string().min(1, 'Incident date is required'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    location: z.object({
        address: z.string().min(1, 'Address is required'),
        latitude: z.number(),
        longitude: z.number(),
    }),
    damageType: z.enum(['Vehicle', 'Property', 'Personal']),
    amount: z.number().min(0, 'Amount must be positive'),
    documents: z.array(z.string()),
});

type ClaimFormData = z.infer<typeof claimFormSchema>;

interface ClaimModalFormProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: Partial<ClaimFormData & { id: string }>;
    customerId?: string;
    policyId?: string;
    onSuccess?: () => void;
}

export default function ClaimModalForm({
    isOpen,
    onClose,
    initialData,
    customerId,
    policyId,
    onSuccess
}: ClaimModalFormProps) {
    const { toast } = useToast();
    const { user } = useAuthContext();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch customers and policies for dropdowns
    const { data: customersData } = useQuery({
        queryKey: ['customers', user?.uid],
        queryFn: () => customerService.list({ userId: user?.uid }),
        enabled: !!user?.uid,
    });

    const { data: policiesData } = useQuery({
        queryKey: ['policies', user?.uid],
        queryFn: () => policyService.list({ userId: user?.uid }),
        enabled: !!user?.uid,
    });

    const form = useForm<ClaimFormData>({
        resolver: zodResolver(claimFormSchema),
        defaultValues: {
            customerId: customerId || initialData?.customerId || '',
            policyId: policyId || initialData?.policyId || '',
            incidentDate: initialData?.incidentDate || format(new Date(), 'yyyy-MM-dd'),
            description: initialData?.description || '',
            location: initialData?.location || {
                address: '',
                latitude: 0,
                longitude: 0,
            },
            damageType: initialData?.damageType || 'Vehicle',
            amount: initialData?.amount || 0,
            documents: initialData?.documents || [],
        },
    });

    // Reset form when modal opens with edit data
    React.useEffect(() => {
        if (isOpen && initialData) {
            form.reset({
                customerId: customerId || initialData?.customerId || '',
                policyId: policyId || initialData?.policyId || '',
                incidentDate: initialData?.incidentDate || format(new Date(), 'yyyy-MM-dd'),
                description: initialData?.description || '',
                location: initialData?.location || {
                    address: '',
                    latitude: 0,
                    longitude: 0,
                },
                damageType: initialData?.damageType || 'Vehicle',
                amount: initialData?.amount || 0,
                documents: initialData?.documents || [],
            });
        } else if (isOpen && !initialData) {
            // Reset to default values for create mode
            form.reset({
                customerId: customerId || '',
                policyId: policyId || '',
                incidentDate: format(new Date(), 'yyyy-MM-dd'),
                description: '',
                location: {
                    address: '',
                    latitude: 0,
                    longitude: 0,
                },
                damageType: 'Vehicle',
                amount: 0,
                documents: [],
            });
        }
    }, [isOpen, initialData, customerId, policyId, form]);

    const onSubmit = async (data: ClaimFormData) => {
        try {
            setIsSubmitting(true);

            // Check if user is authenticated
            if (!user?.uid) {
                toast({
                    title: 'Authentication Error',
                    description: 'You must be logged in to create a claim.',
                    variant: 'destructive',
                });
                return;
            }

            if (initialData?.id) {
                // Update existing claim
                await claimService.update(initialData.id, data);
                toast({
                    title: 'Claim Updated',
                    description: 'Claim has been updated successfully.',
                });
            } else {
                // Create new claim
                if (!user?.uid) {
                    throw new Error('User not authenticated');
                }
                await claimService.create(data, user.uid);
                toast({
                    title: 'Claim Created',
                    description: 'Claim has been created successfully.',
                });
            }

            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Error saving claim:', error);
            toast({
                title: 'Error',
                description: 'Failed to save claim. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {initialData?.id ? 'Edit Claim' : 'Create New Claim'}
                    </DialogTitle>
                    <DialogDescription>
                        {initialData?.id
                            ? 'Update the claim information below.'
                            : 'Fill in the details below to create a new insurance claim.'
                        }
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Basic Information</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="customerId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Customer *</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a customer" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {customersData?.customers?.map((customer) => (
                                                        <SelectItem key={customer.id} value={customer.id}>
                                                            {customer.firstName} {customer.lastName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="policyId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Policy *</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a policy" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {policiesData?.policies?.map((policy) => (
                                                        <SelectItem key={policy.id} value={policy.id}>
                                                            {policy.policyNumber} - {policy.type}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="incidentDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Incident Date *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="date"
                                                    {...field}
                                                    value={field.value}
                                                    onChange={(e) => field.onChange(e.target.value)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="damageType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Damage Type *</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Vehicle">Vehicle</SelectItem>
                                                    <SelectItem value="Property">Property</SelectItem>
                                                    <SelectItem value="Personal">Personal</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Incident Details */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Incident Details</h3>

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description *</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Describe the incident in detail..."
                                                className="min-h-[100px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="location.address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Incident Location *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter the incident location address"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Financial Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Financial Information</h3>

                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Claim Amount (ZMW) *</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                {...field}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </form>
                </Form>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={form.handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                        type="submit"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            initialData?.id ? 'Update Claim' : 'Create Claim'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
