export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;
  constructor(message: string, status: number, code?: string, details?: unknown);
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface ApiClientConfig {
  baseUrl: string;
  getAccessToken?: () => string | null;
  getRefreshToken?: () => string | null;
  setTokens?: (tokens: TokenPair) => void;
  clearTokens?: () => void;
}

export interface RequestOptions extends RequestInit {
  auth?: boolean;
}

export interface ApiClient {
  request<T = unknown>(path: string, options?: RequestOptions): Promise<T>;
  get<T = unknown>(path: string, options?: RequestOptions): Promise<T>;
  post<T = unknown>(path: string, body: unknown, options?: RequestOptions): Promise<T>;
  put<T = unknown>(path: string, body: unknown, options?: RequestOptions): Promise<T>;
  patch<T = unknown>(path: string, body: unknown, options?: RequestOptions): Promise<T>;
  delete<T = unknown>(path: string, options?: RequestOptions): Promise<T>;
}

export function createApiClient(config: ApiClientConfig): ApiClient;
