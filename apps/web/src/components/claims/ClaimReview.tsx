
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Claim } from '@/types/policy';
import { claimService } from '@/lib/services/claimService';
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
import { format } from 'date-fns';
import { FileIcon, Loader2Icon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

const reviewFormSchema = z.object({
    status: z.enum(['UnderReview', 'Approved', 'Rejected'] as const),
    approvedAmount: z.number().optional(),
    reviewNotes: z.string().min(1, 'Review notes are required'),
});

type ReviewFormData = z.infer<typeof reviewFormSchema>;

interface ClaimReviewProps {
    claim: Claim;
    onUpdate: () => void;
}

const statusColors = {
    'Submitted': 'default',
    'UnderReview': 'secondary',
    'Approved': 'outline',
    'Rejected': 'destructive',
    'Paid': 'outline',
} as const;

export default function ClaimReview({ claim, onUpdate }: ClaimReviewProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ReviewFormData>({
        resolver: zodResolver(reviewFormSchema),
        defaultValues: {
            status: claim.status === 'Submitted' ? 'UnderReview' : (claim.status === 'Paid' ? 'Approved' : claim.status),
            approvedAmount: claim.approvedAmount,
            reviewNotes: claim.reviewNotes || '',
        },
    });

    const onSubmit = async (data: ReviewFormData) => {
        try {
            setIsSubmitting(true);

            if (data.status === 'Approved' && !data.approvedAmount) {
                toast({
                    title: 'Error',
                    description: 'Approved amount is required when approving a claim.',
                    variant: 'destructive',
                });
                return;
            }

            await claimService.updateStatus(claim.id, data.status, data.reviewNotes);

            if (data.status === 'Approved' && data.approvedAmount) {
                await claimService.approveAmount(claim.id, data.approvedAmount, data.reviewNotes);
            }

            toast({
                title: 'Claim updated',
                description: 'The claim has been updated successfully.',
            });

            onUpdate();
        } catch (error) {
            console.error('Error updating claim:', error);
            toast({
                title: 'Error',
                description: 'There was an error updating the claim. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Claim Details */}
            <Card>
                <CardHeader>
                    <CardTitle>Claim Details</CardTitle>
                    <CardDescription>
                        Submitted on {format(new Date(claim.createdAt), 'PPP')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="text-sm font-medium text-gray-500">Status</h4>
                            <Badge variant={statusColors[claim.status]}>
                                {claim.status}
                            </Badge>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-gray-500">Damage Type</h4>
                            <p>{claim.damageType}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-gray-500">Incident Date</h4>
                            <p>{format(new Date(claim.incidentDate), 'PPP')}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-gray-500">Amount Claimed</h4>
                            <p>{(claim.amount || 0).toLocaleString('en-ZM', {
                                style: 'currency',
                                currency: 'ZMW',
                            })}</p>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Description</h4>
                        <p className="text-sm">{claim.description}</p>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Location</h4>
                        <p className="text-sm">{claim.location.address}</p>
                    </div>

                    {claim.documents.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-2">Documents</h4>
                            <ul className="space-y-2">
                                {claim.documents.map((url, index) => (
                                    <li key={index}>
                                        <a
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center text-indigo-600 hover:text-indigo-900"
                                        >
                                            <FileIcon className="h-4 w-4 mr-2" />
                                            <span>Document {index + 1}</span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Review Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Review Decision</CardTitle>
                    <CardDescription>
                        Update the claim status and provide your review notes
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="UnderReview">Under Review</SelectItem>
                                                <SelectItem value="Approved">Approved</SelectItem>
                                                <SelectItem value="Rejected">Rejected</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {form.watch('status') === 'Approved' && (
                                <FormField
                                    control={form.control}
                                    name="approvedAmount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Approved Amount</FormLabel>
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
                            )}

                            <FormField
                                control={form.control}
                                name="reviewNotes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Review Notes</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                placeholder="Provide your review notes..."
                                                className="min-h-[100px]"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end">
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && (
                                        <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Update Claim
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
} 