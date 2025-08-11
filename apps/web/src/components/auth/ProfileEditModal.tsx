import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/contexts/AuthContext';
import { userService } from '@/lib/services/userService';
import { User, UserRole } from '@/types/auth';

const profileEditSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  role: z.enum(['agent', 'admin'] as const),
  department: z.string().min(2, 'Department must be at least 2 characters'),
  employeeId: z.string().min(3, 'Employee ID must be at least 3 characters'),
  insuranceCompany: z.string().min(2, 'Insurance company name must be at least 2 characters'),
  bio: z.string().optional(),
  address: z.object({
    street: z.string().min(5, 'Street address must be at least 5 characters'),
    city: z.string().min(2, 'City must be at least 2 characters'),
    province: z.string().min(2, 'Province must be at least 2 characters'),
    postalCode: z.string().min(4, 'Postal code must be at least 4 characters'),
  }),
});

type ProfileEditFormData = z.infer<typeof profileEditSchema>;

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export default function ProfileEditModal({ isOpen, onClose, user }: ProfileEditModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateUser } = useAuthContext();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileEditFormData>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      role: user.role,
      department: user.department || '',
      employeeId: user.employeeId || '',
      insuranceCompany: user.insuranceCompany || '',
      bio: user.bio || '',
      address: user.address || {
        street: '',
        city: '',
        province: '',
        postalCode: '',
      },
    },
  });

  const onSubmit = async (data: ProfileEditFormData) => {
    try {
      setIsSubmitting(true);

      const userData: Partial<User> = {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: data.role as UserRole,
        department: data.department,
        employeeId: data.employeeId,
        insuranceCompany: data.insuranceCompany,
        bio: data.bio || '',
        address: data.address,
        updatedAt: new Date(),
      };

      await userService.updateUser(user.uid, userData);

      // Update the user context
      if (updateUser) {
        updateUser({ ...user, ...userData });
      }

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated!',
      });

      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  {...register('firstName')}
                  placeholder="Enter your first name"
                />
                {errors.firstName && (
                  <p className="text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  {...register('lastName')}
                  placeholder="Enter your last name"
                />
                {errors.lastName && (
                  <p className="text-sm text-red-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="Enter your phone number"
              />
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Professional Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select
                  value={watch('role')}
                  onValueChange={(value) => setValue('role', value as 'agent' | 'admin')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agent">Insurance Agent</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-sm text-red-600">{errors.role.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Input
                  id="department"
                  {...register('department')}
                  placeholder="Enter your department"
                />
                {errors.department && (
                  <p className="text-sm text-red-600">{errors.department.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID *</Label>
                <Input
                  id="employeeId"
                  {...register('employeeId')}
                  placeholder="Enter your employee ID"
                />
                {errors.employeeId && (
                  <p className="text-sm text-red-600">{errors.employeeId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="insuranceCompany">Insurance Company *</Label>
                <Input
                  id="insuranceCompany"
                  {...register('insuranceCompany')}
                  placeholder="Enter your insurance company name"
                />
                {errors.insuranceCompany && (
                  <p className="text-sm text-red-600">{errors.insuranceCompany.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                {...register('bio')}
                placeholder="Tell us about yourself (optional)"
                rows={3}
              />
              {errors.bio && (
                <p className="text-sm text-red-600">{errors.bio.message}</p>
              )}
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Address Information
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="street">Street Address *</Label>
              <Input
                id="street"
                {...register('address.street')}
                placeholder="Enter your street address"
              />
              {errors.address?.street && (
                <p className="text-sm text-red-600">{errors.address.street.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  {...register('address.city')}
                  placeholder="Enter your city"
                />
                {errors.address?.city && (
                  <p className="text-sm text-red-600">{errors.address.city.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="province">Province *</Label>
                <Input
                  id="province"
                  {...register('address.province')}
                  placeholder="Enter your province"
                />
                {errors.address?.province && (
                  <p className="text-sm text-red-600">{errors.address.province.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code *</Label>
                <Input
                  id="postalCode"
                  {...register('address.postalCode')}
                  placeholder="Enter your postal code"
                />
                {errors.address?.postalCode && (
                  <p className="text-sm text-red-600">{errors.address.postalCode.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Updating Profile...' : 'Update Profile'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
