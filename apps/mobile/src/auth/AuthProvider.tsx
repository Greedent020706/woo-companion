import { useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { LoginInput, User } from '@woo/shared';
import { api, setApiToken, setUnauthorizedHandler } from '../lib/api';
import { clearSession, loadSession, saveSession } from '../lib/session-storage';

export type AuthStatus = 'restoring' | 'authenticated' | 'anonymous';

export type AuthContextValue = {
  user: User | null;
  status: AuthStatus;
  login: (credentials: LoginInput) => Promise<User>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('restoring');

  const logout = useCallback(async () => {
    setApiToken(null);
    setUser(null);
    setStatus('anonymous');
    queryClient.removeQueries({ queryKey: ['my-orders'] });
    await clearSession();
  }, [queryClient]);

  useEffect(() => {
    setUnauthorizedHandler(() => void logout());
  }, [logout]);

  useEffect(() => {
    loadSession()
      .catch(() => null)
      .then((storedSession) => {
        if (!storedSession) {
          setStatus('anonymous');
          return;
        }
        setApiToken(storedSession.token);
        setUser(storedSession.user);
        setStatus('authenticated');
      });
  }, []);

  const login = useCallback(async (credentials: LoginInput) => {
    const session = await api.login(credentials);
    await saveSession(session);
    setApiToken(session.token);
    setUser(session.user);
    setStatus('authenticated');
    return session.user;
  }, []);

  const value = useMemo(() => ({ user, status, login, logout }), [user, status, login, logout]);

  return <AuthContext value={value}>{children}</AuthContext>;
}
