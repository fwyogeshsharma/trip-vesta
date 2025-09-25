import { indexedDBService, BankAccount, WalletTransaction, LocalWalletState } from './indexedDBService';

interface WalletData {
  balance: number;
  totalInvested: number;
  totalWithdrawn: number;
  profitEarned: number;
}

export class WalletSyncService {
  private static instance: WalletSyncService;
  private syncInProgress = false;

  private constructor() {}

  static getInstance(): WalletSyncService {
    if (!WalletSyncService.instance) {
      WalletSyncService.instance = new WalletSyncService();
    }
    return WalletSyncService.instance;
  }

  /**
   * Sync bank account data to local database when added via API
   */
  async syncBankAccountToLocal(apiAccountData: Record<string, unknown>): Promise<number> {
    try {
      const bankAccount: Omit<BankAccount, 'id' | 'created_date' | 'updated_date'> = {
        account_holder_name: (apiAccountData.beneficiary_name || apiAccountData.accountHolderName) as string,
        bank_name: (apiAccountData.bank_name || apiAccountData.bank) as string,
        account_number: (apiAccountData.account_number || apiAccountData.accountNumber) as string,
        ifsc_code: (apiAccountData.ifsc_code || apiAccountData.ifscCode) as string,
        account_type: (apiAccountData.account_type || apiAccountData.type || 'Savings') as string,
        is_verified: Boolean(apiAccountData.is_verified),
        is_active: Boolean(apiAccountData.is_active),
        api_id: (apiAccountData._id || apiAccountData.id) as string
      };

      const localId = await indexedDBService.addBankAccount(bankAccount);
      console.log('Bank account synced to local database:', { localId, apiId: bankAccount.api_id });

      return localId;
    } catch (error) {
      console.error('Error syncing bank account to local database:', error);
      throw error;
    }
  }

  /**
   * Sync all bank accounts from API to local database
   */
  async syncAllBankAccountsToLocal(apiAccountsData: Record<string, unknown>[]): Promise<number[]> {
    try {
      const syncResults: number[] = [];

      for (const apiAccount of apiAccountsData) {
        try {
          // Check if account already exists in local database
          const existingAccounts = await indexedDBService.getBankAccountsByUserId('current_user'); // You might want to pass actual user ID
          const existingAccount = existingAccounts.find(acc => acc.api_id === apiAccount._id as string);

          if (existingAccount) {
            // Update existing account
            const updates: Partial<BankAccount> = {
              account_holder_name: apiAccount.beneficiary_name as string,
              bank_name: apiAccount.bank_name as string,
              account_number: apiAccount.account_number as string,
              ifsc_code: apiAccount.ifsc_code as string,
              account_type: (apiAccount.account_type || 'Savings') as string,
              is_verified: Boolean(apiAccount.is_verified),
              is_active: Boolean(apiAccount.is_active)
            };

            await indexedDBService.updateBankAccount(existingAccount.id!, updates);
            syncResults.push(existingAccount.id!);
            console.log('Updated existing bank account in local database:', existingAccount.id);
          } else {
            // Add new account
            const localId = await this.syncBankAccountToLocal(apiAccount);
            syncResults.push(localId);
          }
        } catch (error) {
          console.error('Error syncing individual bank account:', error);
          // Continue with other accounts even if one fails
        }
      }

      console.log('Batch sync completed. Synced accounts:', syncResults.length);
      return syncResults;
    } catch (error) {
      console.error('Error during batch bank accounts sync:', error);
      throw error;
    }
  }

  /**
   * Record wallet transaction in local database
   */
  async recordWalletTransaction(
    userId: string,
    transactionType: 'ADD_FUNDS' | 'WITHDRAW' | 'INVESTMENT' | 'PROFIT',
    amount: number,
    balanceBefore: number,
    balanceAfter: number,
    description: string,
    bankAccountId?: number,
    apiTransactionId?: string
  ): Promise<number> {
    try {
      const transaction: Omit<WalletTransaction, 'id' | 'created_date' | 'updated_date'> = {
        user_id: userId,
        transaction_type: transactionType,
        amount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        description,
        bank_account_id: bankAccountId,
        api_transaction_id: apiTransactionId,
        status: 'COMPLETED'
      };

      const localTransactionId = await indexedDBService.addTransaction(transaction);
      console.log('Wallet transaction recorded:', { localTransactionId, type: transactionType, amount });

      // Update local wallet state
      await this.updateLocalWalletState(userId, {
        balance: balanceAfter,
        total_invested: transactionType === 'INVESTMENT' ? amount : 0,
        total_withdrawn: transactionType === 'WITHDRAW' ? amount : 0,
        profit_earned: transactionType === 'PROFIT' ? amount : 0
      });

      return localTransactionId;
    } catch (error) {
      console.error('Error recording wallet transaction:', error);
      throw error;
    }
  }

  /**
   * Update local wallet state
   */
  async updateLocalWalletState(
    userId: string,
    updates: {
      balance?: number;
      total_invested?: number;
      total_withdrawn?: number;
      profit_earned?: number;
    }
  ): Promise<void> {
    try {
      // Get current state
      let currentState = await indexedDBService.getWalletState(userId);

      if (!currentState) {
        // Create new state
        currentState = {
          user_id: userId,
          balance: 0,
          total_invested: 0,
          total_withdrawn: 0,
          profit_earned: 0,
          last_sync_date: new Date().toISOString()
        };
      }

      // Apply updates
      const updatedState = {
        balance: updates.balance !== undefined ? updates.balance : currentState.balance,
        total_invested: currentState.total_invested + (updates.total_invested || 0),
        total_withdrawn: currentState.total_withdrawn + (updates.total_withdrawn || 0),
        profit_earned: currentState.profit_earned + (updates.profit_earned || 0)
      };

      await indexedDBService.updateWalletState(userId, updatedState);
      console.log('Local wallet state updated:', updatedState);
    } catch (error) {
      console.error('Error updating local wallet state:', error);
      throw error;
    }
  }

  /**
   * Sync wallet data from context to local database
   */
  async syncWalletDataToLocal(userId: string, walletData: WalletData): Promise<void> {
    try {
      if (this.syncInProgress) {
        console.log('Sync already in progress, skipping...');
        return;
      }

      this.syncInProgress = true;

      const localWalletData = {
        balance: walletData.balance,
        total_invested: walletData.totalInvested,
        total_withdrawn: walletData.totalWithdrawn,
        profit_earned: walletData.profitEarned
      };

      await indexedDBService.updateWalletState(userId, localWalletData);
      console.log('Wallet data synced to local database for user:', userId);
    } catch (error) {
      console.error('Error syncing wallet data to local database:', error);
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Get wallet transaction history from local database
   */
  async getWalletTransactionHistory(userId: string, limit?: number, offset?: number): Promise<WalletTransaction[]> {
    try {
      return await indexedDBService.getTransactionsByUserId(userId, limit);
    } catch (error) {
      console.error('Error fetching wallet transaction history:', error);
      throw error;
    }
  }

  /**
   * Get local wallet state
   */
  async getLocalWalletState(userId: string): Promise<LocalWalletState | null> {
    try {
      return await indexedDBService.getWalletState(userId);
    } catch (error) {
      console.error('Error fetching local wallet state:', error);
      throw error;
    }
  }

  /**
   * Get local bank accounts
   */
  async getLocalBankAccounts(userId: string): Promise<BankAccount[]> {
    try {
      return await indexedDBService.getBankAccountsByUserId(userId);
    } catch (error) {
      console.error('Error fetching local bank accounts:', error);
      throw error;
    }
  }

  /**
   * Set active bank account in local database
   */
  async setActiveAccount(accountId: number, userId: string): Promise<boolean> {
    try {
      const success = await indexedDBService.setActiveAccount(accountId, userId);
      console.log('Active account updated:', { accountId, success });
      return success;
    } catch (error) {
      console.error('Error setting active account:', error);
      throw error;
    }
  }

  /**
   * Get active bank account from local database
   */
  async getActiveAccount(userId: string): Promise<BankAccount | null> {
    try {
      return await indexedDBService.getActiveAccount(userId);
    } catch (error) {
      console.error('Error fetching active account:', error);
      throw error;
    }
  }

  /**
   * Background sync process - could be called periodically
   */
  async performBackgroundSync(userId: string, apiWalletData?: WalletData, apiBankAccounts?: Record<string, unknown>[]): Promise<void> {
    try {
      console.log('Starting background sync process...');

      // Sync wallet data if provided
      if (apiWalletData) {
        await this.syncWalletDataToLocal(userId, apiWalletData);
      }

      // Sync bank accounts if provided
      if (apiBankAccounts && apiBankAccounts.length > 0) {
        await this.syncAllBankAccountsToLocal(apiBankAccounts);
      }

      console.log('Background sync completed successfully');
    } catch (error) {
      console.error('Error during background sync:', error);
      // Don't throw here as this is a background process
    }
  }

  /**
   * Get database statistics for monitoring
   */
  async getDatabaseStats(): Promise<{
    totalAccounts: number;
    totalTransactions: number;
    totalUsers: number;
  }> {
    try {
      return await indexedDBService.getDatabaseStats();
    } catch (error) {
      console.error('Error fetching database stats:', error);
      throw error;
    }
  }

  /**
   * Clean up old transaction records (optional maintenance)
   */
  async cleanupOldRecords(daysToKeep: number = 365): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      // Note: You would need to implement this in databaseService if needed
      console.log('Cleanup functionality can be implemented for transactions older than:', cutoffDate);
    } catch (error) {
      console.error('Error during cleanup:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const walletSyncService = WalletSyncService.getInstance();
export default walletSyncService;