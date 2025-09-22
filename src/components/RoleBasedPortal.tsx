import React from "react";
import { Routes, Route } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { InvestmentSidebar } from "@/components/InvestmentSidebar";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { NotificationBell } from "@/components/NotificationBell";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";

// Import pages
import Dashboard from "@/pages/Dashboard";
import Wallet from "@/pages/Wallet";
import Trips from "@/pages/Trips";
import AccountLedger from "@/pages/History";
import Admin from "@/pages/Admin";
import KYC from "@/pages/KYC";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import AccessDialog from "@/components/AccessDialog";

const RoleBasedPortal = () => {
  const { theme, toggleTheme } = useTheme();
  const { hasInvestorAccess, hasAdminAccess, hasIPAdminAccess, user, debugUserRoles } = useAuth();

  // Debug user roles on component mount
  React.useEffect(() => {
    console.log('RoleBasedPortal - User changed:', user);
    console.log('RoleBasedPortal - User roles:', user?.roles);
    debugUserRoles();
  }, [user]);

  // Simple access check - just look for "Investor" or "IP Admin" in roles array
  const hasInvestor = hasInvestorAccess();
  const hasIPAdmin = hasIPAdminAccess();

  console.log('RoleBasedPortal - Access Check Results:');
  console.log('  hasInvestor:', hasInvestor);
  console.log('  hasIPAdmin:', hasIPAdmin);
  console.log('  Will show access dialog:', !hasInvestor && !hasIPAdmin);

  // If user has neither role, show access dialog
  if (!hasInvestor && !hasIPAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <AccessDialog />
      </div>
    );
  }

  const getPortalTitle = () => {
    if (hasInvestor && hasIPAdmin) {
      return "Trip Vesta - Investment & Admin Portal";
    } else if (hasIPAdmin) {
      return "Trip Vesta - Admin Portal";
    } else {
      return "Trip Vesta - Investment Portal";
    }
  };

  const getInvestorRoutes = () => {
    if (!hasInvestor) return null;

    return (
      <>
        <Route path="/" element={<Dashboard />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/trips" element={<Trips />} />
        <Route path="/history" element={<AccountLedger />} />
        <Route path="/kyc" element={<KYC />} />
        <Route path="/settings" element={<Settings />} />
      </>
    );
  };

  const getAdminRoutes = () => {
    if (!hasIPAdminAccess()) return null;

    return (
      <>
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/investors" element={<Admin />} />
        <Route path="/admin/analytics" element={<Admin />} />
      </>
    );
  };

  const getDefaultRoute = () => {
    // If user has both roles, show dashboard by default
    if (hasInvestor && hasIPAdmin) {
      return <Route path="/" element={<Dashboard />} />;
    }
    // If user only has admin access, redirect to admin by default
    else if (hasIPAdminAccess() && !hasInvestor) {
      return <Route path="/" element={<Admin />} />;
    }
    // If user only has investor access, show dashboard
    else if (hasInvestor) {
      return <Route path="/" element={<Dashboard />} />;
    }

    // Should not reach here due to access check above
    return <Route path="/" element={<Dashboard />} />;
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <InvestmentSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center justify-between border-b bg-background px-4">
            <h2 className="font-semibold text-lg">{getPortalTitle()}</h2>
            <div className="flex items-center gap-2">
              <NotificationBell />
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="h-8 w-8 p-0"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
              <ProfileDropdown
                userEmail={user?.email}
                userName={user?.name}
              />
            </div>
          </header>
          <main className="flex-1 bg-background">
            <Routes>
              {getDefaultRoute()}
              {getInvestorRoutes()}
              {getAdminRoutes()}
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default RoleBasedPortal;