import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { walletSyncService } from '@/services/walletSyncService';
import { financialTransactionsService } from '@/services/financialTransactionsService';
import { useAuth } from './AuthContext';

export interface WalletData {
  balance: number;
  totalInvested: number;
  totalWithdrawn: number;
  profitEarned: number;
}

interface WalletContextType {
  walletData: WalletData;
  updateBalance: (newBalance: number) => void;
  deductFromBalance: (amount: number) => boolean;
  addToBalance: (amount: number) => void;
  withdrawFromBalance: (amount: number) => boolean;
  syncToDatabase: (userId: string) => Promise<void>;
  loadFromDatabase: () => Promise<void>;
  syncFinancialTransactions: () => Promise<void>;
  loadBalanceFromTransactions: () => Promise<number>;
  isLoading: boolean;
  isTransactionSyncing: boolean;
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
  const [isLoading, setIsLoading] = useState(false);
  const [isTransactionSyncing, setIsTransactionSyncing] = useState(false);
  const { user } = useAuth();

  // Load wallet data from local database on mount
  useEffect(() => {
    const loadInitialData = async () => {
      if (user) {
        await loadFromDatabase();
      } else {
        // Fallback to localStorage for non-authenticated users
        try {
          const stored = localStorage.getItem(WALLET_STORAGE_KEY);
          if (stored) {
            const parsedData = JSON.parse(stored);
            setWalletData(parsedData);
          }
        } catch (error) {
          console.error('Error loading wallet data from localStorage:', error);
        }
      }
    };

    loadInitialData();
  }, [user]);

  // Save wallet data to localStorage and sync to database
  const saveWalletData = async (data: WalletData, userId?: string) => {
    try {
      localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(data));
      setWalletData(data);

      // Sync to local database if userId is provided
      if (userId) {
        await walletSyncService.syncWalletDataToLocal(userId, data);
      }
    } catch (error) {
      console.error('Error saving wallet data:', error);
    }
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

  const addToBalance = (amount: number) => {
    const updatedData = {
      ...walletData,
      balance: walletData.balance + amount
    };
    saveWalletData(updatedData);
  };

  const withdrawFromBalance = (amount: number): boolean => {
    if (walletData.balance >= amount) {
      const updatedData = {
        ...walletData,
        balance: walletData.balance - amount,
        totalWithdrawn: walletData.totalWithdrawn + amount
      };
      saveWalletData(updatedData);
      return true;
    }
    return false;
  };

  // Load wallet data from database
  const loadFromDatabase = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const userId = user.id || user._id || 'current_user';
      const localWalletState = await walletSyncService.getLocalWalletState(userId);

      if (localWalletState) {
        const dbWalletData: WalletData = {
          balance: localWalletState.balance,
          totalInvested: localWalletState.total_invested,
          totalWithdrawn: localWalletState.total_withdrawn,
          profitEarned: localWalletState.profit_earned
        };

        setWalletData(dbWalletData);
        // Also save to localStorage as backup
        localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(dbWalletData));
        console.log('Wallet data loaded from database:', dbWalletData);
      } else {
        console.log('No wallet data found in database, using defaults');
        // Initialize database with default data
        await walletSyncService.syncWalletDataToLocal(userId, defaultWalletData);
      }
    } catch (error) {
      console.error('Error loading wallet data from database:', error);
      // Fallback to localStorage
      try {
        const stored = localStorage.getItem(WALLET_STORAGE_KEY);
        if (stored) {
          const parsedData = JSON.parse(stored);
          setWalletData(parsedData);
        }
      } catch (localStorageError) {
        console.error('Error loading from localStorage:', localStorageError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Sync current wallet data to database
  const syncToDatabase = async (userId: string) => {
    try {
      await walletSyncService.syncWalletDataToLocal(userId, walletData);
    } catch (error) {
      console.error('Error syncing wallet data to database:', error);
      throw error;
    }
  };

  // Sync financial transactions and calculate wallet balance
  const syncFinancialTransactions = async () => {
    if (!user) {
      console.log('User not authenticated, skipping financial transaction sync');
      return;
    }

    setIsTransactionSyncing(true);
    try {
      console.log('Starting financial transaction sync...');

      // Sync all financial transactions
      const syncResult = await financialTransactionsService.syncAllTransactionsToLocal();
      console.log('Financial transactions synced:', syncResult);

      // Update wallet balance based on transaction calculation
      const calculatedBalance = syncResult.walletValue;

      // Update wallet data with calculated balance
      const updatedWalletData = {
        ...walletData,
        balance: calculatedBalance
      };

      setWalletData(updatedWalletData);
      localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(updatedWalletData));

      // Sync to local database
      const userId = user.id || user._id || 'current_user';
      await walletSyncService.syncWalletDataToLocal(userId, updatedWalletData);

      console.log('Wallet balance updated from financial transactions:', calculatedBalance);

    } catch (error) {
      console.error('Error syncing financial transactions:', error);
      throw error;
    } finally {
      setIsTransactionSyncing(false);
    }
  };

  // Load balance from financial transactions without syncing from API
  const loadBalanceFromTransactions = async (): Promise<number> => {
    try {
      const companyId = "62d66794e54f47829a886a1d"; // Default company ID
      const userId = user?.id || user?._id;

      const calculatedBalance = await financialTransactionsService.calculateWalletValueFromTransactions(
        companyId,
        userId
      );

      console.log('Calculated balance from local transactions:', calculatedBalance);
      return calculatedBalance;

    } catch (error) {
      console.error('Error loading balance from transactions:', error);
      return walletData.balance; // Fallback to current balance
    }
  };

  const value: WalletContextType = {
    walletData,
    updateBalance,
    deductFromBalance,
    addToBalance,
    withdrawFromBalance,
    syncToDatabase,
    loadFromDatabase,
    syncFinancialTransactions,
    loadBalanceFromTransactions,
    isLoading,
    isTransactionSyncing
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