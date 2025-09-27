import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { User, Role } from '../../types/api';

type SessionState = {
  token?: string;
  role?: Role;
  userId?: string;
  user?: User;
  isAuthenticated: boolean;
  isLoading: boolean;
};

type SessionActions = {
  setSession: (params: {
    token: string;
    role: Role;
    userId: string;
    user: User;
  }) => Promise<void>;
  clear: () => Promise<void>;
  setLoading: (loading: boolean) => void;
};

type SessionStore = SessionState & SessionActions;

const secureStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      // Check if we're in a web environment
      if (typeof window !== 'undefined') {
        return localStorage.getItem(name);
      }
      return await SecureStore.getItemAsync(name);
    } catch {
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      // Check if we're in a web environment
      if (typeof window !== 'undefined') {
        localStorage.setItem(name, value);
        return;
      }
      await SecureStore.setItemAsync(name, value);
    } catch (error) {
      console.error('Failed to store session data:', error);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      // Check if we're in a web environment
      if (typeof window !== 'undefined') {
        localStorage.removeItem(name);
        return;
      }
      await SecureStore.deleteItemAsync(name);
    } catch (error) {
      console.error('Failed to remove session data:', error);
    }
  },
};

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      token: undefined,
      role: undefined,
      userId: undefined,
      user: undefined,
      isAuthenticated: false,
      isLoading: true,

      setSession: async ({ token, role, userId, user }) => {
        set({
          token,
          role,
          userId,
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      clear: async () => {
        set({
          token: undefined,
          role: undefined,
          userId: undefined,
          user: undefined,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'session-storage',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        token: state.token,
        role: state.role,
        userId: state.userId,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
