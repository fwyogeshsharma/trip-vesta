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
  Flag
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// Removed PaymentService import - directing users to production
import { useWallet } from "@/contexts/WalletContext";
import { useAuth } from "@/contexts/AuthContext";

// Razorpay integration removed - users directed to production for payments

const Wallet = () => {
  const { toast } = useToast();
  const { walletData, addToBalance, withdrawFromBalance } = useWallet();
  const { user } = useAuth();
  const [addAmount, setAddAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Form states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<number | null>(null);
  const [investmentPermission, setInvestmentPermission] = useState(true);
  const [isProductionDialogOpen, setIsProductionDialogOpen] = useState(false);

  // Add account form
  const [newAccountData, setNewAccountData] = useState({
    bank: "",
    accountNumber: "",
    type: "Checking"
  });

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

  // Removed Razorpay script loading - directing users to production

  const handleSetActiveAccount = (accountId: number) => {
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
  };

  const handleAddFunds = async () => {
    if (!addAmount || parseFloat(addAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to add",
        variant: "destructive"
      });
      return;
    }

    const amountToAdd = parseFloat(addAmount);

    // Validate minimum amount (₹1)
    if (amountToAdd < 1) {
      toast({
        title: "Minimum Amount Required",
        description: "Minimum amount to add is ₹1",
        variant: "destructive"
      });
      return;
    }

    // Show production redirect dialog
    setIsProductionDialogOpen(true);
    setAddAmount("");
  };

  // Removed payment success handler - users directed to production

  const handleWithdraw = () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to withdraw",
        variant: "destructive"
      });
      return;
    }

    const amountToWithdraw = parseFloat(withdrawAmount);

    const success = withdrawFromBalance(amountToWithdraw);

    if (success) {
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

  const handleAddAccount = () => {
    if (!newAccountData.bank || !newAccountData.accountNumber) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const newAccount = {
      id: bankAccounts.length + 1,
      bank: newAccountData.bank,
      accountNumber: `****${newAccountData.accountNumber.slice(-4)}`,
      type: newAccountData.type,
      verified: false,
      active: false
    };

    setBankAccounts(prev => [...prev, newAccount]);
    setNewAccountData({ bank: "", accountNumber: "", type: "Checking" });
    setIsAddDialogOpen(false);

    toast({
      title: "Bank Account Added",
      description: `${newAccount.bank} account has been added successfully`,
    });
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
        <div className="flex items-center space-x-2">
          <Shield className="h-4 w-4 text-success" />
          <span className="text-sm text-muted-foreground">Secure</span>
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
              Unused amount will be credited to your account in monthly cycle
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
                  disabled={isProcessingPayment}
                >
                  {isProcessingPayment ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    "Add Funds"
                  )}
                </Button>
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
              <div className="space-y-4">
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Bank Account Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Bank Account</DialogTitle>
            <DialogDescription>
              Add a new bank account for deposits and withdrawals.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="add-bank-name">Bank Name</Label>
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
              <Label htmlFor="add-account-number">Account Number</Label>
              <Input
                id="add-account-number"
                placeholder="Enter full account number"
                value={newAccountData.accountNumber}
                onChange={(e) =>
                  setNewAccountData(prev => ({ ...prev, accountNumber: e.target.value }))
                }
              />
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
                setNewAccountData({ bank: "", accountNumber: "", type: "Checking" });
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddAccount}>Add Account</Button>
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

      {/* Production Redirect Dialog */}
      <Dialog open={isProductionDialogOpen} onOpenChange={setIsProductionDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              🚧 Demo Site - Payment Not Available
            </DialogTitle>
            <DialogDescription>
              This is a demonstration version of the investment portal.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-yellow-800 mb-2">
                Ready to Make Real Investments?
              </h3>
              <p className="text-yellow-700 text-sm mb-3">
                To add funds to your wallet and start investing, please visit our production site where secure payment processing is available.
              </p>
              <div className="flex items-center gap-2 text-sm text-yellow-600">
                <Shield className="h-4 w-4" />
                <span>Secure payments powered by industry-standard encryption</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Continue exploring the demo or switch to production for real transactions.
              </p>
            </div>
          </div>
          <div className="flex justify-center">
            <Button
              onClick={() => setIsProductionDialogOpen(false)}
              className="w-full"
            >
              Continue Demo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Wallet;