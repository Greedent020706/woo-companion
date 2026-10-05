import { createApiClient } from '@woo/shared';

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';

let currentToken: string | null = null;
let handleUnauthorized = () => {};

export function setApiToken(token: string | null) {
  currentToken = token;
}

export function setUnauthorizedHandler(handler: () => void) {
  handleUnauthorized = handler;
}

export const api = createApiClient({
  baseUrl: API_URL,
  getToken: () => currentToken,
  onUnauthorized: () => handleUnauthorized(),
});
