
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
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

const claimFormSchema = z.object({
    customerId: z.string(),
    policyId: z.string(),
    incidentDate: z.date(),
    description: z.string().min(10),
    location: z.object({
        address: z.string(),
        latitude: z.number(),
        longitude: z.number(),
    }),
    damageType: z.enum(['Vehicle', 'Property', 'Personal']),
    amount: z.number().min(0),
    documents: z.array(z.string()),
});

type ClaimFormData = z.infer<typeof claimFormSchema>;

interface ClaimFormProps {
    customerId?: string;
    policyId?: string;
}

export default function ClaimForm({ customerId, policyId }: ClaimFormProps) {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ClaimFormData>({
        resolver: zodResolver(claimFormSchema),
        defaultValues: {
            customerId: customerId || '',
            policyId: policyId || '',
            incidentDate: new Date(),
            description: '',
            location: {
                address: '',
                latitude: 0,
                longitude: 0,
            },
            damageType: 'Vehicle',
            amount: 0,
            documents: [],
        },
    });

    const onSubmit = async (data: ClaimFormData) => {
        try {
            setIsSubmitting(true);
            // Format the date to ISO string before sending to API
            const formattedData = {
                ...data,
                incidentDate: data.incidentDate.toISOString(),
            };

            // TODO: Submit claim
            console.log('Submitting claim:', formattedData);

            toast({
                title: 'Claim submitted',
                description: 'Your claim has been submitted successfully.',
            });

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
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Form fields here */}
                <div className="flex justify-end space-x-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate(-1)}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit Claim'}
                    </Button>
                </div>
            </form>
        </Form>
    );
} 