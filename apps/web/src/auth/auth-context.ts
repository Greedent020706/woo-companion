import { createContext } from 'react';
import type { LoginInput, User } from '@woo/shared';

export type AuthStatus = 'checking' | 'authenticated' | 'anonymous';

export type AuthContextValue = {
  user: User | null;
  status: AuthStatus;
  login: (credentials: LoginInput) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
