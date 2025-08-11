
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '@/hooks/use-toast';
import { claimService } from '@/lib/services/claimService';
import { useAuthContext } from '@/contexts/AuthContext';
import { format } from 'date-fns';

const claimFormSchema = z.object({
    customerId: z.string().min(1, 'Customer is required'),
    policyId: z.string().min(1, 'Policy is required'),
    incidentDate: z.string().min(1, 'Incident date is required'),
    location: z.object({
        latitude: z.number(),
        longitude: z.number(),
        address: z.string().min(1, 'Address is required'),
    }),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    amount: z.number().min(0, 'Amount must be greater than 0'),
    damageType: z.enum(['Vehicle', 'Property', 'Personal']),
    documents: z.array(z.string()),
});

type ClaimFormData = z.infer<typeof claimFormSchema>;

interface ClaimFormProps {
    initialData?: Partial<ClaimFormData> & { id?: string };
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function ClaimForm({ initialData, onSuccess, onCancel }: ClaimFormProps) {
    const { user } = useAuthContext();
    const { toast } = useToast();

    const form = useForm<ClaimFormData>({
        resolver: zodResolver(claimFormSchema),
        defaultValues: {
            customerId: initialData?.customerId || '',
            policyId: initialData?.policyId || '',
            incidentDate: initialData?.incidentDate || format(new Date(), 'yyyy-MM-dd'),
            location: {
                latitude: initialData?.location?.latitude || 0,
                longitude: initialData?.location?.longitude || 0,
                address: initialData?.location?.address || '',
            },
            description: initialData?.description || '',
            amount: initialData?.amount || 0,
            damageType: initialData?.damageType || 'Vehicle',
            documents: initialData?.documents || [],
        },
    });

    const onSubmit = async (data: ClaimFormData) => {
        try {
            if (!user) {
                throw new Error('User not authenticated');
            }

            if (initialData?.id) {
                await claimService.update(initialData.id, data);
                toast({
                    title: 'Success',
                    description: 'Claim updated successfully',
                });
            } else {
                await claimService.create(data, user.uid);
                toast({
                    title: 'Success',
                    description: 'Claim created successfully',
                });
            }

            onSuccess?.();
            form.reset();
        } catch (error) {
            console.error('Error saving claim:', error);
            toast({
                title: 'Error',
                description: 'Failed to save claim. Please try again.',
                variant: 'destructive',
            });
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
                <div>
                    <Controller
                        name="incidentDate"
                        control={form.control}
                        render={({ field }) => (
                            <div className="space-y-2">
                                <label htmlFor="incidentDate" className="block text-sm font-medium">
                                    Incident Date
                                </label>
                                <Input {...field} type="date" />
                            </div>
                        )}
                    />
                </div>

                <div>
                    <Controller
                        name="location.address"
                        control={form.control}
                        render={({ field }) => (
                            <div className="space-y-2">
                                <label htmlFor="address" className="block text-sm font-medium">
                                    Location Address
                                </label>
                                <Input {...field} />
                            </div>
                        )}
                    />
                </div>

                <div>
                    <Controller
                        name="description"
                        control={form.control}
                        render={({ field }) => (
                            <div className="space-y-2">
                                <label htmlFor="description" className="block text-sm font-medium">
                                    Description
                                </label>
                                <Input {...field} />
                            </div>
                        )}
                    />
                </div>

                <div>
                    <Controller
                        name="amount"
                        control={form.control}
                        render={({ field }) => (
                            <div className="space-y-2">
                                <label htmlFor="amount" className="block text-sm font-medium">
                                    Amount
                                </label>
                                <Input
                                    {...field}
                                    type="number"
                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                />
                            </div>
                        )}
                    />
                </div>

                <div>
                    <Controller
                        name="damageType"
                        control={form.control}
                        render={({ field }) => (
                            <div className="space-y-2">
                                <label htmlFor="damageType" className="block text-sm font-medium">
                                    Damage Type
                                </label>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select damage type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Vehicle">Vehicle</SelectItem>
                                        <SelectItem value="Property">Property</SelectItem>
                                        <SelectItem value="Personal">Personal</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    />
                </div>
            </div>

            <div className="flex justify-end space-x-2">
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                )}
                <Button type="submit">
                    {initialData?.id ? 'Update Claim' : 'Create Claim'}
                </Button>
            </div>
        </form>
    );
} 