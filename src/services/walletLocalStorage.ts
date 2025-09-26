export interface WalletData {
  balance: number;
  totalInvested: number;
  totalWithdrawn: number;
  profitEarned: number;
  lastSyncedAt?: string; // Timestamp of last sync with financial transactions
}

export interface WalletTransaction {
  id: string;
  type: 'ADD' | 'WITHDRAW' | 'INVESTMENT' | 'PROFIT';
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string;
  transaction_id?: string;
  created_at: string;
  status: 'pending' | 'completed';
}

const WALLET_STORAGE_KEY = 'available-balance';
const WALLET_TRANSACTIONS_KEY = 'trip-vesta-wallet-transactions';

export class WalletLocalStorage {
  // Default wallet data
  private static defaultWalletData: WalletData = {
    balance: 0,
    totalInvested: 0,
    totalWithdrawn: 0,
    profitEarned: 0
  };

  // Migrate old wallet data to new key
  private static migrateOldData(): void {
    try {
      const oldKey = 'trip-vesta-wallet-data';
      const oldData = localStorage.getItem(oldKey);
      const newData = localStorage.getItem(WALLET_STORAGE_KEY);

      // If old data exists but new data doesn't, migrate it
      if (oldData && !newData) {
        console.log('🔄 Migrating wallet data from old key to new key...');
        localStorage.setItem(WALLET_STORAGE_KEY, oldData);
        localStorage.removeItem(oldKey); // Clean up old key
        console.log('✅ Wallet data migrated successfully to "available-balance"');
      }
    } catch (error) {
      console.error('Error migrating wallet data:', error);
    }
  }

  // Get wallet data from localStorage
  static getWalletData(): WalletData {
    try {
      // First, try to migrate any old data
      this.migrateOldData();

      const stored = localStorage.getItem(WALLET_STORAGE_KEY);
      const walletData = stored ? JSON.parse(stored) : this.defaultWalletData;

      console.log('💰 Wallet data loaded from localStorage:', {
        key: WALLET_STORAGE_KEY,
        balance: `₹${walletData.balance.toLocaleString()}`,
        totalInvested: `₹${walletData.totalInvested.toLocaleString()}`
      });

      return walletData;
    } catch (error) {
      console.error('Error loading wallet data from localStorage:', error);
      return this.defaultWalletData;
    }
  }

  // Save wallet data to localStorage
  static saveWalletData(walletData: WalletData): void {
    try {
      localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(walletData));
      console.log('💾 Wallet data saved to localStorage:', {
        key: WALLET_STORAGE_KEY,
        balance: `₹${walletData.balance.toLocaleString()}`,
        totalInvested: `₹${walletData.totalInvested.toLocaleString()}`
      });
    } catch (error) {
      console.error('Error saving wallet data to localStorage:', error);
    }
  }

  // Get all transactions from localStorage
  static getTransactions(): WalletTransaction[] {
    try {
      const stored = localStorage.getItem(WALLET_TRANSACTIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading transactions from localStorage:', error);
      return [];
    }
  }

  // Save transactions to localStorage
  static saveTransactions(transactions: WalletTransaction[]): void {
    try {
      localStorage.setItem(WALLET_TRANSACTIONS_KEY, JSON.stringify(transactions));
    } catch (error) {
      console.error('Error saving transactions to localStorage:', error);
    }
  }

  // Add a new transaction
  static addTransaction(transaction: Omit<WalletTransaction, 'id' | 'created_at'>): WalletTransaction {
    const newTransaction: WalletTransaction = {
      ...transaction,
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString()
    };

    const transactions = this.getTransactions();
    transactions.unshift(newTransaction); // Add to beginning of array
    this.saveTransactions(transactions);

    return newTransaction;
  }

  // Update wallet balance and add transaction
  static updateBalance(
    type: 'ADD' | 'WITHDRAW' | 'INVESTMENT' | 'PROFIT',
    amount: number,
    description: string,
    transaction_id?: string,
    status: 'pending' | 'completed' = 'completed'
  ): { success: boolean; newBalance?: number; transaction?: WalletTransaction; error?: string } {
    try {
      const walletData = this.getWalletData();
      let newBalance = walletData.balance;
      let newTotalInvested = walletData.totalInvested;
      let newTotalWithdrawn = walletData.totalWithdrawn;
      let newProfitEarned = walletData.profitEarned;

      // Calculate new balance based on transaction type
      switch (type) {
        case 'ADD':
          newBalance += amount;
          break;
        case 'WITHDRAW':
          if (walletData.balance < amount) {
            return { success: false, error: 'Insufficient balance' };
          }
          newBalance -= amount;
          newTotalWithdrawn += amount;
          break;
        case 'INVESTMENT':
          if (walletData.balance < amount) {
            return { success: false, error: 'Insufficient balance' };
          }
          newBalance -= amount;
          newTotalInvested += amount;
          break;
        case 'PROFIT':
          newBalance += amount;
          newProfitEarned += amount;
          break;
      }

      // Add transaction record
      const transaction = this.addTransaction({
        type,
        amount,
        balance_before: walletData.balance,
        balance_after: newBalance,
        description,
        transaction_id,
        status
      });

      // Update wallet data
      const newWalletData: WalletData = {
        balance: newBalance,
        totalInvested: newTotalInvested,
        totalWithdrawn: newTotalWithdrawn,
        profitEarned: newProfitEarned
      };

      this.saveWalletData(newWalletData);

      return {
        success: true,
        newBalance,
        transaction
      };
    } catch (error) {
      console.error('Error updating wallet balance:', error);
      return { success: false, error: 'Failed to update wallet balance' };
    }
  }

  // Sync localStorage with calculated financial transaction balance
  static syncWithFinancialTransactionBalance(
    calculatedBalance: number,
    totalCredits: number = 0,
    totalDebits: number = 0,
    creditCount: number = 0,
    debitCount: number = 0
  ): void {
    try {
      const currentWalletData = this.getWalletData();

      // Create updated wallet data based on financial transaction calculation
      const updatedWalletData: WalletData = {
        balance: calculatedBalance,
        totalInvested: totalDebits, // Debits can represent investments
        totalWithdrawn: 0, // Keep existing or calculate based on specific transaction types
        profitEarned: Math.max(0, calculatedBalance - totalCredits + totalDebits), // Rough profit calculation
        lastSyncedAt: new Date().toISOString() // Record sync timestamp
      };

      // Only update if the balance has changed significantly (to avoid unnecessary updates)
      if (Math.abs(currentWalletData.balance - calculatedBalance) >= 1) {
        this.saveWalletData(updatedWalletData);

        // Add a transaction record for the sync
        this.addTransaction({
          type: 'ADD',
          amount: calculatedBalance - currentWalletData.balance,
          balance_before: currentWalletData.balance,
          balance_after: calculatedBalance,
          description: `Balance synced with financial transactions (${creditCount} credits, ${debitCount} debits)`,
          transaction_id: `sync_${Date.now()}`,
          status: 'completed'
        });

        console.log('🔄 localStorage synced with financial transaction balance:', {
          previousBalance: `₹${currentWalletData.balance.toLocaleString()}`,
          newBalance: `₹${calculatedBalance.toLocaleString()}`,
          totalCredits: `₹${totalCredits.toLocaleString()}`,
          totalDebits: `₹${totalDebits.toLocaleString()}`,
          creditCount,
          debitCount
        });
      } else {
        console.log('💰 Balance already in sync with financial transactions:', {
          balance: `₹${calculatedBalance.toLocaleString()}`
        });
      }
    } catch (error) {
      console.error('Error syncing localStorage with financial transaction balance:', error);
    }
  }

  // Clear all wallet data (for testing)
  static clearAllData(): void {
    // Remove new keys
    localStorage.removeItem(WALLET_STORAGE_KEY);
    localStorage.removeItem(WALLET_TRANSACTIONS_KEY);

    // Also remove old key if it exists
    localStorage.removeItem('trip-vesta-wallet-data');

    console.log('🧹 All wallet data cleared from localStorage');
  }

  // Get transactions by type
  static getTransactionsByType(type: WalletTransaction['type']): WalletTransaction[] {
    return this.getTransactions().filter(t => t.type === type);
  }

  // Get pending transactions
  static getPendingTransactions(): WalletTransaction[] {
    return this.getTransactions().filter(t => t.status === 'pending');
  }

  // Update transaction status
  static updateTransactionStatus(transactionId: string, status: 'pending' | 'completed'): boolean {
    try {
      const transactions = this.getTransactions();
      const transactionIndex = transactions.findIndex(t => t.id === transactionId);

      if (transactionIndex === -1) {
        return false;
      }

      transactions[transactionIndex].status = status;
      this.saveTransactions(transactions);

      return true;
    } catch (error) {
      console.error('Error updating transaction status:', error);
      return false;
    }
  }

  // Process pending investment transactions after 24 hours
  static processPendingInvestments(): void {
    const transactions = this.getTransactions();
    const now = new Date().getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    transactions.forEach(transaction => {
      if (transaction.type === 'INVESTMENT' &&
          transaction.status === 'pending' &&
          (now - new Date(transaction.created_at).getTime()) >= twentyFourHours) {

        this.updateTransactionStatus(transaction.id, 'completed');

        // Update wallet data to reflect the completed investment
        const walletData = this.getWalletData();
        // Balance was already deducted when transaction was created, so no change needed
        // Just ensure totalInvested is correct
        this.saveWalletData(walletData);
      }
    });
  }
}