import { z } from 'zod';

const defaultCorsOrigins = [
  'http://localhost:5173',
  'https://quarta-colonia24-quarta-colonia.vercel.app',
  'https://quarta-colonia24-adm.vercel.app'
] as const;

const parseCorsOrigins = (value: string | undefined): string[] => {
  if (!value) return [...defaultCorsOrigins];

  const origins = value
    .split(',')
    .map((item) => item.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  if (origins.length === 0) return [...defaultCorsOrigins];

  const invalidOrigin = origins.find((origin) => !/^https?:\/\/[^/\s]+$/i.test(origin));
  if (invalidOrigin) {
    throw new Error(
      `Invalid environment variables. Check server/.env. Details: CORS_ORIGINS contains invalid origin "${invalidOrigin}".`
    );
  }

  return Array.from(new Set(origins));
};

const rawEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  FIREBASE_PROJECT_ID: z.string().min(1),
  FIREBASE_CLIENT_EMAIL: z.string().email(),
  FIREBASE_PRIVATE_KEY: z.string().min(1),
  FIREBASE_STORAGE_BUCKET: z.string().min(1).optional(),
  STORAGE_BUCKET: z.string().min(1).optional(),
  ADMIN_USERNAME: z
    .string()
    .trim()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/),
  ADMIN_PASSWORD_HASH: z
    .string()
    .trim()
    .regex(/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/, 'ADMIN_PASSWORD_HASH must be a valid bcrypt hash'),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  CORS_ORIGINS: z.string().optional(),
  CORS_ORIGIN: z.string().optional(),
  UPLOAD_MAX_BYTES: z.coerce.number().int().positive().default(5 * 1024 * 1024)
});

export interface Env {
  NODE_ENV: 'development' | 'test' | 'production';
  PORT: number;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_CLIENT_EMAIL: string;
  FIREBASE_PRIVATE_KEY: string;
  FIREBASE_STORAGE_BUCKET: string;
  ADMIN_USERNAME: string;
  ADMIN_PASSWORD_HASH: string;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_ACCESS_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
  CORS_ORIGINS: string[];
  UPLOAD_MAX_BYTES: number;
}

let cachedEnv: Env | null = null;

export const getEnv = (): Env => {
  if (cachedEnv) return cachedEnv;

  const parsed = rawEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const details = Object.entries(parsed.error.flatten().fieldErrors)
      .map(([key, value]) => `${key}: ${(value ?? []).join(', ')}`)
      .join(' | ');

    throw new Error(`Invalid environment variables. Check server/.env. Details: ${details}`);
  }

  const storageBucket = parsed.data.FIREBASE_STORAGE_BUCKET ?? parsed.data.STORAGE_BUCKET;
  if (!storageBucket) {
    throw new Error(
      'Invalid environment variables. Check server/.env. Details: FIREBASE_STORAGE_BUCKET is required.'
    );
  }

  const corsOrigins = parseCorsOrigins(parsed.data.CORS_ORIGINS ?? parsed.data.CORS_ORIGIN);

  cachedEnv = {
    NODE_ENV: parsed.data.NODE_ENV,
    PORT: parsed.data.PORT,
    FIREBASE_PROJECT_ID: parsed.data.FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: parsed.data.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: parsed.data.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    FIREBASE_STORAGE_BUCKET: storageBucket,
    ADMIN_USERNAME: parsed.data.ADMIN_USERNAME,
    ADMIN_PASSWORD_HASH: parsed.data.ADMIN_PASSWORD_HASH,
    JWT_ACCESS_SECRET: parsed.data.JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET: parsed.data.JWT_REFRESH_SECRET,
    JWT_ACCESS_EXPIRES_IN: parsed.data.JWT_ACCESS_EXPIRES_IN,
    JWT_REFRESH_EXPIRES_IN: parsed.data.JWT_REFRESH_EXPIRES_IN,
    CORS_ORIGINS: corsOrigins,
    UPLOAD_MAX_BYTES: parsed.data.UPLOAD_MAX_BYTES
  };

  return cachedEnv;
};
