import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { backgroundSyncService } from '@/services/backgroundSyncService';

interface SyncStatus {
  isActive: boolean;
  lastSyncError?: string;
  canManualSync: boolean;
}

export const useBackgroundSync = () => {
  const { user } = useAuth();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isActive: false,
    canManualSync: true
  });
  const [isManualSyncing, setIsManualSyncing] = useState(false);

  useEffect(() => {
    if (user) {
      const userId = user.id || user._id || 'current_user';

      // Start background sync service
      backgroundSyncService.start(userId, {
        syncIntervalMinutes: 15, // Sync every 15 minutes
        maxRetries: 3,
        retryDelayMs: 5000
      });

      // Update status
      setSyncStatus(prev => ({
        ...prev,
        isActive: true
      }));

      console.log('Background sync service started for user:', userId);

      // Cleanup when user changes or component unmounts
      return () => {
        backgroundSyncService.stop();
        setSyncStatus(prev => ({
          ...prev,
          isActive: false
        }));
        console.log('Background sync service stopped');
      };
    }
  }, [user]);

  const triggerManualSync = async (): Promise<boolean> => {
    if (!user || isManualSyncing) {
      return false;
    }

    setIsManualSyncing(true);
    setSyncStatus(prev => ({
      ...prev,
      canManualSync: false,
      lastSyncError: undefined
    }));

    try {
      const userId = user.id || user._id || 'current_user';
      const success = await backgroundSyncService.triggerManualSync(userId);

      if (success) {
        setSyncStatus(prev => ({
          ...prev,
          lastSyncError: undefined
        }));
      } else {
        setSyncStatus(prev => ({
          ...prev,
          lastSyncError: 'Manual sync failed'
        }));
      }

      return success;
    } catch (error) {
      console.error('Manual sync error:', error);
      setSyncStatus(prev => ({
        ...prev,
        lastSyncError: error instanceof Error ? error.message : 'Unknown error'
      }));
      return false;
    } finally {
      setIsManualSyncing(false);

      // Re-enable manual sync after a short delay
      setTimeout(() => {
        setSyncStatus(prev => ({
          ...prev,
          canManualSync: true
        }));
      }, 2000);
    }
  };

  const getSyncConfig = () => {
    return backgroundSyncService.getConfig();
  };

  const updateSyncConfig = (config: { syncIntervalMinutes?: number; maxRetries?: number; retryDelayMs?: number }) => {
    backgroundSyncService.updateConfig(config);
  };

  return {
    syncStatus,
    isManualSyncing,
    triggerManualSync,
    getSyncConfig,
    updateSyncConfig
  };
};

export default useBackgroundSync;