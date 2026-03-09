export class ApiError extends Error {
  constructor(message, status, code, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const ensureNoTrailingSlash = (url) => url.replace(/\/+$/, '');
const normalizePath = (path) => (path.startsWith('/') ? path : `/${path}`);

const buildRequestUrl = (baseUrl, path) => {
  const normalizedPath = normalizePath(path);

  if (baseUrl.endsWith('/api') && normalizedPath.startsWith('/api/')) {
    return `${baseUrl}${normalizedPath.slice(4)}`;
  }

  return `${baseUrl}${normalizedPath}`;
};

const parseJsonIfAny = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) return null;
  return response.json();
};

export const createApiClient = ({
  baseUrl,
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens
}) => {
  const safeBaseUrl = ensureNoTrailingSlash(baseUrl);
  const isDev =
    typeof import.meta !== 'undefined' &&
    typeof import.meta.env !== 'undefined' &&
    Boolean(import.meta.env.DEV);

  const request = async (path, options = {}) => {
    const headers = new Headers(options.headers || {});
    const hasJsonBody = options.body != null && !(options.body instanceof FormData);

    if (hasJsonBody && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    if (options.auth) {
      const token = getAccessToken?.();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    let response = await fetch(buildRequestUrl(safeBaseUrl, path), {
      ...options,
      headers
    });

    if (response.status === 401 && options.auth && getRefreshToken && setTokens) {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearTokens?.();
      } else {
        const refreshResponse = await fetch(buildRequestUrl(safeBaseUrl, '/api/auth/refresh'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ refreshToken })
        });

        if (refreshResponse.ok) {
          const refreshed = await refreshResponse.json();
          if (refreshed?.accessToken && refreshed?.refreshToken) {
            setTokens({
              accessToken: refreshed.accessToken,
              refreshToken: refreshed.refreshToken
            });
            const retryHeaders = new Headers(options.headers || {});
            if (hasJsonBody && !retryHeaders.has('Content-Type')) {
              retryHeaders.set('Content-Type', 'application/json');
            }
            retryHeaders.set('Authorization', `Bearer ${refreshed.accessToken}`);

            response = await fetch(buildRequestUrl(safeBaseUrl, path), {
              ...options,
              headers: retryHeaders
            });
          } else {
            clearTokens?.();
          }
        } else {
          clearTokens?.();
        }
      }
    }

    const data = await parseJsonIfAny(response);
    if (!response.ok) {
      if (response.status >= 500 && isDev) {
        // Logs de desenvolvimento para diagnostico rápido de falhas do backend.
        console.error('[API_ERROR]', {
          path,
          status: response.status,
          body: data
        });
      }

      const messageFromApi = data?.message || data?.error?.message;
      const codeFromApi = data?.code || data?.error?.code;
      const detailsFromApi =
        data?.details || data?.error?.details || (data?.requestId ? { requestId: data.requestId } : undefined);
      const friendlyMessage =
        response.status >= 500
          ? 'Erro interno do servidor. Tente novamente em instantes.'
          : messageFromApi || `HTTP ${response.status}`;

      throw new ApiError(
        friendlyMessage,
        response.status,
        codeFromApi,
        detailsFromApi
      );
    }

    return data;
  };

  return {
    request,
    get(path, options = {}) {
      return request(path, { ...options, method: 'GET' });
    },
    post(path, body, options = {}) {
      return request(path, {
        ...options,
        method: 'POST',
        body: body instanceof FormData ? body : JSON.stringify(body)
      });
    },
    put(path, body, options = {}) {
      return request(path, {
        ...options,
        method: 'PUT',
        body: body instanceof FormData ? body : JSON.stringify(body)
      });
    },
    patch(path, body, options = {}) {
      return request(path, {
        ...options,
        method: 'PATCH',
        body: body instanceof FormData ? body : JSON.stringify(body)
      });
    },
    delete(path, options = {}) {
      return request(path, { ...options, method: 'DELETE' });
    }
  };
};
