import { Timestamp } from 'firebase-admin/firestore';

export const toDate = (value: unknown, fallback = new Date()): Date => {
  if (value instanceof Date) return value;
  if (value instanceof Timestamp) return value.toDate();

  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    const maybeDate = (value as { toDate: () => Date }).toDate();
    if (maybeDate instanceof Date && !Number.isNaN(maybeDate.getTime())) return maybeDate;
  }

  return fallback;
};

export const toISOStringOrNull = (value: Date | null): string | null =>
  value ? value.toISOString() : null;
