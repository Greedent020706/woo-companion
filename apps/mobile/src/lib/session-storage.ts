import * as SecureStore from 'expo-secure-store';
import { userSchema, type User } from '@woo/shared';

const TOKEN_KEY = 'woo-companion.token';
const USER_KEY = 'woo-companion.user';

export type StoredSession = { token: string; user: User };

export async function loadSession(): Promise<StoredSession | null> {
  const [token, rawUser] = await Promise.all([
    SecureStore.getItemAsync(TOKEN_KEY),
    SecureStore.getItemAsync(USER_KEY),
  ]);
  if (!token || !rawUser) return null;

  const parsedUser = userSchema.safeParse(JSON.parse(rawUser));
  return parsedUser.success ? { token, user: parsedUser.data } : null;
}

export async function saveSession({ token, user }: StoredSession) {
  await Promise.all([
    SecureStore.setItemAsync(TOKEN_KEY, token),
    SecureStore.setItemAsync(USER_KEY, JSON.stringify(user)),
  ]);
}

export async function clearSession() {
  await Promise.all([
    SecureStore.deleteItemAsync(TOKEN_KEY),
    SecureStore.deleteItemAsync(USER_KEY),
  ]);
}
