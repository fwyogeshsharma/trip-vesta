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
   * Record wallet transaction in local database with enhanced tracking
   */
  async recordWalletTransaction(
    userId: string,
    transactionType: 'ADD_FUNDS' | 'WITHDRAW' | 'INVESTMENT' | 'PROFIT' | 'REFUND' | 'ADJUSTMENT',
    amount: number,
    balanceBefore: number,
    balanceAfter: number,
    description: string,
    bankAccountId?: number,
    apiTransactionId?: string,
    additionalData?: {
      transactionSource?: 'CASHFREE' | 'RAZORPAY' | 'MANUAL' | 'SYSTEM' | 'BANK_TRANSFER';
      referenceId?: string;
      gatewayResponse?: any;
      feeAmount?: number;
      verificationMethod?: 'API' | 'WEBHOOK' | 'MANUAL';
      metadata?: any;
      // New accounting fields
      partyName?: string;
      partyType?: 'PAYMENT_GATEWAY' | 'USER' | 'BANK' | 'SYSTEM';
      paymentMode?: 'ONLINE' | 'UPI' | 'CARD' | 'BANK_TRANSFER' | 'CASH' | 'WALLET';
      chartOfAccount?: string;
      voucherNumber?: string;
      customNote?: string;
    }
  ): Promise<number> {
    try {
      const now = new Date().toISOString();
      const netAmount = additionalData?.feeAmount ? amount - additionalData.feeAmount : amount;

      // Generate unique transaction ID for accounting
      const transactionId = additionalData?.referenceId ||
                           `TXN${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      // Determine entry type based on transaction type
      const entryType: 'DEBIT' | 'CREDIT' = ['WITHDRAW', 'INVESTMENT'].includes(transactionType) ? 'DEBIT' : 'CREDIT';

      // Determine party based on transaction source
      let partyName = additionalData?.partyName;
      let partyType = additionalData?.partyType;

      if (!partyName) {
        switch (additionalData?.transactionSource) {
          case 'CASHFREE':
            partyName = 'Cashfree Payments';
            partyType = 'PAYMENT_GATEWAY';
            break;
          case 'RAZORPAY':
            partyName = 'Razorpay';
            partyType = 'PAYMENT_GATEWAY';
            break;
          case 'BANK_TRANSFER':
            partyName = 'Bank';
            partyType = 'BANK';
            break;
          default:
            partyName = 'System';
            partyType = 'SYSTEM';
        }
      }

      // Create accounting note
      const accountingNote = additionalData?.customNote ||
        `${transactionType.replace('_', ' ')} - ${description} via ${additionalData?.transactionSource || 'SYSTEM'}`;

      const transaction: Omit<WalletTransaction, 'id' | 'created_date' | 'updated_date'> = {
        user_id: userId,
        transaction_type: transactionType,
        amount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        description,
        bank_account_id: bankAccountId,
        api_transaction_id: apiTransactionId,
        status: 'COMPLETED',
        transaction_source: additionalData?.transactionSource || 'SYSTEM',
        reference_id: additionalData?.referenceId,
        gateway_response: additionalData?.gatewayResponse ? JSON.stringify(additionalData.gatewayResponse) : undefined,
        fee_amount: additionalData?.feeAmount || 0,
        net_amount: netAmount,
        metadata: additionalData?.metadata ? JSON.stringify(additionalData.metadata) : undefined,
        verified_at: now,
        verification_method: additionalData?.verificationMethod || 'SYSTEM',

        // Enhanced accounting fields
        transaction_id: transactionId,
        party_name: partyName,
        party_type: partyType,
        note: accountingNote,
        payment_mode: additionalData?.paymentMode || 'ONLINE',
        entry_type: entryType,
        chart_of_account: additionalData?.chartOfAccount || 'WALLET_BALANCE',
        voucher_number: additionalData?.voucherNumber || `VCH${Date.now()}`
      };

      const localTransactionId = await indexedDBService.addTransaction(transaction);
      console.log('Wallet transaction recorded:', { localTransactionId, type: transactionType, amount });

      // Update local wallet state with comprehensive tracking
      const stateUpdates: any = {
        balance: balanceAfter,
        last_transaction_id: localTransactionId
      };

      // Update specific counters based on transaction type
      if (transactionType === 'INVESTMENT') {
        stateUpdates.total_invested = amount;
      } else if (transactionType === 'WITHDRAW') {
        stateUpdates.total_withdrawn = amount;
      } else if (transactionType === 'PROFIT') {
        stateUpdates.profit_earned = amount;
      } else if (transactionType === 'REFUND') {
        stateUpdates.total_refunds = amount;
      } else if (transactionType === 'ADJUSTMENT') {
        stateUpdates.total_adjustments = amount;
      }

      // Track fees if provided
      if (additionalData?.feeAmount) {
        stateUpdates.total_fees_paid = additionalData.feeAmount;
      }

      await this.updateLocalWalletState(userId, stateUpdates);

      // Create audit log for this transaction
      await this.createAuditLog(userId, 'TRANSACTION_ADDED', undefined, JSON.stringify(transaction), 'SYSTEM');

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
        // Create new state with enhanced fields
        currentState = {
          user_id: userId,
          balance: 0,
          total_invested: 0,
          total_withdrawn: 0,
          profit_earned: 0,
          total_fees_paid: 0,
          total_refunds: 0,
          total_adjustments: 0,
          pending_balance: 0,
          available_balance: 0,
          version: 1,
          last_sync_date: new Date().toISOString()
        };
      }

      // Apply updates with enhanced tracking
      const updatedState = {
        balance: updates.balance !== undefined ? updates.balance : currentState.balance,
        total_invested: currentState.total_invested + (updates.total_invested || 0),
        total_withdrawn: currentState.total_withdrawn + (updates.total_withdrawn || 0),
        profit_earned: currentState.profit_earned + (updates.profit_earned || 0),
        total_fees_paid: (currentState.total_fees_paid || 0) + (updates.total_fees_paid || 0),
        total_refunds: (currentState.total_refunds || 0) + (updates.total_refunds || 0),
        total_adjustments: (currentState.total_adjustments || 0) + (updates.total_adjustments || 0),
        pending_balance: updates.pending_balance !== undefined ? updates.pending_balance : (currentState.pending_balance || 0),
        available_balance: (updates.balance !== undefined ? updates.balance : currentState.balance) - (currentState.pending_balance || 0),
        last_transaction_id: updates.last_transaction_id || currentState.last_transaction_id,
        version: (currentState.version || 0) + 1,
        last_api_sync_date: updates.last_api_sync_date || currentState.last_api_sync_date
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
   * Create audit log entry
   */
  async createAuditLog(
    userId: string,
    action: 'BALANCE_UPDATE' | 'TRANSACTION_ADDED' | 'TRANSACTION_UPDATED' | 'STATE_SYNC' | 'MANUAL_ADJUSTMENT',
    oldValue?: string,
    newValue?: string,
    changedBy: 'USER' | 'SYSTEM' | 'API' | 'PAYMENT_GATEWAY' = 'SYSTEM'
  ): Promise<void> {
    try {
      const auditLog = {
        user_id: userId,
        action,
        old_value: oldValue,
        new_value: newValue,
        changed_by: changedBy,
        ip_address: this.getClientIP(),
        user_agent: navigator.userAgent,
        session_id: this.getSessionId(),
        created_date: new Date().toISOString()
      };

      await indexedDBService.addAuditLog(auditLog);
      console.log('Audit log created:', { action, userId, changedBy });
    } catch (error) {
      console.error('Error creating audit log:', error);
      // Don't throw here as audit logging failure shouldn't break main functionality
    }
  }

  /**
   * Create balance snapshot
   */
  async createBalanceSnapshot(
    userId: string,
    walletState: LocalWalletState,
    snapshotType: 'HOURLY' | 'DAILY' | 'MONTHLY' | 'MANUAL' = 'MANUAL'
  ): Promise<void> {
    try {
      const transactionCount = await this.getTransactionCount(userId);

      const snapshot = {
        user_id: userId,
        balance: walletState.balance,
        total_invested: walletState.total_invested,
        total_withdrawn: walletState.total_withdrawn,
        profit_earned: walletState.profit_earned,
        transaction_count: transactionCount,
        snapshot_type: snapshotType,
        created_date: new Date().toISOString()
      };

      await indexedDBService.addBalanceSnapshot(snapshot);
      console.log('Balance snapshot created:', { userId, snapshotType, balance: walletState.balance });
    } catch (error) {
      console.error('Error creating balance snapshot:', error);
      throw error;
    }
  }

  /**
   * Auto-sync and backup mechanism
   */
  async performAutoBackup(userId: string): Promise<void> {
    try {
      const walletState = await this.getLocalWalletState(userId);
      if (walletState) {
        await this.createBalanceSnapshot(userId, walletState, 'HOURLY');

        // Perform integrity check
        const isValid = await this.verifyWalletIntegrity(userId);
        if (!isValid) {
          console.warn('Wallet integrity check failed for user:', userId);
          await this.createAuditLog(userId, 'MANUAL_ADJUSTMENT', undefined, 'Integrity check failed', 'SYSTEM');
        }
      }
    } catch (error) {
      console.error('Error during auto backup:', error);
      // Don't throw as this is a background process
    }
  }

  /**
   * Verify wallet integrity
   */
  async verifyWalletIntegrity(userId: string): Promise<boolean> {
    try {
      const walletState = await this.getLocalWalletState(userId);
      if (!walletState) return false;

      const transactions = await this.getWalletTransactionHistory(userId);

      // Calculate balance from transactions
      let calculatedBalance = 0;
      let calculatedInvested = 0;
      let calculatedWithdrawn = 0;
      let calculatedProfit = 0;
      let calculatedFees = 0;

      for (const transaction of transactions) {
        if (transaction.status === 'COMPLETED') {
          switch (transaction.transaction_type) {
            case 'ADD_FUNDS':
              calculatedBalance += transaction.amount;
              break;
            case 'WITHDRAW':
              calculatedBalance -= transaction.amount;
              calculatedWithdrawn += transaction.amount;
              break;
            case 'INVESTMENT':
              calculatedInvested += transaction.amount;
              break;
            case 'PROFIT':
              calculatedBalance += transaction.amount;
              calculatedProfit += transaction.amount;
              break;
            case 'REFUND':
              calculatedBalance += transaction.amount;
              break;
          }

          if (transaction.fee_amount) {
            calculatedFees += transaction.fee_amount;
          }
        }
      }

      // Check if calculated values match stored values
      const isBalanceValid = Math.abs(walletState.balance - calculatedBalance) < 0.01;
      const isTotalInvestedValid = Math.abs(walletState.total_invested - calculatedInvested) < 0.01;

      console.log('Integrity check:', {
        storedBalance: walletState.balance,
        calculatedBalance,
        isBalanceValid,
        isTotalInvestedValid
      });

      return isBalanceValid && isTotalInvestedValid;
    } catch (error) {
      console.error('Error verifying wallet integrity:', error);
      return false;
    }
  }

  /**
   * Get transaction count for user
   */
  async getTransactionCount(userId: string): Promise<number> {
    try {
      const transactions = await this.getWalletTransactionHistory(userId);
      return transactions.length;
    } catch (error) {
      console.error('Error getting transaction count:', error);
      return 0;
    }
  }

  /**
   * Get client IP (for audit logging)
   */
  private getClientIP(): string {
    // In a real app, you'd get this from your server or a service
    return 'client-side-unknown';
  }

  /**
   * Get session ID (for audit logging)
   */
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('wallet_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('wallet_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Enhanced wallet state update with version control and checksums
   */
  async updateLocalWalletStateEnhanced(
    userId: string,
    updates: Partial<LocalWalletState>
  ): Promise<void> {
    try {
      // Get current state for audit trail
      const currentState = await this.getLocalWalletState(userId);
      const oldValue = currentState ? JSON.stringify(currentState) : undefined;

      // Perform the update
      await this.updateLocalWalletState(userId, updates);

      // Get new state for audit trail
      const newState = await this.getLocalWalletState(userId);
      const newValue = newState ? JSON.stringify(newState) : undefined;

      // Create audit log
      await this.createAuditLog(userId, 'STATE_SYNC', oldValue, newValue, 'SYSTEM');

      console.log('Enhanced wallet state update completed for user:', userId);
    } catch (error) {
      console.error('Error in enhanced wallet state update:', error);
      throw error;
    }
  }

  /**
   * Get audit logs for user
   */
  async getAuditLogsByUserId(userId: string, limit?: number): Promise<any[]> {
    try {
      return await indexedDBService.getAuditLogsByUserId(userId, limit);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }
  }

  /**
   * Get balance snapshots for user
   */
  async getBalanceSnapshotsByUserId(userId: string, limit?: number): Promise<any[]> {
    try {
      return await indexedDBService.getBalanceSnapshotsByUserId(userId, limit);
    } catch (error) {
      console.error('Error fetching balance snapshots:', error);
      return [];
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