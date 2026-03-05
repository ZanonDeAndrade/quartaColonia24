import { z } from 'zod';

export const loginBodySchema = z.object({
  username: z
    .string()
    .trim()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(6)
});

export const refreshBodySchema = z.object({
  refreshToken: z.string().min(1)
});

export const logoutBodySchema = z.object({
  refreshToken: z.string().min(1)
});
