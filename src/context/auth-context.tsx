'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { fetchMe, login as loginRequest, register as registerRequest } from '@/lib/auth-api';
import { AUTH_TOKEN_KEY } from '@/lib/config';
import { identifyUser, resetPostHog } from '@/lib/posthog';
import type { PublicUser } from '@/types/user';

type AuthContextValue = {
  user: PublicUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<PublicUser>;
  register: (email: string, password: string, fullName: string) => Promise<PublicUser>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const persistSession = useCallback((nextToken: string, nextUser: PublicUser) => {
    localStorage.setItem(AUTH_TOKEN_KEY, nextToken);
    setToken(nextToken);
    setUser(nextUser);
    identifyUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setToken(null);
    setUser(null);
    resetPostHog();
  }, []);

  const refreshUser = useCallback(async () => {
    const stored = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!stored) {
      setUser(null);
      setToken(null);
      return;
    }
    const me = await fetchMe(stored);
    setToken(stored);
    setUser(me);
    identifyUser(me);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const stored = localStorage.getItem(AUTH_TOKEN_KEY);
        if (!stored) {
          return;
        }
        const me = await fetchMe(stored);
        if (!cancelled) {
          setToken(stored);
          setUser(me);
          identifyUser(me);
        }
      } catch {
        if (!cancelled) {
          localStorage.removeItem(AUTH_TOKEN_KEY);
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await loginRequest(email, password);
      persistSession(result.token, result.user);
      return result.user;
    },
    [persistSession],
  );

  const register = useCallback(
    async (email: string, password: string, fullName: string) => {
      const result = await registerRequest(email, password, fullName);
      persistSession(result.token, result.user);
      return result.user;
    },
    [persistSession],
  );

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, token, isLoading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
