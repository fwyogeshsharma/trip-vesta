import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Upload
} from "lucide-react";
import { KYCStorage } from "@/utils/kycStorage";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get KYC status
  const kycData = KYCStorage.getKYCData();
  const kycStatus = kycData?.status || 'not_started';

  // User Settings State
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
      darkMode: false,
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
    <div className="container mx-auto p-6 max-w-4xl">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={userSettings.profile.firstName}
                  onChange={(e) => updateSetting('profile', 'firstName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={userSettings.profile.lastName}
                  onChange={(e) => updateSetting('profile', 'lastName', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={userSettings.profile.email}
                  onChange={(e) => updateSetting('profile', 'email', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={userSettings.profile.phone}
                  onChange={(e) => updateSetting('profile', 'phone', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  value={userSettings.profile.language}
                  onValueChange={(value) => updateSetting('profile', 'language', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                    <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
                    <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={userSettings.profile.timezone}
                  onValueChange={(value) => updateSetting('profile', 'timezone', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                    <SelectItem value="Asia/Dubai">Asia/Dubai (GST)</SelectItem>
                    <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={userSettings.profile.currency}
                  onValueChange={(value) => updateSetting('profile', 'currency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
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

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Settings
            </CardTitle>
            <CardDescription>
              Manage your account security and privacy settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="two-factor" className="text-sm font-medium">
                  Two-Factor Authentication
                </Label>
                <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
              </div>
              <Switch
                id="two-factor"
                checked={userSettings.security.twoFactorEnabled}
                onCheckedChange={(checked) => updateSetting('security', 'twoFactorEnabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="biometric" className="text-sm font-medium">
                  Biometric Authentication
                </Label>
                <p className="text-xs text-muted-foreground">Use fingerprint or face recognition</p>
              </div>
              <Switch
                id="biometric"
                checked={userSettings.security.biometricEnabled}
                onCheckedChange={(checked) => updateSetting('security', 'biometricEnabled', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
              <Select
                value={userSettings.security.sessionTimeout}
                onValueChange={(value) => updateSetting('security', 'sessionTimeout', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="login-alerts" className="text-sm font-medium">
                  Login Alerts
                </Label>
                <p className="text-xs text-muted-foreground">Get notified of new device logins</p>
              </div>
              <Switch
                id="login-alerts"
                checked={userSettings.security.loginAlerts}
                onCheckedChange={(checked) => updateSetting('security', 'loginAlerts', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* App Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              App Preferences
            </CardTitle>
            <CardDescription>
              Customize your app experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {userSettings.preferences.darkMode ?
                  <Moon className="h-4 w-4 text-muted-foreground" /> :
                  <Sun className="h-4 w-4 text-muted-foreground" />
                }
                <div>
                  <Label htmlFor="dark-mode" className="text-sm font-medium">
                    Dark Mode
                  </Label>
                  <p className="text-xs text-muted-foreground">Use dark theme for the interface</p>
                </div>
              </div>
              <Switch
                id="dark-mode"
                checked={userSettings.preferences.darkMode}
                onCheckedChange={(checked) => updateSetting('preferences', 'darkMode', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label htmlFor="compact-view" className="text-sm font-medium">
                    Compact View
                  </Label>
                  <p className="text-xs text-muted-foreground">Show more content in less space</p>
                </div>
              </div>
              <Switch
                id="compact-view"
                checked={userSettings.preferences.compactView}
                onCheckedChange={(checked) => updateSetting('preferences', 'compactView', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-logout" className="text-sm font-medium">
                  Auto Logout
                </Label>
                <p className="text-xs text-muted-foreground">Automatically logout after inactivity</p>
              </div>
              <Switch
                id="auto-logout"
                checked={userSettings.preferences.autoLogout}
                onCheckedChange={(checked) => updateSetting('preferences', 'autoLogout', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="analytics-opt-in" className="text-sm font-medium">
                  Analytics Opt-in
                </Label>
                <p className="text-xs text-muted-foreground">Help improve the app by sharing usage data</p>
              </div>
              <Switch
                id="analytics-opt-in"
                checked={userSettings.preferences.analyticsOptIn}
                onCheckedChange={(checked) => updateSetting('preferences', 'analyticsOptIn', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Data Management
            </CardTitle>
            <CardDescription>
              Manage your account data and privacy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Export Account Data</Label>
                <p className="text-xs text-muted-foreground">Download all your account data in JSON format</p>
              </div>
              <Button variant="outline" size="sm" onClick={exportData}>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium text-red-600">Delete Account</Label>
                <p className="text-xs text-muted-foreground">Permanently delete your account and all associated data</p>
              </div>
              <Button variant="destructive" size="sm" onClick={deleteAccount}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
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