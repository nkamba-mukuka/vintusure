import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCustomerCRUD } from './customer';
import { useToast } from '@/hooks/use-toast';
import { Customer, CustomerFormData } from '@/types/customer';

interface CustomerFormProps {
    customer?: Customer;
    mode: 'create' | 'edit';
}

export default function CustomerForm({ customer, mode }: CustomerFormProps) {
    const navigate = useNavigate();
    const { createCustomer, updateCustomer, isLoading, error } = useCustomerCRUD();
    const { toast } = useToast();

    const [formData, setFormData] = useState<CustomerFormData>({
        nrcPassport: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: {
            street: '',
            city: '',
            province: '',
            postalCode: '',
        },
        dateOfBirth: '',
        gender: 'male',
        occupation: '',
        status: 'active',
    });

    useEffect(() => {
        if (customer && mode === 'edit') {
            setFormData({
                nrcPassport: customer.nrcPassport,
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email,
                phone: customer.phone,
                address: customer.address,
                dateOfBirth: customer.dateOfBirth,
                gender: customer.gender,
                occupation: customer.occupation,
                status: customer.status,
            });
        }
    }, [customer, mode]);

    const handleInputChange = (field: string, value: string) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent as keyof CustomerFormData],
                    [child]: value,
                },
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value,
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (mode === 'create') {
                const newCustomer = await createCustomer(formData);
                if (newCustomer) {
                    toast({
                        title: "Customer created",
                        description: "Customer has been created successfully.",
                    });
<<<<<<< HEAD
                    navigate('/customers');
=======
                    navigate('/dashboard/customers');
>>>>>>> 358bab339ae23ea56fcb881bd4beb96a58138f16
                }
            } else if (mode === 'edit' && customer) {
                const success = await updateCustomer(customer.id, formData);
                if (success) {
                    toast({
                        title: "Customer updated",
                        description: "Customer has been updated successfully.",
                    });
<<<<<<< HEAD
                    navigate('/customers');
=======
                    navigate('/dashboard/customers');
>>>>>>> 358bab339ae23ea56fcb881bd4beb96a58138f16
                }
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "An error occurred while saving the customer.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <Card>
                <CardHeader>
                    <CardTitle>
                        {mode === 'create' ? 'Create New Customer' : 'Edit Customer'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Personal Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="firstName">First Name *</Label>
                                <Input
                                    id="firstName"
                                    value={formData.firstName}
                                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="lastName">Last Name *</Label>
                                <Input
                                    id="lastName"
                                    value={formData.lastName}
                                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="nrcPassport">NRC/Passport *</Label>
                                <Input
                                    id="nrcPassport"
                                    value={formData.nrcPassport}
                                    onChange={(e) => handleInputChange('nrcPassport', e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                                <Input
                                    id="dateOfBirth"
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="phone">Phone *</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="gender">Gender *</Label>
                                <Select
                                    value={formData.gender}
                                    onValueChange={(value) => handleInputChange('gender', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="occupation">Occupation</Label>
                                <Input
                                    id="occupation"
                                    value={formData.occupation}
                                    onChange={(e) => handleInputChange('occupation', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Address Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Address Information</h3>
                            <div>
                                <Label htmlFor="street">Street Address</Label>
                                <Input
                                    id="street"
                                    value={formData.address.street}
                                    onChange={(e) => handleInputChange('address.street', e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        value={formData.address.city}
                                        onChange={(e) => handleInputChange('address.city', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="province">Province</Label>
                                    <Input
                                        id="province"
                                        value={formData.address.province}
                                        onChange={(e) => handleInputChange('address.province', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="postalCode">Postal Code</Label>
                                    <Input
                                        id="postalCode"
                                        value={formData.address.postalCode}
                                        onChange={(e) => handleInputChange('address.postalCode', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {mode === 'edit' && (
                            <div>
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => handleInputChange('status', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {error && (
                            <div className="text-red-600 text-sm">{error}</div>
                        )}

                        <div className="flex justify-end space-x-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/dashboard/customers')}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Saving...' : mode === 'create' ? 'Create Customer' : 'Update Customer'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
} 