export const allowedOrigins = [
  'http://localhost:5173',
  'https://quarta-colonia24-quarta-colonia.vercel.app',
  'https://quarta-colonia24-adm.vercel.app'
] as const;

const originPattern = /^https?:\/\/[^/\s]+$/i;

const normalizeOrigin = (origin: string) => origin.trim().replace(/\/+$/, '');

export const parseAllowedOrigins = (rawOrigins?: string): string[] => {
  const fromEnv = (rawOrigins ?? '')
    .split(',')
    .map((origin) => normalizeOrigin(origin))
    .filter(Boolean);

  const resolved = fromEnv.length > 0 ? fromEnv : [...allowedOrigins];
  const uniqueOrigins = Array.from(new Set(resolved));

  const invalidOrigin = uniqueOrigins.find((origin) => !originPattern.test(origin));
  if (invalidOrigin) {
    throw new Error(
      `Invalid environment variables. Check server/.env. Details: CORS_ORIGINS contains invalid origin "${invalidOrigin}".`
    );
  }

  return uniqueOrigins;
};
