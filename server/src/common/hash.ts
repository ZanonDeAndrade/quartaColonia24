import crypto from 'node:crypto';

export const hashSha256 = (value: string): string =>
  crypto.createHash('sha256').update(value).digest('hex');
