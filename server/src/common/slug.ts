import slugifyPackage from 'slugify';

export const slugify = (value: string): string =>
  slugifyPackage(value, {
    lower: true,
    strict: true,
    trim: true
  });
