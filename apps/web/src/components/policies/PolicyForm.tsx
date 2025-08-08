
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PolicyFormData, policyFormSchema } from '@/lib/validations/policy';
import { useQuery } from '@tanstack/react-query';
import { customerService } from '@/lib/services/customerService';
import { policyService } from '@/lib/services/policyService';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useAuthContext } from '@/contexts/AuthContext';
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
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Loader2Icon } from 'lucide-react';
import { cn } from '@/lib/utils';
import PremiumCalculator from '@/components/premium/PremiumCalculator';
import { PremiumBreakdown } from '@/lib/services/premiumService';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

interface PolicyFormProps {
    initialData?: Partial<PolicyFormData & { id: string }>;
    customerId?: string;
}

export default function PolicyForm({ initialData, customerId }: PolicyFormProps) {
    const router = useNavigate();
    const { toast } = useToast();
    const { user } = useAuthContext();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [premiumBreakdown, setPremiumBreakdown] = useState<PremiumBreakdown | null>(null);

    // Fetch customers for the customer select
    const { data: customers } = useQuery({
        queryKey: ['customers'],
        queryFn: () => customerService.list(),
    });

    const form = useForm<PolicyFormData>({
        resolver: zodResolver(policyFormSchema),
        defaultValues: {
            customerId: customerId || initialData?.customerId || '',
            type: initialData?.type || 'comprehensive',
            status: initialData?.status || 'pending',
            policyNumber: initialData?.policyNumber || undefined,
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
            startDate: initialData?.startDate || new Date(),
            endDate: initialData?.endDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
            premium: {
                amount: initialData?.premium?.amount || 0,
                currency: initialData?.premium?.currency || 'ZMW',
                paymentStatus: initialData?.premium?.paymentStatus || 'pending',
                paymentMethod: initialData?.premium?.paymentMethod || '',
            },
        },
    });

    const onSubmit = async (data: PolicyFormData) => {
        try {
            setIsSubmitting(true);
            
            // Check if user is authenticated
            if (!user?.uid) {
                toast({
                    title: 'Authentication Error',
                    description: 'You must be logged in to create or update policies.',
                    variant: 'destructive',
                });
                return;
            }

            if (initialData?.id) {
                await policyService.update(initialData.id, data);
                toast({
                    title: 'Policy updated',
                    description: 'The policy has been updated successfully.',
                });
            } else {
                await policyService.create({
                    ...data,
                    status: 'pending',
                    policyNumber: `POL-${Date.now()}`,
                }, user.uid);
                toast({
                    title: 'Policy created',
                    description: 'The policy has been created successfully.',
                });
            }

            router('/policies');
        } catch (error) {
            console.error('Error saving policy:', error);
            toast({
                title: 'Error',
                description: 'There was an error saving the policy. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePremiumCalculation = (breakdown: PremiumBreakdown) => {
        setPremiumBreakdown(breakdown);
        form.setValue('premium.amount', breakdown.total);
        form.setValue('premium.currency', 'ZMW');
    };

    return (
        <div className="space-y-8">
            {/* Customer Selection */}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                                        <SelectTrigger className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                                            <SelectValue placeholder="Select a customer" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-white border-gray-300">
                                        {customers?.customers.map((customer) => (
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

                    {/* Policy Type */}
                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Policy Type</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                                            <SelectValue placeholder="Select policy type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-white border-gray-300">
                                        <SelectItem value="comprehensive">Comprehensive</SelectItem>
                                        <SelectItem value="third_party">Third Party</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Vehicle Details Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Vehicle Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="vehicle.registrationNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Registration Number</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="vehicle.make"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Make</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="vehicle.model"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Model</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="vehicle.year"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Year</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="vehicle.engineNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Engine Number</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="vehicle.chassisNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Chassis Number</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="vehicle.value"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Value</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="number"
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
                                    name="vehicle.usage"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Usage</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                                                        <SelectValue placeholder="Select usage type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-white border-gray-300">
                                                    <SelectItem value="private">Private</SelectItem>
                                                    <SelectItem value="commercial">Commercial</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Premium Calculation Section */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">Premium Calculation</h2>
                        <PremiumCalculator
                            onCalculate={handlePremiumCalculation}
                            defaultValues={{
                                vehicleValue: form.watch('vehicle.value'),
                                vehicleType: 'car',
                                usage: form.watch('vehicle.usage'),
                                coverageType: form.watch('type'),
                                vehicleAge: new Date().getFullYear() - form.watch('vehicle.year'),
                            }}
                        />
                    </div>

                    {/* Policy Details Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Policy Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Policy Dates */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="startDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Start Date</FormLabel>
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
                                                        disabled={(date: Date) =>
                                                            date < new Date() || date > new Date('2100-01-01')
                                                        }
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
                                    name="endDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>End Date</FormLabel>
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
                                                        disabled={(date: Date) =>
                                                            date <= new Date() || date > new Date('2100-01-01')
                                                        }
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Premium Fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="premium.amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Premium Amount</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        const parsedValue = value === '' ? 0 : parseFloat(value);
                                                        field.onChange(isNaN(parsedValue) ? 0 : parsedValue);
                                                    }}
                                                    disabled={!!premiumBreakdown}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="premium.currency"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Currency</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                disabled={!!premiumBreakdown}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                                                        <SelectValue placeholder="Select currency" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-white border-gray-300">
                                                    <SelectItem value="ZMW">ZMW</SelectItem>
                                                    <SelectItem value="USD">USD</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="premium.paymentStatus"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Payment Status</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                                                        <SelectValue placeholder="Select payment status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-white border-gray-300">
                                                    <SelectItem value="paid">Paid</SelectItem>
                                                    <SelectItem value="pending">Pending</SelectItem>
                                                    <SelectItem value="partial">Partial</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="premium.paymentMethod"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Payment Method</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Form Actions */}
                    <div className="flex justify-end space-x-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router('/policies')}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && (
                                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {initialData?.id ? 'Update Policy' : 'Create Policy'}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
} 