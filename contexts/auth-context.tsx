"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@/types/api';
import { AuthService } from '@/services/auth';
import { ProfileService } from '@/services/profile';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshAttempts, setRefreshAttempts] = useState(0);

  useEffect(() => {
    checkAuthStatus();

    // Set up automatic token refresh every 10 minutes
    const refreshInterval = setInterval(() => {
      if (AuthService.isAuthenticated()) {
        refreshAuth();
      }
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(refreshInterval);
  }, []);

  const checkAuthStatus = async () => {
    try {
      if (AuthService.isAuthenticated()) {
        // Fetch user data from profile endpoint
        const response = await ProfileService.getProfile();

        if (response.success && response.data) {
          setUser(response.data.user);
        } else {
          // If profile fetch fails due to auth error, logout
          console.log('Profile fetch failed, logging out');
          await logout();
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // If there's an error, clear the auth state
      await logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await AuthService.login({ email, password });

      if (response.success && response.data) {
        setUser(response.data.user);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AuthService.logout();
      setUser(null);

      // Show logout message
      toast.info('Logged Out', {
        description: 'You have been logged out successfully.',
      });

      // Redirect to get-started page
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          window.location.href = '/get-started';
        }, 500);
      }
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, clear local state
      setUser(null);
      if (typeof window !== 'undefined') {
        window.location.href = '/get-started';
      }
    }
  };

  const refreshAuth = async (): Promise<void> => {
    try {
      const response = await AuthService.refreshToken();

      if (!response.success) {
        // Refresh failed - logout immediately
        console.log('Token refresh failed, logging out');
        await logout();
      } else {
        // Reset attempts on successful refresh
        setRefreshAttempts(0);
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      // On error, logout immediately
      await logout();
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
