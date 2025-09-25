// Browser-compatible database service using IndexedDB
interface BankAccount {
  id?: number;
  account_holder_name: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  account_type: string;
  is_verified: boolean;
  is_active: boolean;
  api_id?: string;
  created_date: string;
  updated_date?: string;
}

interface WalletTransaction {
  id?: number;
  user_id: string;
  transaction_type: 'ADD_FUNDS' | 'WITHDRAW' | 'INVESTMENT' | 'PROFIT' | 'REFUND' | 'ADJUSTMENT';
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string;
  bank_account_id?: number;
  api_transaction_id?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  transaction_source: 'CASHFREE' | 'RAZORPAY' | 'MANUAL' | 'SYSTEM' | 'BANK_TRANSFER';
  reference_id?: string; // Payment gateway reference
  gateway_response?: string; // Full gateway response for audit
  fee_amount?: number; // Transaction fees
  net_amount?: number; // Amount after fees
  metadata?: string; // JSON string for additional data
  verified_at?: string; // When payment was verified
  verification_method?: 'API' | 'WEBHOOK' | 'MANUAL';

  // Enhanced accounting fields
  transaction_id: string; // Unique transaction identifier for accounting
  party_name?: string; // Party involved (Cashfree, User, Bank, etc.)
  party_type?: 'PAYMENT_GATEWAY' | 'USER' | 'BANK' | 'SYSTEM';
  note: string; // Accounting note/description
  payment_mode: 'ONLINE' | 'UPI' | 'CARD' | 'BANK_TRANSFER' | 'CASH' | 'WALLET';
  entry_type: 'DEBIT' | 'CREDIT'; // Accounting entry type
  chart_of_account?: string; // Chart of accounts reference
  voucher_number?: string; // Accounting voucher number

  created_date: string;
  updated_date?: string;
}

interface LocalWalletState {
  id?: number;
  user_id: string;
  balance: number;
  total_invested: number;
  total_withdrawn: number;
  profit_earned: number;
  total_fees_paid: number; // Track transaction fees
  total_refunds: number; // Track refunds received
  total_adjustments: number; // Track manual adjustments
  pending_balance: number; // Amount in pending transactions
  available_balance: number; // balance - pending_balance
  last_transaction_id?: number; // Reference to last transaction for integrity
  checksum?: string; // Data integrity check
  last_sync_date: string;
  last_api_sync_date?: string; // When data was last synced with server
  version: number; // For conflict resolution
  updated_date?: string;
}

// New interface for audit logs
interface WalletAuditLog {
  id?: number;
  user_id: string;
  action: 'BALANCE_UPDATE' | 'TRANSACTION_ADDED' | 'TRANSACTION_UPDATED' | 'STATE_SYNC' | 'MANUAL_ADJUSTMENT';
  old_value?: string; // JSON string of old state
  new_value?: string; // JSON string of new state
  changed_by: 'USER' | 'SYSTEM' | 'API' | 'PAYMENT_GATEWAY';
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  created_date: string;
}

// New interface for balance snapshots (daily/hourly backups)
interface BalanceSnapshot {
  id?: number;
  user_id: string;
  balance: number;
  total_invested: number;
  total_withdrawn: number;
  profit_earned: number;
  transaction_count: number;
  snapshot_type: 'HOURLY' | 'DAILY' | 'MONTHLY' | 'MANUAL';
  created_date: string;
}

interface FinancialTransactionLocal {
  id?: number;
  _id: string;
  transaction_date: string;
  transaction_id: number;
  transaction_type: string;
  trade_type: string;
  book_owner_company: string;
  book_owner_user: string | null;
  party_user_id: string | null;
  party_user_name: string | null;
  party_user_email: string | null;
  party_user_phone: string | null;
  party_company: string | null;
  note: string;
  transaction_reference_id: string | null;
  amount: number;
  mediator: string | null;
  payment_transfer_mode: string;
  chart_of_account_id: string;
  chart_of_account_name: string;
  chart_of_account_type: string;
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
  synced_at: string;
}

class IndexedDBService {
  private db: IDBDatabase | null = null;
  private dbName = 'WalletTransactionsDB';
  private version = 2; // Increased version for schema updates
  private isInitialized = false;

  constructor() {
    this.initializeDatabase();
  }

  private initializeDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isInitialized && this.db) {
        resolve();
        return;
      }

      if (!window.indexedDB) {
        reject(new Error('IndexedDB is not supported in this browser'));
        return;
      }

      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('Error opening IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        console.log('Connected to IndexedDB:', this.dbName);
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create bank_accounts store
        if (!db.objectStoreNames.contains('bank_accounts')) {
          const bankAccountsStore = db.createObjectStore('bank_accounts', { keyPath: 'id', autoIncrement: true });
          bankAccountsStore.createIndex('api_id', 'api_id', { unique: false });
          bankAccountsStore.createIndex('user_id', 'user_id', { unique: false });
          console.log('Created bank_accounts object store');
        }

        // Create wallet_transactions store
        if (!db.objectStoreNames.contains('wallet_transactions')) {
          const transactionsStore = db.createObjectStore('wallet_transactions', { keyPath: 'id', autoIncrement: true });
          transactionsStore.createIndex('user_id', 'user_id', { unique: false });
          transactionsStore.createIndex('transaction_type', 'transaction_type', { unique: false });
          transactionsStore.createIndex('created_date', 'created_date', { unique: false });
          transactionsStore.createIndex('status', 'status', { unique: false });
          console.log('Created wallet_transactions object store');
        }

        // Create local_wallet_state store
        if (!db.objectStoreNames.contains('local_wallet_state')) {
          const walletStateStore = db.createObjectStore('local_wallet_state', { keyPath: 'id', autoIncrement: true });
          walletStateStore.createIndex('user_id', 'user_id', { unique: true });
          console.log('Created local_wallet_state object store');
        }

        // Create financial_transactions store
        if (!db.objectStoreNames.contains('financial_transactions')) {
          const financialTransactionsStore = db.createObjectStore('financial_transactions', { keyPath: 'id', autoIncrement: true });
          financialTransactionsStore.createIndex('_id', '_id', { unique: true });
          financialTransactionsStore.createIndex('transaction_date', 'transaction_date', { unique: false });
          financialTransactionsStore.createIndex('party_user_id', 'party_user_id', { unique: false });
          financialTransactionsStore.createIndex('book_owner_company', 'book_owner_company', { unique: false });
          financialTransactionsStore.createIndex('entry_type', 'entry_type', { unique: false });
          financialTransactionsStore.createIndex('synced_at', 'synced_at', { unique: false });
          console.log('Created financial_transactions object store');
        }

        // Create wallet_audit_logs store (new)
        if (!db.objectStoreNames.contains('wallet_audit_logs')) {
          const auditLogsStore = db.createObjectStore('wallet_audit_logs', { keyPath: 'id', autoIncrement: true });
          auditLogsStore.createIndex('user_id', 'user_id', { unique: false });
          auditLogsStore.createIndex('action', 'action', { unique: false });
          auditLogsStore.createIndex('created_date', 'created_date', { unique: false });
          auditLogsStore.createIndex('changed_by', 'changed_by', { unique: false });
          console.log('Created wallet_audit_logs object store');
        }

        // Create balance_snapshots store (new)
        if (!db.objectStoreNames.contains('balance_snapshots')) {
          const snapshotsStore = db.createObjectStore('balance_snapshots', { keyPath: 'id', autoIncrement: true });
          snapshotsStore.createIndex('user_id', 'user_id', { unique: false });
          snapshotsStore.createIndex('snapshot_type', 'snapshot_type', { unique: false });
          snapshotsStore.createIndex('created_date', 'created_date', { unique: false });
          console.log('Created balance_snapshots object store');
        }

        // Add new indexes to wallet_transactions for enhanced tracking
        if (db.objectStoreNames.contains('wallet_transactions')) {
          const transaction = db.transaction(['wallet_transactions'], 'versionchange');
          const store = transaction.objectStore('wallet_transactions');

          // Check if indexes already exist before creating
          if (!store.indexNames.contains('transaction_source')) {
            store.createIndex('transaction_source', 'transaction_source', { unique: false });
          }
          if (!store.indexNames.contains('reference_id')) {
            store.createIndex('reference_id', 'reference_id', { unique: false });
          }
          if (!store.indexNames.contains('verified_at')) {
            store.createIndex('verified_at', 'verified_at', { unique: false });
          }
          if (!store.indexNames.contains('transaction_id')) {
            store.createIndex('transaction_id', 'transaction_id', { unique: false });
          }
          if (!store.indexNames.contains('party_name')) {
            store.createIndex('party_name', 'party_name', { unique: false });
          }
          if (!store.indexNames.contains('entry_type')) {
            store.createIndex('entry_type', 'entry_type', { unique: false });
          }
          if (!store.indexNames.contains('payment_mode')) {
            store.createIndex('payment_mode', 'payment_mode', { unique: false });
          }
          console.log('Enhanced wallet_transactions indexes with accounting fields');
        }
      };
    });
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized || !this.db) {
      await this.initializeDatabase();
    }
  }

  // Bank Account operations
  async addBankAccount(account: Omit<BankAccount, 'id'>): Promise<number> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['bank_accounts'], 'readwrite');
      const store = transaction.objectStore('bank_accounts');
      const request = store.add({
        ...account,
        created_date: account.created_date || new Date().toISOString()
      });

      request.onsuccess = () => {
        resolve(request.result as number);
      };

      request.onerror = () => {
        console.error('Error adding bank account:', request.error);
        reject(request.error);
      };
    });
  }

  async getBankAccountsByUserId(userId: string): Promise<BankAccount[]> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['bank_accounts'], 'readonly');
      const store = transaction.objectStore('bank_accounts');
      const request = store.getAll();

      request.onsuccess = () => {
        // For now, return all accounts since we don't have user_id in the schema
        // In a real implementation, you'd filter by user_id
        resolve(request.result || []);
      };

      request.onerror = () => {
        console.error('Error fetching bank accounts:', request.error);
        reject(request.error);
      };
    });
  }

  async updateBankAccount(id: number, updates: Partial<BankAccount>): Promise<boolean> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['bank_accounts'], 'readwrite');
      const store = transaction.objectStore('bank_accounts');

      // First get the existing record
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const existingAccount = getRequest.result;
        if (!existingAccount) {
          resolve(false);
          return;
        }

        // Update the record
        const updatedAccount = {
          ...existingAccount,
          ...updates,
          updated_date: new Date().toISOString()
        };

        const updateRequest = store.put(updatedAccount);

        updateRequest.onsuccess = () => {
          resolve(true);
        };

        updateRequest.onerror = () => {
          console.error('Error updating bank account:', updateRequest.error);
          reject(updateRequest.error);
        };
      };

      getRequest.onerror = () => {
        console.error('Error fetching bank account for update:', getRequest.error);
        reject(getRequest.error);
      };
    });
  }

  async setActiveAccount(accountId: number, userId: string): Promise<boolean> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['bank_accounts'], 'readwrite');
      const store = transaction.objectStore('bank_accounts');

      // First, set all accounts to inactive
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => {
        const allAccounts = getAllRequest.result;
        let updatedCount = 0;
        const totalAccounts = allAccounts.length;

        if (totalAccounts === 0) {
          resolve(false);
          return;
        }

        allAccounts.forEach((account) => {
          const updatedAccount = {
            ...account,
            is_active: account.id === accountId,
            updated_date: new Date().toISOString()
          };

          const updateRequest = store.put(updatedAccount);

          updateRequest.onsuccess = () => {
            updatedCount++;
            if (updatedCount === totalAccounts) {
              resolve(true);
            }
          };

          updateRequest.onerror = () => {
            console.error('Error updating account active status:', updateRequest.error);
            reject(updateRequest.error);
          };
        });
      };

      getAllRequest.onerror = () => {
        console.error('Error fetching accounts for active status update:', getAllRequest.error);
        reject(getAllRequest.error);
      };
    });
  }

  async getActiveAccount(userId: string): Promise<BankAccount | null> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['bank_accounts'], 'readonly');
      const store = transaction.objectStore('bank_accounts');
      const request = store.getAll();

      request.onsuccess = () => {
        const accounts = request.result || [];
        const activeAccount = accounts.find(account => account.is_active);
        resolve(activeAccount || null);
      };

      request.onerror = () => {
        console.error('Error fetching active account:', request.error);
        reject(request.error);
      };
    });
  }

  // Wallet Transaction operations
  async addTransaction(transaction: Omit<WalletTransaction, 'id'>): Promise<number> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const dbTransaction = this.db.transaction(['wallet_transactions'], 'readwrite');
      const store = dbTransaction.objectStore('wallet_transactions');
      const request = store.add({
        ...transaction,
        created_date: transaction.created_date || new Date().toISOString()
      });

      request.onsuccess = () => {
        resolve(request.result as number);
      };

      request.onerror = () => {
        console.error('Error adding transaction:', request.error);
        reject(request.error);
      };
    });
  }

  async getTransactionsByUserId(userId: string, limit?: number): Promise<WalletTransaction[]> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['wallet_transactions'], 'readonly');
      const store = transaction.objectStore('wallet_transactions');
      const index = store.index('user_id');
      const request = index.getAll(userId);

      request.onsuccess = () => {
        let results = request.result || [];

        // Sort by created_date descending
        results.sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime());

        // Apply limit if specified
        if (limit && limit > 0) {
          results = results.slice(0, limit);
        }

        resolve(results);
      };

      request.onerror = () => {
        console.error('Error fetching transactions:', request.error);
        reject(request.error);
      };
    });
  }

  async updateTransactionStatus(id: number, status: 'PENDING' | 'COMPLETED' | 'FAILED'): Promise<boolean> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['wallet_transactions'], 'readwrite');
      const store = transaction.objectStore('wallet_transactions');

      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const existingTransaction = getRequest.result;
        if (!existingTransaction) {
          resolve(false);
          return;
        }

        const updatedTransaction = {
          ...existingTransaction,
          status,
          updated_date: new Date().toISOString()
        };

        const updateRequest = store.put(updatedTransaction);

        updateRequest.onsuccess = () => {
          resolve(true);
        };

        updateRequest.onerror = () => {
          console.error('Error updating transaction status:', updateRequest.error);
          reject(updateRequest.error);
        };
      };

      getRequest.onerror = () => {
        console.error('Error fetching transaction for update:', getRequest.error);
        reject(getRequest.error);
      };
    });
  }

  // Wallet State operations
  async updateWalletState(userId: string, walletData: Omit<LocalWalletState, 'id' | 'user_id'>): Promise<boolean> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['local_wallet_state'], 'readwrite');
      const store = transaction.objectStore('local_wallet_state');
      const index = store.index('user_id');
      const getRequest = index.get(userId);

      getRequest.onsuccess = () => {
        const existingState = getRequest.result;
        const now = new Date().toISOString();

        const stateData = {
          user_id: userId,
          ...walletData,
          last_sync_date: now,
          updated_date: now
        };

        let request: IDBRequest;
        if (existingState) {
          // Update existing
          request = store.put({ ...existingState, ...stateData });
        } else {
          // Create new
          request = store.add(stateData);
        }

        request.onsuccess = () => {
          resolve(true);
        };

        request.onerror = () => {
          console.error('Error updating wallet state:', request.error);
          reject(request.error);
        };
      };

      getRequest.onerror = () => {
        console.error('Error fetching wallet state:', getRequest.error);
        reject(getRequest.error);
      };
    });
  }

  async getWalletState(userId: string): Promise<LocalWalletState | null> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['local_wallet_state'], 'readonly');
      const store = transaction.objectStore('local_wallet_state');
      const index = store.index('user_id');
      const request = index.get(userId);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        console.error('Error fetching wallet state:', request.error);
        reject(request.error);
      };
    });
  }

  // Financial Transaction operations
  async addFinancialTransaction(transaction: Omit<FinancialTransactionLocal, 'id'>): Promise<number> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const dbTransaction = this.db.transaction(['financial_transactions'], 'readwrite');
      const store = dbTransaction.objectStore('financial_transactions');
      const request = store.add({
        ...transaction,
        synced_at: transaction.synced_at || new Date().toISOString()
      });

      request.onsuccess = () => {
        resolve(request.result as number);
      };

      request.onerror = () => {
        console.error('Error adding financial transaction:', request.error);
        reject(request.error);
      };
    });
  }

  async getFinancialTransactionById(transactionId: string): Promise<FinancialTransactionLocal | null> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['financial_transactions'], 'readonly');
      const store = transaction.objectStore('financial_transactions');
      const index = store.index('_id');
      const request = index.get(transactionId);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        console.error('Error fetching financial transaction:', request.error);
        reject(request.error);
      };
    });
  }

  async getFinancialTransactionsByCompany(companyId: string, limit?: number, offset?: number): Promise<FinancialTransactionLocal[]> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['financial_transactions'], 'readonly');
      const store = transaction.objectStore('financial_transactions');
      const index = store.index('book_owner_company');
      const request = index.getAll(companyId);

      request.onsuccess = () => {
        let results = request.result || [];

        // Sort by transaction_date descending
        results.sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());

        // Apply pagination if specified
        if (offset && offset > 0) {
          results = results.slice(offset);
        }
        if (limit && limit > 0) {
          results = results.slice(0, limit);
        }

        resolve(results);
      };

      request.onerror = () => {
        console.error('Error fetching financial transactions by company:', request.error);
        reject(request.error);
      };
    });
  }

  async getFinancialTransactionsByUser(userId: string, limit?: number): Promise<FinancialTransactionLocal[]> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['financial_transactions'], 'readonly');
      const store = transaction.objectStore('financial_transactions');
      const index = store.index('party_user_id');
      const request = index.getAll(userId);

      request.onsuccess = () => {
        let results = request.result || [];

        // Sort by transaction_date descending
        results.sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());

        // Apply limit if specified
        if (limit && limit > 0) {
          results = results.slice(0, limit);
        }

        resolve(results);
      };

      request.onerror = () => {
        console.error('Error fetching financial transactions by user:', request.error);
        reject(request.error);
      };
    });
  }

  async updateFinancialTransaction(id: number, updates: Partial<FinancialTransactionLocal>): Promise<boolean> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['financial_transactions'], 'readwrite');
      const store = transaction.objectStore('financial_transactions');

      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const existingTransaction = getRequest.result;
        if (!existingTransaction) {
          resolve(false);
          return;
        }

        const updatedTransaction = {
          ...existingTransaction,
          ...updates,
          synced_at: new Date().toISOString()
        };

        const updateRequest = store.put(updatedTransaction);

        updateRequest.onsuccess = () => {
          resolve(true);
        };

        updateRequest.onerror = () => {
          console.error('Error updating financial transaction:', updateRequest.error);
          reject(updateRequest.error);
        };
      };

      getRequest.onerror = () => {
        console.error('Error fetching financial transaction for update:', getRequest.error);
        reject(getRequest.error);
      };
    });
  }

  async bulkSyncFinancialTransactions(transactions: Omit<FinancialTransactionLocal, 'id'>[]): Promise<number[]> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['financial_transactions'], 'readwrite');
      const store = transaction.objectStore('financial_transactions');
      const index = store.index('_id');
      const syncedIds: number[] = [];
      let processedCount = 0;

      const processTransaction = (transactionData: Omit<FinancialTransactionLocal, 'id'>) => {
        // Check if transaction already exists
        const getRequest = index.get(transactionData._id);

        getRequest.onsuccess = () => {
          const existingTransaction = getRequest.result;

          if (existingTransaction) {
            // Update existing transaction
            const updatedTransaction = {
              ...existingTransaction,
              ...transactionData,
              synced_at: new Date().toISOString()
            };

            const updateRequest = store.put(updatedTransaction);
            updateRequest.onsuccess = () => {
              syncedIds.push(existingTransaction.id!);
              processedCount++;
              if (processedCount === transactions.length) {
                resolve(syncedIds);
              }
            };

            updateRequest.onerror = () => {
              console.error('Error updating existing financial transaction:', updateRequest.error);
              processedCount++;
              if (processedCount === transactions.length) {
                resolve(syncedIds);
              }
            };
          } else {
            // Add new transaction
            const addRequest = store.add({
              ...transactionData,
              synced_at: new Date().toISOString()
            });

            addRequest.onsuccess = () => {
              syncedIds.push(addRequest.result as number);
              processedCount++;
              if (processedCount === transactions.length) {
                resolve(syncedIds);
              }
            };

            addRequest.onerror = () => {
              console.error('Error adding new financial transaction:', addRequest.error);
              processedCount++;
              if (processedCount === transactions.length) {
                resolve(syncedIds);
              }
            };
          }
        };

        getRequest.onerror = () => {
          console.error('Error checking existing financial transaction:', getRequest.error);
          processedCount++;
          if (processedCount === transactions.length) {
            resolve(syncedIds);
          }
        };
      };

      // Process all transactions
      transactions.forEach(processTransaction);

      transaction.onerror = () => {
        console.error('Transaction error during bulk sync:', transaction.error);
        reject(transaction.error);
      };
    });
  }

  // Utility methods
  async getDatabaseStats(): Promise<{
    totalAccounts: number;
    totalTransactions: number;
    totalUsers: number;
    totalFinancialTransactions: number;
  }> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['bank_accounts', 'wallet_transactions', 'local_wallet_state', 'financial_transactions'], 'readonly');
      const results = { totalAccounts: 0, totalTransactions: 0, totalUsers: 0, totalFinancialTransactions: 0 };
      let completedQueries = 0;

      // Count bank accounts
      const accountsStore = transaction.objectStore('bank_accounts');
      const accountsRequest = accountsStore.count();
      accountsRequest.onsuccess = () => {
        results.totalAccounts = accountsRequest.result;
        completedQueries++;
        if (completedQueries === 4) resolve(results);
      };

      // Count wallet transactions
      const transactionsStore = transaction.objectStore('wallet_transactions');
      const transactionsRequest = transactionsStore.count();
      transactionsRequest.onsuccess = () => {
        results.totalTransactions = transactionsRequest.result;
        completedQueries++;
        if (completedQueries === 4) resolve(results);
      };

      // Count users
      const usersStore = transaction.objectStore('local_wallet_state');
      const usersRequest = usersStore.count();
      usersRequest.onsuccess = () => {
        results.totalUsers = usersRequest.result;
        completedQueries++;
        if (completedQueries === 4) resolve(results);
      };

      // Count financial transactions
      const financialTransactionsStore = transaction.objectStore('financial_transactions');
      const financialTransactionsRequest = financialTransactionsStore.count();
      financialTransactionsRequest.onsuccess = () => {
        results.totalFinancialTransactions = financialTransactionsRequest.result;
        completedQueries++;
        if (completedQueries === 4) resolve(results);
      };

      transaction.onerror = () => {
        console.error('Error getting database stats:', transaction.error);
        reject(transaction.error);
      };
    });
  }

  async closeDatabase(): Promise<void> {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close();
        this.db = null;
        this.isInitialized = false;
        console.log('IndexedDB connection closed');
      }
      resolve();
    });
  }

  // New methods for audit logs
  async addAuditLog(auditLog: Omit<WalletAuditLog, 'id'>): Promise<number> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['wallet_audit_logs'], 'readwrite');
      const store = transaction.objectStore('wallet_audit_logs');

      const auditLogWithTimestamp = {
        ...auditLog,
        created_date: auditLog.created_date || new Date().toISOString()
      };

      const request = store.add(auditLogWithTimestamp);

      request.onsuccess = () => {
        resolve(request.result as number);
      };

      request.onerror = () => {
        console.error('Error adding audit log:', request.error);
        reject(request.error);
      };
    });
  }

  // New methods for balance snapshots
  async addBalanceSnapshot(snapshot: Omit<BalanceSnapshot, 'id'>): Promise<number> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['balance_snapshots'], 'readwrite');
      const store = transaction.objectStore('balance_snapshots');

      const snapshotWithTimestamp = {
        ...snapshot,
        created_date: snapshot.created_date || new Date().toISOString()
      };

      const request = store.add(snapshotWithTimestamp);

      request.onsuccess = () => {
        resolve(request.result as number);
      };

      request.onerror = () => {
        console.error('Error adding balance snapshot:', request.error);
        reject(request.error);
      };
    });
  }

  // Get audit logs for a user
  async getAuditLogsByUserId(userId: string, limit?: number): Promise<WalletAuditLog[]> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['wallet_audit_logs'], 'readonly');
      const store = transaction.objectStore('wallet_audit_logs');
      const index = store.index('user_id');
      const request = index.getAll(userId);

      request.onsuccess = () => {
        let results = request.result as WalletAuditLog[];

        // Sort by created_date descending (newest first)
        results.sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime());

        // Apply limit if specified
        if (limit && limit > 0) {
          results = results.slice(0, limit);
        }

        resolve(results);
      };

      request.onerror = () => {
        console.error('Error fetching audit logs:', request.error);
        reject(request.error);
      };
    });
  }

  // Get balance snapshots for a user
  async getBalanceSnapshotsByUserId(userId: string, limit?: number): Promise<BalanceSnapshot[]> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['balance_snapshots'], 'readonly');
      const store = transaction.objectStore('balance_snapshots');
      const index = store.index('user_id');
      const request = index.getAll(userId);

      request.onsuccess = () => {
        let results = request.result as BalanceSnapshot[];

        // Sort by created_date descending (newest first)
        results.sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime());

        // Apply limit if specified
        if (limit && limit > 0) {
          results = results.slice(0, limit);
        }

        resolve(results);
      };

      request.onerror = () => {
        console.error('Error fetching balance snapshots:', request.error);
        reject(request.error);
      };
    });
  }
}

// Export types and singleton instance
export type { BankAccount, WalletTransaction, LocalWalletState, FinancialTransactionLocal, WalletAuditLog, BalanceSnapshot };
export const indexedDBService = new IndexedDBService();
export default indexedDBService;