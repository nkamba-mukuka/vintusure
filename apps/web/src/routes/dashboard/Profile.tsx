import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthContext } from '@/contexts/AuthContext';
import ProfileEditModal from '@/components/auth/ProfileEditModal';

const getRoleBadgeVariant = (role: string | undefined) => {
  switch (role) {
    case 'admin':
      return 'destructive';
    case 'agent':
      return 'default';
    default:
      return 'secondary';
  }
};

const formatAddress = (address: { street: string; city: string; province: string; postalCode: string } | undefined) => {
  if (!address) return 'Not provided';
  return `${address.street}, ${address.city}, ${address.province} ${address.postalCode}`;
};

export default function Profile() {
  const { user } = useAuthContext();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">Profile</h2>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        <Button onClick={() => setIsEditModalOpen(true)}>Edit Profile</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium">Name</h3>
            <p className="text-sm sm:text-base font-medium mt-1">
              {user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : user.email}
            </p>
            <Badge variant={getRoleBadgeVariant(user.role)} className="mt-2 text-xs sm:text-sm">
              {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
            </Badge>
          </div>

          <div>
            <h3 className="font-medium">Email</h3>
            <p className="text-sm sm:text-base font-medium mt-1">{user.email}</p>
          </div>

          <div>
            <h3 className="font-medium">Phone</h3>
            <p className="text-sm sm:text-base font-medium mt-1">{user.phone || 'Not provided'}</p>
          </div>

          <div>
            <h3 className="font-medium">Department</h3>
            <p className="text-sm sm:text-base font-medium mt-1">{user.department || 'Not provided'}</p>
          </div>

          <div>
            <h3 className="font-medium">Employee ID</h3>
            <p className="text-sm sm:text-base font-medium mt-1">{user.employeeId || 'Not provided'}</p>
          </div>

          <div>
            <h3 className="font-medium">Insurance Company</h3>
            <p className="text-sm sm:text-base font-medium mt-1">{user.insuranceCompany || 'Not provided'}</p>
          </div>

          <div>
            <h3 className="font-medium">Address</h3>
            <p className="text-sm sm:text-base font-medium mt-1">{formatAddress(user.address)}</p>
          </div>

          <div>
            <h3 className="font-medium">Bio</h3>
            <p className="text-sm sm:text-base font-medium mt-1">{user.bio || 'Not provided'}</p>
          </div>
        </CardContent>
      </Card>

      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
}
