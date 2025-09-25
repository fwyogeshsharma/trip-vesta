import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import walletDatabaseService, { WalletRecord, TransactionRecord } from '@/services/walletDatabaseService';
import walletSyncService, { WalletSyncResult } from '@/services/walletSyncService';

export interface WalletData {
  balance: number;
  totalInvested: number;
  totalWithdrawn: number;
  profitEarned: number;
}

interface WalletContextType {
  walletData: WalletData;
  transactions: TransactionRecord[];
  updateBalance: (newBalance: number) => void;
  deductFromBalance: (amount: number) => boolean;
  addToBalance: (amount: number, description?: string, transactionId?: string) => Promise<void>;
  withdrawFromBalance: (amount: number, description?: string) => Promise<boolean>;
  refreshWalletData: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  syncWalletFromFinancialTransactions: (companyId?: string) => Promise<WalletSyncResult>;
  clearAllData: () => Promise<void>;
  exportData: () => Promise<{ wallet: WalletRecord[], transactions: TransactionRecord[] }>;
  isLoading: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const WALLET_STORAGE_KEY = 'trip-vesta-wallet-data';

const defaultWalletData: WalletData = {
  balance: 0,
  totalInvested: 0,
  totalWithdrawn: 0,
  profitEarned: 0
};

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [walletData, setWalletData] = useState<WalletData>(defaultWalletData);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const refreshWalletData = useCallback(async () => {
    if (!user) {
      setWalletData(defaultWalletData);
      return;
    }

    setIsLoading(true);
    try {
      const userId = user.id || user._id || 'default_user';
      const wallet = await walletDatabaseService.getOrCreateWallet(userId);

      setWalletData({
        balance: wallet.balance || 0,
        totalInvested: wallet.total_invested || 0,
        totalWithdrawn: wallet.total_withdrawn || 0,
        profitEarned: wallet.profit_earned || 0
      });
    } catch (error) {
      console.error('Error loading wallet data from database:', error);
      // Set default data on error to prevent undefined values
      setWalletData(defaultWalletData);
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

  // Load wallet data from SQLite database on mount
  useEffect(() => {
    if (user) {
      refreshWalletData();
      refreshTransactions();
    }
  }, [user, refreshWalletData, refreshTransactions]);

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

  const addToBalance = async (amount: number, description = 'Funds added to wallet', transactionId?: string) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const userId = user.id || user._id || 'default_user';
      const updatedWallet = await walletDatabaseService.addFunds(userId, amount, description, transactionId);

      setWalletData({
        balance: updatedWallet.balance,
        totalInvested: updatedWallet.total_invested,
        totalWithdrawn: updatedWallet.total_withdrawn,
        profitEarned: updatedWallet.profit_earned
      });

      // Refresh transactions to show the new transaction
      await refreshTransactions();
    } catch (error) {
      console.error('Error adding funds:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const withdrawFromBalance = async (amount: number, description = 'Funds withdrawn from wallet'): Promise<boolean> => {
    if (!user) return false;

    setIsLoading(true);
    try {
      const userId = user.id || user._id || 'default_user';
      const result = await walletDatabaseService.withdrawFunds(userId, amount, description);

      if (result.success && result.wallet) {
        setWalletData({
          balance: result.wallet.balance,
          totalInvested: result.wallet.total_invested,
          totalWithdrawn: result.wallet.total_withdrawn,
          profitEarned: result.wallet.profit_earned
        });

        // Refresh transactions to show the new transaction
        await refreshTransactions();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error withdrawing funds:', error);
      return false;
    } finally {
      setIsLoading(false);
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
    updateBalance,
    deductFromBalance,
    addToBalance,
    withdrawFromBalance,
    refreshWalletData,
    refreshTransactions,
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