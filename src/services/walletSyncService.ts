import { financialTransactionsService, FinancialTransaction } from './financialTransactionsService';
import walletDatabaseService from './walletDatabaseService';
import { createFakeTransactionData, generateDetailedDescription } from '@/utils/transactionGenerator';

export interface WalletSyncResult {
  success: boolean;
  totalAmount: number;
  totalInvested: number;
  transactionsProcessed: number;
  newWalletBalance: number;
  error?: string;
}

class WalletSyncService {
  /**
   * Extract investment amount from transaction note
   */
  private extractInvestmentFromNote(note: string): number {
    try {
      // Look for investment-related keywords and extract amounts
      const investmentKeywords = [
        'invest', 'investment', 'lender', 'fund', 'capital',
        'membership', 'subscription', 'service', 'website',
        'premium', 'plan', 'package'
      ];
      const lowerNote = note.toLowerCase();

      // Check if note contains investment-related keywords
      const hasInvestmentKeyword = investmentKeywords.some(keyword =>
        lowerNote.includes(keyword)
      );

      if (hasInvestmentKeyword) {
        // Try to extract amount from note using various patterns
        const amountPatterns = [
          /₹([\d,]+)/g,
          /rs\.?\s*([\d,]+)/gi,
          /amount[:\s]+([\d,]+)/gi,
          /([\d,]+)\s*rupees?/gi,
          /\b([\d,]+)\b/g // Any number
        ];

        for (const pattern of amountPatterns) {
          const matches = Array.from(note.matchAll(pattern));
          if (matches.length > 0) {
            // Take the largest number found as it's likely the investment amount
            const amounts = matches.map(match =>
              parseFloat(match[1].replace(/,/g, ''))
            ).filter(amount => amount > 0);

            if (amounts.length > 0) {
              return Math.max(...amounts);
            }
          }
        }
      }

      return 0;
    } catch (error) {
      console.warn('Error extracting investment from note:', note, error);
      return 0;
    }
  }

  /**
   * Sync wallet balance from financial transactions
   * Uses transaction amounts directly (+ or -) and extracts investment from notes
   */
  async syncWalletFromFinancialTransactions(
    userId: string,
    companyId: string = "62d66794e54f47829a886a1d"
  ): Promise<WalletSyncResult> {
    try {
      console.log('🔄 Starting auto wallet sync from financial transactions...', { userId, companyId });

      // Get all financial transactions for the company
      let allTransactions: FinancialTransaction[] = [];
      let currentPage = 1;
      let hasMorePages = true;
      const maxResults = 100;

      while (hasMorePages) {
        const response = await financialTransactionsService.getFinancialTransactions(
          companyId,
          currentPage,
          maxResults
        );

        allTransactions.push(...response._items);

        // Check if there are more pages
        hasMorePages = response._items.length === maxResults;
        currentPage++;

        // Safety limit to prevent infinite loops
        if (currentPage > 50) break;
      }

      console.log(`📊 Retrieved ${allTransactions.length} financial transactions`);

      // Calculate wallet balance: Credits increase balance, Debits decrease balance
      let totalAmount = 0;
      let totalInvested = 0;

      allTransactions.forEach(tx => {
        // Handle Debit/Credit properly for wallet balance
        if (tx.entry_type === 'Credit') {
          // Credits increase wallet balance (money coming in)
          totalAmount += tx.amount;
          console.log(`💰 Credit: +₹${tx.amount.toLocaleString()} from "${tx.note}"`);
        } else if (tx.entry_type === 'Debit') {
          // Debits decrease wallet balance (money going out)
          totalAmount -= tx.amount;
          console.log(`💸 Debit: -₹${tx.amount.toLocaleString()} from "${tx.note}"`);
        }

        // Extract investment amount from note (regardless of debit/credit)
        const investmentFromNote = this.extractInvestmentFromNote(tx.note || '');
        if (investmentFromNote > 0) {
          totalInvested += investmentFromNote;
          console.log(`💹 Found investment in note: ₹${investmentFromNote.toLocaleString()} from "${tx.note}"`);
        }
      });

      // Calculate transaction type counts for summary
      const creditCount = allTransactions.filter(tx => tx.entry_type === 'Credit').length;
      const debitCount = allTransactions.filter(tx => tx.entry_type === 'Debit').length;
      const totalCredits = allTransactions
        .filter(tx => tx.entry_type === 'Credit')
        .reduce((sum, tx) => sum + tx.amount, 0);
      const totalDebits = allTransactions
        .filter(tx => tx.entry_type === 'Debit')
        .reduce((sum, tx) => sum + tx.amount, 0);

      console.log('💰 Financial Transaction Summary:', {
        totalCredits: `₹${totalCredits.toLocaleString()} (${creditCount} transactions)`,
        totalDebits: `₹${totalDebits.toLocaleString()} (${debitCount} transactions)`,
        netWalletBalance: `₹${totalAmount.toLocaleString()} (Credits - Debits)`,
        totalInvested: `₹${totalInvested.toLocaleString()}`,
        transactionCount: allTransactions.length
      });

      // Get current wallet balance
      const currentWallet = await walletDatabaseService.getOrCreateWallet(userId);
      const currentBalance = currentWallet.balance;
      const currentTotalInvested = currentWallet.total_invested;

      console.log(`🏦 Current wallet state:`, {
        balance: `₹${currentBalance.toLocaleString()}`,
        totalInvested: `₹${currentTotalInvested.toLocaleString()}`
      });

      // Update wallet balance to match total amount from financial transactions
      const newBalance = totalAmount;
      const newTotalInvested = totalInvested;

      // Check if we need to update anything
      const needsBalanceUpdate = newBalance !== currentBalance;
      const needsInvestmentUpdate = newTotalInvested !== currentTotalInvested;

      if (needsBalanceUpdate || needsInvestmentUpdate) {
        // Create a sync transaction record with fake transaction data
        const fakeTransactionData = createFakeTransactionData();
        const syncDescription = `Auto-sync from financial transactions - Balance: ₹${totalAmount.toLocaleString()}, Investments: ₹${totalInvested.toLocaleString()}`;

        // Add sync transaction to database if balance changed
        if (needsBalanceUpdate) {
          const balanceDifference = newBalance - currentBalance;
          const transactionType = balanceDifference > 0 ? 'ADD' : 'WITHDRAW';

          await walletDatabaseService.addTransaction({
            user_id: userId,
            transaction_type: transactionType as 'ADD' | 'WITHDRAW',
            amount: Math.abs(balanceDifference),
            balance_before: currentBalance,
            balance_after: newBalance,
            description: syncDescription,
            transaction_id: fakeTransactionData.transactionId
          });
        }

        // Update wallet balance and total invested
        await walletDatabaseService.updateWalletBalanceAndInvestment(userId, newBalance, newTotalInvested);

        console.log('✅ Wallet updated:', {
          previousBalance: `₹${currentBalance.toLocaleString()}`,
          newBalance: `₹${newBalance.toLocaleString()}`,
          previousInvested: `₹${currentTotalInvested.toLocaleString()}`,
          newInvested: `₹${newTotalInvested.toLocaleString()}`,
          balanceChanged: needsBalanceUpdate,
          investmentChanged: needsInvestmentUpdate
        });
      } else {
        console.log('ℹ️ Wallet already in sync with financial transactions');
      }

      return {
        success: true,
        totalAmount,
        totalInvested,
        transactionsProcessed: allTransactions.length,
        newWalletBalance: newBalance
      };

    } catch (error) {
      console.error('❌ Failed to sync wallet from financial transactions:', error);

      return {
        success: false,
        totalAmount: 0,
        totalInvested: 0,
        transactionsProcessed: 0,
        newWalletBalance: 0,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get financial transactions summary without updating wallet
   */
  async getFinancialTransactionsSummary(
    companyId: string = "62d66794e54f47829a886a1d"
  ): Promise<{
    totalCredits: number;
    totalDebits: number;
    netAmount: number;
    transactionsCount: number;
  }> {
    try {
      // Get first page to check total count
      const response = await financialTransactionsService.getFinancialTransactions(companyId, 1, 1);
      const totalCount = response._meta.total;

      // Get all transactions if count is reasonable
      if (totalCount > 1000) {
        throw new Error('Too many transactions to process at once');
      }

      const fullResponse = await financialTransactionsService.getFinancialTransactions(
        companyId, 1, totalCount
      );

      const allTransactions = fullResponse._items;

      let totalCredits = 0;
      let totalDebits = 0;

      allTransactions.forEach(tx => {
        if (tx.entry_type === 'Credit') {
          totalCredits += tx.amount;
        } else if (tx.entry_type === 'Debit') {
          totalDebits += tx.amount;
        }
      });

      return {
        totalCredits,
        totalDebits,
        netAmount: totalCredits - totalDebits,
        transactionsCount: allTransactions.length
      };

    } catch (error) {
      console.error('Failed to get financial transactions summary:', error);
      throw error;
    }
  }
}

export default new WalletSyncService();