import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { userService } from '@/lib/services/userService';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential, deleteUser } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { 
  Settings as SettingsIcon,
  User,
  Palette,
  Globe,
  Database,
  Key,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Download,
  Trash2
} from 'lucide-react';

export default function SettingsPage() {
  const { user, updateUser, signOut } = useAuthContext();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Form states
  const [accountSettings, setAccountSettings] = useState({
    email: user?.email || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [preferenceSettings, setPreferenceSettings] = useState({
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD',
  });

  // Load user data when component mounts or user changes
  useEffect(() => {
    if (user) {
      setAccountSettings({
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
      });

      setPreferenceSettings({
        language: user.preferences?.language || 'en',
        timezone: user.preferences?.timezone || 'UTC',
        dateFormat: user.preferences?.dateFormat || 'MM/DD/YYYY',
        currency: user.preferences?.currency || 'USD',
      });
    }
  }, [user]);

  const handleAccountUpdate = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to update your account.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const userData = {
        firstName: accountSettings.firstName,
        lastName: accountSettings.lastName,
        phone: accountSettings.phone,
      };

      await userService.updateUser(user.uid, userData);
      
      // Update the user context
      updateUser(userData);

      toast({
        title: 'Account Updated',
        description: 'Your account settings have been successfully updated.',
      });
    } catch (error) {
      console.error('Error updating account:', error);
      toast({
        title: 'Error',
        description: 'Failed to update account settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!user?.email) {
      toast({
        title: 'Error',
        description: 'Email is required for password change.',
        variant: 'destructive',
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'New password and confirm password do not match.',
        variant: 'destructive',
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'New password must be at least 6 characters long.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Re-authenticate user before password change
      const credential = EmailAuthProvider.credential(user.email, passwordData.currentPassword);
      await reauthenticateWithCredential(auth.currentUser!, credential);
      
      // Update password
      await updatePassword(auth.currentUser!, passwordData.newPassword);
      
      toast({
        title: 'Password Updated',
        description: 'Your password has been successfully changed.',
      });
      
      // Reset password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (error: any) {
      console.error('Error changing password:', error);
      let errorMessage = 'Failed to update password. Please try again.';
      
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Current password is incorrect.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'New password is too weak. Please choose a stronger password.';
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferenceUpdate = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to update preferences.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Save preferences to user document
      const userData = {
        preferences: {
          language: preferenceSettings.language,
          timezone: preferenceSettings.timezone,
          dateFormat: preferenceSettings.dateFormat,
          currency: preferenceSettings.currency,
        },
      };

      await userService.updateUser(user.uid, userData);
      
      toast({
        title: 'Preferences Updated',
        description: 'Your preferences have been successfully updated.',
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to update preferences. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDataExport = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to export your data.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Prepare user data for export
      const exportData = {
        user: {
          uid: user.uid,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role,
          department: user.department,
          employeeId: user.employeeId,
          insuranceCompany: user.insuranceCompany,
          bio: user.bio,
          address: user.address,
          preferences: user.preferences,
          profileCompleted: user.profileCompleted,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        exportDate: new Date().toISOString(),
        exportVersion: '1.0',
      };

      // Create and download JSON file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vintusure-data-${user.uid}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Data Exported',
        description: 'Your data has been successfully exported and downloaded.',
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: 'Error',
        description: 'Failed to export data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountDeletion = async () => {
    if (!user?.email) {
      toast({
        title: 'Error',
        description: 'Email is required for account deletion.',
        variant: 'destructive',
      });
      return;
    }

    if (deleteConfirmText !== 'DELETE') {
      toast({
        title: 'Error',
        description: 'Please type DELETE to confirm account deletion.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Delete user document from Firestore
      await userService.deleteUser(user.uid);
      
      // Delete Firebase Auth user
      await deleteUser(auth.currentUser!);
      
      toast({
        title: 'Account Deleted',
        description: 'Your account has been permanently deleted.',
      });
      
      // Sign out and redirect
      await signOut();
    } catch (error: any) {
      console.error('Error deleting account:', error);
      let errorMessage = 'Failed to delete account. Please try again.';
      
      if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Please re-authenticate before deleting your account.';
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
      setDeleteConfirmText('');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your account preferences and security</p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <SettingsIcon className="h-3 w-3" />
          Settings
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Settings
            </CardTitle>
            <CardDescription>
              Update your personal information and account details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={accountSettings.firstName}
                  onChange={(e) => setAccountSettings(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Enter your first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={accountSettings.lastName}
                  onChange={(e) => setAccountSettings(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Enter your last name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={accountSettings.email}
                disabled
                className="bg-gray-50 dark:bg-gray-800"
              />
              <p className="text-sm text-muted-foreground">Email cannot be changed</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={accountSettings.phone}
                onChange={(e) => setAccountSettings(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter your phone number"
              />
            </div>
            <Button onClick={handleAccountUpdate} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Account
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Password Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Password Settings
            </CardTitle>
            <CardDescription>
              Change your password and manage security
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Enter current password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Enter new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirm new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button 
              onClick={handlePasswordChange} 
              disabled={isLoading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword} 
              className="w-full"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Key className="h-4 w-4 mr-2" />
                  Change Password
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Preferences
            </CardTitle>
            <CardDescription>
              Customize your application experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Language</Label>
                <Select
                  value={preferenceSettings.language}
                  onValueChange={(value) => setPreferenceSettings(prev => ({ ...prev, language: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select
                  value={preferenceSettings.timezone}
                  onValueChange={(value) => setPreferenceSettings(prev => ({ ...prev, timezone: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="EST">Eastern Time</SelectItem>
                    <SelectItem value="PST">Pacific Time</SelectItem>
                    <SelectItem value="GMT">GMT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Date Format</Label>
                <Select
                  value={preferenceSettings.dateFormat}
                  onValueChange={(value) => setPreferenceSettings(prev => ({ ...prev, dateFormat: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select
                  value={preferenceSettings.currency}
                  onValueChange={(value) => setPreferenceSettings(prev => ({ ...prev, currency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="CAD">CAD (C$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handlePreferenceUpdate} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Palette className="h-4 w-4 mr-2" />
                  Update Preferences
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data & Privacy
            </CardTitle>
            <CardDescription>
              Manage your data and privacy settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Data Export</Label>
                <p className="text-sm text-muted-foreground">Download a copy of your data in JSON format</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDataExport}
                  disabled={isLoading}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isLoading ? 'Exporting...' : 'Export Data'}
                </Button>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Account Deletion</Label>
                <p className="text-sm text-muted-foreground">Permanently delete your account and all associated data</p>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Deletion Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-destructive mb-4">Delete Account</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This action cannot be undone. All your data will be permanently deleted.
            </p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="deleteConfirm">Type DELETE to confirm</Label>
                <Input
                  id="deleteConfirm"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleAccountDeletion}
                  disabled={isLoading || deleteConfirmText !== 'DELETE'}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Account'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
