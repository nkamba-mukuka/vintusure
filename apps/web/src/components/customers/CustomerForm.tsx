import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '@/hooks/use-toast';
import { customerService } from '@/lib/services/customerService';
import { useAuthContext } from '@/contexts/AuthContext';

const customerFormSchema = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone number must be at least 10 characters'),
    nrcPassport: z.string().min(6, 'NRC/Passport number must be at least 6 characters'),
    address: z.object({
        street: z.string().min(1, 'Street address is required'),
        city: z.string().min(1, 'City is required'),
        province: z.string().min(1, 'Province is required'),
        postalCode: z.string().min(1, 'Postal code is required'),
    }),
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    gender: z.enum(['male', 'female', 'other']),
    occupation: z.string().min(1, 'Occupation is required'),
    status: z.enum(['active', 'inactive']).default('active'),
});

type CustomerFormData = z.infer<typeof customerFormSchema>;

interface CustomerFormProps {
    initialData?: Partial<CustomerFormData> & { id?: string };
    onSuccess?: () => void;
}

export default function CustomerForm({ initialData, onSuccess }: CustomerFormProps) {
    const { user } = useAuthContext();
    const { toast } = useToast();

    const form = useForm<CustomerFormData>({
        resolver: zodResolver(customerFormSchema),
        defaultValues: {
            firstName: initialData?.firstName || '',
            lastName: initialData?.lastName || '',
            email: initialData?.email || '',
            phone: initialData?.phone || '',
            nrcPassport: initialData?.nrcPassport || '',
            address: {
                street: initialData?.address?.street || '',
                city: initialData?.address?.city || '',
                province: initialData?.address?.province || '',
                postalCode: initialData?.address?.postalCode || '',
            },
            dateOfBirth: initialData?.dateOfBirth || '',
            gender: initialData?.gender || 'other',
            occupation: initialData?.occupation || '',
            status: initialData?.status || 'active',
        },
    });

    const onSubmit = async (data: CustomerFormData) => {
        try {
            if (!user) {
                throw new Error('User not authenticated');
            }

            if (initialData?.id) {
                await customerService.update(initialData.id, data);
                toast({
                    title: 'Success',
                    description: 'Customer updated successfully',
                });
            } else {
                await customerService.create(data, user.uid);
                toast({
                    title: 'Success',
                    description: 'Customer created successfully',
                });
            }

            onSuccess?.();
            form.reset();
        } catch (error) {
            console.error('Error saving customer:', error);
            toast({
                title: 'Error',
                description: 'Failed to save customer. Please try again.',
                variant: 'destructive',
            });
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
                <div>
                    <Controller
                        name="firstName"
                        control={form.control}
                        render={({ field }) => (
                            <div className="space-y-2">
                                <label htmlFor="firstName" className="block text-sm font-medium">
                                    First Name
                                </label>
                                <Input {...field} />
                            </div>
                        )}
                    />
                </div>

                <div>
                    <Controller
                        name="lastName"
                        control={form.control}
                        render={({ field }) => (
                            <div className="space-y-2">
                                <label htmlFor="lastName" className="block text-sm font-medium">
                                    Last Name
                                </label>
                                <Input {...field} />
                            </div>
                        )}
                    />
                </div>

                <div>
                    <Controller
                        name="email"
                        control={form.control}
                        render={({ field }) => (
                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-sm font-medium">
                                    Email
                                </label>
                                <Input {...field} type="email" />
                            </div>
                        )}
                    />
                </div>

                <div>
                    <Controller
                        name="phone"
                        control={form.control}
                        render={({ field }) => (
                            <div className="space-y-2">
                                <label htmlFor="phone" className="block text-sm font-medium">
                                    Phone
                                </label>
                                <Input {...field} type="tel" />
                            </div>
                        )}
                    />
                </div>

                <div>
                    <Controller
                        name="nrcPassport"
                        control={form.control}
                        render={({ field }) => (
                            <div className="space-y-2">
                                <label htmlFor="nrcPassport" className="block text-sm font-medium">
                                    NRC/Passport Number
                                </label>
                                <Input {...field} />
                            </div>
                        )}
                    />
                </div>

                <div>
                    <Controller
                        name="address.street"
                        control={form.control}
                        render={({ field }) => (
                            <div className="space-y-2">
                                <label htmlFor="street" className="block text-sm font-medium">
                                    Street Address
                                </label>
                                <Input {...field} />
                            </div>
                        )}
                    />
                </div>

                <div>
                    <Controller
                        name="address.city"
                        control={form.control}
                        render={({ field }) => (
                            <div className="space-y-2">
                                <label htmlFor="city" className="block text-sm font-medium">
                                    City
                                </label>
                                <Input {...field} />
                            </div>
                        )}
                    />
                </div>

                <div>
                    <Controller
                        name="address.province"
                        control={form.control}
                        render={({ field }) => (
                            <div className="space-y-2">
                                <label htmlFor="province" className="block text-sm font-medium">
                                    Province
                                </label>
                                <Input {...field} />
                            </div>
                        )}
                    />
                </div>

                <div>
                    <Controller
                        name="address.postalCode"
                        control={form.control}
                        render={({ field }) => (
                            <div className="space-y-2">
                                <label htmlFor="postalCode" className="block text-sm font-medium">
                                    Postal Code
                                </label>
                                <Input {...field} />
                            </div>
                        )}
                    />
                </div>

                <div>
                    <Controller
                        name="dateOfBirth"
                        control={form.control}
                        render={({ field }) => (
                            <div className="space-y-2">
                                <label htmlFor="dateOfBirth" className="block text-sm font-medium">
                                    Date of Birth
                                </label>
                                <Input {...field} type="date" />
                            </div>
                        )}
                    />
                </div>

                <div>
                    <Controller
                        name="gender"
                        control={form.control}
                        render={({ field }) => (
                            <div className="space-y-2">
                                <label htmlFor="gender" className="block text-sm font-medium">
                                    Gender
                                </label>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    />
                </div>

                <div>
                    <Controller
                        name="occupation"
                        control={form.control}
                        render={({ field }) => (
                            <div className="space-y-2">
                                <label htmlFor="occupation" className="block text-sm font-medium">
                                    Occupation
                                </label>
                                <Input {...field} />
                            </div>
                        )}
                    />
                </div>

                <div>
                    <Controller
                        name="status"
                        control={form.control}
                        render={({ field }) => (
                            <div className="space-y-2">
                                <label htmlFor="status" className="block text-sm font-medium">
                                    Status
                                </label>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    />
                </div>
            </div>

            <div className="flex justify-end space-x-2">
                <Button type="submit">
                    {initialData?.id ? 'Update Customer' : 'Create Customer'}
                </Button>
            </div>
        </form>
    );
} 