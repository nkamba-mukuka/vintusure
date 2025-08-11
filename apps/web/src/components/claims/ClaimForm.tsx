
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useAuthContext } from '@/contexts/AuthContext';
import { claimService } from '@/lib/services/claimService';
import { customerService } from '@/lib/services/customerService';
import { policyService } from '@/lib/services/policyService';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
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
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

const claimFormSchema = z.object({
    customerId: z.string().min(1, 'Customer is required'),
    policyId: z.string().min(1, 'Policy is required'),
    incidentDate: z.date(),
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

interface ClaimFormProps {
    initialData?: Partial<ClaimFormData & { id: string }>;
    customerId?: string;
    policyId?: string;
}

export default function ClaimForm({ initialData, customerId, policyId }: ClaimFormProps) {
    const navigate = useNavigate();
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
            incidentDate: initialData?.incidentDate || new Date(),
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

    const onSubmit = async (data: ClaimFormData) => {
        try {
            setIsSubmitting(true);
            
            if (!user?.uid) {
                toast({
                    title: 'Authentication Error',
                    description: 'You must be logged in to create or update claims.',
                    variant: 'destructive',
                });
                return;
            }

            if (initialData?.id) {
                const formattedData = {
                    ...data,
                    incidentDate: data.incidentDate.toISOString(),
                };
                await claimService.update(initialData.id, formattedData);
                toast({
                    title: 'Claim updated',
                    description: 'The claim has been updated successfully.',
                });
            } else {
                const formattedData = {
                    ...data,
                    incidentDate: data.incidentDate.toISOString(),
                };
                await claimService.create(formattedData, user.uid);
                toast({
                    title: 'Claim submitted',
                    description: 'Your claim has been submitted successfully.',
                });
            }

            navigate('/claims');
        } catch (error) {
            console.error('Error submitting claim:', error);
            toast({
                title: 'Error',
                description: 'Failed to submit claim. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Customer and Policy Selection */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Claim Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="customerId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Customer</FormLabel>
                                            <Select
                                                disabled={!!customerId}
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a customer" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {customersData?.customers.map((customer) => (
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
                                            <FormLabel>Policy</FormLabel>
                                            <Select
                                                disabled={!!policyId}
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a policy" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {policiesData?.policies.map((policy) => (
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
                        </CardContent>
                    </Card>

                    {/* Incident Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Incident Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="incidentDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Incident Date</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            className={cn(
                                                                'w-full pl-3 text-left font-normal',
                                                                !field.value && 'text-muted-foreground'
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, 'PPP')
                                                            ) : (
                                                                <span>Pick a date</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        disabled={(date) => date > new Date()}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="damageType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Damage Type</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select damage type" />
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

                                <FormField
                                    control={form.control}
                                    name="amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Claim Amount</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        const parsedValue = value === '' ? 0 : parseFloat(value);
                                                        field.onChange(isNaN(parsedValue) ? 0 : parsedValue);
                                                    }}
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
                                            <FormLabel>Incident Location</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Enter incident address" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                placeholder="Describe the incident in detail..."
                                                rows={4}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Form Actions */}
                    <div className="flex justify-end space-x-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/claims')}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && (
                                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {initialData?.id ? 'Update Claim' : 'Submit Claim'}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
} 