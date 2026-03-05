import { z } from 'zod';

const queryBooleanSchema = z.preprocess((value) => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
}, z.boolean());

const optionalUrlSchema = z.preprocess((value) => {
  if (value === '' || value === null || typeof value === 'undefined') {
    return undefined;
  }
  return value;
}, z.string().trim().url().optional());

export const adminColumnsListQuerySchema = z.object({
  published: queryBooleanSchema.optional(),
  search: z.string().trim().max(120).optional()
});

export const createColumnBodySchema = z.object({
  title: z.string().trim().min(10).max(220),
  excerpt: z.string().trim().min(20).max(600),
  content: z.string().trim().min(100).max(120000),
  authorName: z.string().trim().min(3).max(120),
  authorImageUrl: optionalUrlSchema,
  published: z.boolean().optional().default(false)
});

export const updateColumnBodySchema = z
  .object({
    title: z.string().trim().min(10).max(220).optional(),
    excerpt: z.string().trim().min(20).max(600).optional(),
    content: z.string().trim().min(100).max(120000).optional(),
    authorName: z.string().trim().min(3).max(120).optional(),
    authorImageUrl: optionalUrlSchema,
    published: z.boolean().optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required'
  });

export const publishColumnBodySchema = z.object({
  published: z.boolean()
});
