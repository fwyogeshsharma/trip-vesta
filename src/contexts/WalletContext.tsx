import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const WALLET_STORAGE_KEY = 'trip-vesta-wallet-data';

const defaultWalletData: WalletData = {
  balance: 1307250.00,
  totalInvested: 3754090.00,
  totalWithdrawn: 705500.00,
  profitEarned: 562740.00
};

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [walletData, setWalletData] = useState<WalletData>(defaultWalletData);

  // Load wallet data from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(WALLET_STORAGE_KEY);
      if (stored) {
        const parsedData = JSON.parse(stored);
        setWalletData(parsedData);
      }
    } catch (error) {
      console.error('Error loading wallet data from localStorage:', error);
    }
  }, []);

  // Save wallet data to localStorage whenever it changes
  const saveWalletData = (data: WalletData) => {
    try {
      localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(data));
      setWalletData(data);
    } catch (error) {
      console.error('Error saving wallet data to localStorage:', error);
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

  const value: WalletContextType = {
    walletData,
    updateBalance,
    deductFromBalance,
    addToBalance,
    withdrawFromBalance
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