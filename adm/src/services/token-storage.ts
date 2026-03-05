const ACCESS_KEY = 'qc_adm_access_token';
const REFRESH_KEY = 'qc_adm_refresh_token';

export const tokenStorage = {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_KEY);
  },
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_KEY);
  },
  setTokens(input: { accessToken: string; refreshToken: string }) {
    localStorage.setItem(ACCESS_KEY, input.accessToken);
    localStorage.setItem(REFRESH_KEY, input.refreshToken);
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  }
};
