import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import walletDatabaseService, { WalletRecord, TransactionRecord } from '@/services/walletDatabaseService';
import walletSyncService, { WalletSyncResult } from '@/services/walletSyncService';
import { WalletLocalStorage, WalletData as LocalWalletData, WalletTransaction } from '@/services/walletLocalStorage';

export interface WalletData {
  balance: number;
  totalInvested: number;
  totalWithdrawn: number;
  profitEarned: number;
}

interface WalletContextType {
  walletData: WalletData;
  transactions: TransactionRecord[];
  localTransactions: WalletTransaction[];
  updateBalance: (newBalance: number) => void;
  deductFromBalance: (amount: number) => boolean;
  investInTrip: (amount: number, description?: string, transactionId?: string) => boolean;
  addToBalance: (amount: number, description?: string, transactionId?: string) => Promise<void>;
  withdrawFromBalance: (amount: number, description?: string) => Promise<boolean>;
  refreshWalletData: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  refreshLocalData: () => void;
  syncLocalStorageWithFinancialTransactions: (calculatedBalance: number, totalCredits?: number, totalDebits?: number, creditCount?: number, debitCount?: number) => void;
  syncWalletFromFinancialTransactions: (companyId?: string) => Promise<WalletSyncResult>;
  clearAllData: () => Promise<void>;
  exportData: () => Promise<{ wallet: WalletRecord[], transactions: TransactionRecord[] }>;
  isLoading: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const OLD_WALLET_STORAGE_KEY = 'trip-vesta-wallet-data';
const NEW_WALLET_STORAGE_KEY = 'available-balance';

const defaultWalletData: WalletData = {
  balance: 0,
  totalInvested: 0,
  totalWithdrawn: 0,
  profitEarned: 0
};

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [walletData, setWalletData] = useState<WalletData>(defaultWalletData);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [localTransactions, setLocalTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const refreshWalletData = useCallback(async () => {
    if (!user) {
      // Load from localStorage even without user for demo purposes
      const localWalletData = WalletLocalStorage.getWalletData();
      setWalletData(localWalletData);
      return;
    }

    setIsLoading(true);
    try {
      // Always prioritize localStorage data over database
      const localWalletData = WalletLocalStorage.getWalletData();

      // If localStorage has no balance, try to load from database as fallback
      if (localWalletData.balance === 0 &&
          localWalletData.totalInvested === 0 &&
          localWalletData.totalWithdrawn === 0 &&
          localWalletData.profitEarned === 0) {

        try {
          const userId = user.id || user._id || 'default_user';
          const wallet = await walletDatabaseService.getOrCreateWallet(userId);

          // Only use database data if localStorage is empty
          const databaseWalletData = {
            balance: wallet.balance || 0,
            totalInvested: wallet.total_invested || 0,
            totalWithdrawn: wallet.total_withdrawn || 0,
            profitEarned: wallet.profit_earned || 0
          };

          // Save to localStorage and use it
          WalletLocalStorage.saveWalletData(databaseWalletData);
          setWalletData(databaseWalletData);
        } catch (dbError) {
          console.error('Error loading wallet data from database:', dbError);
          setWalletData(localWalletData); // Use localStorage data even if empty
        }
      } else {
        // Use localStorage data (it has some values)
        setWalletData(localWalletData);
      }

      console.log('💰 Wallet data loaded (localStorage priority):', {
        balance: `₹${localWalletData.balance.toLocaleString()}`,
        totalInvested: `₹${localWalletData.totalInvested.toLocaleString()}`,
        source: 'localStorage'
      });

    } catch (error) {
      console.error('Error loading wallet data:', error);
      // Fallback to localStorage data
      const localWalletData = WalletLocalStorage.getWalletData();
      setWalletData(localWalletData);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const refreshTransactions = useCallback(async () => {
    if (!user) {
      setTransactions([]);
      return;
    }

    try {
      const userId = user.id || user._id || 'default_user';
      const transactionHistory = await walletDatabaseService.getTransactionHistory(userId, 100);
      setTransactions(transactionHistory || []);
    } catch (error) {
      console.error('Error loading transaction history:', error);
      setTransactions([]);
    }
  }, [user]);

  // Refresh local wallet data from localStorage (primary source)
  const refreshLocalData = useCallback(() => {
    try {
      // Process any pending transactions that should be completed
      WalletLocalStorage.processPendingInvestments();

      // Load fresh data from localStorage
      const localWalletData = WalletLocalStorage.getWalletData();
      const localTxns = WalletLocalStorage.getTransactions();

      // Update state immediately
      setWalletData(localWalletData);
      setLocalTransactions(localTxns);

      console.log('📱 Local wallet data refreshed (PRIMARY SOURCE):', {
        balance: `₹${localWalletData.balance.toLocaleString()}`,
        totalInvested: `₹${localWalletData.totalInvested.toLocaleString()}`,
        totalWithdrawn: `₹${localWalletData.totalWithdrawn.toLocaleString()}`,
        profitEarned: `₹${localWalletData.profitEarned.toLocaleString()}`,
        transactions: localTxns.length,
        pendingTransactions: localTxns.filter(t => t.status === 'pending').length
      });
    } catch (error) {
      console.error('Error refreshing local wallet data:', error);
    }
  }, []);

  // Load wallet data from SQLite database and localStorage on mount
  useEffect(() => {
    if (user) {
      refreshWalletData();
      refreshTransactions();
      refreshLocalData(); // Load localStorage data
    }
  }, [user, refreshWalletData, refreshTransactions, refreshLocalData]);

  // Save wallet data to database
  const saveWalletData = (data: WalletData) => {
    setWalletData(data);
  };

  const updateBalance = (newBalance: number) => {
    const updatedData = { ...walletData, balance: newBalance };
    saveWalletData(updatedData);
  };

  const deductFromBalance = (amount: number): boolean => {
    if (walletData.balance >= amount) {
      const updatedData = {
        ...walletData,
        balance: walletData.balance - amount,
        totalInvested: walletData.totalInvested + amount
      };
      saveWalletData(updatedData);
      return true;
    }
    return false;
  };

  // New investment function that uses localStorage and creates pending transaction
  const investInTrip = (amount: number, description = 'Trip investment', transactionId?: string): boolean => {
    try {
      // Check current localStorage balance before attempting investment
      const currentWalletData = WalletLocalStorage.getWalletData();

      console.log('💰 Investment attempt:', {
        requestedAmount: `₹${amount.toLocaleString()}`,
        currentBalance: `₹${currentWalletData.balance.toLocaleString()}`,
        sufficient: currentWalletData.balance >= amount
      });

      if (currentWalletData.balance < amount) {
        console.error('Insufficient balance for investment');
        return false;
      }

      const result = WalletLocalStorage.updateBalance(
        'INVESTMENT',
        amount,
        `${description} - Transaction will be reflected in your wallet within 24 hours`,
        transactionId,
        'pending' // Mark as pending for 24 hour delay
      );

      if (result.success) {
        // Immediately update the React state with new localStorage data
        const updatedWalletData = WalletLocalStorage.getWalletData();
        const updatedTransactions = WalletLocalStorage.getTransactions();

        setWalletData(updatedWalletData);
        setLocalTransactions(updatedTransactions);

        console.log('✅ Investment processed successfully:', {
          newBalance: `₹${updatedWalletData.balance.toLocaleString()}`,
          totalInvested: `₹${updatedWalletData.totalInvested.toLocaleString()}`,
          transactionId: result.transaction?.id
        });

        return true;
      } else {
        console.error('Investment failed:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Error processing investment:', error);
      return false;
    }
  };

  const addToBalance = async (amount: number, description = 'Funds added to wallet', transactionId?: string) => {
    setIsLoading(true);
    try {
      // Add to localStorage first (primary source)
      const result = WalletLocalStorage.updateBalance(
        'ADD',
        amount,
        description,
        transactionId,
        'completed' // Funds added are immediately available
      );

      if (result.success) {
        // Immediately update React state
        const updatedWalletData = WalletLocalStorage.getWalletData();
        const updatedTransactions = WalletLocalStorage.getTransactions();

        setWalletData(updatedWalletData);
        setLocalTransactions(updatedTransactions);

        console.log('✅ Funds added successfully:', {
          amount: `₹${amount.toLocaleString()}`,
          newBalance: `₹${updatedWalletData.balance.toLocaleString()}`,
          transactionId: result.transaction?.id
        });

        // Also try to update database in background (non-blocking)
        if (user) {
          try {
            const userId = user.id || user._id || 'default_user';
            await walletDatabaseService.addFunds(userId, amount, description, transactionId);
            await refreshTransactions();
          } catch (dbError) {
            console.warn('Database update failed, but localStorage updated successfully:', dbError);
          }
        }
      } else {
        throw new Error(result.error || 'Failed to add funds');
      }
    } catch (error) {
      console.error('Error adding funds:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const withdrawFromBalance = async (amount: number, description = 'Funds withdrawn from wallet'): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Withdraw from localStorage first (primary source)
      const result = WalletLocalStorage.updateBalance(
        'WITHDRAW',
        amount,
        description,
        undefined,
        'completed' // Withdrawals are immediate
      );

      if (result.success) {
        // Immediately update React state
        const updatedWalletData = WalletLocalStorage.getWalletData();
        const updatedTransactions = WalletLocalStorage.getTransactions();

        setWalletData(updatedWalletData);
        setLocalTransactions(updatedTransactions);

        console.log('✅ Funds withdrawn successfully:', {
          amount: `₹${amount.toLocaleString()}`,
          newBalance: `₹${updatedWalletData.balance.toLocaleString()}`,
          totalWithdrawn: `₹${updatedWalletData.totalWithdrawn.toLocaleString()}`
        });

        // Also try to update database in background (non-blocking)
        if (user) {
          try {
            const userId = user.id || user._id || 'default_user';
            await walletDatabaseService.withdrawFunds(userId, amount, description);
            await refreshTransactions();
          } catch (dbError) {
            console.warn('Database update failed, but localStorage updated successfully:', dbError);
          }
        }

        return true;
      } else {
        console.error('Withdrawal failed:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Error withdrawing funds:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Sync localStorage with calculated financial transaction balance
  const syncLocalStorageWithFinancialTransactions = (
    calculatedBalance: number,
    totalCredits = 0,
    totalDebits = 0,
    creditCount = 0,
    debitCount = 0
  ) => {
    try {
      // Use the WalletLocalStorage service to sync
      WalletLocalStorage.syncWithFinancialTransactionBalance(
        calculatedBalance,
        totalCredits,
        totalDebits,
        creditCount,
        debitCount
      );

      // Refresh local data to reflect the changes in React state
      refreshLocalData();

      console.log('✅ WalletContext synced localStorage with financial transactions:', {
        calculatedBalance: `₹${calculatedBalance.toLocaleString()}`,
        source: 'Financial Transactions API'
      });
    } catch (error) {
      console.error('Error syncing localStorage with financial transactions:', error);
    }
  };

  const clearAllData = async () => {
    try {
      await walletDatabaseService.clearAllData();
      setWalletData(defaultWalletData);
      setTransactions([]);
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  };

  const exportData = async () => {
    try {
      return await walletDatabaseService.exportData();
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  };

  const syncWalletFromFinancialTransactions = async (companyId = "62d66794e54f47829a886a1d") => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setIsLoading(true);
    try {
      const userId = user.id || user._id || 'default_user';
      const result = await walletSyncService.syncWalletFromFinancialTransactions(userId, companyId);

      if (result.success) {
        // Refresh wallet data to show updated balance
        await refreshWalletData();
        await refreshTransactions();
      }

      return result;
    } catch (error) {
      console.error('Error syncing wallet from financial transactions:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };


  const value: WalletContextType = {
    walletData,
    transactions,
    localTransactions,
    updateBalance,
    deductFromBalance,
    investInTrip,
    addToBalance,
    withdrawFromBalance,
    refreshWalletData,
    refreshTransactions,
    refreshLocalData,
    syncLocalStorageWithFinancialTransactions,
    syncWalletFromFinancialTransactions,
    clearAllData,
    exportData,
    isLoading
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};