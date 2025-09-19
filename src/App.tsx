import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { InvestmentSidebar } from "@/components/InvestmentSidebar";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { NotificationBell } from "@/components/NotificationBell";
import { WalletProvider } from "@/contexts/WalletContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";
import Dashboard from "./pages/Dashboard";
import Wallet from "./pages/Wallet";
import Trips from "./pages/Trips";
import AccountLedger from "./pages/History";
import Admin from "./pages/Admin";
import KYC from "./pages/KYC";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <WalletProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="flex min-h-screen w-full bg-background text-foreground">
              <InvestmentSidebar />
              <div className="flex-1 flex flex-col">
                <header className="h-12 flex items-center justify-between border-b bg-background px-4">
                  <h2 className="font-semibold text-lg">Investment Portal</h2>
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
                    <ProfileDropdown />
                  </div>
                </header>
              <main className="flex-1 bg-background">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/wallet" element={<Wallet />} />
                  <Route path="/trips" element={<Trips />} />
                  <Route path="/history" element={<AccountLedger />} />
                  <Route path="/kyc" element={<KYC />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/admin/investors" element={<Admin />} />
                  <Route path="/admin/analytics" element={<Admin />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </WalletProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
