import { z } from 'zod';

export const publicNewsListQuerySchema = z.object({
  pageSize: z.coerce.number().int().positive().max(50).default(10),
  cursor: z.string().optional()
});

export const adminNewsListQuerySchema = z.object({
  pageSize: z.coerce.number().int().positive().max(50).default(10),
  cursor: z.string().optional(),
  status: z.enum(['draft', 'published']).optional(),
  category: z.string().optional(),
  search: z.string().optional()
});

export const createNewsBodySchema = z.object({
  title: z.string().trim().min(3),
  slug: z.string().trim().min(1).optional(),
  excerpt: z.string().trim().max(400).optional().default(''),
  content: z.string().trim().min(10),
  category: z.string().trim().optional().default(''),
  tags: z.array(z.string().trim().min(1)).optional().default([]),
  status: z.enum(['draft', 'published']).optional().default('draft'),
  imagePath: z.string().trim().min(1).optional().nullable(),
  imageUrl: z.string().trim().url().optional().nullable()
});

export const updateNewsBodySchema = z
  .object({
    title: z.string().trim().min(3).optional(),
    slug: z.string().trim().min(1).optional(),
    excerpt: z.string().trim().max(400).optional(),
    content: z.string().trim().min(10).optional(),
    category: z.string().trim().optional(),
    tags: z.array(z.string().trim().min(1)).optional(),
    status: z.enum(['draft', 'published']).optional(),
    imagePath: z.string().trim().min(1).optional().nullable(),
    imageUrl: z.string().trim().url().optional().nullable()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required'
  });

export const publishNewsBodySchema = z.object({
  published: z.boolean()
});
