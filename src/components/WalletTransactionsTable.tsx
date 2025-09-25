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

  // Sample transactions for demonstration when no real data exists
  const createSampleTransactions = (): WalletTransaction[] => {
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - 7); // Start from 7 days ago

    return [
      {
        id: 'sample-1',
        user_id: userId,
        transaction_id: `TXN${Date.now()}001`,
        api_transaction_id: undefined,
        reference_id: 'CF-sample-order-001',
        type: 'ADD_FUNDS',
        amount: 2500,
        net_amount: 2500,
        fee_amount: 0,
        currency: 'INR',
        status: 'COMPLETED',
        description: 'Sample wallet credit via payment gateway',
        balance_before: 0,
        balance_after: 2500,
        created_date: new Date(baseDate.getTime() + 1 * 60 * 60 * 1000).toISOString(),
        updated_date: new Date(baseDate.getTime() + 1 * 60 * 60 * 1000).toISOString(),
        transaction_source: 'CASHFREE',
        verification_method: 'API',
        verified_at: new Date(baseDate.getTime() + 1 * 60 * 60 * 1000).toISOString(),
        gateway_response: JSON.stringify({
          order_id: 'CF-sample-order-001',
          payment_status: 'SUCCESS',
          payment_method: 'UPI'
        }),
        metadata: JSON.stringify({
          demo: true,
          sample_data: true
        }),
        party_name: 'Cashfree Payments India Pvt Ltd',
        party_type: 'PAYMENT_GATEWAY' as const,
        note: 'Sample wallet credit via Cashfree payment gateway - Order ID: CF-sample-order-001 - Amount: ₹2,500',
        payment_mode: 'ONLINE' as const,
        entry_type: 'CREDIT' as const,
        chart_of_account: 'DIGITAL_WALLET_RECEIPTS',
        voucher_number: `CF-sample-order-001-${Date.now()}`
      },
      {
        id: 'sample-2',
        user_id: userId,
        transaction_id: `TXN${Date.now()}002`,
        api_transaction_id: undefined,
        reference_id: 'INV-sample-002',
        type: 'INVESTMENT',
        amount: 1500,
        net_amount: 1500,
        fee_amount: 0,
        currency: 'INR',
        status: 'COMPLETED',
        description: 'Sample investment in property project',
        balance_before: 2500,
        balance_after: 1000,
        created_date: new Date(baseDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        updated_date: new Date(baseDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        transaction_source: 'INVESTMENT',
        verification_method: 'SYSTEM',
        verified_at: new Date(baseDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        gateway_response: undefined,
        metadata: JSON.stringify({
          demo: true,
          sample_data: true,
          property_id: 'PROP-001'
        }),
        party_name: 'RollingRadius Properties',
        party_type: 'SYSTEM' as const,
        note: 'Sample investment in luxury property project - Project ID: PROP-001 - Amount: ₹1,500',
        payment_mode: 'WALLET' as const,
        entry_type: 'DEBIT' as const,
        chart_of_account: 'INVESTMENT_DEBITS',
        voucher_number: `INV-sample-002-${Date.now()}`
      },
      {
        id: 'sample-3',
        user_id: userId,
        transaction_id: `TXN${Date.now()}003`,
        api_transaction_id: undefined,
        reference_id: 'PROFIT-sample-003',
        type: 'PROFIT',
        amount: 250,
        net_amount: 250,
        fee_amount: 0,
        currency: 'INR',
        status: 'COMPLETED',
        description: 'Sample profit earned from investment',
        balance_before: 1000,
        balance_after: 1250,
        created_date: new Date(baseDate.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        updated_date: new Date(baseDate.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        transaction_source: 'PROFIT',
        verification_method: 'SYSTEM',
        verified_at: new Date(baseDate.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        gateway_response: undefined,
        metadata: JSON.stringify({
          demo: true,
          sample_data: true,
          profit_rate: '16.67%'
        }),
        party_name: 'RollingRadius Properties',
        party_type: 'SYSTEM' as const,
        note: 'Sample profit earned from property investment - ROI: 16.67% - Amount: ₹250',
        payment_mode: 'WALLET' as const,
        entry_type: 'CREDIT' as const,
        chart_of_account: 'PROFIT_CREDITS',
        voucher_number: `PROFIT-sample-003-${Date.now()}`
      }
    ];
  };

  const loadWalletData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Loading wallet data for user:', userId);

      // Load wallet transactions
      const walletTransactions = await walletSyncService.getWalletTransactionHistory(userId);

      // If no real transactions exist, show sample transactions for demonstration
      if (walletTransactions.length === 0) {
        const sampleTransactions = createSampleTransactions();
        setTransactions(sampleTransactions);
        console.log('No real transactions found, showing sample data for demonstration');
      } else {
        setTransactions(walletTransactions);
      }

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
            <label className="text-sm font-medium text-gray-500">Local ID</label>
            <p className="text-sm">{transaction.id}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Transaction ID (Accounting)</label>
            <p className="text-sm font-mono font-bold">{transaction.transaction_id}</p>
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
            <label className="text-sm font-medium text-gray-500">Party Name</label>
            <p className="text-sm font-medium">{transaction.party_name || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Party Type</label>
            <p className="text-sm">{transaction.party_type || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Payment Mode</label>
            <p className="text-sm">{transaction.payment_mode || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Entry Type</label>
            <p className={`text-sm font-bold ${transaction.entry_type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
              {transaction.entry_type}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Voucher Number</label>
            <p className="text-sm">{transaction.voucher_number || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Chart of Account</label>
            <p className="text-sm">{transaction.chart_of_account || 'N/A'}</p>
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
          <label className="text-sm font-medium text-gray-500">Original Description</label>
          <p className="text-sm">{transaction.description}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500">Accounting Note</label>
          <p className="text-sm font-medium bg-blue-50 p-2 rounded">{transaction.note || transaction.description}</p>
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
            {transactions.length > 0 && transactions.some(t => t.id.includes('sample')) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 text-blue-800">
                  <Database className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Sample transaction records are shown for demonstration. Real transactions will replace these when you add funds.
                  </span>
                </div>
              </div>
            )}
            <ScrollArea className="h-[600px] w-full rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Party</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead>Payment Mode</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Entry Type</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="text-muted-foreground">
                          <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          No wallet transactions found in local database
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((transaction) => (
                      <TableRow key={transaction.id} className="hover:bg-muted/30">
                        <TableCell className="text-sm font-mono">
                          <div>{formatDateTime(transaction.created_date).split(',')[0]}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDateTime(transaction.created_date).split(',')[1]}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          <div className="font-medium">{transaction.transaction_id}</div>
                          {transaction.reference_id && (
                            <div className="text-xs text-muted-foreground">
                              Ref: {transaction.reference_id}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{transaction.party_name || 'N/A'}</div>
                          <div className="text-xs text-muted-foreground">
                            {transaction.party_type || 'Unknown'}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <div className="text-sm truncate" title={transaction.note}>
                            {transaction.note || transaction.description}
                          </div>
                          {transaction.voucher_number && (
                            <div className="text-xs text-muted-foreground">
                              Voucher: {transaction.voucher_number}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {transaction.payment_mode || 'ONLINE'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className={`text-lg font-bold ${
                            transaction.entry_type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.entry_type === 'CREDIT' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </div>
                          {transaction.fee_amount && transaction.fee_amount > 0 && (
                            <div className="text-xs text-muted-foreground">
                              Fee: {formatCurrency(transaction.fee_amount)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              transaction.entry_type === 'CREDIT'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }
                          >
                            {transaction.entry_type}
                          </Badge>
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