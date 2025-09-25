import { getAuthToken } from './authService';

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

}

// Export singleton instance
export const financialTransactionsService = FinancialTransactionsService.getInstance();
export default financialTransactionsService;