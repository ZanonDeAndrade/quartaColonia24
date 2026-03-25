const DEFAULT_API_URL = 'https://quarta-colonia-755008866679.southamerica-east1.run.app';

export function getApiBaseUrl() {
  return (import.meta.env.VITE_API_URL ?? DEFAULT_API_URL).replace(/\/+$/, '');
}

function buildApiUrl(path: string) {
  const baseUrl = getApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (baseUrl.endsWith("/api") && normalizedPath.startsWith("/api/")) {
    return `${baseUrl}${normalizedPath.slice(4)}`;
  }

  return `${baseUrl}${normalizedPath}`;
}

async function parseJsonOrNull(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const body = await parseJsonOrNull(response);

  if (!response.ok) {
    const message =
      typeof body === "object" &&
      body !== null &&
      "message" in body &&
      typeof (body as { message?: string }).message === "string"
        ? (body as { message: string }).message
        : `HTTP ${response.status}`;

    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error("[apiGet]", path, response.status, body);
    }

    throw new Error(message);
  }

  return body as T;
}
