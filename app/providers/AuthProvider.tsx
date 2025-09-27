import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSessionStore } from '../store/session';
import { useMe } from '../features/auth/auth.api';
import { Role } from '../../types/api';
import { FirebaseAuthService } from '../services/firebaseAuth';

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

export function AuthProvider({ children }: AuthProviderProps) {
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
        // Check if user is already signed in
        const currentUser = FirebaseAuthService.getCurrentUser();
        if (currentUser) {
          const token = await currentUser.getIdToken();
          const userData = {
            id: currentUser.uid,
            email: currentUser.email || '',
            name: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
            role: 'patient' as Role
          };
          
          await setSession({
            token,
            role: 'patient',
            userId: currentUser.uid,
            user: userData,
          });
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        await clear();
      } finally {
        setIsInitialized(true);
        setLoading(false);
      }
    };

    initializeAuth();
  }, [setSession, clear, setLoading]);

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
      await FirebaseAuthService.signOut();
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
