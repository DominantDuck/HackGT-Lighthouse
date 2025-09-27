import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/utils/api';
import { LoginRequest, LoginResponse, User } from '@/types/api';
import { FirebaseAuthService } from '@/services/firebaseAuth';
import { useSessionStore } from '@/store/session';

// Auth API functions - Now using Firebase
export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const user = await FirebaseAuthService.signIn(credentials.email, credentials.password);
    
    return {
      token: await user.getIdToken(),
      user: {
        id: user.uid,
        email: user.email || '',
        name: user.displayName || user.email?.split('@')[0] || 'User',
        role: 'patient' // Default role, can be customized based on user data
      }
    };
  },

  logout: async (): Promise<void> => {
    await FirebaseAuthService.signOut();
    await useSessionStore.getState().clear();
  },

  getMe: async (): Promise<User> => {
    const user = FirebaseAuthService.getCurrentUser();
    if (!user) {
      throw new Error('No user signed in');
    }
    
    return {
      id: user.uid,
      email: user.email || '',
      name: user.displayName || user.email?.split('@')[0] || 'User',
      role: 'patient' // Default role, can be customized based on user data
    };
  },

  refreshToken: async (): Promise<{ token: string }> => {
    const user = FirebaseAuthService.getCurrentUser();
    if (!user) {
      throw new Error('No user signed in');
    }
    
    const token = await user.getIdToken(true); // Force refresh
    return { token };
  },
};

// React Query hooks
export const useLogin = () => {
  const queryClient = useQueryClient();
  const setSession = useSessionStore((state) => state.setSession);

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: async (data) => {
      await setSession({
        token: data.token,
        role: data.user.role,
        userId: data.user.id,
        user: data.user,
      });
      // Invalidate and refetch user data
      await queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const clear = useSessionStore((state) => state.clear);

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: async () => {
      // Clear all cached data
      await queryClient.clear();
    },
    onError: (error) => {
      console.error('Logout failed:', error);
    },
  });
};

export const useMe = () => {
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: authApi.getMe,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 401 errors
      if (error?.code === 'UNAUTHORIZED') {
        return false;
      }
      return failureCount < 3;
    },
  });
};

export const useRefreshToken = () => {
  const setSession = useSessionStore((state) => state.setSession);
  const currentToken = useSessionStore((state) => state.token);

  return useMutation({
    mutationFn: authApi.refreshToken,
    onSuccess: async (data) => {
      // Update token in store
      const currentSession = useSessionStore.getState();
      if (currentSession.user && currentSession.role && currentSession.userId) {
        await setSession({
          token: data.token,
          role: currentSession.role,
          userId: currentSession.userId,
          user: currentSession.user,
        });
      }
    },
    onError: async (error) => {
      console.error('Token refresh failed:', error);
      // Clear session on refresh failure
      await useSessionStore.getState().clear();
    },
  });
};
