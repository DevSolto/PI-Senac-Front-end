import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  getCurrentUser,
  login as loginRequest,
} from '@/shared/api/auth';
import type { LoginPayload, LoginResponse } from '@/shared/api/auth.types';
import type { User } from '@/shared/api/users.types';
import { apiClient, clearAuthToken, setAuthToken } from '@/shared/http';

const AUTH_TOKEN_STORAGE_KEY = 'auth_token';

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
  const [token, setTokenState] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>('idle');

  const persistToken = useCallback((value: string) => {
    setTokenState(value);
    setAuthToken(value);

    if (isBrowser()) {
      window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, value);
    }
  }, []);

  const clearStoredToken = useCallback(() => {
    setTokenState(null);
    clearAuthToken();

    if (isBrowser()) {
      window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
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
        const currentUser = await getCurrentUser();
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

    const storedToken = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

    if (!storedToken) {
      clearStoredToken();
      setUser(null);
      setStatus('unauthenticated');
      return;
    }

    setStatus('loading');
    setTokenState(storedToken);
    setAuthToken(storedToken);

    getCurrentUser()
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
