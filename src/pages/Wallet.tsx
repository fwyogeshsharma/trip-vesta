import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

// API configuration
const API_BASE_URL = 'https://35.244.19.78:8042';
import {
  Wallet as WalletIcon,
  CreditCard,
  Plus,
  Minus,
  TrendingUp,
  Building,
  Shield,
  Edit,
  X,
  Loader2,
  Flag,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/contexts/WalletContext";
import { useAuth } from "@/contexts/AuthContext";
import { getAuthToken } from "@/services/authService";
import { walletSyncService } from "@/services/walletSyncService";
import { useBackgroundSync } from "@/hooks/useBackgroundSync";
import DatabaseViewer from "@/components/DatabaseViewer";
import FinancialTransactionsTable from "@/components/FinancialTransactionsTable";

// Razorpay integration removed - users directed to production for payments

const Wallet = () => {
  const { toast } = useToast();
  const { walletData, addToBalance, withdrawFromBalance, loadFromDatabase, isLoading } = useWallet();
  const { user } = useAuth();
  const { syncStatus, isManualSyncing, triggerManualSync } = useBackgroundSync();
  const [addAmount, setAddAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  // Form states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<number | null>(null);
  const [investmentPermission, setInvestmentPermission] = useState(true);


  // Add account form
  const [newAccountData, setNewAccountData] = useState({
    accountHolderName: "",
    bank: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
    bankIdentity: "",
    type: "Checking"
  });

  // File upload states
  const [accountIdentityFile, setAccountIdentityFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);

  // Edit account form
  const [editAccountData, setEditAccountData] = useState({
    bank: "",
    accountNumber: "",
    type: "Checking"
  });

  // Dynamic wallet data - now using context
  // const [walletData, setWalletData] = useState({
  //   balance: 1307250.00,
  //   totalInvested: 3754090.00,
  //   totalWithdrawn: 705500.00,
  //   profitEarned: 562740.00
  // });

  const [bankAccounts, setBankAccounts] = useState([
    {
      id: 1,
      bank: "State Bank of India",
      accountNumber: "****1234",
      type: "Checking",
      verified: true,
      active: true
    },
    {
      id: 2,
      bank: "HDFC Bank",
      accountNumber: "****5678",
      type: "Savings",
      verified: true,
      active: false
    },
    {
      id: 3,
      bank: "Chase Bank",
      accountNumber: "****3456",
      type: "Business",
      verified: true,
      active: false
    },
    {
      id: 4,
      bank: "Bank of America",
      accountNumber: "****7890",
      type: "Checking",
      verified: true,
      active: false
    }
  ]);

  // Fetch existing bank accounts from API
  const fetchBankAccounts = async () => {
    if (!user) return;

    setIsLoadingAccounts(true);
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const companyId = user?.company_id || "62d66794e54f47829a886a1d";
      const whereClause = encodeURIComponent(JSON.stringify({ "created_by_company": companyId }));
      const sortClause = encodeURIComponent(JSON.stringify([["_created", -1]]));

      const url = `${API_BASE_URL}/banking_details?where=${whereClause}&max_results=100&sort=${sortClause}`;

      console.log("Fetching bank accounts from:", url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch bank accounts: ${response.status}`);
      }

      const result = await response.json();
      console.log("Bank accounts fetched:", result);

      // Transform API data to match our UI format
      const transformedAccounts = result._items?.map((account: any, index: number) => ({
        id: account._id || index + 1,
        accountHolderName: account.beneficiary_name,
        bank: account.bank_name,
        accountNumber: `****${account.account_number?.slice(-4) || "****"}`,
        fullAccountNumber: account.account_number, // Store full number for editing
        ifscCode: account.ifsc_code,
        bankIdentity: account.banking_detail_type,
        accountIdentityId: account.account_identity,
        type: account.account_type || "Savings", // Default if not specified
        verified: account.is_verified || false,
        active: account.is_active || false,
        apiId: account._id,
        createdDate: account._created
      })) || [];

      setBankAccounts(transformedAccounts);

      // Sync all accounts to local database in background
      if (transformedAccounts.length > 0) {
        try {
          await walletSyncService.syncAllBankAccountsToLocal(result._items || []);
          console.log('All bank accounts synced to local database');
        } catch (syncError) {
          console.error('Error syncing bank accounts to local database:', syncError);
          // Continue even if local sync fails
        }
      }

      // If no accounts are active and we have accounts, set the first one as active
      if (transformedAccounts.length > 0 && !transformedAccounts.some((acc: any) => acc.active)) {
        const updatedAccounts = transformedAccounts.map((acc: any, index: number) => ({
          ...acc,
          active: index === 0
        }));
        setBankAccounts(updatedAccounts);
      }

    } catch (error: any) {
      console.error("Failed to fetch bank accounts:", error);
      toast({
        title: "Failed to Load Accounts",
        description: error.message || "Could not load your bank accounts. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  // Load bank accounts when component mounts or user changes
  useEffect(() => {
    if (user) {
      fetchBankAccounts();

      // Sync current wallet data to local database
      const syncWalletData = async () => {
        try {
          await walletSyncService.syncWalletDataToLocal(user.id || user._id || 'current_user', {
            balance: walletData.balance,
            totalInvested: walletData.totalInvested,
            totalWithdrawn: walletData.totalWithdrawn,
            profitEarned: walletData.profitEarned
          });
        } catch (error) {
          console.error('Error syncing wallet data on mount:', error);
        }
      };

      syncWalletData();
    }
  }, [user, walletData]);

  // Handle payment return from payment gateway
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const orderId = urlParams.get('order_id');
    const transactionId = urlParams.get('transaction_id');
    const amount = urlParams.get('amount');
    const status = urlParams.get('status');

    // Handle various return URL formats from payment gateway
    if ((paymentStatus === 'success' || status === 'success' || status === 'SUCCESS') && (orderId || transactionId)) {
      handlePaymentReturn(orderId || transactionId || '', {
        amount: amount ? parseFloat(amount) : undefined,
        status: status || paymentStatus,
        transactionId: transactionId
      });
    } else if (orderId || transactionId) {
      // Check if we have a pending payment even without explicit success parameter
      const pendingPaymentStr = localStorage.getItem('pendingPayment');
      if (pendingPaymentStr) {
        handlePaymentReturn(orderId || transactionId || '', {
          amount: amount ? parseFloat(amount) : undefined,
          status: status || 'unknown',
          transactionId: transactionId
        });
      }
    } else {
      // Check for any pending payment even without URL parameters (in case user was logged out and back in)
      const pendingPaymentStr = localStorage.getItem('pendingPayment');
      if (pendingPaymentStr) {
        try {
          const pendingPayment = JSON.parse(pendingPaymentStr);
          if (pendingPayment.orderId) {
            console.log('Found pending payment without URL params, processing...', pendingPayment);
            handlePaymentReturn(pendingPayment.orderId, {
              amount: pendingPayment.amount,
              status: 'success', // Assume success if we have pending payment data
              transactionId: pendingPayment.paymentId || pendingPayment.orderId
            });
          }
        } catch (error) {
          console.error('Error processing pending payment from localStorage:', error);
          localStorage.removeItem('pendingPayment'); // Clean up invalid data
        }
      }
    }
  }, []);

  // Handle payment return from payment gateway
  const handlePaymentReturn = async (
    orderId: string,
    paymentDetails?: {
      amount?: number;
      status?: string;
      transactionId?: string;
    }
  ) => {
    console.log('Processing payment return:', { orderId, paymentDetails });

    try {
      const pendingPaymentStr = localStorage.getItem('pendingPayment');
      let pendingPayment = null;

      if (pendingPaymentStr) {
        pendingPayment = JSON.parse(pendingPaymentStr);
      }

      console.log('Pending payment:', pendingPayment);

      const userId = user?.id || user?._id || 'current_user';
      const currentBalance = walletData.balance;

      // Determine amount - use from URL params, pending payment, or prompt user
      let amount = paymentDetails?.amount || (pendingPayment?.amount);

      if (!amount) {
        console.warn('No amount found in payment return, this might indicate an issue');
        // You might want to call your API to verify the payment amount
        return;
      }

      // Determine if payment was successful
      const isSuccessful = paymentDetails?.status?.toLowerCase() === 'success' ||
                          paymentDetails?.status?.toLowerCase() === 'completed' ||
                          !paymentDetails?.status; // Default to success if no status provided

      if (isSuccessful) {
        // Add funds to wallet
        addToBalance(amount);

        // Record successful transaction with proper transaction ID
        const transactionId = paymentDetails?.transactionId ||
                             pendingPayment?.paymentId ||
                             pendingPayment?.orderId ||
                             orderId;

        await walletSyncService.recordWalletTransaction(
          userId,
          'ADD_FUNDS',
          amount,
          currentBalance,
          currentBalance + amount,
          `Funds added successfully via payment gateway - ₹${amount}`,
          undefined, // No specific bank account for online payments
          transactionId
        );

        // Reload wallet data from database to show updated balance
        await loadFromDatabase();

        toast({
          title: "Payment Successful!",
          description: `₹${amount.toLocaleString()} has been added to your wallet`,
        });

        console.log('Payment processed successfully:', {
          orderId,
          amount,
          transactionId,
          newBalance: currentBalance + amount
        });
      } else {
        toast({
          title: "Payment Failed",
          description: `Payment was not successful. Status: ${paymentDetails?.status || 'Unknown'}`,
          variant: "destructive"
        });
      }

      // Clear pending payment
      localStorage.removeItem('pendingPayment');

      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);

    } catch (error) {
      console.error('Error handling payment return:', error);

      toast({
        title: "Payment Processing Error",
        description: "There was an issue processing your payment. Please check your wallet balance or contact support.",
        variant: "destructive"
      });

      // Clear pending payment even on error
      localStorage.removeItem('pendingPayment');

      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  // Removed Razorpay script loading - directing users to production

  const handleSetActiveAccount = async (accountId: number) => {
    try {
      const userId = user?.id || user?._id || 'current_user';

      // Update in local database
      await walletSyncService.setActiveAccount(accountId, userId);

      // Update local state
      setBankAccounts(prev =>
        prev.map(account => ({
          ...account,
          active: account.id === accountId
        }))
      );

      const selectedAccount = bankAccounts.find(acc => acc.id === accountId);
      toast({
        title: "Active Account Changed",
        description: `${selectedAccount?.bank} is now your active account for transactions`,
      });
    } catch (error) {
      console.error('Error setting active account:', error);
      toast({
        title: "Error",
        description: "Failed to set active account. Please try again.",
        variant: "destructive"
      });
    }
  };


  // Payment request handler
  const handleAddFunds = async () => {
    if (!addAmount || parseFloat(addAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to add",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to add funds to your wallet",
        variant: "destructive"
      });
      return;
    }

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const payload = {
        amount: parseFloat(addAmount),
        mode_of_payment: "Online",
        order_note: "Lender Investment",
        paying_user: "6257f1d75b42235a2ae4ab34",
        product_or_service: "68d3f6fb262b4bc5964b6a68",
        receiving_user: "6257f1d75b42235a2ae4ab34"
      };

      console.log('Creating payment request with payload:', payload);

      const response = await fetch(`${API_BASE_URL}/payment_request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Payment API error (${response.status}):`, errorText);
        throw new Error(`Payment API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Payment request result:', result);
      console.log('Full response structure:', JSON.stringify(result, null, 2));

      // Check for payment link in response and redirect to Cashfree
      const paymentLink = result.payment_link ||
                         result.data?.payment_link ||
                         result.paymentLink ||
                         result.data?.paymentLink ||
                         result.payment_url ||
                         result.data?.payment_url;

      if (paymentLink) {
        // Store pending payment information for later processing
        const pendingPayment = {
          amount: parseFloat(addAmount),
          orderId: result.orderId || result.order_id || result.id || `payment_${Date.now()}`,
          paymentId: result.paymentId || result.payment_id || result.id,
          timestamp: new Date().toISOString(),
          userId: user?.id || user?._id || 'current_user'
        };
        localStorage.setItem('pendingPayment', JSON.stringify(pendingPayment));

        toast({
          title: "Redirecting to Payment",
          description: "You will be redirected to complete the payment",
        });

        // Redirect to Cashfree payment gateway
        setTimeout(() => {
          window.location.href = paymentLink;
        }, 1000);
      } else {
        console.warn('No payment link found in response:', result);
        toast({
          title: "Payment Request Created",
          description: "Payment request created successfully",
        });
      }

    } catch (error) {
      console.error('Payment request failed:', error);
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : 'Failed to create payment request',
        variant: "destructive"
      });
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to withdraw",
        variant: "destructive"
      });
      return;
    }

    const amountToWithdraw = parseFloat(withdrawAmount);
    const currentBalance = walletData.balance;
    const userId = user?.id || user?._id || 'current_user';

    const success = withdrawFromBalance(amountToWithdraw);

    if (success) {
      // Record withdrawal transaction in local database
      try {
        const activeAccount = bankAccounts.find(acc => acc.active);
        await walletSyncService.recordWalletTransaction(
          userId,
          'WITHDRAW',
          amountToWithdraw,
          currentBalance,
          currentBalance - amountToWithdraw,
          `Withdrawal to ${activeAccount?.bank || 'bank account'} - ₹${amountToWithdraw}`,
          activeAccount?.id,
          `withdraw_${Date.now()}`
        );
        console.log('Withdrawal transaction recorded');
      } catch (dbError) {
        console.error('Error recording withdrawal transaction to local database:', dbError);
        // Continue even if local recording fails
      }

      toast({
        title: "Withdrawal Processed",
        description: `₹${amountToWithdraw.toLocaleString()} has been withdrawn from your wallet`,
      });
      setWithdrawAmount("");
    } else {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this withdrawal",
        variant: "destructive"
      });
    }
  };

  // Upload file and get account identity ID
  const uploadAccountIdentityFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      console.log("Uploading file to /files endpoint:", file.name, file.type, file.size);

      // Upload file to /files endpoint
      const response = await fetch(`${API_BASE_URL}/files`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("File upload failed:", response.status, errorText);
        throw new Error(`File upload failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log("File upload successful:", result);

      // Return the file ID from the response
      return result._id || result.id || result.file_id;
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  };

  // Submit banking details to API
  const submitBankingDetails = async (accountIdentityId: string) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const bankingDetailsPayload = {
        beneficiary_name: newAccountData.accountHolderName,
        account_number: newAccountData.accountNumber,
        ifsc_code: newAccountData.ifscCode.toUpperCase(),
        bank_name: newAccountData.bank,
        banking_detail_type: "Bank",
        account_identity: accountIdentityId,
        created_by_company: user?.company_id || "62d66794e54f47829a886a1d" // Use user's company or default
      };

      console.log("Submitting banking details:", bankingDetailsPayload);

      const response = await fetch(`${API_BASE_URL}/banking_details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bankingDetailsPayload)
      });

      if (!response.ok) {
        throw new Error(`Banking details submission failed: ${response.status}`);
      }

      const result = await response.json();
      console.log("Banking details submitted successfully:", result);
      return result;
    } catch (error) {
      console.error('Banking details submission failed:', error);
      throw error;
    }
  };

  const handleAddAccount = async () => {
    // Validate all required fields
    if (!newAccountData.accountHolderName || !newAccountData.bank || !newAccountData.accountNumber ||
        !newAccountData.confirmAccountNumber || !newAccountData.ifscCode || !accountIdentityFile) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and upload account identity image",
        variant: "destructive"
      });
      return;
    }

    // Validate that uploaded file is an image
    if (accountIdentityFile && !accountIdentityFile.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image file (JPG, PNG, GIF, WebP) for account identity",
        variant: "destructive"
      });
      return;
    }

    // Validate image file size (max 10MB)
    if (accountIdentityFile && accountIdentityFile.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Image size must be less than 10MB",
        variant: "destructive"
      });
      return;
    }

    // Validate account number confirmation
    if (newAccountData.accountNumber !== newAccountData.confirmAccountNumber) {
      toast({
        title: "Account Number Mismatch",
        description: "Account number and confirm account number must match",
        variant: "destructive"
      });
      return;
    }

    // Validate IFSC code format (basic validation)
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(newAccountData.ifscCode.toUpperCase())) {
      toast({
        title: "Invalid IFSC Code",
        description: "Please enter a valid IFSC code (e.g., SBIN0123456)",
        variant: "destructive"
      });
      return;
    }

    // Check if user is logged in
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to add bank account",
        variant: "destructive"
      });
      return;
    }

    setIsAddingAccount(true);

    try {
      // Step 1: Upload account identity image file
      toast({
        title: "Uploading Image",
        description: "Uploading account identity image to database...",
      });

      const accountIdentityId = await uploadAccountIdentityFile(accountIdentityFile);

      // Step 2: Submit banking details
      toast({
        title: "Submitting Details",
        description: "Submitting banking details...",
      });

      const apiResult = await submitBankingDetails(accountIdentityId);

      // Step 3: Sync the new account to local database
      try {
        await walletSyncService.syncBankAccountToLocal(apiResult);
        console.log('Bank account synced to local database');
      } catch (syncError) {
        console.error('Error syncing bank account to local database:', syncError);
        // Continue even if local sync fails
      }

      // Step 4: Refresh bank accounts from API to get the latest data
      await fetchBankAccounts();

      // Reset form
      setNewAccountData({
        accountHolderName: "",
        bank: "",
        accountNumber: "",
        confirmAccountNumber: "",
        ifscCode: "",
        bankIdentity: "",
        type: "Checking"
      });
      setAccountIdentityFile(null);
      setImagePreview(null);
      setIsAddDialogOpen(false);

      toast({
        title: "Bank Account Added Successfully",
        description: `${newAccountData.bank} account for ${newAccountData.accountHolderName} has been added and submitted for verification`,
      });

    } catch (error: any) {
      console.error("Add account failed:", error);

      toast({
        title: "Failed to Add Account",
        description: error.message || "Failed to add bank account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAddingAccount(false);
    }
  };

  const handleEditAccount = () => {
    if (!editAccountData.bank || !editAccountData.accountNumber) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setBankAccounts(prev =>
      prev.map(account =>
        account.id === editingAccount
          ? {
              ...account,
              bank: editAccountData.bank,
              accountNumber: `****${editAccountData.accountNumber.slice(-4)}`,
              type: editAccountData.type
            }
          : account
      )
    );

    setEditAccountData({ bank: "", accountNumber: "", type: "Checking" });
    setIsEditDialogOpen(false);
    setEditingAccount(null);

    toast({
      title: "Account Updated",
      description: "Bank account details have been updated successfully",
    });
  };

  const handleOpenEditDialog = (accountId: number) => {
    const account = bankAccounts.find(acc => acc.id === accountId);
    if (account) {
      setEditAccountData({
        bank: account.bank,
        accountNumber: account.accountNumber.replace("****", ""),
        type: account.type
      });
      setEditingAccount(accountId);
      setIsEditDialogOpen(true);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6 bg-background text-foreground">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{user?.name || "User"}'s Wallet</h1>
        <div className="flex items-center space-x-4">
          {/* Sync Status and Manual Sync Button */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className={`h-2 w-2 rounded-full ${syncStatus.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-xs text-muted-foreground">
                {syncStatus.isActive ? 'Auto-sync ON' : 'Auto-sync OFF'}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={triggerManualSync}
              disabled={isManualSyncing || !syncStatus.canManualSync}
              className="h-8"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isManualSyncing ? 'animate-spin' : ''}`} />
              {isManualSyncing ? 'Syncing...' : 'Sync'}
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-success" />
            <span className="text-sm text-muted-foreground">Secure</span>
          </div>
        </div>
      </div>

      {/* Wallet Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <WalletIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{walletData.balance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Real-time balance from local database
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{walletData.totalInvested.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Withdrawn</CardTitle>
            <Minus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{walletData.totalWithdrawn.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Earned</CardTitle>
            <Plus className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">₹{walletData.profitEarned.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="manage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="manage">Manage Funds</TabsTrigger>
          <TabsTrigger value="accounts">Bank Accounts</TabsTrigger>
          <TabsTrigger value="transactions">Financial Transactions</TabsTrigger>
          <TabsTrigger value="database">Local Database</TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-4">
          {/* RR Investment Permission Flag */}
          <Card className={`border-primary/20 ${investmentPermission ? 'bg-primary/5' : 'bg-muted/30'}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Flag className={`h-5 w-5 ${investmentPermission ? 'text-primary' : 'text-muted-foreground'}`} />
                <div className="flex-1">
                  <h3 className={`font-semibold ${investmentPermission ? 'text-primary' : 'text-muted-foreground'}`}>
                    Investment Permission
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Allow RR to invest on behalf of me using wallet funds
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={investmentPermission
                      ? "bg-success/10 text-success border-success/20"
                      : "bg-destructive/10 text-destructive border-destructive/20"
                    }
                  >
                    {investmentPermission ? "Enabled" : "Disabled"}
                  </Badge>
                  <Switch
                    checked={investmentPermission}
                    onCheckedChange={setInvestmentPermission}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Add Funds */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-success" />
                  Add Funds
                </CardTitle>
                <CardDescription>
                  Add money to your wallet from linked bank accounts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="add-amount">Amount</Label>
                  <Input
                    id="add-amount"
                    type="number"
                    placeholder="0.00"
                    value={addAmount}
                    onChange={(e) => setAddAmount(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleAddFunds}
                  className="w-full"
                >
                  Add Funds
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Secure payment powered by your payment gateway
                </p>
              </CardContent>
            </Card>

            {/* Withdraw Funds */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Minus className="h-5 w-5 text-destructive" />
                  Withdraw Funds
                </CardTitle>
                <CardDescription>
                  Withdraw money to your linked bank accounts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="withdraw-amount">Amount</Label>
                  <Input
                    id="withdraw-amount"
                    type="number"
                    placeholder="0.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                  />
                </div>
                <Button onClick={handleWithdraw} variant="outline" className="w-full">
                  Withdraw Funds
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Linked Bank Accounts
              </CardTitle>
              <CardDescription>
                Manage your connected bank accounts for deposits and withdrawals
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAccounts ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span className="text-muted-foreground">Loading bank accounts...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {bankAccounts.length === 0 ? (
                    <div className="text-center py-8">
                      <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Bank Accounts</h3>
                      <p className="text-sm text-muted-foreground mb-4">You haven't added any bank accounts yet.</p>
                      <Button
                        variant="outline"
                        onClick={() => setIsAddDialogOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Account
                      </Button>
                    </div>
                  ) : (
                    <>
                      {bankAccounts.map((account) => (
                        <div
                          key={account.id}
                          className={`flex items-center justify-between p-4 border rounded-lg transition-all ${
                            account.active ? 'border-primary bg-primary/5 shadow-sm' : 'hover:bg-muted/30'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <CreditCard className={`h-8 w-8 ${
                              account.active ? 'text-primary' : 'text-muted-foreground'
                            }`} />
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">{account.bank}</h3>
                                {account.active && (
                                  <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                                    Active
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {account.type} • {account.accountNumber}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {account.accountHolderName} • IFSC: {account.ifscCode}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {account.verified ? (
                              <Badge className="bg-success text-success-foreground">Verified</Badge>
                            ) : (
                              <Badge variant="secondary">Pending</Badge>
                            )}
                            {!account.active && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSetActiveAccount(account.id)}
                              >
                                Set Active
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenEditDialog(account.id)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setIsAddDialogOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Bank Account
                      </Button>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <FinancialTransactionsTable
            userId={user?.id || user?._id}
            companyId="62d66794e54f47829a886a1d"
          />
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <DatabaseViewer />
        </TabsContent>
      </Tabs>

      {/* Add Bank Account Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Bank Account</DialogTitle>
            <DialogDescription>
              Add a new bank account for deposits and withdrawals. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="add-account-holder-name">Account Holder Name *</Label>
              <Input
                id="add-account-holder-name"
                placeholder="Enter full name as per bank records"
                value={newAccountData.accountHolderName}
                onChange={(e) =>
                  setNewAccountData(prev => ({ ...prev, accountHolderName: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-account-number">Account Number *</Label>
              <Input
                id="add-account-number"
                placeholder="Enter full account number"
                type="number"
                value={newAccountData.accountNumber}
                onChange={(e) =>
                  setNewAccountData(prev => ({ ...prev, accountNumber: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-confirm-account-number">Confirm Account Number *</Label>
              <Input
                id="add-confirm-account-number"
                placeholder="Re-enter account number"
                type="number"
                value={newAccountData.confirmAccountNumber}
                onChange={(e) =>
                  setNewAccountData(prev => ({ ...prev, confirmAccountNumber: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-ifsc-code">IFSC Code *</Label>
              <Input
                id="add-ifsc-code"
                placeholder="Enter IFSC code (e.g., SBIN0123456)"
                value={newAccountData.ifscCode}
                onChange={(e) =>
                  setNewAccountData(prev => ({ ...prev, ifscCode: e.target.value.toUpperCase() }))
                }
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-bank-name">Bank Name *</Label>
              <Input
                id="add-bank-name"
                placeholder="Enter bank name"
                value={newAccountData.bank}
                onChange={(e) =>
                  setNewAccountData(prev => ({ ...prev, bank: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-bank-identity">Bank Identity</Label>
              <Input
                id="add-bank-identity"
                placeholder="Enter bank branch or identifier (optional)"
                value={newAccountData.bankIdentity}
                onChange={(e) =>
                  setNewAccountData(prev => ({ ...prev, bankIdentity: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-account-identity">Upload Account Identity * (Image)</Label>
              <Input
                id="add-account-identity"
                type="file"
                accept=".jpg,.jpeg,.png,.gif,.bmp,.webp"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setAccountIdentityFile(file);

                  // Create image preview
                  if (file && file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      setImagePreview(e.target?.result as string);
                    };
                    reader.readAsDataURL(file);
                  } else {
                    setImagePreview(null);
                  }
                }}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">
                Upload clear images of bank statement, passbook copy, or cancelled cheque (JPG, PNG, GIF, WebP formats)
              </p>

              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-3 p-3 border rounded-lg bg-muted/20">
                  <p className="text-sm font-medium mb-2">Preview:</p>
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Account identity preview"
                      className="max-w-full h-auto max-h-48 rounded-md border"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2 h-8 w-8 p-0"
                      onClick={() => {
                        setAccountIdentityFile(null);
                        setImagePreview(null);
                        // Reset file input
                        const fileInput = document.getElementById('add-account-identity') as HTMLInputElement;
                        if (fileInput) fileInput.value = '';
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {accountIdentityFile && (
                    <p className="text-xs text-muted-foreground mt-2">
                      File: {accountIdentityFile.name} ({(accountIdentityFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
              )}

              {/* File validation message */}
              {accountIdentityFile && !accountIdentityFile.type.startsWith('image/') && (
                <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-xs text-destructive">
                    Please select an image file (JPG, PNG, GIF, WebP)
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-account-type">Account Type</Label>
              <Select
                value={newAccountData.type}
                onValueChange={(value) =>
                  setNewAccountData(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Checking">Checking</SelectItem>
                  <SelectItem value="Savings">Savings</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                setNewAccountData({
                  accountHolderName: "",
                  bank: "",
                  accountNumber: "",
                  confirmAccountNumber: "",
                  ifscCode: "",
                  bankIdentity: "",
                  type: "Checking"
                });
                setAccountIdentityFile(null);
                setImagePreview(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddAccount} disabled={isAddingAccount}>
              {isAddingAccount ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding Account...
                </>
              ) : (
                "Add Account"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Bank Account Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Bank Account</DialogTitle>
            <DialogDescription>
              Update your bank account information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-bank-name">Bank Name</Label>
              <Input
                id="edit-bank-name"
                placeholder="Enter bank name"
                value={editAccountData.bank}
                onChange={(e) =>
                  setEditAccountData(prev => ({ ...prev, bank: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-account-number">Account Number</Label>
              <Input
                id="edit-account-number"
                placeholder="Enter last 4 digits"
                value={editAccountData.accountNumber}
                onChange={(e) =>
                  setEditAccountData(prev => ({ ...prev, accountNumber: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-account-type">Account Type</Label>
              <Select
                value={editAccountData.type}
                onValueChange={(value) =>
                  setEditAccountData(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Checking">Checking</SelectItem>
                  <SelectItem value="Savings">Savings</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditAccountData({ bank: "", accountNumber: "", type: "Checking" });
                setEditingAccount(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEditAccount}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Wallet;