import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  RefreshCw,
  Calendar,
  CreditCard,
  TrendingUp,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Shield,
  Database,
  Archive
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { walletSyncService } from "@/services/walletSyncService";
import { WalletTransaction, WalletAuditLog, BalanceSnapshot } from "@/services/indexedDBService";
import { useAuth } from "@/contexts/AuthContext";

const WalletTransactionsTable: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [auditLogs, setAuditLogs] = useState<WalletAuditLog[]>([]);
  const [snapshots, setSnapshots] = useState<BalanceSnapshot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<WalletTransaction | null>(null);
  const [activeTab, setActiveTab] = useState("transactions");

  const userId = user?.id || user?._id || 'current_user';

  const loadWalletData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Loading wallet data for user:', userId);

      // Load wallet transactions
      const walletTransactions = await walletSyncService.getWalletTransactionHistory(userId);
      setTransactions(walletTransactions);

      // Load audit logs (only load from indexedDB if implemented)
      try {
        const logs = await (walletSyncService as any).getAuditLogsByUserId?.(userId, 50) || [];
        setAuditLogs(logs);
      } catch (auditError) {
        console.warn('Audit logs not available:', auditError);
      }

      // Load balance snapshots (only load from indexedDB if implemented)
      try {
        const snaps = await (walletSyncService as any).getBalanceSnapshotsByUserId?.(userId, 20) || [];
        setSnapshots(snaps);
      } catch (snapshotError) {
        console.warn('Balance snapshots not available:', snapshotError);
      }

      console.log('Loaded wallet data:', {
        transactions: walletTransactions.length,
        auditLogs: auditLogs.length,
        snapshots: snapshots.length
      });

    } catch (error: any) {
      console.error('Error loading wallet data:', error);
      setError(error.message || 'Failed to load wallet data');
      toast({
        title: "Error Loading Data",
        description: error.message || "Failed to load wallet transaction data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadWalletData();
    }
  }, [userId]);

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'ADD_FUNDS': return 'bg-green-100 text-green-800';
      case 'WITHDRAW': return 'bg-red-100 text-red-800';
      case 'INVESTMENT': return 'bg-blue-100 text-blue-800';
      case 'PROFIT': return 'bg-emerald-100 text-emerald-800';
      case 'REFUND': return 'bg-yellow-100 text-yellow-800';
      case 'ADJUSTMENT': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const TransactionDetailsDialog = ({ transaction }: { transaction: WalletTransaction }) => (
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Transaction Details</DialogTitle>
        <DialogDescription>
          Complete transaction information and metadata
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Transaction ID</label>
            <p className="text-sm">{transaction.id}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">API Transaction ID</label>
            <p className="text-sm">{transaction.api_transaction_id || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Reference ID</label>
            <p className="text-sm">{transaction.reference_id || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Transaction Source</label>
            <p className="text-sm">{transaction.transaction_source || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Amount</label>
            <p className="text-lg font-bold text-green-600">{formatCurrency(transaction.amount)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Net Amount</label>
            <p className="text-sm">{transaction.net_amount ? formatCurrency(transaction.net_amount) : 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Fee Amount</label>
            <p className="text-sm">{transaction.fee_amount ? formatCurrency(transaction.fee_amount) : '₹0.00'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Balance Before</label>
            <p className="text-sm">{formatCurrency(transaction.balance_before)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Balance After</label>
            <p className="text-sm font-bold">{formatCurrency(transaction.balance_after)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Verification Method</label>
            <p className="text-sm">{transaction.verification_method || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Verified At</label>
            <p className="text-sm">{transaction.verified_at ? formatDateTime(transaction.verified_at) : 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Created</label>
            <p className="text-sm">{formatDateTime(transaction.created_date)}</p>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500">Description</label>
          <p className="text-sm">{transaction.description}</p>
        </div>

        {transaction.gateway_response && (
          <div>
            <label className="text-sm font-medium text-gray-500">Gateway Response</label>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
              {JSON.stringify(JSON.parse(transaction.gateway_response), null, 2)}
            </pre>
          </div>
        )}

        {transaction.metadata && (
          <div>
            <label className="text-sm font-medium text-gray-500">Metadata</label>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
              {JSON.stringify(JSON.parse(transaction.metadata), null, 2)}
            </pre>
          </div>
        )}
      </div>
    </DialogContent>
  );

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Transactions</h3>
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <Button onClick={loadWalletData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Local Wallet Database
            </CardTitle>
            <CardDescription>
              Complete transaction history and audit logs from local database
            </CardDescription>
          </div>
          <Button onClick={loadWalletData} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transactions">
              Transactions ({transactions.length})
            </TabsTrigger>
            <TabsTrigger value="audit">
              Audit Logs ({auditLogs.length})
            </TabsTrigger>
            <TabsTrigger value="snapshots">
              Snapshots ({snapshots.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-4">
            <ScrollArea className="h-[600px] w-full rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="text-muted-foreground">
                          <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          No wallet transactions found in local database
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="text-sm">
                          {formatDateTime(transaction.created_date)}
                        </TableCell>
                        <TableCell>
                          <Badge className={getTransactionTypeColor(transaction.transaction_type)}>
                            {transaction.transaction_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(transaction.amount)}
                          {transaction.fee_amount && transaction.fee_amount > 0 && (
                            <div className="text-xs text-muted-foreground">
                              Fee: {formatCurrency(transaction.fee_amount)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>After: {formatCurrency(transaction.balance_after)}</div>
                            <div className="text-xs text-muted-foreground">
                              Before: {formatCurrency(transaction.balance_before)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(transaction.status)}>
                            {transaction.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {transaction.transaction_source || 'SYSTEM'}
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <TransactionDetailsDialog transaction={transaction} />
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            <ScrollArea className="h-[600px] w-full rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Changed By</TableHead>
                    <TableHead>Session</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <div className="text-muted-foreground">
                          <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          No audit logs found
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    auditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm">
                          {formatDateTime(log.created_date)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.action}</Badge>
                        </TableCell>
                        <TableCell>{log.changed_by}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {log.session_id?.substring(0, 12)}...
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="snapshots" className="space-y-4">
            <ScrollArea className="h-[600px] w-full rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Invested</TableHead>
                    <TableHead>Withdrawn</TableHead>
                    <TableHead>Profit</TableHead>
                    <TableHead>Transactions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {snapshots.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="text-muted-foreground">
                          <Archive className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          No balance snapshots found
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    snapshots.map((snapshot) => (
                      <TableRow key={snapshot.id}>
                        <TableCell className="text-sm">
                          {formatDateTime(snapshot.created_date)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{snapshot.snapshot_type}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(snapshot.balance)}
                        </TableCell>
                        <TableCell>{formatCurrency(snapshot.total_invested)}</TableCell>
                        <TableCell>{formatCurrency(snapshot.total_withdrawn)}</TableCell>
                        <TableCell>{formatCurrency(snapshot.profit_earned)}</TableCell>
                        <TableCell>{snapshot.transaction_count}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default WalletTransactionsTable;