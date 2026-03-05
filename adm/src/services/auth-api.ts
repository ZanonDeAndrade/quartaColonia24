import { api } from './api-client';
import type { AuthMeResponse, AuthSessionResponse } from '../types/api';

export const authApi = {
  login(payload: { username: string; password: string }) {
    return api.post<AuthSessionResponse>('/api/auth/login', payload);
  },
  refresh(refreshToken: string) {
    return api.post<AuthSessionResponse>('/api/auth/refresh', { refreshToken });
  },
  logout(refreshToken: string) {
    return api.post<{ success: true }>('/api/auth/logout', { refreshToken });
  },
  me() {
    return api.get<AuthMeResponse>('/api/auth/me', { auth: true });
  }
};
