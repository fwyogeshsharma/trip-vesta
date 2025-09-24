import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const AccessDialog = () => {
  const [open, setOpen] = useState(true);
  const { logout } = useAuth();

  const handleTryAgain = () => {
    logout();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Access Required</DialogTitle>
          <DialogDescription>
            You need "Lender" or "IP Admin" role to access Trip Vesta Portal.
            Please contact support for access.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-start">
          <Button onClick={handleTryAgain} variant="default">
            Try Different Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AccessDialog;