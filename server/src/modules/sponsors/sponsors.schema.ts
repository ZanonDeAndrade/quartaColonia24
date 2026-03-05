import { z } from 'zod';

const optionalLinkSchema = z.preprocess((value) => {
  if (value === '' || value === null || typeof value === 'undefined') {
    return undefined;
  }
  return value;
}, z.string().trim().url().optional());

const queryBooleanSchema = z.preprocess((value) => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
}, z.boolean());

export const adminSponsorsListQuerySchema = z.object({
  active: queryBooleanSchema.optional()
});

export const createSponsorBodySchema = z.object({
  name: z.string().trim().min(2),
  link: optionalLinkSchema,
  active: z.boolean(),
  order: z.coerce.number().int()
});

export const updateSponsorBodySchema = z
  .object({
    name: z.string().trim().min(2).optional(),
    link: optionalLinkSchema,
    active: z.boolean().optional(),
    order: z.coerce.number().int().optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required'
  });
