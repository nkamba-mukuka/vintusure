'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { policyService } from '@/lib/services/policyService';
import { claimService } from '@/lib/services/claimService';
import { useRouter } from 'next/navigation';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Loader2Icon } from 'lucide-react';
import { cn } from '@/lib/utils';
import DocumentUpload from '@/components/documents/DocumentUpload';

const claimFormSchema = z.object({
    policyId: z.string().min(1, 'Policy is required'),
    incidentDate: z.date({
        required_error: 'Incident date is required',
        invalid_type_error: 'Incident date must be a valid date',
    }),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    location: z.object({
        latitude: z.number(),
        longitude: z.number(),
        address: z.string().min(1, 'Address is required'),
    }),
    damageType: z.enum(['Vehicle', 'Property', 'Personal']),
    amount: z.number().min(1, 'Amount must be greater than 0'),
});

type ClaimFormData = z.infer<typeof claimFormSchema>;

interface ClaimFormProps {
    customerId?: string;
    policyId?: string;
}

export default function ClaimForm({ customerId, policyId }: ClaimFormProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([]);

    // Fetch customer's policies
    const { data: policies } = useQuery({
        queryKey: ['policies', customerId],
        queryFn: () => policyService.list(
            { customerId, status: 'active' },
            100 // Fetch all active policies
        ),
        enabled: !!customerId,
    });

    const form = useForm<ClaimFormData>({
        resolver: zodResolver(claimFormSchema),
        defaultValues: {
            policyId: policyId || '',
            incidentDate: new Date(),
            description: '',
            location: {
                latitude: 0,
                longitude: 0,
                address: '',
            },
            damageType: 'Vehicle',
            amount: 0,
        },
    });

    const handleLocationSelect = async (address: string) => {
        try {
            // Here you would typically use a geocoding service
            // For now, we'll just set the address
            form.setValue('location', {
                latitude: 0,
                longitude: 0,
                address,
            });
        } catch (error) {
            console.error('Error geocoding address:', error);
        }
    };

    const handleDocumentUpload = (document: { url: string }) => {
        setUploadedDocuments((prev) => [...prev, document.url]);
    };

    const onSubmit = async (data: ClaimFormData) => {
        try {
            setIsSubmitting(true);
            await claimService.create({
                ...data,
                customerId: customerId || '',
                documents: uploadedDocuments,
            });

            toast({
                title: 'Claim submitted',
                description: 'Your claim has been submitted successfully.',
            });

            router.push('/claims');
        } catch (error) {
            console.error('Error submitting claim:', error);
            toast({
                title: 'Error',
                description: 'There was an error submitting your claim. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Policy Selection */}
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
                                    {policies?.policies.map((policy) => (
                                        <SelectItem key={policy.id} value={policy.id}>
                                            {policy.policyNumber} - {policy.vehicle.registrationNumber}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Incident Date */}
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
                                        disabled={(date) =>
                                            date > new Date() || date < new Date('2000-01-01')
                                        }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Damage Type */}
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
                                    <SelectItem value="Vehicle">Vehicle Damage</SelectItem>
                                    <SelectItem value="Property">Property Damage</SelectItem>
                                    <SelectItem value="Personal">Personal Injury</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Description */}
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Incident Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    {...field}
                                    placeholder="Please describe what happened..."
                                    className="min-h-[100px]"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Location */}
                <FormField
                    control={form.control}
                    name="location.address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Incident Location</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="Enter the incident location"
                                    onChange={(e) => {
                                        field.onChange(e);
                                        handleLocationSelect(e.target.value);
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Amount */}
                <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Estimated Amount</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Document Upload */}
                <div className="space-y-4">
                    <FormLabel>Supporting Documents</FormLabel>
                    <DocumentUpload
                        entityType="claim"
                        entityId="temp" // Will be updated after claim creation
                        documentType="Claim Document"
                        onUploadComplete={handleDocumentUpload}
                        onUploadError={(error) => {
                            toast({
                                title: 'Upload failed',
                                description: error.message,
                                variant: 'destructive',
                            });
                        }}
                    />
                </div>

                <div className="flex justify-end space-x-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && (
                            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Submit Claim
                    </Button>
                </div>
            </form>
        </Form>
    );
} 