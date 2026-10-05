import { createApiClient } from '@woo/shared';
import { tokenStorage } from './token-storage';

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

let handleUnauthorized = () => {};

export function setUnauthorizedHandler(handler: () => void) {
  handleUnauthorized = handler;
}

export const api = createApiClient({
  baseUrl: API_URL,
  getToken: () => tokenStorage.get(),
  onUnauthorized: () => handleUnauthorized(),
});
