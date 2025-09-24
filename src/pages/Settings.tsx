import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserProfile } from "@/hooks/useUserProfile";
import { OptimizedImage } from "@/components/OptimizedImage";
import ProfilePicture from "@/components/ProfilePicture";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  User,
  Bell,
  Shield,
  CreditCard,
  FileCheck,
  Smartphone,
  Mail,
  Globe,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Save,
  Trash2,
  Download,
  Upload,
  Edit
} from "lucide-react";
import { KYCStorage } from "@/utils/kycStorage";
import { useTheme } from "@/contexts/ThemeContext";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get KYC status
  const kycData = KYCStorage.getKYCData();
  const kycStatus = kycData?.status || 'not_started';

  // User Profile Hook
  const {
    profile,
    loading,
    error,
    updating,
    updatePersonalInfo,
    updateNotificationPreferences,
    updatePrivacySettings,
    updateProfilePicture,
    refreshProfile
  } = useUserProfile();

  // Form states for editing
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    designation: '',
    street: '',
    city: '',
    state: '',
    pincode: ''
  });

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      setProfileForm({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        designation: profile.designation || '',
        street: profile.address?.street || '',
        city: profile.address?.city || '',
        state: profile.address?.state || '',
        pincode: profile.address?.pincode || ''
      });
    }
  }, [profile]);

  // User Settings State (fallback for non-API settings)
  const [userSettings, setUserSettings] = useState({
    profile: {
      firstName: "John",
      lastName: "Investor",
      email: "investor@tripvesta.com",
      phone: "+91 98765 43210",
      language: "en",
      timezone: "Asia/Kolkata",
      currency: "INR"
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: true,
      investmentUpdates: true,
      marketingEmails: false,
      securityAlerts: true,
      soundEnabled: true
    },
    security: {
      twoFactorEnabled: false,
      biometricEnabled: false,
      sessionTimeout: "30",
      passwordChangeRequired: false,
      loginAlerts: true
    },
    preferences: {
      compactView: false,
      autoLogout: true,
      dataExport: true,
      analyticsOptIn: true
    }
  });

  const [isSaving, setIsSaving] = useState(false);

  // Handle settings update
  const updateSetting = (section: keyof typeof userSettings, key: string, value: any) => {
    setUserSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  // Save settings
  const saveSettings = async () => {
    setIsSaving(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In a real app, save to backend
    localStorage.setItem('user-settings', JSON.stringify(userSettings));

    setIsSaving(false);
    toast({
      title: "Settings Saved",
      description: "Your account settings have been updated successfully.",
    });
  };

  // Export data
  const exportData = () => {
    const data = {
      userSettings,
      kycData,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tripvesta-data-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Data Exported",
      description: "Your account data has been exported successfully.",
    });
  };

  // Delete account
  const deleteAccount = () => {
    toast({
      title: "Delete Account",
      description: "Account deletion would be handled here with proper confirmation flow.",
      variant: "destructive",
    });
  };

  // API-based handlers for user profile management
  const handleSaveProfile = async () => {
    if (!profile) return;

    try {
      console.log('Updating profile with _etag:', profile.etag);

      const result = await updatePersonalInfo({
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        phone: profileForm.phone,
        designation: profileForm.designation,
        address: {
          street: profileForm.street,
          city: profileForm.city,
          state: profileForm.state,
          pincode: profileForm.pincode
        }
      });

      console.log('Profile update result:', result);

      setEditingProfile(false);
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully. New _etag cached for future updates.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: error || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleProfilePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Uploading new profile picture...');
      const fileId = await updateProfilePicture(file);
      console.log('Profile picture updated with fileId:', fileId);
      console.log('Updated profile state:', profile);

      toast({
        title: "Profile Picture Updated",
        description: "Your profile picture has been updated successfully in all locations.",
      });
    } catch (err) {
      console.error('Profile picture update error:', err);
      toast({
        title: "Error",
        description: "Failed to update profile picture. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNotificationChange = async (key: string, value: boolean) => {
    try {
      const newNotifications = {
        ...profile?.settings?.notifications,
        [key]: value
      };

      await updateNotificationPreferences(newNotifications);
      toast({
        title: "Notifications Updated",
        description: "Your notification preferences have been updated.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update notifications. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePrivacyChange = async (key: string, value: any) => {
    try {
      const newPrivacy = {
        ...profile?.settings?.privacy,
        [key]: value
      };

      await updatePrivacySettings(newPrivacy);
      toast({
        title: "Privacy Settings Updated",
        description: "Your privacy settings have been updated.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update privacy settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get KYC status badge
  const getKYCBadge = () => {
    switch (kycStatus) {
      case 'approved':
        return <Badge className="bg-green-500 text-white">Verified</Badge>;
      case 'under_review':
        return <Badge className="bg-yellow-500 text-white">Under Review</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500 text-white">Rejected</Badge>;
      case 'submitted':
        return <Badge className="bg-blue-500 text-white">Submitted</Badge>;
      case 'in_progress':
        return <Badge className="bg-orange-500 text-white">In Progress</Badge>;
      default:
        return <Badge variant="outline">Not Started</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl bg-background text-foreground min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences and security settings</p>
        </div>
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="space-y-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your personal information and account details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={refreshProfile} variant="outline">
                  Retry
                </Button>
              </div>
            ) : (
              <>
                {/* Profile Picture Section */}
                <div className="flex items-center gap-4 pb-4 border-b">
                  <div className="relative">
                    <ProfilePicture
                      profilePic={profile?.profilePicture}
                      userName={profile?.fullName || 'User'}
                      size="xl"
                      className="w-20 h-20"
                      refreshKey={profile?.updated || profile?.etag}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 rounded-full p-2"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={updating}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{profile?.fullName || 'Loading...'}</h3>
                    <p className="text-sm text-muted-foreground">{profile?.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {profile?.primaryRole || 'User'}
                      </Badge>
                      {profile?.verification?.emailVerified && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfilePictureChange}
                  />
                </div>

                {/* Profile Form */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Personal Information</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingProfile(!editingProfile)}
                    >
                      {editingProfile ? 'Cancel' : 'Edit'}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={editingProfile ? profileForm.firstName : profile?.firstName || ''}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
                        disabled={!editingProfile}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={editingProfile ? profileForm.lastName : profile?.lastName || ''}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
                        disabled={!editingProfile}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile?.email || ''}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={editingProfile ? profileForm.phone : profile?.phone || ''}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={!editingProfile}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="designation">Designation</Label>
                    <Input
                      id="designation"
                      value={editingProfile ? profileForm.designation : profile?.designation || ''}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, designation: e.target.value }))}
                      disabled={!editingProfile}
                    />
                  </div>

                  {/* Address Section */}
                  {editingProfile && (
                    <div className="space-y-4 border-t pt-4">
                      <h5 className="font-medium text-sm">Address Information</h5>
                      <div className="space-y-2">
                        <Label htmlFor="street">Street Address</Label>
                        <Input
                          id="street"
                          value={profileForm.street}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, street: e.target.value }))}
                          placeholder="Enter street address"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={profileForm.city}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, city: e.target.value }))}
                            placeholder="City"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            value={profileForm.state}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, state: e.target.value }))}
                            placeholder="State"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pincode">PIN Code</Label>
                          <Input
                            id="pincode"
                            value={profileForm.pincode}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, pincode: e.target.value }))}
                            placeholder="PIN Code"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {editingProfile && (
                    <div className="flex gap-2 pt-4 border-t">
                      <Button onClick={handleSaveProfile} disabled={updating}>
                        {updating ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingProfile(false);
                          // Reset form to current profile data
                          if (profile) {
                            setProfileForm({
                              firstName: profile.firstName || '',
                              lastName: profile.lastName || '',
                              phone: profile.phone || '',
                              designation: profile.designation || '',
                              street: profile.address?.street || '',
                              city: profile.address?.city || '',
                              state: profile.address?.state || '',
                              pincode: profile.address?.pincode || ''
                            });
                          }
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}

          </CardContent>
        </Card>

        {/* KYC Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                KYC Verification
              </div>
              {getKYCBadge()}
            </CardTitle>
            <CardDescription>
              Complete your KYC verification to unlock all investment features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">
                  {kycStatus === 'approved'
                    ? 'Your KYC is verified and approved. You can invest in all available trips.'
                    : kycStatus === 'under_review'
                    ? 'Your KYC is currently being reviewed. This usually takes 24-48 hours.'
                    : 'Complete your KYC verification to start investing with full access.'
                  }
                </p>
                {kycData && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Completion: {KYCStorage.getCompletionPercentage()}%
                  </p>
                )}
              </div>
              <Button
                onClick={() => navigate('/kyc')}
                variant={kycStatus === 'approved' ? 'outline' : 'default'}
                size="sm"
              >
                {kycStatus === 'approved' ? 'View KYC' : 'Complete KYC'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Choose how you want to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="email-notifications" className="text-sm font-medium">
                      Email Notifications
                    </Label>
                    <p className="text-xs text-muted-foreground">Receive email updates about your investments</p>
                  </div>
                </div>
                <Switch
                  id="email-notifications"
                  checked={userSettings.notifications.emailNotifications}
                  onCheckedChange={(checked) => updateSetting('notifications', 'emailNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="sms-notifications" className="text-sm font-medium">
                      SMS Notifications
                    </Label>
                    <p className="text-xs text-muted-foreground">Receive SMS updates for important events</p>
                  </div>
                </div>
                <Switch
                  id="sms-notifications"
                  checked={userSettings.notifications.smsNotifications}
                  onCheckedChange={(checked) => updateSetting('notifications', 'smsNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="push-notifications" className="text-sm font-medium">
                      Push Notifications
                    </Label>
                    <p className="text-xs text-muted-foreground">Receive browser push notifications</p>
                  </div>
                </div>
                <Switch
                  id="push-notifications"
                  checked={userSettings.notifications.pushNotifications}
                  onCheckedChange={(checked) => updateSetting('notifications', 'pushNotifications', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="investment-updates" className="text-sm font-medium">
                      Investment Updates
                    </Label>
                    <p className="text-xs text-muted-foreground">Updates about your active investments</p>
                  </div>
                </div>
                <Switch
                  id="investment-updates"
                  checked={userSettings.notifications.investmentUpdates}
                  onCheckedChange={(checked) => updateSetting('notifications', 'investmentUpdates', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="security-alerts" className="text-sm font-medium">
                      Security Alerts
                    </Label>
                    <p className="text-xs text-muted-foreground">Important security notifications</p>
                  </div>
                </div>
                <Switch
                  id="security-alerts"
                  checked={userSettings.notifications.securityAlerts}
                  onCheckedChange={(checked) => updateSetting('notifications', 'securityAlerts', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {userSettings.notifications.soundEnabled ?
                    <Volume2 className="h-4 w-4 text-muted-foreground" /> :
                    <VolumeX className="h-4 w-4 text-muted-foreground" />
                  }
                  <div>
                    <Label htmlFor="sound-enabled" className="text-sm font-medium">
                      Notification Sounds
                    </Label>
                    <p className="text-xs text-muted-foreground">Play sounds for notifications</p>
                  </div>
                </div>
                <Switch
                  id="sound-enabled"
                  checked={userSettings.notifications.soundEnabled}
                  onCheckedChange={(checked) => updateSetting('notifications', 'soundEnabled', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={saveSettings} disabled={isSaving} size="lg">
            {isSaving ? (
              <>
                <Save className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;