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
import { getUser } from '@/shared/api/users';
import { apiClient, clearAuthToken, setAuthToken } from '@/shared/http';
import { deleteCookie, getCookie, setCookie } from '@/shared/utils/cookies';

const AUTH_TOKEN_COOKIE_KEY = 'auth_token';

interface JwtPayload {
  id: number;
  role: 'admin' | 'user';
  [key: string]: unknown;
}

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

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');

  if (typeof globalThis.atob === 'function') {
    return globalThis.atob(padded);
  }

  if (typeof Buffer !== 'undefined') {
    return Buffer.from(padded, 'base64').toString('utf-8');
  }

  throw new Error('Base64 decoding is not supported in this environment.');
}

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split('.');

    if (!payload) {
      return null;
    }

    const decodedPayload = decodeBase64Url(payload);
    const parsedPayload = JSON.parse(decodedPayload) as JwtPayload;

    if (typeof parsedPayload.id !== 'number') {
      return null;
    }

    return parsedPayload;
  } catch (error) {
    console.error('[AuthProvider] Failed to decode JWT payload', error);
    return null;
  }
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>('idle');

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
      setStatus('loading');
      persistToken(accessToken);

      try {
        const payload = decodeJwtPayload(accessToken);

        if (!payload) {
          throw new Error('Token de acesso inválido.');
        }

        const currentUser = await getUser(payload.id);
        setUser(currentUser);
        setStatus('authenticated');
      } catch (error) {
        clearStoredToken();
        setUser(null);
        setStatus('unauthenticated');
        throw error;
      }
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
    if (!isBrowser()) {
      setStatus('unauthenticated');
      return;
    }

    const storedToken = getCookie(AUTH_TOKEN_COOKIE_KEY);

    if (!storedToken) {
      clearStoredToken();
      setUser(null);
      setStatus('unauthenticated');
      return;
    }

    setStatus('loading');
    setTokenState(storedToken);
    setAuthToken(storedToken);

    const payload = decodeJwtPayload(storedToken);

    if (!payload) {
      clearStoredToken();
      setUser(null);
      setStatus('unauthenticated');
      return;
    }

    getUser(payload.id)
      .then((currentUser) => {
        setUser(currentUser);
        setStatus('authenticated');
      })
      .catch(() => {
        logout();
      });
  }, [clearStoredToken, logout]);

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
