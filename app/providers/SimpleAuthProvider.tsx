import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSessionStore } from '../store/session';
import { Role } from '../../types/api';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
  role: Role | undefined;
  login: (token: string, user: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function SimpleAuthProvider({ children }: AuthProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const { 
    isAuthenticated, 
    isLoading: sessionLoading, 
    user, 
    role, 
    token,
    setSession, 
    clear,
    setLoading 
  } = useSessionStore();

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Simple initialization - just check if we have a token
        if (token && user) {
          // User is already authenticated
          setLoading(false);
        } else {
          // No authentication
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        await clear();
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [token, user, setLoading, clear]);

  const login = async (token: string, user: any) => {
    try {
      await setSession({
        token,
        role: user.role,
        userId: user.id,
        user,
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await clear();
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  const isLoading = sessionLoading || !isInitialized;

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    role,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a SimpleAuthProvider');
  }
  return context;
}
