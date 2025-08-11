
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { policyFormSchema, type PolicyFormData } from '@/lib/validations/policy';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { policyService } from '@/lib/services/policyService';
import { useAuthContext } from '@/contexts/AuthContext';

interface PolicyFormProps {
    initialData?: Partial<PolicyFormData>;
    onSuccess?: () => void;
}

export default function PolicyForm({ initialData, onSuccess }: PolicyFormProps) {
    const { user } = useAuthContext();
    const { toast } = useToast();

    const form = useForm<PolicyFormData>({
        resolver: zodResolver(policyFormSchema),
        defaultValues: {
            type: initialData?.type || 'comprehensive',
            status: initialData?.status || 'pending',
            customerId: initialData?.customerId || '',
            vehicle: {
                registrationNumber: initialData?.vehicle?.registrationNumber || '',
                make: initialData?.vehicle?.make || '',
                model: initialData?.vehicle?.model || '',
                year: initialData?.vehicle?.year || new Date().getFullYear(),
                engineNumber: initialData?.vehicle?.engineNumber || '',
                chassisNumber: initialData?.vehicle?.chassisNumber || '',
                value: initialData?.vehicle?.value || 0,
                usage: initialData?.vehicle?.usage || 'private',
            },
            startDate: initialData?.startDate || new Date().toISOString(),
            endDate: initialData?.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            premium: {
                amount: initialData?.premium?.amount || 0,
                currency: initialData?.premium?.currency || 'USD',
                paymentStatus: initialData?.premium?.paymentStatus || 'pending',
                nextPaymentDate: initialData?.premium?.nextPaymentDate,
            },
            policyNumber: initialData?.policyNumber,
        },
    });

    const onSubmit = async (data: PolicyFormData) => {
        try {
            if (!user) {
                throw new Error('User not authenticated');
            }

            // Ensure required fields are present
            if (!data.policyNumber) {
                data.policyNumber = `POL-${Date.now()}`; // Generate a policy number if not provided
            }

            if (initialData?.id) {
                await policyService.update(initialData.id, {
                    ...data,
                    startDate: data.startDate,
                    endDate: data.endDate,
                });
                toast({
                    title: 'Success',
                    description: 'Policy updated successfully',
                });
            } else {
                await policyService.create({
                    ...data,
                    startDate: data.startDate,
                    endDate: data.endDate,
                    policyNumber: data.policyNumber,
                }, user.uid);
                toast({
                    title: 'Success',
                    description: 'Policy created successfully',
                });
            }

            onSuccess?.();
            form.reset();
        } catch (error) {
            console.error('Error saving policy:', error);
            toast({
                title: 'Error',
                description: 'Failed to save policy. Please try again.',
                variant: 'destructive',
            });
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
                <div>
                    <Controller
                        name="type"
                        control={form.control}
                        render={({ field }) => (
                            <div className="space-y-2">
                                <label htmlFor="type" className="block text-sm font-medium">
                                    Policy Type
                                </label>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select policy type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="comprehensive">Comprehensive</SelectItem>
                                        <SelectItem value="third_party">Third Party</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    />
                </div>

                <div>
                    <Controller
                        name="vehicle.registrationNumber"
                        control={form.control}
                        render={({ field }) => (
                            <div className="space-y-2">
                                <label htmlFor="registrationNumber" className="block text-sm font-medium">
                                    Registration Number
                                </label>
                                <Input {...field} />
                            </div>
                        )}
                    />
                </div>

                <div>
                    <Controller
                        name="vehicle.make"
                        control={form.control}
                        render={({ field }) => (
                            <div className="space-y-2">
                                <label htmlFor="make" className="block text-sm font-medium">
                                    Make
                                </label>
                                <Input {...field} />
                            </div>
                        )}
                    />
                </div>

                <div>
                    <Controller
                        name="vehicle.model"
                        control={form.control}
                        render={({ field }) => (
                            <div className="space-y-2">
                                <label htmlFor="model" className="block text-sm font-medium">
                                    Model
                                </label>
                                <Input {...field} />
                            </div>
                        )}
                    />
                </div>

                <div>
                    <Controller
                        name="vehicle.year"
                        control={form.control}
                        render={({ field }) => (
                            <div className="space-y-2">
                                <label htmlFor="year" className="block text-sm font-medium">
                                    Year
                                </label>
                                <Input
                                    {...field}
                                    type="number"
                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                />
                            </div>
                        )}
                    />
                </div>

                <div>
                    <Controller
                        name="vehicle.value"
                        control={form.control}
                        render={({ field }) => (
                            <div className="space-y-2">
                                <label htmlFor="value" className="block text-sm font-medium">
                                    Vehicle Value
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
                        name="vehicle.usage"
                        control={form.control}
                        render={({ field }) => (
                            <div className="space-y-2">
                                <label htmlFor="usage" className="block text-sm font-medium">
                                    Vehicle Usage
                                </label>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select vehicle usage" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="private">Private</SelectItem>
                                        <SelectItem value="commercial">Commercial</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    />
                </div>

                <div>
                    <Controller
                        name="premium.amount"
                        control={form.control}
                        render={({ field }) => (
                            <div className="space-y-2">
                                <label htmlFor="premiumAmount" className="block text-sm font-medium">
                                    Premium Amount
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
                        name="premium.paymentStatus"
                        control={form.control}
                        render={({ field }) => (
                            <div className="space-y-2">
                                <label htmlFor="paymentStatus" className="block text-sm font-medium">
                                    Payment Status
                                </label>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select payment status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="paid">Paid</SelectItem>
                                        <SelectItem value="partial">Partial</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    />
                </div>
            </div>

            <div className="flex justify-end space-x-2">
                <Button type="submit">
                    {initialData?.id ? 'Update Policy' : 'Create Policy'}
                </Button>
            </div>
        </form>
    );
} 