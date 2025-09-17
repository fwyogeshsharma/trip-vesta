import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { InvestmentSidebar } from "@/components/InvestmentSidebar";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { WalletProvider } from "@/contexts/WalletContext";
import Dashboard from "./pages/Dashboard";
import Wallet from "./pages/Wallet";
import Trips from "./pages/Trips";
import History from "./pages/History";
import Admin from "./pages/Admin";
import KYC from "./pages/KYC";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <WalletProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              <InvestmentSidebar />
              <div className="flex-1 flex flex-col">
                <header className="h-12 flex items-center justify-between border-b px-4">
                  <h2 className="font-semibold text-lg">Investment Portal</h2>
                  <ProfileDropdown />
                </header>
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/wallet" element={<Wallet />} />
                    <Route path="/trips" element={<Trips />} />
                    <Route path="/history" element={<History />} />
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
  </QueryClientProvider>
);

export default App;
