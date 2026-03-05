import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from 'react';
import { authApi } from '../services/auth-api';
import { tokenStorage } from '../services/token-storage';
import type { AuthSessionResponse, AuthUser } from '../types/api';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isAdmin: boolean;
  login: (input: { username: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const defaultAuthContextValue: AuthContextValue = {
  user: null,
  loading: true,
  isAdmin: false,
  async login() {
    throw new Error('AuthProvider is not mounted.');
  },
  async logout() {
    throw new Error('AuthProvider is not mounted.');
  }
};

const AuthContext = createContext<AuthContextValue>(defaultAuthContextValue);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const applyAuthPayload = useCallback(async (payload: AuthSessionResponse) => {
    tokenStorage.setTokens({
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken
    });
    setUser(payload.user);
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        // Ignore logout failures and always clear local state.
      }
    }
    tokenStorage.clear();
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) return false;
    try {
      const payload = await authApi.refresh(refreshToken);
      await applyAuthPayload(payload);
      return true;
    } catch {
      tokenStorage.clear();
      setUser(null);
      return false;
    }
  }, [applyAuthPayload]);

  useEffect(() => {
    const loadUser = async () => {
      const accessToken = tokenStorage.getAccessToken();
      const refreshToken = tokenStorage.getRefreshToken();
      if (!accessToken && !refreshToken) {
        setLoading(false);
        return;
      }

      try {
        const profile = await authApi.me();
        setUser(profile);
      } catch {
        const refreshed = await refresh();
        if (!refreshed) {
          tokenStorage.clear();
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    void loadUser();
  }, [refresh]);

  const login = useCallback(
    async (input: { username: string; password: string }) => {
      const payload = await authApi.login(input);
      await applyAuthPayload(payload);
    },
    [applyAuthPayload]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAdmin: user?.role === 'admin',
      login,
      logout
    }),
    [user, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  return useContext(AuthContext);
};
