import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Database,
  CreditCard,
  TrendingUp,
  RefreshCw,
  Calendar,
  Users,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { walletSyncService } from "@/services/walletSyncService";
import { BankAccount, WalletTransaction, LocalWalletState } from "@/services/indexedDBService";

interface DatabaseStats {
  totalAccounts: number;
  totalTransactions: number;
  totalUsers: number;
}

export const DatabaseViewer: React.FC = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [walletState, setWalletState] = useState<LocalWalletState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load database statistics
      const dbStats = await walletSyncService.getDatabaseStats();
      setStats(dbStats);
      console.log('Database stats:', dbStats);

      // Load bank accounts
      const accounts = await walletSyncService.getLocalBankAccounts('current_user');
      setBankAccounts(accounts);
      console.log('Bank accounts loaded:', accounts.length);

      // Load recent transactions
      const txns = await walletSyncService.getWalletTransactionHistory('current_user', 50);
      setTransactions(txns);
      console.log('Transactions loaded:', txns.length, txns);

      // Load wallet state
      const state = await walletSyncService.getLocalWalletState('current_user');
      setWalletState(state);
      console.log('Wallet state loaded:', state);

      console.log('Database data loaded successfully:', {
        stats: dbStats,
        accountsCount: accounts.length,
        transactionsCount: txns.length,
        walletState: state
      });

    } catch (err: unknown) {
      console.error('Error loading database data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load database data');
      toast({
        title: "Database Error",
        description: "Failed to load local database data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'ADD_FUNDS':
        return 'bg-green-500/10 text-green-600 border-green-200';
      case 'WITHDRAW':
        return 'bg-red-500/10 text-red-600 border-red-200';
      case 'INVESTMENT':
        return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'PROFIT':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-500/10 text-green-600 border-green-200';
      case 'PENDING':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
      case 'FAILED':
        return 'bg-red-500/10 text-red-600 border-red-200';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  if (error) {
    return (
      <Card className="border-destructive/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>Error: {error}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Database Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Local Database</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadData}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bank Accounts</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAccounts}</div>
              <p className="text-xs text-muted-foreground">Synced accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTransactions}</div>
              <p className="text-xs text-muted-foreground">Local records</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">With local data</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Data Tables */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="accounts">Bank Accounts</TabsTrigger>
          <TabsTrigger value="wallet">Wallet State</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Local transaction history</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {transactions.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No transactions found
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((txn) => (
                      <div
                        key={txn.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Badge className={getTransactionTypeColor(txn.transaction_type)}>
                            {txn.transaction_type}
                          </Badge>
                          <div>
                            <p className="font-medium">₹{txn.amount.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">{txn.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(txn.status)}>
                            {txn.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            {formatDate(txn.created_date)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts">
          <Card>
            <CardHeader>
              <CardTitle>Bank Accounts</CardTitle>
              <CardDescription>Synced bank accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {bankAccounts.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No bank accounts found
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bankAccounts.map((account) => (
                      <div
                        key={account.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-8 w-8 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{account.bank_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {account.account_holder_name} • {account.account_type}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ****{account.account_number.slice(-4)} • {account.ifsc_code}
                            </p>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          {account.is_verified ? (
                            <Badge className="bg-green-500/10 text-green-600 border-green-200">
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                          {account.is_active && (
                            <Badge variant="outline" className="ml-2">Active</Badge>
                          )}
                          <p className="text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            {formatDate(account.created_date)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wallet">
          <Card>
            <CardHeader>
              <CardTitle>Wallet State</CardTitle>
              <CardDescription>Current local wallet state</CardDescription>
            </CardHeader>
            <CardContent>
              {!walletState ? (
                <div className="text-center text-muted-foreground py-8">
                  No wallet state found
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Balance:</span>
                      <span className="font-medium">₹{walletState.balance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Invested:</span>
                      <span className="font-medium">₹{walletState.total_invested.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Withdrawn:</span>
                      <span className="font-medium">₹{walletState.total_withdrawn.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Profit Earned:</span>
                      <span className="font-medium text-green-600">₹{walletState.profit_earned.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">User ID:</span>
                      <span className="font-mono text-sm">{walletState.user_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Sync:</span>
                      <span className="text-sm">{formatDate(walletState.last_sync_date)}</span>
                    </div>
                    {walletState.updated_date && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Updated:</span>
                        <span className="text-sm">{formatDate(walletState.updated_date)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DatabaseViewer;