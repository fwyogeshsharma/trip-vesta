import { getAuthToken } from './authService';
import { indexedDBService, FinancialTransactionLocal } from './indexedDBService';

// API configuration
const API_BASE_URL = 'https://35.244.19.78:8042';

// Interface for financial transaction
export interface FinancialTransaction {
  _id: string;
  transaction_date: string;
  transaction_id: number;
  transaction_type: string;
  trade_type: string;
  book_owner: {
    user: string | null;
    company: string;
  };
  party: {
    user: {
      _id: string;
      phone: {
        country_phone_code: string;
        number: string;
      };
      name: string;
      email: string;
      [key: string]: any;
    } | null;
    company: string | null;
  };
  note: string;
  transaction_reference_id: string | null;
  amount: number;
  mediator: string | null;
  payment_transfer_mode: string;
  payment_reference: {
    invoice_id: string | null;
    purchase_order_number: string | null;
    user_payment_id: string | null;
    vehicle_expense_id: string | null;
    payment_sheet_id: string | null;
    voucher_id: string | null;
    trip_expense_id: string | null;
    settlement_note_id: string | null;
    settlement_note_allocation_id: string | null;
    company_id: string | null;
    user_id: string | null;
  };
  operation_expense_type: string | null;
  chart_of_account: {
    _id: string;
    name: string;
    type: string;
    sub_type: string;
    number: number;
  };
  entry_type: 'Debit' | 'Credit';
  record_status: string;
  tag: string;
  currency: string;
  _updated: string;
  _created: string;
  _deleted: boolean;
  _version: number;
  updated_by: string;
  created_by: string;
  csr: string;
  _etag: string;
  parallel_transaction_id: number;
  _latest_version: number;
}

// Interface for API response
export interface FinancialTransactionsResponse {
  _items: FinancialTransaction[];
  _meta: {
    page: number;
    max_results: number;
    total: number;
  };
  _links: {
    self: { href: string; title: string };
    parent: { href: string; title: string };
  };
}

// Interface for query parameters
export interface FinancialTransactionsQuery {
  where?: {
    'book_owner.company': string;
    'chart_of_account': { '$in': number[] };
    'cancelled': { '$exists': boolean };
  };
  embedded?: {
    'chart_of_account': number;
    'party.user': number;
    'party.company': number;
  };
  page?: number;
  max_results?: number;
  sort?: string;
}

class FinancialTransactionsService {
  private static instance: FinancialTransactionsService;

  private constructor() {}

  static getInstance(): FinancialTransactionsService {
    if (!FinancialTransactionsService.instance) {
      FinancialTransactionsService.instance = new FinancialTransactionsService();
    }
    return FinancialTransactionsService.instance;
  }

  /**
   * Get financial transactions with query parameters
   */
  async getFinancialTransactions(
    companyId: string = "62d66794e54f47829a886a1d",
    page: number = 1,
    maxResults: number = 25
  ): Promise<FinancialTransactionsResponse> {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Build query parameters
      const where = {
        "book_owner.company": companyId,
        "chart_of_account": { "$in": [1000, 1001] },
        "cancelled": { "$exists": false }
      };

      const embedded = {
        "chart_of_account": 1,
        "party.user": 1,
        "party.company": 1
      };

      const sort = '[("transaction_date", -1)]';

      // Build URL with query parameters
      const params = new URLSearchParams({
        where: JSON.stringify(where),
        embedded: JSON.stringify(embedded),
        page: page.toString(),
        max_results: maxResults.toString(),
        sort: sort
      });

      const url = `${API_BASE_URL}/financial_transactions?${params.toString()}`;

      console.log('Fetching financial transactions from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Financial transactions response:', result);

      return result as FinancialTransactionsResponse;

    } catch (error) {
      console.error('Error fetching financial transactions:', error);
      throw error;
    }
  }

  /**
   * Get transactions for a specific user
   */
  async getUserTransactions(
    userId: string,
    companyId: string = "62d66794e54f47829a886a1d",
    page: number = 1,
    maxResults: number = 25
  ): Promise<FinancialTransactionsResponse> {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Build query parameters with user filter
      const where = {
        "book_owner.company": companyId,
        "party.user": userId,
        "chart_of_account": { "$in": [1000, 1001] },
        "cancelled": { "$exists": false }
      };

      const embedded = {
        "chart_of_account": 1,
        "party.user": 1,
        "party.company": 1
      };

      const sort = '[("transaction_date", -1)]';

      // Build URL with query parameters
      const params = new URLSearchParams({
        where: JSON.stringify(where),
        embedded: JSON.stringify(embedded),
        page: page.toString(),
        max_results: maxResults.toString(),
        sort: sort
      });

      const url = `${API_BASE_URL}/financial_transactions?${params.toString()}`;

      console.log('Fetching user financial transactions from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('User financial transactions response:', result);

      return result as FinancialTransactionsResponse;

    } catch (error) {
      console.error('Error fetching user financial transactions:', error);
      throw error;
    }
  }

  /**
   * Format currency amount
   */
  formatAmount(amount: number, currency: string = 'INR'): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  /**
   * Format date
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Get entry type color for display
   */
  getEntryTypeColor(entryType: 'Debit' | 'Credit'): string {
    switch (entryType) {
      case 'Credit':
        return 'text-green-600 bg-green-100';
      case 'Debit':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  /**
   * Transform API financial transaction to local format
   */
  private transformToLocalTransaction(apiTransaction: FinancialTransaction): Omit<FinancialTransactionLocal, 'id'> {
    return {
      _id: apiTransaction._id,
      transaction_date: apiTransaction.transaction_date,
      transaction_id: apiTransaction.transaction_id,
      transaction_type: apiTransaction.transaction_type,
      trade_type: apiTransaction.trade_type,
      book_owner_company: apiTransaction.book_owner.company,
      book_owner_user: apiTransaction.book_owner.user,
      party_user_id: apiTransaction.party.user?._id || null,
      party_user_name: apiTransaction.party.user?.name || null,
      party_user_email: apiTransaction.party.user?.email || null,
      party_user_phone: apiTransaction.party.user?.phone ?
        `${apiTransaction.party.user.phone.country_phone_code}${apiTransaction.party.user.phone.number}` : null,
      party_company: apiTransaction.party.company,
      note: apiTransaction.note,
      transaction_reference_id: apiTransaction.transaction_reference_id,
      amount: apiTransaction.amount,
      mediator: apiTransaction.mediator,
      payment_transfer_mode: apiTransaction.payment_transfer_mode,
      chart_of_account_id: apiTransaction.chart_of_account._id,
      chart_of_account_name: apiTransaction.chart_of_account.name,
      chart_of_account_type: apiTransaction.chart_of_account.type,
      entry_type: apiTransaction.entry_type,
      record_status: apiTransaction.record_status,
      tag: apiTransaction.tag,
      currency: apiTransaction.currency,
      _updated: apiTransaction._updated,
      _created: apiTransaction._created,
      _deleted: apiTransaction._deleted,
      _version: apiTransaction._version,
      updated_by: apiTransaction.updated_by,
      created_by: apiTransaction.created_by,
      csr: apiTransaction.csr,
      _etag: apiTransaction._etag,
      parallel_transaction_id: apiTransaction.parallel_transaction_id,
      _latest_version: apiTransaction._latest_version,
      synced_at: new Date().toISOString()
    };
  }

  /**
   * Sync financial transactions to local database
   */
  async syncTransactionsToLocal(
    companyId: string = "62d66794e54f47829a886a1d",
    page: number = 1,
    maxResults: number = 100
  ): Promise<{ synced: number; total: number; walletValue: number }> {
    try {
      const response = await this.getFinancialTransactions(companyId, page, maxResults);

      if (!response._items || response._items.length === 0) {
        console.log('No financial transactions to sync');
        return { synced: 0, total: 0, walletValue: 0 };
      }

      // Transform API transactions to local format
      const localTransactions = response._items.map(transaction =>
        this.transformToLocalTransaction(transaction)
      );

      // Bulk sync to local database
      const syncedIds = await indexedDBService.bulkSyncFinancialTransactions(localTransactions);

      // Calculate wallet value based on synced transactions
      const walletValue = await this.calculateWalletValueFromTransactions(companyId);

      console.log(`Synced ${syncedIds.length} financial transactions. Calculated wallet value: ${walletValue}`);

      return {
        synced: syncedIds.length,
        total: response._meta.total,
        walletValue: walletValue
      };

    } catch (error) {
      console.error('Error syncing financial transactions to local database:', error);
      throw error;
    }
  }

  /**
   * Get financial transactions from local database
   */
  async getLocalFinancialTransactions(
    companyId: string,
    limit?: number,
    offset?: number
  ): Promise<FinancialTransactionLocal[]> {
    try {
      return await indexedDBService.getFinancialTransactionsByCompany(companyId, limit, offset);
    } catch (error) {
      console.error('Error fetching local financial transactions:', error);
      throw error;
    }
  }

  /**
   * Get user financial transactions from local database
   */
  async getLocalUserTransactions(userId: string, limit?: number): Promise<FinancialTransactionLocal[]> {
    try {
      return await indexedDBService.getFinancialTransactionsByUser(userId, limit);
    } catch (error) {
      console.error('Error fetching local user financial transactions:', error);
      throw error;
    }
  }

  /**
   * Calculate wallet value from financial transactions
   * This calculates the net amount (Credits - Debits) which represents the wallet balance
   */
  async calculateWalletValueFromTransactions(companyId: string, userId?: string): Promise<number> {
    try {
      let transactions: FinancialTransactionLocal[];

      if (userId) {
        transactions = await this.getLocalUserTransactions(userId);
      } else {
        transactions = await this.getLocalFinancialTransactions(companyId);
      }

      let walletValue = 0;

      transactions.forEach(transaction => {
        if (transaction.entry_type === 'Credit') {
          walletValue += transaction.amount;
        } else if (transaction.entry_type === 'Debit') {
          walletValue -= transaction.amount;
        }
      });

      return walletValue;
    } catch (error) {
      console.error('Error calculating wallet value from transactions:', error);
      throw error;
    }
  }

  /**
   * Get wallet summary from local transactions
   */
  async getWalletSummaryFromTransactions(companyId: string, userId?: string): Promise<{
    totalCredits: number;
    totalDebits: number;
    netBalance: number;
    transactionCount: number;
    lastTransactionDate: string | null;
  }> {
    try {
      let transactions: FinancialTransactionLocal[];

      if (userId) {
        transactions = await this.getLocalUserTransactions(userId);
      } else {
        transactions = await this.getLocalFinancialTransactions(companyId);
      }

      let totalCredits = 0;
      let totalDebits = 0;
      let lastTransactionDate: string | null = null;

      transactions.forEach(transaction => {
        if (transaction.entry_type === 'Credit') {
          totalCredits += transaction.amount;
        } else if (transaction.entry_type === 'Debit') {
          totalDebits += transaction.amount;
        }

        // Update last transaction date
        if (!lastTransactionDate || transaction.transaction_date > lastTransactionDate) {
          lastTransactionDate = transaction.transaction_date;
        }
      });

      const netBalance = totalCredits - totalDebits;

      return {
        totalCredits,
        totalDebits,
        netBalance,
        transactionCount: transactions.length,
        lastTransactionDate
      };

    } catch (error) {
      console.error('Error getting wallet summary from transactions:', error);
      throw error;
    }
  }

  /**
   * Sync all financial transactions (paginated approach)
   */
  async syncAllTransactionsToLocal(companyId: string = "62d66794e54f47829a886a1d"): Promise<{
    totalSynced: number;
    totalTransactions: number;
    walletValue: number;
  }> {
    try {
      let totalSynced = 0;
      let totalTransactions = 0;
      let page = 1;
      const maxResults = 100; // Process in batches of 100
      let hasMoreData = true;

      while (hasMoreData) {
        const syncResult = await this.syncTransactionsToLocal(companyId, page, maxResults);

        totalSynced += syncResult.synced;
        totalTransactions = syncResult.total;

        // Check if we have more pages to process
        const currentPageRecords = page * maxResults;
        hasMoreData = currentPageRecords < totalTransactions;

        console.log(`Synced page ${page}: ${syncResult.synced} transactions`);
        page++;
      }

      // Calculate final wallet value
      const walletValue = await this.calculateWalletValueFromTransactions(companyId);

      console.log(`Sync completed: ${totalSynced} transactions synced. Final wallet value: ${walletValue}`);

      return {
        totalSynced,
        totalTransactions,
        walletValue
      };

    } catch (error) {
      console.error('Error during complete financial transactions sync:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const financialTransactionsService = FinancialTransactionsService.getInstance();
export default financialTransactionsService;