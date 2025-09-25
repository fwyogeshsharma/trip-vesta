import { walletSyncService } from './walletSyncService';
import { getAuthToken } from './authService';

interface SyncConfig {
  syncIntervalMinutes: number;
  maxRetries: number;
  retryDelayMs: number;
}

export class BackgroundSyncService {
  private static instance: BackgroundSyncService;
  private syncInterval: NodeJS.Timeout | null = null;
  private isRunning = false;
  private config: SyncConfig = {
    syncIntervalMinutes: 15, // Sync every 15 minutes
    maxRetries: 3,
    retryDelayMs: 5000 // 5 seconds
  };

  private constructor() {}

  static getInstance(): BackgroundSyncService {
    if (!BackgroundSyncService.instance) {
      BackgroundSyncService.instance = new BackgroundSyncService();
    }
    return BackgroundSyncService.instance;
  }

  /**
   * Start the background sync process
   */
  start(userId: string, config?: Partial<SyncConfig>): void {
    if (this.isRunning) {
      console.log('Background sync is already running');
      return;
    }

    if (config) {
      this.config = { ...this.config, ...config };
    }

    console.log('Starting background sync service with config:', this.config);

    this.isRunning = true;

    // Run initial sync
    this.performSync(userId);

    // Set up recurring sync
    this.syncInterval = setInterval(() => {
      this.performSync(userId);
    }, this.config.syncIntervalMinutes * 60 * 1000);

    console.log(`Background sync started. Next sync in ${this.config.syncIntervalMinutes} minutes.`);
  }

  /**
   * Stop the background sync process
   */
  stop(): void {
    if (!this.isRunning) {
      console.log('Background sync is not running');
      return;
    }

    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    this.isRunning = false;
    console.log('Background sync service stopped');
  }

  /**
   * Perform a single sync operation
   */
  private async performSync(userId: string, retryCount = 0): Promise<void> {
    try {
      console.log('Starting background sync process...');

      // Get auth token to check if user is still authenticated
      const token = getAuthToken();
      if (!token) {
        console.log('No auth token found, skipping sync');
        return;
      }

      // Sync bank accounts from API
      await this.syncBankAccountsFromAPI(userId);

      // You could also sync wallet data here if needed
      // await this.syncWalletDataFromAPI(userId);

      // Get database statistics for monitoring
      const stats = await walletSyncService.getDatabaseStats();
      console.log('Background sync completed successfully. Database stats:', stats);

    } catch (error) {
      console.error('Background sync failed:', error);

      // Retry logic
      if (retryCount < this.config.maxRetries) {
        console.log(`Retrying sync in ${this.config.retryDelayMs}ms (attempt ${retryCount + 1}/${this.config.maxRetries})`);

        setTimeout(() => {
          this.performSync(userId, retryCount + 1);
        }, this.config.retryDelayMs);
      } else {
        console.error('Background sync failed after maximum retries');
      }
    }
  }

  /**
   * Sync bank accounts from API
   */
  private async syncBankAccountsFromAPI(userId: string): Promise<void> {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No auth token available');
      }

      const API_BASE_URL = 'https://35.244.19.78:8042';
      const companyId = "62d66794e54f47829a886a1d"; // You might want to get this from user context
      const whereClause = encodeURIComponent(JSON.stringify({ "created_by_company": companyId }));
      const sortClause = encodeURIComponent(JSON.stringify([["_created", -1]]));

      const url = `${API_BASE_URL}/banking_details?where=${whereClause}&max_results=100&sort=${sortClause}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch bank accounts: ${response.status}`);
      }

      const result = await response.json();

      if (result._items && result._items.length > 0) {
        await walletSyncService.syncAllBankAccountsToLocal(result._items);
        console.log(`Synced ${result._items.length} bank accounts from API`);
      } else {
        console.log('No bank accounts found to sync');
      }

    } catch (error) {
      console.error('Error syncing bank accounts from API:', error);
      throw error;
    }
  }

  /**
   * Manual sync trigger - can be called from UI
   */
  async triggerManualSync(userId: string): Promise<boolean> {
    try {
      console.log('Manual sync triggered');
      await this.performSync(userId);
      return true;
    } catch (error) {
      console.error('Manual sync failed:', error);
      return false;
    }
  }

  /**
   * Check if sync service is running
   */
  isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Get current sync configuration
   */
  getConfig(): SyncConfig {
    return { ...this.config };
  }

  /**
   * Update sync configuration
   */
  updateConfig(newConfig: Partial<SyncConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('Sync configuration updated:', this.config);

    // If running, restart with new config
    if (this.isRunning) {
      const userId = 'current_user'; // You might need to store this
      this.stop();
      this.start(userId, newConfig);
    }
  }

  /**
   * Get sync service status
   */
  getStatus(): {
    isRunning: boolean;
    config: SyncConfig;
    nextSyncIn?: number; // milliseconds
  } {
    const status = {
      isRunning: this.isRunning,
      config: this.config
    };

    return status;
  }

  /**
   * Clean up resources when app is closing
   */
  cleanup(): void {
    this.stop();
    console.log('Background sync service cleaned up');
  }
}

// Export singleton instance
export const backgroundSyncService = BackgroundSyncService.getInstance();

// Auto-cleanup on window unload (browser only)
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    backgroundSyncService.cleanup();
  });
}

export default backgroundSyncService;