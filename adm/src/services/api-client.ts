import { createApiClient } from '@repo/api';
import { getApiBaseUrl } from './api-base-url';
import { tokenStorage } from './token-storage';

export const api = createApiClient({
  baseUrl: getApiBaseUrl(),
  getAccessToken: () => tokenStorage.getAccessToken(),
  getRefreshToken: () => tokenStorage.getRefreshToken(),
  setTokens: (tokens) => tokenStorage.setTokens(tokens),
  clearTokens: () => tokenStorage.clear()
});
