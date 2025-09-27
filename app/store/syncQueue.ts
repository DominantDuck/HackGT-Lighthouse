import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { SyncItem, SyncStatus } from '../../types/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

type SyncQueueState = {
  items: SyncItem[];
  status: SyncStatus;
};

type SyncQueueActions = {
  addItem: (type: SyncItem['type'], data: Record<string, any>) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<SyncItem>) => void;
  clearCompleted: () => void;
  setOnlineStatus: (isOnline: boolean) => void;
  setSyncInProgress: (inProgress: boolean) => void;
  updateLastSync: (timestamp: string) => void;
  incrementRetryCount: (id: string) => void;
  getPendingItems: () => SyncItem[];
  getFailedItems: () => SyncItem[];
};

type SyncQueueStore = SyncQueueState & SyncQueueActions;

const createSyncItem = (
  type: SyncItem['type'],
  data: Record<string, any>
): SyncItem => ({
  id: uuidv4(),
  type,
  data,
  timestamp: new Date().toISOString(),
  retry_count: 0,
  max_retries: 3,
});

export const useSyncQueueStore = create<SyncQueueStore>()(
  persist(
    (set, get) => ({
      items: [],
      status: {
        is_online: true,
        pending_items: 0,
        last_sync: null,
        sync_in_progress: false,
      },

      addItem: (type, data) => {
        const newItem = createSyncItem(type, data);
        set((state) => ({
          items: [...state.items, newItem],
          status: {
            ...state.status,
            pending_items: state.items.length + 1,
          },
        }));
      },

      removeItem: (id) => {
        set((state) => {
          const filteredItems = state.items.filter((item) => item.id !== id);
          return {
            items: filteredItems,
            status: {
              ...state.status,
              pending_items: filteredItems.length,
            },
          };
        });
      },

      updateItem: (id, updates) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        }));
      },

      clearCompleted: () => {
        set((state) => {
          const pendingItems = state.items.filter(
            (item) => item.retry_count < item.max_retries
          );
          return {
            items: pendingItems,
            status: {
              ...state.status,
              pending_items: pendingItems.length,
            },
          };
        });
      },

      setOnlineStatus: (isOnline) => {
        set((state) => ({
          status: {
            ...state.status,
            is_online: isOnline,
          },
        }));
      },

      setSyncInProgress: (inProgress) => {
        set((state) => ({
          status: {
            ...state.status,
            sync_in_progress: inProgress,
          },
        }));
      },

      updateLastSync: (timestamp) => {
        set((state) => ({
          status: {
            ...state.status,
            last_sync: timestamp,
          },
        }));
      },

      incrementRetryCount: (id) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, retry_count: item.retry_count + 1 }
              : item
          ),
        }));
      },

      getPendingItems: () => {
        const { items } = get();
        return items.filter((item) => item.retry_count < item.max_retries);
      },

      getFailedItems: () => {
        const { items } = get();
        return items.filter((item) => item.retry_count >= item.max_retries);
      },
    }),
    {
      name: 'sync-queue-storage',
      storage: createJSONStorage(() => ({
        getItem: async (name: string) => {
          try {
            const item = await AsyncStorage.getItem(name);
            return item;
          } catch {
            return null;
          }
        },
        setItem: async (name: string, value: string) => {
          try {
            await AsyncStorage.setItem(name, value);
          } catch (error) {
            console.error('Failed to store sync queue data:', error);
          }
        },
        removeItem: async (name: string) => {
          try {
            await AsyncStorage.removeItem(name);
          } catch (error) {
            console.error('Failed to remove sync queue data:', error);
          }
        },
      })),
    }
  )
);
