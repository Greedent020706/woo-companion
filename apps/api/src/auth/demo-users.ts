import type { User } from '@woo/shared';

type DemoAccount = User & { password: string };

// Credenciales de demostración en claro a propósito: no hay base de datos de usuarios
const DEMO_ACCOUNTS: DemoAccount[] = [
  { id: 1, email: 'admin@demo.com', name: 'Admin Demo', role: 'admin', password: 'demo1234' },
  {
    id: 2,
    email: 'cliente@demo.com',
    name: 'Lucía Cliente',
    role: 'customer',
    password: 'demo1234',
  },
];

export function findUserByCredentials(email: string, password: string): User | null {
  const account = DEMO_ACCOUNTS.find(
    (candidate) =>
      candidate.email.toLowerCase() === email.toLowerCase() && candidate.password === password,
  );
  if (!account) return null;
  const { password: _password, ...user } = account;
  return user;
}
