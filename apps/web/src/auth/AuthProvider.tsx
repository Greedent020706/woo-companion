import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { LoginInput, User } from '@woo/shared';
import { api, setUnauthorizedHandler } from '../lib/api';
import { tokenStorage } from '../lib/token-storage';
import { AuthContext, type AuthStatus } from './auth-context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>(() =>
    tokenStorage.get() ? 'checking' : 'anonymous',
  );

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
    setStatus('anonymous');
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    setUnauthorizedHandler(logout);
  }, [logout]);

  useEffect(() => {
    if (!tokenStorage.get()) return;
    let isCurrent = true;
    api
      .getCurrentUser()
      .then((currentUser) => {
        if (!isCurrent) return;
        setUser(currentUser);
        setStatus('authenticated');
      })
      .catch(() => {
        if (isCurrent) logout();
      });
    return () => {
      isCurrent = false;
    };
  }, [logout]);

  const login = useCallback(async (credentials: LoginInput) => {
    const { token, user: loggedUser } = await api.login(credentials);
    if (loggedUser.role !== 'admin') {
      throw new Error('Esta cuenta no tiene acceso al panel. Usa la app móvil.');
    }
    tokenStorage.set(token);
    setUser(loggedUser);
    setStatus('authenticated');
  }, []);

  const value = useMemo(() => ({ user, status, login, logout }), [user, status, login, logout]);

  return <AuthContext value={value}>{children}</AuthContext>;
}
