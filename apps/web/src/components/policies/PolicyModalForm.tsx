import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PolicyFormData, policyFormSchema } from '@/lib/validations/policy';
import { useQuery } from '@tanstack/react-query';
import { customerService } from '@/lib/services/customerService';
import { policyService } from '@/lib/services/policyService';
import { useToast } from '@/components/ui/use-toast';
import { useAuthContext } from '@/contexts/AuthContext';
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

import React from 'react';

interface PolicyModalFormProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: Partial<PolicyFormData & { id: string }>;
    customerId?: string;
    onSuccess?: () => void;
}

export default function PolicyModalForm({ 
    isOpen, 
    onClose, 
    initialData, 
    customerId, 
    onSuccess 
}: PolicyModalFormProps) {
    const { toast } = useToast();
    const { user } = useAuthContext();
    const [isSubmitting, setIsSubmitting] = useState(false);


    // Fetch customers for the customer select - only current user's customers
    const { data: customers } = useQuery({
        queryKey: ['customers', user?.uid],
        queryFn: () => customerService.list({ userId: user?.uid }),
        enabled: !!user?.uid,
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

    // Reset form when modal opens with edit data
    React.useEffect(() => {
        if (isOpen && initialData) {
            form.reset({
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
            });
        } else if (isOpen && !initialData) {
            // Reset to default values for create mode
            form.reset({
                customerId: customerId || '',
                type: 'comprehensive',
                status: 'pending',
                policyNumber: undefined,
                vehicle: {
                    registrationNumber: '',
                    make: '',
                    model: '',
                    year: new Date().getFullYear(),
                    engineNumber: '',
                    chassisNumber: '',
                    value: 0,
                    usage: 'private',
                },
                startDate: new Date(),
                endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                premium: {
                    amount: 0,
                    currency: 'ZMW',
                    paymentStatus: 'pending',
                    paymentMethod: '',
                },
            });
        }
    }, [isOpen, initialData, customerId, form]);

    const onSubmit = async (data: PolicyFormData) => {
        try {
            setIsSubmitting(true);
            
            // Check if user is authenticated
            if (!user?.uid) {
                toast({
                    title: 'Authentication Error',
                    description: 'You must be logged in to create a policy.',
                    variant: 'destructive',
                });
                return;
            }

            if (initialData?.id) {
                // Update existing policy
                await policyService.update(initialData.id, data);
                toast({
                    title: 'Policy Updated',
                    description: 'Policy has been updated successfully.',
                });
            } else {
                // Create new policy
                if (!user?.uid) {
                    throw new Error('User not authenticated');
                }
                // Remove policyNumber from data since it's undefined for new policies
                const { policyNumber, ...policyData } = data;
                await policyService.create({
                    ...policyData,
                    status: 'pending',
                    policyNumber: `POL-${Date.now()}`,
                }, user.uid);
                toast({
                    title: 'Policy Created',
                    description: 'Policy has been created successfully.',
                });
            }

            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Error saving policy:', error);
            toast({
                title: 'Error',
                description: 'Failed to save policy. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };



    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {initialData?.id ? 'Edit Policy' : 'Create New Policy'}
                    </DialogTitle>
                    <DialogDescription>
                        {initialData?.id 
                            ? 'Update the policy information below.' 
                            : 'Fill in the details below to create a new insurance policy.'
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
                                                    {customers?.customers?.map((customer) => (
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
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Policy Type *</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="comprehensive">Comprehensive</SelectItem>
                                                    <SelectItem value="third-party">Third Party</SelectItem>
                                                    <SelectItem value="third-party-fire-theft">Third Party Fire & Theft</SelectItem>
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
                                    name="startDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Start Date *</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full pl-3 text-left font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, "PPP")
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
                                                            date < new Date()
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
                                            <FormLabel>End Date *</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full pl-3 text-left font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, "PPP")
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
                                                            date <= form.getValues('startDate')
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
                        </div>

                        {/* Vehicle Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Vehicle Information</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="vehicle.registrationNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Registration Number *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="ABC 123" {...field} />
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
                                            <FormLabel>Make *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Toyota" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="vehicle.model"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Model *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Corolla" {...field} />
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
                                            <FormLabel>Year *</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    type="number" 
                                                    placeholder="2020" 
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="vehicle.engineNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Engine Number *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Engine number" {...field} />
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
                                            <FormLabel>Chassis Number *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Chassis number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="vehicle.value"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Vehicle Value (ZMW) *</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    type="number" 
                                                    placeholder="50000" 
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
                                            <FormLabel>Usage *</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="private">Private</SelectItem>
                                                    <SelectItem value="commercial">Commercial</SelectItem>
                                                    <SelectItem value="public">Public</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>



                        {/* Premium Information */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold">Premium Information</h3>
                                
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="premium.amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Premium Amount (ZMW) *</FormLabel>
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

                                <FormField
                                    control={form.control}
                                    name="premium.paymentMethod"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Payment Method</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select payment method" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="cash">Cash</SelectItem>
                                                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                                    <SelectItem value="mobile_money">Mobile Money</SelectItem>
                                                    <SelectItem value="card">Card</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
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
                            initialData?.id ? 'Update Policy' : 'Create Policy'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
