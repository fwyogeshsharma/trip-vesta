import initSqlJs, { Database } from 'sql.js';

export interface WalletRecord {
  id?: number;
  user_id: string;
  balance: number;
  total_invested: number;
  total_withdrawn: number;
  profit_earned: number;
  updated_at: string;
  created_at?: string;
}

export interface TransactionRecord {
  id?: number;
  user_id: string;
  transaction_type: 'ADD' | 'WITHDRAW' | 'INVESTMENT' | 'PROFIT';
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string;
  transaction_id?: string;
  created_at: string;
}

class WalletDatabaseService {
  private db: Database | null = null;
  private dbInitialized = false;

  async initializeDatabase(): Promise<void> {
    if (this.dbInitialized && this.db) return;

    try {
      // Load SQL.js
      const SQL = await initSqlJs({
        locateFile: (file: string) => `https://sql.js.org/dist/${file}`
      });

      // Check if we have existing data in localStorage
      const existingData = localStorage.getItem('wallet_database');

      if (existingData) {
        // Load existing database from localStorage
        const uInt8Array = new Uint8Array(JSON.parse(existingData));
        this.db = new SQL.Database(uInt8Array);
      } else {
        // Create new database
        this.db = new SQL.Database();
        await this.createTables();
      }

      this.dbInitialized = true;
      console.log('Wallet database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize wallet database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Create wallet table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS wallet (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL UNIQUE,
        balance REAL NOT NULL DEFAULT 0,
        total_invested REAL NOT NULL DEFAULT 0,
        total_withdrawn REAL NOT NULL DEFAULT 0,
        profit_earned REAL NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create transactions table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        transaction_type TEXT NOT NULL CHECK (transaction_type IN ('ADD', 'WITHDRAW', 'INVESTMENT', 'PROFIT')),
        amount REAL NOT NULL,
        balance_before REAL NOT NULL,
        balance_after REAL NOT NULL,
        description TEXT NOT NULL,
        transaction_id TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES wallet (user_id)
      )
    `);

    // Create index for better performance
    this.db.run('CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id)');
    this.db.run('CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC)');

    console.log('Database tables created successfully');
    this.saveToLocalStorage();
  }

  private saveToLocalStorage(): void {
    if (!this.db) return;

    try {
      const data = this.db.export();
      localStorage.setItem('wallet_database', JSON.stringify(Array.from(data)));
    } catch (error) {
      console.error('Failed to save database to localStorage:', error);
    }
  }

  async getOrCreateWallet(userId: string): Promise<WalletRecord> {
    await this.initializeDatabase();
    if (!this.db) throw new Error('Database not initialized');

    // Try to get existing wallet
    const stmt = this.db.prepare('SELECT * FROM wallet WHERE user_id = ?');
    const result = stmt.get([userId]);
    stmt.free();

    if (result) {
      return {
        id: result[0] as number,
        user_id: result[1] as string,
        balance: result[2] as number,
        total_invested: result[3] as number,
        total_withdrawn: result[4] as number,
        profit_earned: result[5] as number,
        created_at: result[6] as string,
        updated_at: result[7] as string
      };
    }

    // Create new wallet if it doesn't exist
    const now = new Date().toISOString();
    const insertStmt = this.db.prepare(`
      INSERT INTO wallet (user_id, balance, total_invested, total_withdrawn, profit_earned, created_at, updated_at)
      VALUES (?, 0, 0, 0, 0, ?, ?)
    `);
    const insertResult = insertStmt.run([userId, now, now]);
    insertStmt.free();

    this.saveToLocalStorage();

    return {
      id: insertResult.lastInsertRowid as number,
      user_id: userId,
      balance: 0,
      total_invested: 0,
      total_withdrawn: 0,
      profit_earned: 0,
      created_at: now,
      updated_at: now
    };
  }

  async updateWalletBalance(userId: string, newBalance: number): Promise<void> {
    await this.initializeDatabase();
    if (!this.db) throw new Error('Database not initialized');

    const now = new Date().toISOString();
    const stmt = this.db.prepare('UPDATE wallet SET balance = ?, updated_at = ? WHERE user_id = ?');
    stmt.run([newBalance, now, userId]);
    stmt.free();

    this.saveToLocalStorage();
  }

  async updateWalletInvestment(userId: string, totalInvested: number): Promise<void> {
    await this.initializeDatabase();
    if (!this.db) throw new Error('Database not initialized');

    const now = new Date().toISOString();
    const stmt = this.db.prepare('UPDATE wallet SET total_invested = ?, updated_at = ? WHERE user_id = ?');
    stmt.run([totalInvested, now, userId]);
    stmt.free();

    this.saveToLocalStorage();
  }

  async updateWalletBalanceAndInvestment(userId: string, newBalance: number, totalInvested: number): Promise<void> {
    await this.initializeDatabase();
    if (!this.db) throw new Error('Database not initialized');

    const now = new Date().toISOString();
    const stmt = this.db.prepare('UPDATE wallet SET balance = ?, total_invested = ?, updated_at = ? WHERE user_id = ?');
    stmt.run([newBalance, totalInvested, now, userId]);
    stmt.free();

    this.saveToLocalStorage();
  }

  async addTransaction(transaction: Omit<TransactionRecord, 'id' | 'created_at'>): Promise<number> {
    await this.initializeDatabase();
    if (!this.db) throw new Error('Database not initialized');

    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      INSERT INTO transactions (user_id, transaction_type, amount, balance_before, balance_after, description, transaction_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run([
      transaction.user_id,
      transaction.transaction_type,
      transaction.amount,
      transaction.balance_before,
      transaction.balance_after,
      transaction.description,
      transaction.transaction_id || null,
      now
    ]);

    stmt.free();
    this.saveToLocalStorage();

    return result.lastInsertRowid as number;
  }

  async getTransactionHistory(userId: string, limit: number = 50): Promise<TransactionRecord[]> {
    await this.initializeDatabase();
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      SELECT * FROM transactions
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `;

    const stmt = this.db.prepare(query);
    const results = [];

    try {
      stmt.bind([userId, limit]);
      while (stmt.step()) {
        const row = stmt.get();
        results.push({
          id: row[0] as number,
          user_id: row[1] as string,
          transaction_type: row[2] as 'ADD' | 'WITHDRAW' | 'INVESTMENT' | 'PROFIT',
          amount: row[3] as number,
          balance_before: row[4] as number,
          balance_after: row[5] as number,
          description: row[6] as string,
          transaction_id: row[7] as string || undefined,
          created_at: row[8] as string
        });
      }
    } finally {
      stmt.free();
    }

    return results;
  }

  async addFunds(userId: string, amount: number, description: string, transactionId?: string): Promise<WalletRecord> {
    await this.initializeDatabase();
    if (!this.db) throw new Error('Database not initialized');

    const wallet = await this.getOrCreateWallet(userId);
    const newBalance = wallet.balance + amount;

    // Add transaction record
    await this.addTransaction({
      user_id: userId,
      transaction_type: 'ADD',
      amount,
      balance_before: wallet.balance,
      balance_after: newBalance,
      description,
      transaction_id: transactionId
    });

    // Update wallet balance
    await this.updateWalletBalance(userId, newBalance);

    return {
      ...wallet,
      balance: newBalance,
      updated_at: new Date().toISOString()
    };
  }

  async withdrawFunds(userId: string, amount: number, description: string): Promise<{ success: boolean; wallet?: WalletRecord; error?: string }> {
    await this.initializeDatabase();
    if (!this.db) throw new Error('Database not initialized');

    const wallet = await this.getOrCreateWallet(userId);

    if (wallet.balance < amount) {
      return { success: false, error: 'Insufficient balance' };
    }

    const newBalance = wallet.balance - amount;

    // Add transaction record
    await this.addTransaction({
      user_id: userId,
      transaction_type: 'WITHDRAW',
      amount,
      balance_before: wallet.balance,
      balance_after: newBalance,
      description
    });

    // Update wallet balance and total withdrawn
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      UPDATE wallet
      SET balance = ?, total_withdrawn = total_withdrawn + ?, updated_at = ?
      WHERE user_id = ?
    `);
    stmt.run([newBalance, amount, now, userId]);
    stmt.free();

    this.saveToLocalStorage();

    return {
      success: true,
      wallet: {
        ...wallet,
        balance: newBalance,
        total_withdrawn: wallet.total_withdrawn + amount,
        updated_at: now
      }
    };
  }

  async clearAllData(): Promise<void> {
    await this.initializeDatabase();
    if (!this.db) throw new Error('Database not initialized');

    this.db.run('DELETE FROM transactions');
    this.db.run('DELETE FROM wallet');
    this.saveToLocalStorage();
    console.log('All wallet data cleared');
  }

  async exportData(): Promise<{ wallet: WalletRecord[], transactions: TransactionRecord[] }> {
    await this.initializeDatabase();
    if (!this.db) throw new Error('Database not initialized');

    const walletResults = [];
    const walletStmt = this.db.prepare('SELECT * FROM wallet');

    try {
      while (walletStmt.step()) {
        const row = walletStmt.get();
        walletResults.push({
          id: row[0] as number,
          user_id: row[1] as string,
          balance: row[2] as number,
          total_invested: row[3] as number,
          total_withdrawn: row[4] as number,
          profit_earned: row[5] as number,
          created_at: row[6] as string,
          updated_at: row[7] as string
        });
      }
    } finally {
      walletStmt.free();
    }

    const transactionResults = [];
    const transactionStmt = this.db.prepare('SELECT * FROM transactions ORDER BY created_at DESC');

    try {
      while (transactionStmt.step()) {
        const row = transactionStmt.get();
        transactionResults.push({
          id: row[0] as number,
          user_id: row[1] as string,
          transaction_type: row[2] as 'ADD' | 'WITHDRAW' | 'INVESTMENT' | 'PROFIT',
          amount: row[3] as number,
          balance_before: row[4] as number,
          balance_after: row[5] as number,
          description: row[6] as string,
          transaction_id: row[7] as string || undefined,
          created_at: row[8] as string
        });
      }
    } finally {
      transactionStmt.free();
    }

    return {
      wallet: walletResults,
      transactions: transactionResults
    };
  }
}

export default new WalletDatabaseService();