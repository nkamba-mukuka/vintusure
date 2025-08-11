import { useState } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Edit, UserIcon } from 'lucide-react'
import ProfileEditModal from '@/components/auth/ProfileEditModal'

export default function ProfilePage() {
  const { user } = useAuthContext()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive'
      case 'agent':
        return 'default'
      case 'customer':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your account information</p>
        </div>
        <Button onClick={() => setIsEditModalOpen(true)} className="flex items-center gap-2 w-full sm:w-auto">
          <Edit className="h-4 w-4" />
          Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <UserIcon className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
              </div>
              <CardTitle className="text-lg sm:text-xl">
                {user.firstName} {user.lastName}
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">{user.email}</CardDescription>
              <Badge variant={getRoleBadgeVariant(user.role)} className="mt-2 text-xs sm:text-sm">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Member since</p>
                <p className="font-medium text-sm sm:text-base">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Personal Information</CardTitle>
              <CardDescription>Your basic profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">First Name</label>
                  <p className="text-sm sm:text-base font-medium mt-1">{user.firstName || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                  <p className="text-sm sm:text-base font-medium mt-1">{user.lastName || 'Not provided'}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                <p className="text-sm sm:text-base font-medium mt-1">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                <p className="text-sm sm:text-base font-medium mt-1">{user.phone || 'Not provided'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Account Information</CardTitle>
              <CardDescription>Your account settings and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Account Role</label>
                  <p className="text-sm sm:text-base font-medium mt-1 capitalize">{user.role}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Account Status</label>
                  <p className="text-sm sm:text-base font-medium mt-1">
                    <Badge variant={user.profileCompleted ? 'default' : 'secondary'} className="text-xs">
                      {user.profileCompleted ? 'Complete' : 'Incomplete'}
                    </Badge>
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                <p className="text-sm sm:text-base font-medium mt-1">
                  {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          {user.company && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Company Information</CardTitle>
                <CardDescription>Your business details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Company Name</label>
                    <p className="text-sm sm:text-base font-medium mt-1">{user.company}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Position</label>
                    <p className="text-sm sm:text-base font-medium mt-1">{user.position || 'Not specified'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Company Address</label>
                  <p className="text-sm sm:text-base font-medium mt-1">{user.address || 'Not provided'}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
      />
    </div>
  )
}
