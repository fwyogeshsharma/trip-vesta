import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  RefreshCw,
  Calendar,
  CreditCard,
  TrendingUp,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  financialTransactionsService,
  FinancialTransaction,
  FinancialTransactionsResponse
} from "@/services/financialTransactionsService";

interface FinancialTransactionsTableProps {
  userId?: string;
  companyId?: string;
}

export const FinancialTransactionsTable: React.FC<FinancialTransactionsTableProps> = ({
  userId,
  companyId = "62d66794e54f47829a886a1d"
}) => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const maxResults = 25;

  const loadTransactions = async (page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      console.log('Loading financial transactions:', { userId, companyId, page });

      let response: FinancialTransactionsResponse;

      if (userId) {
        response = await financialTransactionsService.getUserTransactions(
          userId,
          companyId,
          page,
          maxResults
        );
      } else {
        response = await financialTransactionsService.getFinancialTransactions(
          companyId,
          page,
          maxResults
        );
      }

      setTransactions(response._items || []);
      setTotalTransactions(response._meta?.total || 0);
      setTotalPages(Math.ceil((response._meta?.total || 0) / maxResults));
      setCurrentPage(page);

      console.log('Financial transactions loaded:', {
        count: response._items?.length || 0,
        total: response._meta?.total || 0,
        page: page,
        totalPages: Math.ceil((response._meta?.total || 0) / maxResults)
      });

    } catch (err: unknown) {
      console.error('Error loading financial transactions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load financial transactions');
      toast({
        title: "Error",
        description: "Failed to load financial transactions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions(1);
  }, [userId, companyId]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      loadTransactions(newPage);
    }
  };

  const formatDate = (dateString: string) => {
    return financialTransactionsService.formatDate(dateString);
  };

  const formatAmount = (amount: number, currency: string = 'INR') => {
    return financialTransactionsService.formatAmount(amount, currency);
  };

  const getEntryTypeColor = (entryType: 'Debit' | 'Credit') => {
    return financialTransactionsService.getEntryTypeColor(entryType);
  };

  const getPaymentModeColor = (mode: string | null | undefined) => {
    if (!mode) return 'bg-gray-100 text-gray-700';

    switch (mode.toLowerCase()) {
      case 'cashfree payments gateway':
        return 'bg-blue-100 text-blue-700';
      case 'cash':
        return 'bg-green-100 text-green-700';
      case 'bank transfer':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
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
            onClick={() => loadTransactions(currentPage)}
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Financial Transactions
            </CardTitle>
            <CardDescription>
              {userId ? 'Your transaction history' : 'All company transactions'}
              {totalTransactions > 0 && ` (${totalTransactions} total)`}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadTransactions(currentPage)}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          {transactions.length === 0 && !loading ? (
            <div className="text-center text-muted-foreground py-8">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-lg font-medium">No transactions found</p>
              <p className="text-sm">No financial transactions available for the selected criteria.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">Transaction ID</TableHead>
                  <TableHead className="text-xs">Party</TableHead>
                  <TableHead className="text-xs">Note</TableHead>
                  <TableHead className="text-xs">Payment Mode</TableHead>
                  <TableHead className="text-xs">Amount</TableHead>
                  <TableHead className="text-xs">Entry Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Loading transactions...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction) => (
                    <TableRow key={transaction._id}>
                      <TableCell className="py-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">
                            {formatDate(transaction.transaction_date)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="font-mono text-xs">
                          #{transaction.transaction_id}
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        {transaction.party.user ? (
                          <div>
                            <div className="font-medium text-xs">
                              {transaction.party.user.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {transaction.party.user.phone.country_phone_code}
                              {transaction.party.user.phone.number}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Company</span>
                        )}
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="max-w-[150px] truncate text-xs" title={transaction.note}>
                          {transaction.note}
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        <Badge
                          variant="secondary"
                          className={`text-xs ${getPaymentModeColor(transaction.payment_transfer_mode)}`}
                        >
                          {transaction.payment_transfer_mode || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="font-medium text-xs">
                          {formatAmount(transaction.amount, transaction.currency)}
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        <Badge
                          variant="secondary"
                          className={`text-xs ${getEntryTypeColor(transaction.entry_type)}`}
                        >
                          {transaction.entry_type}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </ScrollArea>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * maxResults) + 1} to{' '}
              {Math.min(currentPage * maxResults, totalTransactions)} of{' '}
              {totalTransactions} transactions
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1 || loading}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages, currentPage - 2 + i));
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      disabled={loading}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || loading}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FinancialTransactionsTable;