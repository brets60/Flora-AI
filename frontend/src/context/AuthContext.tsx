import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginDemoUser: () => Promise<void>;
  register: (data: { full_name: string; email: string; password: string; terms_accepted: boolean }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEFAULT_DEMO_USER: User = {
  id: 'user-demo-001',
  full_name: 'Dr. Flora Botanist',
  email: 'demo@floraai.com',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  preferred_language: 'en',
  timezone: 'UTC',
  theme: 'light',
  measurement_units: 'metric',
  notification_preferences: {
    browser: true,
    watering: true,
    fertilizing: true,
  },
  created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  updated_at: new Date().toISOString(),
};

export const DEMO_TOKEN = 'flora-demo-offline-jwt-token-2026';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const cached = localStorage.getItem('flora_user');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(localStorage.getItem('flora_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('flora_theme') as 'light' | 'dark') || 'light';
  });

  // Apply dark mode class to root HTML element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('flora_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('flora_token');
      const cachedUser = localStorage.getItem('flora_user');

      if (storedToken) {
        try {
          const profile = await api.getMe();
          const isDemoSession = storedToken.includes('demo') || profile.email === 'demo@floraai.com' || (cachedUser && cachedUser.includes('demo@floraai.com'));
          const merged = isDemoSession ? { ...DEFAULT_DEMO_USER, ...profile } : profile;
          setUser(merged);
          localStorage.setItem('flora_user', JSON.stringify(merged));
          if (merged.theme === 'dark' || merged.theme === 'light') {
            setTheme(merged.theme);
          }
        } catch (err: any) {
          // If 401 and strictly NOT demo user, reset; otherwise preserve cached profile!
          const isDemoSession = storedToken.includes('demo') || (cachedUser && cachedUser.includes('demo@floraai.com'));
          if (err?.status === 401 && !isDemoSession) {
            localStorage.removeItem('flora_token');
            localStorage.removeItem('flora_user');
            setToken(null);
            setUser(null);
          } else if (cachedUser) {
            try {
              setUser(JSON.parse(cachedUser));
            } catch {
              if (isDemoSession) setUser(DEFAULT_DEMO_USER);
            }
          } else if (isDemoSession) {
            setUser(DEFAULT_DEMO_USER);
            localStorage.setItem('flora_user', JSON.stringify(DEFAULT_DEMO_USER));
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const loginDemoUser = async () => {
    // Instant login without network delay
    localStorage.setItem('flora_token', DEMO_TOKEN);
    localStorage.setItem('flora_user', JSON.stringify(DEFAULT_DEMO_USER));
    setToken(DEMO_TOKEN);
    setUser(DEFAULT_DEMO_USER);

    // Sync in background with backend if network is available
    try {
      const resp = await api.login({ email: 'demo@floraai.com', password: 'FloraPassword123!' });
      if (resp && resp.access_token) {
        const mergedUser = { ...DEFAULT_DEMO_USER, ...resp.user };
        localStorage.setItem('flora_token', resp.access_token);
        localStorage.setItem('flora_user', JSON.stringify(mergedUser));
        setToken(resp.access_token);
        setUser(mergedUser);
      }
    } catch {
      // Offline fallback: already in garden as demo user
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Fast path for demo user credentials
      if (email.toLowerCase() === 'demo@floraai.com') {
        await loginDemoUser();
        return;
      }

      const resp = await api.login({ email, password });
      localStorage.setItem('flora_token', resp.access_token);
      localStorage.setItem('flora_user', JSON.stringify(resp.user));
      setToken(resp.access_token);
      setUser(resp.user);
      if (resp.user.theme === 'dark' || resp.user.theme === 'light') {
        setTheme(resp.user.theme);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { full_name: string; email: string; password: string; terms_accepted: boolean }) => {
    setIsLoading(true);
    try {
      const resp = await api.register(data);
      localStorage.setItem('flora_token', resp.access_token);
      localStorage.setItem('flora_user', JSON.stringify(resp.user));
      setToken(resp.access_token);
      setUser(resp.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('flora_token');
    localStorage.removeItem('flora_user');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const profile = await api.getMe();
      setUser(profile);
      localStorage.setItem('flora_user', JSON.stringify(profile));
    } catch {
      // Preserve current user state
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const updated = await api.updateProfile(data);
      setUser(updated);
      localStorage.setItem('flora_user', JSON.stringify(updated));
    } catch {
      if (user) {
        const merged = { ...user, ...data };
        setUser(merged);
        localStorage.setItem('flora_user', JSON.stringify(merged));
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        loginDemoUser,
        register,
        logout,
        refreshUser,
        updateProfile,
        theme,
        toggleTheme,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
