export const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'https://quarta-colonia24-quarta-colonia.vercel.app',
  'https://quarta-colonia24-adm.vercel.app',
  'https://quartacolonia24horas.com.br'
] as const;

const originPattern = /^https?:\/\/[^/\s]+$/i;
const renderOriginPattern = /^https:\/\/[a-z0-9-]+\.onrender\.com$/i;

export const normalizeOrigin = (origin: string) => origin.trim().replace(/\/+$/, '');

export const parseAllowedOrigins = (rawOrigins?: string): string[] => {
  const fromEnv = (rawOrigins ?? '')
    .split(',')
    .map((origin) => normalizeOrigin(origin))
    .filter(Boolean);

  // Environment values extend defaults instead of replacing them, keeping
  // local development origins working even with older .env values.
  const resolved = [...allowedOrigins, ...fromEnv];
  const uniqueOrigins = Array.from(new Set(resolved));

  const invalidOrigin = uniqueOrigins.find((origin) => !originPattern.test(origin));
  if (invalidOrigin) {
    throw new Error(
      `Invalid environment variables. Check server/.env. Details: CORS_ORIGINS contains invalid origin "${invalidOrigin}".`
    );
  }

  return uniqueOrigins;
};

export const isAllowedOrigin = (origin: string, allowedOriginsList: readonly string[]): boolean => {
  const normalizedOrigin = normalizeOrigin(origin);
  return allowedOriginsList.includes(normalizedOrigin) || renderOriginPattern.test(normalizedOrigin);
};
