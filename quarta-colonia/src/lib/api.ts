const DEFAULT_API_URL = "http://localhost:3005";

function getBaseUrl() {
  return (import.meta.env.VITE_API_URL ?? DEFAULT_API_URL).replace(/\/+$/, "");
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
  const response = await fetch(`${getBaseUrl()}${path}`, {
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
