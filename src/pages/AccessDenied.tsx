import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import {
  Shield,
  Mail,
  Phone,
  AlertTriangle,
  Lock,
  Contact,
  ExternalLink,
  LogOut
} from "lucide-react";

const AccessDenied = () => {
  const { user, logout } = useAuth();

  const handleContactSupport = () => {
    // Rolling Radius contact information
    window.open('mailto:support@rollingradius.com?subject=Access Request for Trip Vesta Portal', '_blank');
  };

  const handleCallSupport = () => {
    window.open('tel:+911234567890', '_blank');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
              <Lock className="w-10 h-10 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-destructive mb-2">
            Access Denied
          </CardTitle>
          <p className="text-muted-foreground text-lg">
            You do not have access to the Trip Vesta Investor Portal
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* User Information */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Your Account Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{user?.name || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-medium">+91 {user?.phoneNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{user?.email || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Current Roles:</span>
                <div className="flex gap-1">
                  {user?.roles && user.roles.length > 0 ? (
                    user.roles.map((role, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {role}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="destructive" className="text-xs">No Roles Assigned</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Required Access */}
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              Required Access Roles
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Investor
                </Badge>
                <span className="text-sm text-muted-foreground">- Access to Investment Portal</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  IP Admin
                </Badge>
                <span className="text-sm text-muted-foreground">- Access to Admin Panel</span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Contact className="w-4 h-4" />
              Contact Rolling Radius for Access
            </h3>

            <p className="text-sm text-muted-foreground">
              To gain access to the Trip Vesta Portal, please contact Rolling Radius support team.
              They will review your request and assign the appropriate roles to your account.
            </p>

            {/* Debug: Show all available roles */}
            <div className="bg-muted/30 rounded-lg p-3 text-xs">
              <p className="font-medium mb-2">Available roles in the system:</p>
              <div className="flex flex-wrap gap-1">
                {["Accountant", "Admin", "CSR", "CSR Supervisor", "IP Admin", "Investor", "User"].map((role) => (
                  <Badge key={role} variant="outline" className="text-xs">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Debug: Show localStorage data */}
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-xs">
              <p className="font-medium mb-2 text-red-700 dark:text-red-400">Debug Information:</p>
              <div className="space-y-1 text-red-600 dark:text-red-300">
                <p><strong>Access Token:</strong> {localStorage.getItem('access_token') ? '✅ Present' : '❌ Missing'}</p>
                <p><strong>User Data:</strong> {localStorage.getItem('data') ? '✅ Present' : '❌ Missing'}</p>
                {localStorage.getItem('data') && (
                  <div>
                    <p><strong>Stored User Data:</strong></p>
                    <pre className="bg-red-100 dark:bg-red-900/30 p-2 rounded text-xs overflow-auto">
                      {JSON.stringify(JSON.parse(localStorage.getItem('data') || '{}'), null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Button
                onClick={handleContactSupport}
                className="flex items-center gap-2"
                variant="outline"
              >
                <Mail className="w-4 h-4" />
                Email Support
                <ExternalLink className="w-3 h-3" />
              </Button>

              <Button
                onClick={handleCallSupport}
                className="flex items-center gap-2"
                variant="outline"
              >
                <Phone className="w-4 h-4" />
                Call Support
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>

            <div className="bg-muted/30 rounded-lg p-3 text-sm text-center">
              <p className="text-muted-foreground">
                <strong>Rolling Radius Support</strong><br />
                Email: support@rollingradius.com<br />
                Phone: +91 123 456 7890<br />
                Business Hours: 9:00 AM - 6:00 PM IST
              </p>
            </div>
          </div>

          {/* Logout Option */}
          <div className="pt-4 border-t">
            <Button
              onClick={logout}
              variant="ghost"
              className="w-full flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
              Logout and Try Different Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessDenied;