import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Settings,
  FileCheck,
  LogOut,
  Shield,
  Bell,
  CreditCard,
  ChevronDown
} from "lucide-react";
import { KYCStorage } from "@/utils/kycStorage";

interface ProfileDropdownProps {
  userEmail?: string;
  userName?: string;
}

export const ProfileDropdown = ({
  userEmail = "investor@tripvesta.com",
  userName = "John Investor"
}: ProfileDropdownProps) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // Get KYC status
  const kycData = KYCStorage.getKYCData();
  const kycStatus = kycData?.status || 'not_started';
  const completionPercentage = KYCStorage.getCompletionPercentage();

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
        return <Badge className="bg-orange-500 text-white">{completionPercentage}% Complete</Badge>;
      default:
        return <Badge variant="outline">Not Started</Badge>;
    }
  };

  const handleKYCClick = () => {
    setIsOpen(false);
    navigate('/kyc');
  };

  const handleSettingsClick = () => {
    setIsOpen(false);
    navigate('/settings');
  };

  const handleLogout = () => {
    // In a real app, you would clear auth tokens here
    console.log('Logging out...');
    setIsOpen(false);
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name.split(' ').map(part => part.charAt(0)).join('').toUpperCase();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-3 py-2 h-auto hover:bg-gray-100"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src="" alt={userName} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start text-left min-w-0">
            <span className="text-sm font-medium truncate max-w-32">{userName}</span>
            <span className="text-xs text-muted-foreground truncate max-w-32">{userEmail}</span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 p-2">
        <DropdownMenuLabel>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="" alt={userName} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold truncate">{userName}</span>
              <span className="text-sm text-muted-foreground truncate">{userEmail}</span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* KYC Status */}
        <DropdownMenuItem onClick={handleKYCClick} className="cursor-pointer">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <FileCheck className="h-4 w-4" />
              <span>KYC Status</span>
            </div>
            {getKYCBadge()}
          </div>
        </DropdownMenuItem>

        {/* Settings */}
        <DropdownMenuItem onClick={handleSettingsClick} className="cursor-pointer">
          <Settings className="h-4 w-4 mr-2" />
          <span>Account Settings</span>
        </DropdownMenuItem>

        {/* Profile */}
        <DropdownMenuItem className="cursor-pointer">
          <User className="h-4 w-4 mr-2" />
          <span>My Profile</span>
        </DropdownMenuItem>

        {/* Wallet */}
        <DropdownMenuItem onClick={() => { setIsOpen(false); navigate('/wallet'); }} className="cursor-pointer">
          <CreditCard className="h-4 w-4 mr-2" />
          <span>Wallet</span>
        </DropdownMenuItem>

        {/* Notifications */}
        <DropdownMenuItem className="cursor-pointer">
          <Bell className="h-4 w-4 mr-2" />
          <span>Notifications</span>
          <Badge variant="destructive" className="ml-auto text-xs px-1.5 py-0.5">3</Badge>
        </DropdownMenuItem>

        {/* Security */}
        <DropdownMenuItem className="cursor-pointer">
          <Shield className="h-4 w-4 mr-2" />
          <span>Security</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
          <LogOut className="h-4 w-4 mr-2" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};