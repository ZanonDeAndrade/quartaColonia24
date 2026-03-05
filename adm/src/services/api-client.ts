import { createApiClient } from '@repo/api';
import { tokenStorage } from './token-storage';

export const api = createApiClient({
  baseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3005',
  getAccessToken: () => tokenStorage.getAccessToken(),
  getRefreshToken: () => tokenStorage.getRefreshToken(),
  setTokens: (tokens) => tokenStorage.setTokens(tokens),
  clearTokens: () => tokenStorage.clear()
});
