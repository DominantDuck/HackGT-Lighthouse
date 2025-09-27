import { useEffect, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useSyncQueueStore } from '../store/syncQueue';
import { apiClient } from '../utils/api';

export function useNetInfoSync() {
  const {
    setOnlineStatus,
    setSyncInProgress,
    updateLastSync,
    getPendingItems,
    addItem,
    removeItem,
    incrementRetryCount,
  } = useSyncQueueStore();

  const syncPendingItems = useCallback(async () => {
    const pendingItems = getPendingItems();
    if (pendingItems.length === 0) return;

    setSyncInProgress(true);

    try {
      for (const item of pendingItems) {
        try {
          // Process each sync item based on type
          switch (item.type) {
            case 'intake_event':
              await apiClient.post('/sensors/event', item.data);
              break;
            case 'check_in':
              await apiClient.post(`/checkins/${item.data.checkInId}/respond`, {
                response: item.data.response,
              });
              break;
            case 'alert_response':
              await apiClient.post(`/alerts/${item.data.alertId}/respond`, {
                action: item.data.action,
                reason: item.data.reason,
              });
              break;
            default:
              console.warn('Unknown sync item type:', item.type);
          }

          // Remove successfully synced item
          removeItem(item.id);
        } catch (error) {
          console.error('Failed to sync item:', item.id, error);
          
          // Increment retry count
          incrementRetryCount(item.id);
          
          // If max retries reached, remove the item
          if (item.retry_count >= item.max_retries) {
            console.warn('Max retries reached for item:', item.id);
            removeItem(item.id);
          }
        }
      }

      updateLastSync(new Date().toISOString());
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncInProgress(false);
    }
  }, [getPendingItems, setSyncInProgress, updateLastSync, removeItem, incrementRetryCount]);

  const scheduleSync = useCallback(() => {
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s, max 30s
    const pendingItems = getPendingItems();
    if (pendingItems.length === 0) return;

    const retryCount = Math.min(pendingItems[0].retry_count, 5);
    const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);

    setTimeout(() => {
      syncPendingItems();
    }, delay);
  }, [getPendingItems, syncPendingItems]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isOnline = state.isConnected && state.isInternetReachable;
      setOnlineStatus(!!isOnline);

      if (isOnline) {
        // When coming back online, sync pending items
        scheduleSync();
      }
    });

    return unsubscribe;
  }, [setOnlineStatus, scheduleSync]);

  // Periodic sync when online
  useEffect(() => {
    const interval = setInterval(() => {
      const { is_online } = useSyncQueueStore.getState().status;
      if (is_online) {
        syncPendingItems();
      }
    }, 30000); // Sync every 30 seconds when online

    return () => clearInterval(interval);
  }, [syncPendingItems]);

  return {
    syncPendingItems,
    scheduleSync,
  };
}
