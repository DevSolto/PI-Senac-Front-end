import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { login as loginRequest } from '@/shared/api/auth';
import type { LoginPayload, LoginResponse } from '@/shared/api/auth.types';
import type { User } from '@/shared/api/users.types';
import { apiClient, clearAuthToken, setAuthToken } from '@/shared/http';
import { deleteCookie, getCookie, setCookie } from '@/shared/utils/cookies';

const AUTH_TOKEN_COOKIE_KEY = 'auth_token';

const readStoredToken = (): string | null => {
  if (!isBrowser()) {
    return null;
  }

  const storedToken = getCookie(AUTH_TOKEN_COOKIE_KEY)?.trim();

  if (!storedToken) {
    return null;
  }

  return storedToken;
};

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

interface LoginOptions {
  accessToken?: string;
}

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  status: AuthStatus;
  login: (payload: LoginPayload, options?: LoginOptions) => Promise<LoginResponse>;
  logout: () => void;
  requireMfa: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(() => {
    const storedToken = readStoredToken();

    if (storedToken) {
      setAuthToken(storedToken);
    }

    return storedToken;
  });
  const [status, setStatus] = useState<AuthStatus>(() =>
    token ? 'authenticated' : 'unauthenticated',
  );

  const persistToken = useCallback((value: string) => {
    setTokenState(value);
    setAuthToken(value);

    if (isBrowser()) {
      setCookie(AUTH_TOKEN_COOKIE_KEY, value, { maxAgeSeconds: 60 * 60 * 24 * 7 });
    }
  }, []);

  const clearStoredToken = useCallback(() => {
    setTokenState(null);
    clearAuthToken();

    if (isBrowser()) {
      deleteCookie(AUTH_TOKEN_COOKIE_KEY);
    }
  }, []);

  const requireMfa = useCallback(() => {
    clearStoredToken();
    setUser(null);
    setStatus('unauthenticated');
  }, [clearStoredToken]);

  const redirectToLogin = useCallback(() => {
    if (isBrowser() && window.location.pathname !== '/login') {
      window.location.assign('/login');
    }
  }, []);

  const logout = useCallback(() => {
    clearStoredToken();
    setUser(null);
    setStatus('unauthenticated');
    redirectToLogin();
  }, [clearStoredToken, redirectToLogin]);

  const hydrateFromToken = useCallback(
    async (accessToken: string) => {
      const normalizedToken = accessToken?.trim();

      if (!normalizedToken) {
        clearStoredToken();
        setUser(null);
        setStatus('unauthenticated');
        throw new Error('Token de acesso inválido.');
      }

      setStatus('loading');
      persistToken(normalizedToken);
      setUser(null);
      setStatus('authenticated');
    },
    [clearStoredToken, persistToken],
  );

  const login = useCallback(
    async (
      payload: LoginPayload,
      options: LoginOptions = {},
    ): Promise<LoginResponse> => {
      setStatus('loading');

      try {
        if (options.accessToken) {
          await hydrateFromToken(options.accessToken);
          return { access_token: options.accessToken };
        }

        const response = await loginRequest(payload);

        if ('access_token' in response && response.access_token) {
          await hydrateFromToken(response.access_token);
        } else {
          requireMfa();
        }

        return response;
      } catch (error) {
        clearStoredToken();
        setUser(null);
        setStatus('unauthenticated');
        throw error;
      }
    },
    [clearStoredToken, hydrateFromToken, requireMfa],
  );

  useEffect(() => {
    if (!token) {
      clearStoredToken();
      setUser(null);
      setStatus('unauthenticated');
      return;
    }

    setAuthToken(token);
    setStatus('authenticated');
  }, [clearStoredToken, token]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirectToLogin();
    }
  }, [redirectToLogin, status]);

  useEffect(() => {
    const removeInterceptor = apiClient.addResponseInterceptor((response) => {
      if (response.status === 401 || response.status === 419) {
        logout();
      }

      return response;
    });

    return () => {
      removeInterceptor();
    };
  }, [logout]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      status,
      login,
      logout,
      requireMfa,
    }),
    [login, logout, requireMfa, status, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
