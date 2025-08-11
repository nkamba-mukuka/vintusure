
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthContext } from '@/contexts/AuthContext';
import { claimService } from '@/lib/services/claimService';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Claim, ClaimFormData, ClaimLocation, DamageType } from '@/types/claim';

const claimFormSchema = z.object({
    customerId: z.string().min(1, 'Customer is required'),
    policyId: z.string().min(1, 'Policy is required'),
    incidentDate: z.string().min(1, 'Incident date is required'),
    location: z.object({
        address: z.string().min(5, 'Address must be at least 5 characters'),
        latitude: z.number(),
        longitude: z.number(),
    }),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    amount: z.number().min(0, 'Amount must be greater than 0'),
    damageType: z.enum(['Vehicle', 'Property', 'Personal']),
    documents: z.array(z.string()),
});

interface ClaimFormProps {
    initialData?: Claim;
    onCancel: () => void;
    onSuccess: () => void;
}

const formatClaimData = (data: ClaimFormData): Omit<Claim, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'createdBy' | 'agent_id'> => {
    return {
        ...data,
        incidentDate: new Date(data.incidentDate),
        amount: parseFloat(data.amount.toString()),
    };
};

export default function ClaimForm({ initialData, onCancel, onSuccess }: ClaimFormProps) {
    const { user } = useAuthContext();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ClaimFormData>({
        resolver: zodResolver(claimFormSchema),
        defaultValues: initialData ? {
            customerId: initialData.customerId,
            policyId: initialData.policyId,
            incidentDate: initialData.incidentDate.toISOString().split('T')[0],
            location: initialData.location,
            description: initialData.description,
            amount: initialData.amount,
            damageType: initialData.damageType,
            documents: initialData.documents,
        } : {
            customerId: '',
            policyId: '',
            incidentDate: new Date().toISOString().split('T')[0],
            location: {
                address: '',
                latitude: 0,
                longitude: 0,
            },
            description: '',
            amount: 0,
            damageType: 'Vehicle',
            documents: [],
        },
    });

    const handleSubmit = async (data: ClaimFormData) => {
        if (!user) return;

        setIsSubmitting(true);
        try {
            const formattedData = formatClaimData(data);

            if (initialData?.id) {
                await claimService.update(initialData.id, formattedData);
                toast({
                    title: 'Success',
                    description: 'Claim updated successfully',
                });
            } else {
                await claimService.create(formattedData, user.uid);
                toast({
                    title: 'Success',
                    description: 'Claim created successfully',
                });
            }

            onSuccess();
        } catch (error) {
            console.error('Error submitting claim:', error);
            toast({
                title: 'Error',
                description: 'Failed to submit claim',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Claim Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="incidentDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Incident Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
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
                                    <FormLabel>Location</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter incident location" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describe what happened..."
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
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Claim Amount</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="Enter claim amount"
                                            {...field}
                                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : initialData ? 'Update Claim' : 'Submit Claim'}
                    </Button>
                </div>
            </form>
        </Form>
    );
} 