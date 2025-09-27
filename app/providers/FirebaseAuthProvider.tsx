import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { FirebaseAuthService } from '../services/firebaseAuth';

interface FirebaseAuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, userData: any) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  getIdToken: () => Promise<string | null>;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(undefined);

export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = FirebaseAuthService.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await FirebaseAuthService.signIn(email, password);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    setLoading(true);
    try {
      const result = await FirebaseAuthService.signUp(email, password, userData);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const result = await FirebaseAuthService.signOut();
      return result;
    } finally {
      setLoading(false);
    }
  };

  const getIdToken = async () => {
    return await FirebaseAuthService.getIdToken();
  };

  const value: FirebaseAuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    getIdToken,
  };

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
}

export function useFirebaseAuth() {
  const context = useContext(FirebaseAuthContext);
  if (context === undefined) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
}
